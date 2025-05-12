<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Cookies from 'js-cookie'; // <-- Add this line

const router = useRouter();
const students = ref([]);
const loading = ref(true);
const filters = ref({
    global: { value: null, matchMode: 'contains' },
    FirstName: { value: null, matchMode: 'contains' },
    LastName: { value: null, matchMode: 'contains' },
    email: { value: null, matchMode: 'contains' },
    grade: { value: null, matchMode: 'contains' },
    section: { value: null, matchMode: 'contains' },
    gender: { value: null, matchMode: 'contains' },
    phone_no: { value: null, matchMode: 'contains' }
});
const totalRecords = ref(0);
const selectedStudents = ref([]);
const lazyParams = ref({
    first: 0,
    rows: 10,
    sortField: 'FirstName',
    sortOrder: 1,
    filters: {}
});

onMounted(() => {
    fetchStudents();
});

const fetchStudents = async () => {
    loading.value = true;
    try {
        // Get token from cookies or localStorage
        let token = Cookies.get('access_token');
        if (!token) {
            token = localStorage.getItem('access_token');
        }
        if (!token) {
            alert('No access token found. Please log in again.');
            loading.value = false;
            return;
        }
        // Build filter params
        const filterParams = {};
        Object.keys(filters.value).forEach(key => {
            if (filters.value[key].value) {
                filterParams[key] = filters.value[key].value;
            }
        });

        const response = await axios.get('http://localhost:8000/api/students', {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                page: Math.floor(lazyParams.value.first / lazyParams.value.rows) + 1,
                per_page: lazyParams.value.rows,
                ...filterParams // Spread all filter params
            }
        });
        console.log('API response:', response.data);
        students.value = response.data.data;
        // Use meta.total for correct pagination
        totalRecords.value = response.data.meta?.total ?? 0;
    } catch (error) {
        students.value = [];
        totalRecords.value = 0;
        if (error.response && error.response.status === 401) {
            alert('Authentication failed. Please log in again.');
        } else {
            alert('Failed to fetch students: ' + (error.response?.data?.message || error.message));
        }
        console.error('Failed to fetch students:', error);
    } finally {
        loading.value = false;
    }
};

const onPage = (event) => {
    lazyParams.value = { ...lazyParams.value, ...event };
    fetchStudents();
};

const onSort = (event) => {
    lazyParams.value = { ...lazyParams.value, ...event };
    fetchStudents();
};

const onFilter = () => {
    lazyParams.value.first = 0;
    fetchStudents();
};

const viewDetails = (student) => {
    router.push({ name: 'StudentDetails', params: { id: student.id } });
};

const editStudent = (student) => {
    router.push({ name: 'EditStudent', params: { id: student.id } });
};

