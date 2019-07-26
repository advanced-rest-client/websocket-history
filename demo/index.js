import '@advanced-rest-client/arc-demo-helper/arc-demo-helper.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@polymer/paper-toast/paper-toast.js';
import '../websocket-history.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';

document.getElementById('theme').addEventListener('change', (e) => {
  if (e.target.checked) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
});
document.getElementById('styled').addEventListener('change', (e) => {
  if (e.target.checked) {
    document.body.classList.add('styled');
  } else {
    document.body.classList.remove('styled');
  }
});
document.getElementById('narrow').addEventListener('change', (e) => {
  const node = document.querySelector('websocket-history');
  if (e.target.checked) {
    node.setAttribute('narrow', '');
  } else {
    node.removeAttribute('narrow');
  }
});

document.getElementById('genButton').addEventListener('click', () => {
  DataGenerator.insertWebsocketData({ size: 100 }).then(() => {
    document.getElementById('genToast').opened = true;
    document.body.dispatchEvent(new CustomEvent('data-imported', {
      bubbles: true
    }));
  });
});

document.getElementById('delButton').addEventListener('click', () => {
  DataGenerator.destroyWebsocketsData().then(() => {
    document.getElementById('delToast').opened = true;
    document.body.dispatchEvent(new CustomEvent('datastore-destroyed', {
      bubbles: true,
      detail: {
        datastore: 'websocket-url-history'
      }
    }));
  });
});

window.addEventListener('socket-url-changed', function(e) {
  const toast = document.getElementById('navToast');
  const d = e.detail;
  toast.text = 'Opening web socket: ' + d.value;
  toast.opened = true;
});
