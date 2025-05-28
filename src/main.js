import { createApp } from 'vue';
import App from './App.vue';
import './bootstrap';
import router from './router';

import Aura from '@primeuix/themes/aura';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

// PrimeVue components you use
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Paginator from 'primevue/paginator';
import Textarea from 'primevue/textarea';
import Toast from 'primevue/toast';
import Toolbar from 'primevue/toolbar';
import Tooltip from 'primevue/tooltip';

import '@/assets/styles.scss';

// Create and configure Pinia with persistence
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

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
