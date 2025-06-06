<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Cookies from 'js-cookie';
import debounce from 'lodash-es/debounce';

const router = useRouter();
const students = ref([]);
const loading = ref(false);
const selectedStudents = ref([]);

const totalRecords = ref(0);
const lazyParams = ref({
    first: 0,
    rows: 10,
    sortField: 'FirstName',
    sortOrder: 1
});

const filters = ref({
    global: { value: '', matchMode: 'contains' }
});

// Debounced fetch for search/filter only
// const fetchStudentsDebounced = debounce(() => {
//     //fetchStudents();
// }, 300);

const fetchStudents = async () => {
   // loading.value = true;
    try {
        const token = Cookies.get('access_token') || localStorage.getItem('access_token');
        if (!token) {
            alert('No access token found. Please log in again.');
            return;
        }

        const appliedFilters = {};
        for (const key in filters.value) {
            if (filters.value[key]?.value) {
                appliedFilters[key] = filters.value[key].value;
            }
        }

        const response = await axios.get('http://localhost:8000/api/students', {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                page: Math.floor(lazyParams.value.first / lazyParams.value.rows) + 1,
                per_page: lazyParams.value.rows,
                sortField: lazyParams.value.sortField,
                sortOrder: lazyParams.value.sortOrder,
                ...appliedFilters,
                with: 'user'
            }
        });

        students.value = response.data.data.map(student => ({
            ...student,
            'user.username': student.user?.username || ''
        }));
        totalRecords.value = response.data.meta?.total ?? 0;
    } catch (error) {
        console.error('Error fetching students:', error);
        alert(error.response?.data?.message || 'Failed to fetch students.');
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchStudents();
});

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
    //fetchStudentsDebounced();
};

const viewDetails = (student) => router.push({ name: 'StudentDetails', params: { id: student.id } });

const editStudent = (student) => router.push({ name: 'EditStudent', params: { id: student.id } });

