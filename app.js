var push = {
  applicationServerKey: '',
  started: false,
  urlBase64ToUint8Array: function(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  },

  checkPermission: function() {
    return new Promise((resolve, reject) => {
      if (Notification.permission === 'denied') {
        return reject(new Error('Push messages are blocked.'));
      }

      if (Notification.permission === 'granted') {
        return resolve();
      }

      if (Notification.permission === 'default') {
        return Notification.requestPermission().then(result => {
          if (result !== 'granted') {
            reject(new Error('Bad permission result'));
          } else {
            resolve();
          }
        });
      }

      return reject(new Error('Unknown permission'));
    });
  },

  subscribe: function() {
    push.started = true;
    return push.checkPermission()
      .then(() => navigator.serviceWorker.ready)
      .then(serviceWorkerRegistration =>
        serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: push.urlBase64ToUint8Array(push.applicationServerKey),
        })
      )
      .then(subscription => {
        return push.sendSubscriptionToServer(subscription, 'POST');
      })
      .catch(e => {
        console.log(Notification.permission);
        if (Notification.permission === 'denied') {
          console.warn('denied');
        } else {
          console.error('disabled', e);
        }
      });
  },

  sendSubscriptionToServer: function(subscription, method) {
    const key = subscription.getKey('p256dh');
    const token = subscription.getKey('auth');
    const contentEncoding = (PushManager.supportedContentEncodings || ['aesgcm'])[0];

    return fetch('push_subscription.php', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        publicKey: key ? btoa(String.fromCharCode.apply(null, new Uint8Array(key))) : null,
        authToken: token ? btoa(String.fromCharCode.apply(null, new Uint8Array(token))) : null,
        contentEncoding,
      }),
    }).then(() => subscription);
  },


  start: function() {
    if (!window.isSecureContext) {
      return;
    }
    if (!('serviceWorker' in navigator)) {
      return;
    }

    if (!('PushManager' in window)) {
      return;
    }

    if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
      return;
    }

    if (Notification.permission === 'denied') {
      return;
    }

    if (window.Notification.permission === "default" || Notification.permission === 'granted') {
      if (!push.started) {
        push.subscribe();
      }
    }
  }
}

document.addEventListener('click', () => {
  push.start();
})

navigator.serviceWorker.register('serviceWorker.js').then((swReg) => {
  console.log('Registration succeeded. Scope is ' + swReg.scope);
}).catch((error) => {
  console.log('Registration failed with ' + error);
});
