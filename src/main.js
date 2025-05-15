// main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import Aura from '@primeuix/themes/aura';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

// PrimeVue components you use
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Paginator from 'primevue/paginator'; // needed if you ever use <Paginator>
import Dropdown from 'primevue/dropdown'; // **needed** for the rows‑per‑page dropdown
import Button from 'primevue/button';
import Toolbar from 'primevue/toolbar';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Badge from 'primevue/badge';
import Toast from 'primevue/toast';
import Tooltip from 'primevue/tooltip';


import '@/assets/styles.scss';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: { darkModeSelector: '.app-dark' }
    }
});
app.use(ToastService);
app.use(ConfirmationService);

// Register components globally:
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('Paginator', Paginator);
app.component('Dropdown', Dropdown);
app.component('Button', Button);
app.component('Toolbar', Toolbar);
app.component('Dialog', Dialog);
app.component('InputText', InputText);
app.component('Textarea', Textarea);
app.component('Badge', Badge);
app.component('Toast', Toast);

app.directive('tooltip', Tooltip);

app.mount('#app');