const deleteStudent = async (student) => {
    if (!confirm(`Are you sure you want to delete ${student.first_name} ${student.last_name}?`)) return;
    try {
        const token = Cookies.get('access_token') || localStorage.getItem('access_token');
        await axios.delete(`http://localhost:8000/api/students/${student.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchStudents();
    } catch (error) {
        alert('Failed to delete student: ' + (error.response?.data?.message || error.message));
    }
};

const addStudent = () => router.push({ name: 'register' });

const deleteSelectedStudents = async () => {
    if (!selectedStudents.value.length) {
        alert('No students selected.');
        return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedStudents.value.length} selected students?`)) return;

    try {
        const token = Cookies.get('access_token') || localStorage.getItem('access_token');
        const deletePromises = selectedStudents.value.map(student =>
            axios.delete(`http://localhost:8000/api/students/${student.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
        );

        await Promise.all(deletePromises);
        fetchStudents();
    } catch (error) {
        alert('Failed to delete selected students: ' + (error.response?.data?.message || error.message));
    }
};

// Edit form logic
const showEditDialog = ref(false);
const editForm = ref({
    id: null,
    first_name: '',
    last_name: '',
    grade:{
        name: '',
    },
    section:{
        name: '',
    },
    
    gender: '',
   
    adress: '',
    user: {
        username: '',
        email: '',
        phone_no: '',
    }
});

const openEditDialog = (student) => {
    editForm.value = { ...student };
    showEditDialog.value = true;
};

const updateStudent = async () => {
    try {
        const token = Cookies.get('access_token') || localStorage.getItem('access_token');
        
        // Prepare the data to be sent to the backend
        const studentData = {
            first_name: editForm.value.first_name,
            last_name: editForm.value.last_name,
            adress: editForm.value.adress,
            grade_name: editForm.value.grade.name,
            section_name: editForm.value.section.name,
            gender: editForm.value.gender,
            username: editForm.value.user.username,
            email: editForm.value.user.email,
            phone_no: editForm.value.user.phone_no,
            // Add password if needed
            // password: editForm.value.user.password
        };

        await axios.put(`http://localhost:8000/api/students/${editForm.value.id}`, studentData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        showEditDialog.value = false;
        fetchStudents();
    } catch (error) {
        alert('Failed to update student: ' + (error.response?.data?.message || error.message));
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
            <span class="p-input-icon-left" style="min-width: 300px;">
                <i class="pi pi-search" />
                <InputText v-model="filters.global.value" placeholder="Search students..." @input="onFilter" class="w-full" />
            </span>
        </div>

        <!-- Data Table -->
        <DataTable
            v-model:selection="selectedStudents"
            :value="students"
            :paginator="true"
            :rows="lazyParams.rows"
            :totalRecords="totalRecords"
            :loading="loading"
            :filters="filters"
            selectionMode="multiple"
            @page="onPage"
            @sort="onSort"
            @filter="onFilter"
        >
            <Column selectionMode="multiple" headerStyle="width: 3rem" />
            <Column field="user.username" header="Username" sortable />
            <Column field="first_name" header="First Name" sortable />
            <Column field="last_name" header="Last Name" sortable />
            <Column field="user.email" header="Email" sortable />
            <Column field="gender" header="Gender" sortable />
            <Column field="grade.name" header="Grade" sortable />
            <Column field="section.name" header="Section" sortable />
            <Column field="user.phone_no" header="Phone" sortable />
            <Column field="adress" header="Adress" sortable />
            <Column headerStyle="min-width:10rem; text-align:center" bodyStyle="text-align:center">
                <template #header>Actions</template>
                <template #body="{ data }">
                    <div class="flex flex-wrap justify-content-center gap-2">
                        <Button icon="pi pi-pencil" tooltip="Edit" class="p-button-rounded p-button-success p-button-sm" @click="openEditDialog(data)" />
                        <Button icon="pi pi-trash" tooltip="Delete" class="p-button-rounded p-button-danger p-button-sm" @click="deleteStudent(data)" />
                    </div>
                </template>
            </Column>
        </DataTable>

        <!-- Edit Dialog -->
        <Dialog v-model:visible="showEditDialog" :modal="true" :closable="true" :style="{ width: '500px' }">
            <template #header>
                <div class="flex align-items-center gap-2">
                    <i class="pi pi-user-edit" style="font-size: 1.5rem; color: #42a5f5;"></i>
                    <span class="text-xl font-bold" style="color: #42a5f5;">Edit Student</span>
                </div>
            </template>
            <div class="mb-2 text-gray-600">Update the student information below and click <b>Update</b> to save changes.</div>
            <Divider />
            <form @submit.prevent="updateStudent">
                <div class="grid grid-cols-2 gap-4">
                    <div class="field">
                        <label>First Name</label>
                        <InputText v-model="editForm.first_name" class="w-full" required />
                    </div>
                    <div class="field">
                        <label>Last Name</label>
                        <InputText v-model="editForm.last_name" class="w-full" required />
                    </div>
                    <div class="field">
                        <label>Grade</label>
                        <InputText v-model="editForm.grade.name" class="w-full" required />
                    </div>
                    <div class="field">
                        <label>Section</label>
                        <InputText v-model="editForm.section.name" class="w-full" required />
                    </div>
                    <div class="field">
                        <label>Gender</label>
                        <InputText v-model="editForm.gender" class="w-full" />
                    </div>
                    <div class="field">
                        <label>Phone</label>
                        <InputText v-model="editForm.user.phone_no" class="w-full" />
                    </div>
                    <div class="field">
                        <label>Email</label>
                        <InputText v-model="editForm.user.email" class="w-full" />
                    </div>
                    <div class="field">
                        <label>Username</label>
                        <InputText v-model="editForm.user.username" class="w-full" />
                    </div>
                    <div class="field col-span-2">
                        <label>Adress</label>
                        <InputText v-model="editForm.adress" class="w-full" />
                    </div>
                </div>
                <div class="flex justify-end mt-4">
                    <Button label="Cancel" icon="pi pi-times" class="p-button-text mr-2" @click="showEditDialog = false" />
                    <Button label="Update" icon="pi pi-check" type="submit" class="p-button-success" />
                </div>
            </form>
        </Dialog>
    </div>
</template>

<style scoped>
.card {
    padding: 2rem;
    background-color: white;
    border-radius: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.field {
    display: flex;
    flex-direction: column;
}
</style>