const deleteStudent = async (student) => {
    if (!confirm(`Are you sure you want to delete ${student.FirstName} ${student.LastName}?`)) return;
    try {
        let token = Cookies.get('access_token');
        if (!token) {
            token = localStorage.getItem('access_token');
        }
        if (!token) {
            alert('No access token found. Please log in again.');
            return;
        }
        await axios.delete(`http://localhost:8000/api/students/${student.id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        fetchStudents(); // Refresh the list after deletion
    } catch (error) {
        if (error.response && error.response.status === 401) {
            alert('Authentication failed. Please log in again.');
        } else {
            alert('Failed to delete student: ' + (error.response?.data?.message || error.message));
        }
        console.error(error);
    }
};

const addStudent = () => {
    router.push({ name: 'register' });
};

const deleteSelectedStudents = () => {
    if (selectedStudents.value.length === 0) {
        alert('No students selected.');
        return;
    }
    // Implement actual delete logic here
    alert(`Delete ${selectedStudents.value.length} selected students`);
};

const showEditDialog = ref(false);
const editForm = ref({
    id: null,
    FirstName: '',
    LastName: '',
    grade: '',
    section: '',
    gender: '',
    phone_no: '',
    email: ''
});

const openEditDialog = (student) => {
    editForm.value = { ...student };
    showEditDialog.value = true;
};

const updateStudent = async () => {
    try {
        let token = Cookies.get('access_token');
        if (!token) {
            token = localStorage.getItem('access_token');
        }
        if (!token) {
            alert('No access token found. Please log in again.');
            return;
        }
        await axios.put(`http://localhost:8000/api/students/${editForm.value.id}`, editForm.value, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        showEditDialog.value = false;
        fetchStudents();
    } catch (error) {
        if (error.response && error.response.status === 401) {
            alert('Authentication failed. Please log in again.');
        } else {
            alert('Failed to update student: ' + (error.response?.data?.message || error.message));
        }
        console.error(error);
    }
};
</script>

<template>
    <div class="card">
        <h5 class="m-0">Student Management</h5>
        <p class="mt-2 mb-4 text-gray-600">Browse, search, and manage students in the system.</p>

        <!-- Toolbar -->
        <div class="flex justify-content-between align-items-center mb-3">
            <div>
                <Button label="Add Student" icon="pi pi-plus" class="mr-2 p-button-success" @click="addStudent" />
                <Button label="Delete Selected" icon="pi pi-trash" class="p-button-danger" :disabled="!selectedStudents.length" @click="deleteSelectedStudents" />
            </div>
            <!-- Global Search Bar -->
            <span class="p-input-icon-left" style="min-width: 300px;">
                <i class="pi pi-search" />
                <InputText v-model="filters.global.value" placeholder="Search students..." @input="onFilter" class="w-full" />
            </span>
        </div>

        <!-- Student Data Table -->
        <DataTable
            v-model:selection="selectedStudents"
            :value="students"
            :paginator="true"
            :rows="10"
            :loading="loading"
            :lazy="true"
            :total-records="totalRecords"
            :row-hover="true"
            paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            current-page-report-template="Showing {first} to {last} of {totalRecords} students"
            responsive-layout="stack"
            :global-filter-fields="['FirstName', 'LastName', 'email', 'grade', 'section', 'gender', 'phone_no']"
            v-model:filters="filters"
            filter-display="row"
            @page="onPage($event)"
            @sort="onSort($event)"
            @filter="onFilter()"
            style-class="p-datatable-gridlines p-datatable-sm custom-table"
            breakpoint="960px"
        >
            <template #empty> No students found. </template>
            <template #loading> Loading students data. Please wait. </template>

            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            <Column field="FirstName" header="First Name" sortable filter filterPlaceholder="Filter by first name"></Column>
            <Column field="LastName" header="Last Name" sortable filter filterPlaceholder="Filter by last name"></Column>
            <Column field="grade" header="Grade" sortable filter filterPlaceholder="Filter by grade">
                <template #body="{ data }">
                    <span class="badge badge-grade">{{ data.grade }}</span>
                </template>
            </Column>
            <Column field="section" header="Section" sortable filter filterPlaceholder="Filter by section"></Column>
            <Column field="gender" header="Gender" sortable filter filterPlaceholder="Filter by gender">
                <template #body="{ data }">
                    <span :class="['badge', data.gender === 'Male' ? 'badge-male' : 'badge-female']">{{ data.gender }}</span>
                </template>
            </Column>
            <Column field="phone_no" header="Phone No" sortable filter filterPlaceholder="Filter by phone"></Column>
            <Column field="email" header="Email" sortable filter filterPlaceholder="Filter by email"></Column>
            <Column headerStyle="min-width:10rem; text-align:center" bodyStyle="text-align:center">
                <template #header>Actions</template>
                <template #body="{ data }">
                    <div class="flex flex-wrap justify-content-center gap-2">
                        <!-- <Button icon="pi pi-eye" tooltip="View Details" tooltipOptions="{ position: 'top' }" class="p-button-rounded p-button-info p-button-sm" @click="viewDetails(data)" /> -->
                        <Button icon="pi pi-pencil" tooltip="Edit" tooltipOptions="{ position: 'top' }" class="p-button-rounded p-button-success p-button-sm" @click="openEditDialog(data)" />
                        <Button icon="pi pi-trash" tooltip="Delete" tooltipOptions="{ position: 'top' }" class="p-button-rounded p-button-danger p-button-sm" @click="deleteStudent(data)" />
                    </div>
                </template>
            </Column>
        </DataTable>

        <!-- Edit Student Dialog -->
        <Dialog v-model:visible="showEditDialog" :modal="true" :closable="true" :style="{ width: '500px' }" class="edit-dialog">
            <template #header>
                <div class="flex align-items-center gap-2">
                    <i class="pi pi-user-edit" style="font-size: 1.5rem; color: #42a5f5;"></i>
                    <span class="text-xl font-bold" style="color: #42a5f5;">Edit Student</span>
                </div>
            </template>
            <div class="mb-2 text-gray-600">Update the student information below and click <b>Update</b> to save changes.</div>
            <Divider />
            <form @submit.prevent="updateStudent">
                <div class="edit-form-flex">
                    <div class="field">
                        <label>First Name</label>
                        <span class="p-input-icon-left w-full">
                            <i class="pi pi-user" />
                            <InputText v-model="editForm.FirstName" required class="w-full" />
                        </span>
                    </div>
                    <div class="field">
                        <label>Last Name</label>
                        <span class="p-input-icon-left w-full">
                            <i class="pi pi-user" />
                            <InputText v-model="editForm.LastName" required class="w-full" />
                        </span>
                    </div>
                    <div class="field">
                        <label>Grade</label>
                        <span class="p-input-icon-left w-full">
                            <i class="pi pi-star" />
                            <InputText v-model="editForm.grade" required class="w-full" />
                        </span>
                    </div>
                    <div class="field">
                        <label>Section</label>
                        <span class="p-input-icon-left w-full">
                            <i class="pi pi-book" />
                            <InputText v-model="editForm.section" required class="w-full" />
                        </span>
                    </div>
                    <div class="field">
                        <label>Gender</label>
                        <span class="p-input-icon-left w-full">
                            <i class="pi pi-users" />
                            <Dropdown v-model="editForm.gender" :options="['Male','Female']" placeholder="Select Gender" required class="w-full" />
                        </span>
                    </div>
                    <div class="field">
                        <label>Phone No</label>
                        <span class="p-input-icon-left w-full">
                            <i class="pi pi-phone" />
                            <InputText v-model="editForm.phone_no" required class="w-full" />
                        </span>
                    </div>
                    <div class="field" style="grid-column: span 2;">
                        <label>Email</label>
                        <span class="p-input-icon-left w-full">
                            <i class="pi pi-envelope" />
                            <InputText v-model="editForm.email" required class="w-full" />
                        </span>
                    </div>
                </div>
                <div class="flex justify-content-end gap-2 mt-3">
                    <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="showEditDialog = false" type="button" />
                    <Button label="Update" icon="pi pi-check" type="submit" />
                </div>
            </form>
        </Dialog>
    </div>
</template>

<style scoped>
.card {
    margin: 2rem auto;
    max-width: 1200px;
    padding: 2rem;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.custom-table .p-datatable-tbody > tr:nth-child(even) {
    background: #f9f9f9;
}
.custom-table .p-datatable-tbody > tr:hover {
    background: #e3f2fd;
}
.badge {
    display: inline-block;
    padding: 0.25em 0.6em;
    font-size: 0.85em;
    border-radius: 12px;
    color: #fff;
}
.badge-male {
    background: #42a5f5;
}
.badge-female {
    background: #ec407a;
}
.badge-grade {
    background: #7e57c2;
}
.edit-dialog .p-dialog-header {
    background: #e3f2fd;
    border-bottom: 1px solid #90caf9;
}
.edit-dialog .p-dialog-content {
    background: #f8fafc;
}
.edit-form-flex {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem 1.5rem;
    margin-bottom: 0.5rem;
}
.edit-form-flex .field {
    margin-bottom: 0;
}
@media (max-width: 600px) {
    .edit-form-flex {
        grid-template-columns: 1fr;
    }
}
</style>