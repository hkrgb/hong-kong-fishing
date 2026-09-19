Firebase Web SDK 10.12.5, downloaded from Google's official distribution:
https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js
https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js
https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js

The app import in auth/firestore is changed to ./firebase-app.js for offline loading.
Original embedded copyright/license notices are retained. Firebase is Apache-2.0:
https://github.com/firebase/firebase-js-sdk/blob/firebase%4010.12.5/LICENSE
Authentication and synchronization still require network access; no credentials or player data are bundled.
