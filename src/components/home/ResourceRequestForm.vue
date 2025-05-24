<template>
    <section class="bg-gradient-to-br from-slate-50 to-indigo-50 py-16 px-5">
        <div class="max-w-6xl mx-auto">
            <div class="text-center mb-12">
                <div class="text-indigo-600 font-semibold mb-2 tracking-widest uppercase">SUGGEST MATERIALS</div>
                <h2 class="text-4xl font-bold text-gray-900 mb-4">Request a Resource</h2>
                <p class="text-gray-600 text-lg max-w-3xl mx-auto">Can't find what you're looking for? Submit a request for resources you'd like to see in our library collection. We consider all suggestions to better serve your learning needs.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <!-- Content panel -->
                <div class="order-2 lg:order-1">
                    <!-- Benefits -->
                    <div class="space-y-6">
                        <div class="flex items-start">
                            <div class="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                                <i class="pi pi-check text-white text-lg"></i>
                            </div>
                            <div>
                                <h3 class="font-semibold text-lg text-gray-900 mb-2">Expand Our Collection</h3>
                                <p class="text-gray-600">Help us build a more comprehensive library aligned with your interests and academic needs</p>
                            </div>
                        </div>
                        <div class="flex items-start">
                            <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                                <i class="pi pi-clock text-white text-lg"></i>
                            </div>
                            <div>
                                <h3 class="font-semibold text-lg text-gray-900 mb-2">Fast Response</h3>
                                <p class="text-gray-600">We review all requests within 48 hours and notify you of our decision and acquisition timeline</p>
                            </div>
                        </div>
                        <div class="flex items-start">
                            <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                                <i class="pi pi-star text-white text-lg"></i>
                            </div>
                            <div>
                                <h3 class="font-semibold text-lg text-gray-900 mb-2">Priority Access</h3>
                                <p class="text-gray-600">Be the first to access newly acquired resources you've requested and get notified when available</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Request form -->
                <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <form @submit.prevent="submitRequest">
                        <div class="mb-4">
                            <label for="resource-title" class="block text-sm font-medium text-gray-700 mb-1">Resource Title*</label>
                            <input
                                id="resource-title"
                                v-model="requestForm.title"
                                type="text"
                                placeholder="Enter the title of the resource"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                        </div>

                        <div class="mb-4">
                            <label for="resource-author" class="block text-sm font-medium text-gray-700 mb-1">Author/Creator</label>
                            <input
                                id="resource-author"
                                v-model="requestForm.author"
                                type="text"
                                placeholder="Name of the author or creator"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div class="mb-4">
                            <label for="resource-type" class="block text-sm font-medium text-gray-700 mb-1">Resource Type*</label>
                            <select id="resource-type" v-model="requestForm.type" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required>
                                <option value="">Select a resource type</option>
                                <option value="book">Physical Book</option>
                                <option value="ebook">E-Book</option>
                                <option value="article">Journal/Article</option>
                                <option value="video">Video</option>
                                <option value="audio">Audio</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div class="mb-4">
                            <label for="resource-reason" class="block text-sm font-medium text-gray-700 mb-1">Reason for Request*</label>
                            <textarea
                                id="resource-reason"
                                v-model="requestForm.reason"
                                placeholder="Why would this resource be valuable to our collection?"
                                rows="4"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            ></textarea>
                        </div>

                        <div class="mb-6">
                            <label for="resource-link" class="block text-sm font-medium text-gray-700 mb-1">Link to Resource (if available)</label>
                            <input
                                id="resource-link"
                                v-model="requestForm.link"
                                type="url"
                                placeholder="http://example.com/resource"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <button type="submit" class="w-full bg-gradient-to-r from-indigo-600 to-blue-700 text-white py-3 px-4 rounded-md hover:from-indigo-700 hover:to-blue-800 font-medium transition-colors">Submit Request</button>
                    </form>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';

const toast = useToast();

// Request form data
const requestForm = ref({
    title: '',
    author: '',
    type: '',
    reason: '',
    link: ''
});

// Submit request handler
const submitRequest = () => {
    console.log('Resource request submitted:', requestForm.value);

    // Show success message
    toast.add({
        severity: 'success',
        summary: 'Request Submitted',
        detail: 'Your resource request has been received. We will review it shortly.',
        life: 3000
    });

    // Reset form
    requestForm.value = {
        title: '',
        author: '',
        type: '',
        reason: '',
        link: ''
    };
};
</script>
