<script setup>
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const publishers = ref([]);
const publisher = ref({});
const selectedPublishers = ref([]);
const publisherDialog = ref(false);
const deletePublisherDialog = ref(false);
const deletePublishersDialog = ref(false);
const submitted = ref(false);
const loading = ref(true);

onMounted(() => {
    loadPublishers();
});

const loadPublishers = async () => {
    loading.value = true;
    try {
        // In a real app, this would be an API call
        setTimeout(() => {
            publishers.value = [
                {
                    id: 1,
                    name: 'Oxford University Press',
                    address: 'Oxford, UK',
                    phone: '+44-1865-556767',
                    email: 'info@oup.com',
                    books_count: 87
                },
                {
                    id: 2,
                    name: 'Penguin Random House',
                    address: 'New York, USA',
                    phone: '+1-212-782-9000',
                    email: 'info@penguinrandomhouse.com',
                    books_count: 124
                },
                {
                    id: 3,
                    name: 'HarperCollins',
                    address: 'New York, USA',
                    phone: '+1-212-207-7000',
                    email: 'contact@harpercollins.com',
                    books_count: 92
                },
                {
                    id: 4,
                    name: 'Cambridge University Press',
                    address: 'Cambridge, UK',
                    phone: '+44-1223-312393',
                    email: 'information@cambridge.org',
                    books_count: 76
                },
                {
                    id: 5,
                    name: 'Wiley',
                    address: 'Hoboken, USA',
                    phone: '+1-201-748-6000',
                    email: 'info@wiley.com',
                    books_count: 65
                },
                {
                    id: 6,
                    name: 'Pearson',
                    address: 'London, UK',
                    phone: '+44-20-7010-2000',
                    email: 'customerservice@pearson.com',
                    books_count: 58
                },
                {
                    id: 7,
                    name: "O'Reilly Media",
                    address: 'Sebastopol, USA',
                    phone: '+1-707-827-7000',
                    email: 'orders@oreilly.com',
                    books_count: 43
                },
                {
                    id: 8,
                    name: 'Springer Nature',
                    address: 'Berlin, Germany',
                    phone: '+49-6221-487-0',
                    email: 'customerservice@springer.com',
                    books_count: 112
                },
                {
                    id: 9,
                    name: 'MIT Press',
                    address: 'Cambridge, USA',
                    phone: '+1-617-253-5646',
                    email: 'mitpress@mit.edu',
                    books_count: 38
                },
                {
                    id: 10,
                    name: 'Scholastic',
                    address: 'New York, USA',
                    phone: '+1-212-343-6100',
                    email: 'custsvc@scholastic.com',
                    books_count: 79
                }
            ];
            loading.value = false;
        }, 1000);
    } catch (error) {
        console.error('Error loading publishers', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load publishers',
            life: 3000
        });
        loading.value = false;
    }
};

const openNew = () => {
    publisher.value = {};
    submitted.value = false;
    publisherDialog.value = true;
};

const hideDialog = () => {
    publisherDialog.value = false;
    submitted.value = false;
};

const savePublisher = () => {
    submitted.value = true;

    if (publisher.value.name?.trim()) {
        if (publisher.value.id) {
            // Update existing publisher
            const index = publishers.value.findIndex((p) => p.id === publisher.value.id);
            publishers.value[index] = { ...publisher.value };
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Publisher Updated',
                life: 3000
            });
        } else {
            // Create new publisher
            publisher.value.id = publishers.value.length
                ? Math.max(...publishers.value.map((p) => p.id)) + 1
                : 1;
            publisher.value.books_count = 0;
            publishers.value.push({ ...publisher.value });
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Publisher Created',
                life: 3000
            });
        }

        publisherDialog.value = false;
        publisher.value = {};
    }
};

const editPublisher = (editPublisher) => {
    publisher.value = { ...editPublisher };
    publisherDialog.value = true;
};

const confirmDeletePublisher = (editPublisher) => {
    publisher.value = editPublisher;
    deletePublisherDialog.value = true;
};

const deletePublisher = () => {
    publishers.value = publishers.value.filter((p) => p.id !== publisher.value.id);
    deletePublisherDialog.value = false;
    publisher.value = {};
    toast.add({ severity: 'success', summary: 'Success', detail: 'Publisher Deleted', life: 3000 });
};

const confirmDeleteSelected = () => {
    deletePublishersDialog.value = true;
};

