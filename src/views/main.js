import '../styles/main.css';
import Router from '../utils/router';
import HomePresenter from '../presenters/home-presenter';
import LoginPresenter from '../presenters/login-presenter';
import RegisterPresenter from '../presenters/register-presenter';
import AddStoryPresenter from '../presenters/add-story-presenter';

const routes = {
  '/': HomePresenter,
  '/home': HomePresenter,
  '/login': LoginPresenter,
  '/register': RegisterPresenter,
  '/add-story': AddStoryPresenter,
};

const router = new Router(document.querySelector('#main-content'), routes);

function toggleNavbarVisibility() {
  const navbar = document.querySelector('nav');
  if (!navbar) return;
  const hiddenRoutes = ['#/login', '#/register'];
  if (hiddenRoutes.includes(window.location.hash)) {
    navbar.style.display = 'none';
  } else {
    navbar.style.display = 'flex';
  }
}

window.addEventListener('hashchange', () => {
  router.renderPage();
  toggleNavbarVisibility();
});

window.addEventListener('load', () => {
  router.renderPage();
  toggleNavbarVisibility();
});

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById('btn-install');
  if (btn) btn.style.display = 'inline-block';
});

document.addEventListener('click', async (e) => {
  if (e.target.id === 'btn-install' && deferredPrompt) {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    e.target.style.display = 'none';
  }
});

async function registerSWAndPush() {
  if (!('serviceWorker' in navigator)) return;

  const swReg = await navigator.serviceWorker.register('./sw.js');

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;

  const applicationServerKey = urlBase64ToUint8Array(
    'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk'
  );

  const subscription = await swReg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });

  const json = subscription.toJSON();

  const body = {
    endpoint: subscription.endpoint,
    keys: json.keys,
    p256dh: json.keys.p256dh,
    auth: json.keys.auth,
  };

  const token = localStorage.getItem('authToken');
  if (token) {
    await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

window.addEventListener('load', () => {
  registerSWAndPush().catch(console.error);
});
