import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const echoKey = import.meta.env.VITE_PUSHER_APP_KEY;
const echoCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER;
const echoScheme = import.meta.env.VITE_PUSHER_SCHEME || 'https';

window.Pusher = Pusher; // Required for Laravel Echo

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: echoKey,
    cluster: echoCluster,
    forceTLS: echoScheme === 'https',
    encrypted: true,
    authEndpoint: '/broadcasting/auth',
    auth: {
        headers: {
            Authorization: 'Bearer ' + getCookie('access_token')
        }
    }
});
console.log('window.Echo initialized:', window.Echo);