const deleteSelectedPublishers = () => {
    publishers.value = publishers.value.filter((p) => !selectedPublishers.value.includes(p));
    deletePublishersDialog.value = false;
    selectedPublishers.value = [];
    toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Publishers Deleted',
        life: 3000
    });
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-4">
                    <template #start>
                        <h5 class="m-0">Manage Publishers</h5>
                    </template>

                    <template #end>
                        <Button
                            label="New"
                            icon="pi pi-plus"
                            class="p-button-success mr-2"
                            @click="openNew" />
                        <Button
                            label="Delete"
                            icon="pi pi-trash"
                            class="p-button-danger"
                            @click="confirmDeleteSelected"
                            :disabled="
                                !selectedPublishers.value || !selectedPublishers.value.length
                            " />
                    </template>
                </Toolbar>

                <DataTable
                    :value="publishers"
                    v-model:selection="selectedPublishers"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :loading="loading"
                    :rowsPerPageOptions="[5, 10, 25]"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} publishers"
                    responsiveLayout="scroll">
                    <template #empty>
                        <div class="p-4 text-center">
                            <i class="pi pi-building text-primary" style="font-size: 3rem"></i>
                            <p>No publishers found.</p>
                        </div>
                    </template>

                    <Column
                        selectionMode="multiple"
                        style="width: 3rem"
                        :exportable="false"></Column>
                    <Column field="id" header="ID" sortable style="min-width: 5rem"></Column>
                    <Column field="name" header="Name" sortable style="min-width: 16rem"></Column>
                    <Column
                        field="address"
                        header="Address"
                        sortable
                        style="min-width: 16rem"></Column>
                    <Column field="phone" header="Phone" style="min-width: 10rem"></Column>
                    <Column field="email" header="Email" style="min-width: 12rem"></Column>
                    <Column field="books_count" header="Books" sortable style="min-width: 8rem">
                        <template #body="slotProps">
                            <Badge :value="slotProps.data.books_count" severity="info"></Badge>
                        </template>
                    </Column>
                    <Column style="min-width: 8rem">
                        <template #body="slotProps">
                            <Button
                                icon="pi pi-pencil"
                                class="p-button-rounded p-button-success mr-2"
                                @click="editPublisher(slotProps.data)" />
                            <Button
                                icon="pi pi-trash"
                                class="p-button-rounded p-button-danger"
                                @click="confirmDeletePublisher(slotProps.data)"
                                :disabled="slotProps.data.books_count > 0" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>

    <!-- Publisher Dialog -->
    <Dialog
        v-model:visible="publisherDialog"
        :style="{ width: '450px' }"
        header="Publisher Details"
        :modal="true"
        class="p-fluid">
        <div class="field">
            <label for="name">Name</label>
            <InputText
                id="name"
                v-model.trim="publisher.name"
                required
                autofocus
                :class="{ 'p-invalid': submitted && !publisher.name }" />
            <small class="p-error" v-if="submitted && !publisher.name">Name is required.</small>
        </div>
        <div class="field">
            <label for="address">Address</label>
            <Textarea id="address" v-model="publisher.address" rows="2" cols="20" />
        </div>
        <div class="field">
            <label for="phone">Phone</label>
            <InputText id="phone" v-model="publisher.phone" />
        </div>
        <div class="field">
            <label for="email">Email</label>
            <InputText id="email" v-model="publisher.email" />
        </div>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
            <Button label="Save" icon="pi pi-check" class="p-button-text" @click="savePublisher" />
        </template>
    </Dialog>

    <!-- Delete Publisher Dialog -->
    <Dialog
        v-model:visible="deletePublisherDialog"
        :style="{ width: '450px' }"
        header="Confirm"
        :modal="true">
        <div class="confirmation-content">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="publisher"
                >Are you sure you want to delete <b>{{ publisher.name }}</b
                >?</span
            >
        </div>
        <template #footer>
            <Button
                label="No"
                icon="pi pi-times"
                class="p-button-text"
                @click="deletePublisherDialog = false" />
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deletePublisher" />
        </template>
    </Dialog>

    <!-- Delete Publishers Dialog -->
    <Dialog
        v-model:visible="deletePublishersDialog"
        :style="{ width: '450px' }"
        header="Confirm"
        :modal="true">
        <div class="confirmation-content">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="selectedPublishers && selectedPublishers.length"
                >Are you sure you want to delete the selected publishers?</span
            >
        </div>
        <template #footer>
            <Button
                label="No"
                icon="pi pi-times"
                class="p-button-text"
                @click="deletePublishersDialog = false" />
            <Button
                label="Yes"
                icon="pi pi-check"
                class="p-button-text"
                @click="deleteSelectedPublishers" />
        </template>
    </Dialog>
</template>

<style scoped>
.confirmation-content {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
