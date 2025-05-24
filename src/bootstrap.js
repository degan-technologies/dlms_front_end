import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// ✅ DO NOT use require(), use the ES import above

const echoKey = import.meta.env.VITE_REVERB_APP_KEY ?? 'local';
const echoHost = import.meta.env.VITE_REVERB_HOST ?? '127.0.0.1';
const echoPort = import.meta.env.VITE_REVERB_PORT ?? 8080;
const echoScheme = import.meta.env.VITE_REVERB_SCHEME ?? 'http';

// ✅ Full object passed to Echo
window.Echo = new Echo({
  broadcaster: 'pusher',
  key: echoKey,
  cluster: 'mt1',        // ✅ REQUIRED BY PUSHER EVEN IF YOU USE Reverb
  wsHost: echoHost,
  wsPort: echoPort,
  wssPort: echoPort,
  forceTLS: echoScheme === 'https',
  encrypted: false,
  enabledTransports: ['ws', 'wss'],
  disableStats: true,
  client: Pusher         // ✅ IMPORTANT: provide the Pusher client explicitly
});
