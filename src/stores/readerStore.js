import axiosInstance from '@/util/axios-config';
import { defineStore } from 'pinia';

export const useReaderStore = defineStore('reader', {
    state: () => ({
        // Current ebook context
        currentEbook: null,
        currentResourceType: null, // 'pdf' or 'video'

        // Notes and chat messages
        notes: [],
        chatMessages: [],

        // Loading states
        isLoadingNotes: false,
        isLoadingChats: false,
        isSavingNote: false,
        isSavingChat: false,

        // Error states
        notesError: null,
        chatsError: null,

        // Current context for new items
        currentPage: 1,
        currentTimestamp: 0,
        selectedText: '',

        // Optimistic updates tracking
        pendingNotes: new Map(),
        pendingChats: new Map(),
        tempIdCounter: 0
    }),

    getters: {
        // Get notes sorted by creation time or timestamp/page
        sortedNotes: (state) => {
            return [...state.notes].sort((a, b) => {
                if (state.currentResourceType === 'video') {
                    // Sort by timestamp for videos
                    return (a.timestamp || 0) - (b.timestamp || 0);
                } else {
                    // Sort by page number for PDFs, then by creation time
                    if (a.page_number !== b.page_number) {
                        return (a.page_number || 0) - (b.page_number || 0);
                    }
                    return new Date(a.created_at || 0) - new Date(b.created_at || 0);
                }
            });
        },

        // Get chat messages sorted by creation time or timestamp/page
        sortedChatMessages: (state) => {
            return [...state.chatMessages].sort((a, b) => {
                if (state.currentResourceType === 'video') {
                    // Sort by timestamp for videos
                    return (a.timestamp || 0) - (b.timestamp || 0);
                } else {
                    // Sort by page number for PDFs, then by creation time
                    if (a.page_number !== b.page_number) {
                        return (a.page_number || 0) - (b.page_number || 0);
                    }
                    return new Date(a.created_at || 0) - new Date(b.created_at || 0);
                }
            });
        },

        // Get notes for current page (PDF only)
        notesForCurrentPage: (state) => {
            if (state.currentResourceType !== 'pdf') return state.notes;
            return state.notes.filter((note) => note.page_number === state.currentPage);
        },

        // Get chat messages for current page (PDF only)
        chatMessagesForCurrentPage: (state) => {
            if (state.currentResourceType !== 'pdf') return state.chatMessages;
            return state.chatMessages.filter((chat) => chat.page_number === state.currentPage);
        },

        // Get notes near current timestamp (Video only)
        notesNearTimestamp: (state) => {
            if (state.currentResourceType !== 'video') return state.notes;
            const timeRange = 60; // 60 seconds range
            return state.notes.filter((note) => {
                const timestamp = note.timestamp || 0;
                return Math.abs(timestamp - state.currentTimestamp) <= timeRange;
            });
        },

        // Get chat messages near current timestamp (Video only)
        chatMessagesNearTimestamp: (state) => {
            if (state.currentResourceType !== 'video') return state.chatMessages;
            const timeRange = 60; // 60 seconds range
            return state.chatMessages.filter((chat) => {
                const timestamp = chat.timestamp || 0;
                return Math.abs(timestamp - state.currentTimestamp) <= timeRange;
            });
        },

        // Check if there are any pending operations
        hasPendingOperations: (state) => {
            return state.isSavingNote || state.isSavingChat || state.pendingNotes.size > 0 || state.pendingChats.size > 0;
        }
    },

    actions: {
        // Initialize store with ebook data
        initializeReader(ebook, resourceType) {
            this.currentEbook = ebook;
            this.currentResourceType = resourceType;
            this.notes = ebook.notes || [];
            this.chatMessages = ebook.chat_messages || [];
            this.notesError = null;
            this.chatsError = null;
        },

        // Update current context
        updateContext({ page = null, timestamp = null, selectedText = '' }) {
            if (page !== null) this.currentPage = page;
            if (timestamp !== null) this.currentTimestamp = timestamp;
            this.selectedText = selectedText;
        },

        // Generate temporary ID for optimistic updates
        generateTempId() {
            return `temp-${Date.now()}-${++this.tempIdCounter}`;
        },

        // Format time for backend (HH:MM:SS)
        formatTimeForBackend(seconds) {
            if (!seconds && seconds !== 0) return null;
            const totalSeconds = Math.floor(seconds);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const secs = totalSeconds % 60;
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        },

        // Add note with optimistic update
        async addNote(noteData) {
            if (!noteData.content?.trim() || !this.currentEbook) {
                throw new Error('Note content is required');
            }

            const tempId = this.generateTempId();
            this.isSavingNote = true;
            this.notesError = null;

            // Create optimistic note
            const optimisticNote = {
                id: tempId,
                content: noteData.content,
                e_book_id: this.currentEbook.id,
                user_id: null, // Will be set by backend
                created_at: new Date().toISOString(),
                pending: true,
                ...this.buildNotePayload(noteData)
            };

            // Add optimistically
            this.notes.push(optimisticNote);
            this.pendingNotes.set(tempId, optimisticNote);

            try {
                // Prepare payload based on resource type
                const payload = {
                    e_book_id: this.currentEbook.id,
                    content: noteData.content,
                    ...this.buildNotePayload(noteData)
                };

                const response = await axiosInstance.post('/notes', payload);

                if (response.data?.data) {
                    // Replace optimistic note with real one
                    const index = this.notes.findIndex((n) => n.id === tempId);
                    if (index !== -1) {
                        this.notes[index] = {
                            ...response.data.data,
                            pending: false
                        };
                    }
                    this.pendingNotes.delete(tempId);
                    return response.data.data;
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (error) {
                // Rollback optimistic update
                const index = this.notes.findIndex((n) => n.id === tempId);
                if (index !== -1) {
                    this.notes.splice(index, 1);
                }
                this.pendingNotes.delete(tempId);
                this.notesError = error.response?.data?.message || 'Failed to save note';
                throw error;
            } finally {
                this.isSavingNote = false;
            }
        },

        // Build note payload based on resource type
        buildNotePayload(noteData) {
            if (this.currentResourceType === 'video') {
                return {
                    timestamp: noteData.timestamp ?? this.currentTimestamp,
                    sent_at: noteData.sent_at || this.formatTimeForBackend(noteData.timestamp ?? this.currentTimestamp)
                };
            } else {
                return {
                    page_number: noteData.page_number ?? this.currentPage,
                    highlight_text: noteData.highlight_text || this.selectedText || null
                };
            }
        },

        // Delete note
        async deleteNote(noteId) {
            if (!noteId) return;

            const noteIndex = this.notes.findIndex((n) => n.id === noteId);
            if (noteIndex === -1) return;

            const noteBackup = this.notes[noteIndex];

            // Optimistically remove
            this.notes.splice(noteIndex, 1);

            try {
                await axiosInstance.delete(`/notes/${noteId}`);
            } catch (error) {
                // Rollback on error
                this.notes.splice(noteIndex, 0, noteBackup);
                this.notesError = error.response?.data?.message || 'Failed to delete note';
                throw error;
            }
        },

        // Add chat message with optimistic update
        async addChatMessage(chatData) {
            if (!chatData.question?.trim() || !this.currentEbook) {
                throw new Error('Question is required');
            }

            const tempId = this.generateTempId();
            this.isSavingChat = true;
            this.chatsError = null;

            // Create optimistic chat message
            const optimisticChat = {
                id: tempId,
                question: chatData.question,
                ai_response: 'Processing your question...',
                e_book_id: this.currentEbook.id,
                user_id: null,
                is_anonymous: false,
                created_at: new Date().toISOString(),
                pending: true,
                ...this.buildChatPayload(chatData)
            };

            // Add optimistically
            this.chatMessages.push(optimisticChat);
            this.pendingChats.set(tempId, optimisticChat);

            try {
                // Prepare payload based on resource type
                const payload = {
                    e_book_id: this.currentEbook.id,
                    question: chatData.question,
                    is_anonymous: chatData.is_anonymous || false,
                    ...this.buildChatPayload(chatData)
                };

                const response = await axiosInstance.post('/chat-messages', payload);

                if (response.data?.data) {
                    // Replace optimistic chat with real one
                    const index = this.chatMessages.findIndex((c) => c.id === tempId);
                    if (index !== -1) {
                        this.chatMessages[index] = {
                            ...response.data.data,
                            pending: false
                        };
                    }
                    this.pendingChats.delete(tempId);
                    return response.data.data;
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (error) {
                // Rollback optimistic update
                const index = this.chatMessages.findIndex((c) => c.id === tempId);
                if (index !== -1) {
                    this.chatMessages.splice(index, 1);
                }
                this.pendingChats.delete(tempId);
                this.chatsError = error.response?.data?.message || 'Failed to send message';
                throw error;
            } finally {
                this.isSavingChat = false;
            }
        },

        // Build chat payload based on resource type
        buildChatPayload(chatData) {
            if (this.currentResourceType === 'video') {
                return {
                    timestamp: chatData.timestamp ?? this.currentTimestamp,
                    sent_at: chatData.sent_at || this.formatTimeForBackend(chatData.timestamp ?? this.currentTimestamp)
                };
            } else {
                return {
                    page_number: chatData.page_number ?? this.currentPage,
                    highlight_text: chatData.highlight_text || this.selectedText || null
                };
            }
        },

        // Delete chat message
        async deleteChatMessage(messageId) {
            if (!messageId) return;

            const messageIndex = this.chatMessages.findIndex((c) => c.id === messageId);
            if (messageIndex === -1) return;

            const messageBackup = this.chatMessages[messageIndex];

            // Optimistically remove
            this.chatMessages.splice(messageIndex, 1);

            try {
                await axiosInstance.delete(`/chat-messages/${messageId}`);
            } catch (error) {
                // Rollback on error
                this.chatMessages.splice(messageIndex, 0, messageBackup);
                this.chatsError = error.response?.data?.message || 'Failed to delete message';
                throw error;
            }
        },

        // Sync data with server (for conflict resolution)
        async syncWithServer() {
            if (!this.currentEbook) return;

            try {
                const response = await axiosInstance.get(`/ebooks/${this.currentEbook.id}`, {
                    params: { with: 'notes,chatMessages' }
                });

                if (response.data?.data) {
                    const serverData = response.data.data;

                    // Merge server data with local optimistic updates
                    this.mergeServerData(serverData.notes || [], 'notes');
                    this.mergeServerData(serverData.chat_messages || [], 'chatMessages');
                }
            } catch (error) {
                console.error('Failed to sync with server:', error);
            }
        },

        // Merge server data with local optimistic updates
        mergeServerData(serverItems, type) {
            const localItems = this[type];
            const pendingItems = type === 'notes' ? this.pendingNotes : this.pendingChats;

            // Create a map of server items
            const serverMap = new Map(serverItems.map((item) => [item.id, item]));

            // Update existing items and remove those not on server (except pending)
            const mergedItems = [];

            for (const localItem of localItems) {
                if (localItem.pending || pendingItems.has(localItem.id)) {
                    // Keep pending items
                    mergedItems.push(localItem);
                } else if (serverMap.has(localItem.id)) {
                    // Update with server version
                    mergedItems.push(serverMap.get(localItem.id));
                    serverMap.delete(localItem.id);
                }
                // Items not on server are removed (they were deleted elsewhere)
            }

            // Add new items from server
            for (const serverItem of serverMap.values()) {
                mergedItems.push(serverItem);
            }

            this[type] = mergedItems;
        },

        // Clear all data
        clearReader() {
            this.currentEbook = null;
            this.currentResourceType = null;
            this.notes = [];
            this.chatMessages = [];
            this.notesError = null;
            this.chatsError = null;
            this.currentPage = 1;
            this.currentTimestamp = 0;
            this.selectedText = '';
            this.pendingNotes.clear();
            this.pendingChats.clear();
        },

        // Retry failed operations
        async retryFailedOperations() {
            // Re-attempt pending operations that failed
            const failedNotes = Array.from(this.pendingNotes.values());
            const failedChats = Array.from(this.pendingChats.values());

            for (const note of failedNotes) {
                try {
                    await this.addNote({
                        content: note.content,
                        timestamp: note.timestamp,
                        page_number: note.page_number,
                        highlight_text: note.highlight_text
                    });
                } catch (error) {
                    console.error('Failed to retry note:', error);
                }
            }

            for (const chat of failedChats) {
                try {
                    await this.addChatMessage({
                        question: chat.question,
                        timestamp: chat.timestamp,
                        page_number: chat.page_number,
                        highlight_text: chat.highlight_text
                    });
                } catch (error) {
                    console.error('Failed to retry chat:', error);
                }
            }
        }
    },

    // Persist only essential data
    persist: {
        key: 'reader-store',
        pick: ['currentEbook', 'currentResourceType', 'notes', 'chatMessages'],
        storage: sessionStorage // Use session storage for reader data
    }
});
