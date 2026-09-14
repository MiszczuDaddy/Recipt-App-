// ---------------------------------------------------------------------------
// Firebase configuration for the Receipt Scanner PWA.
//
// This app uses its OWN, DEDICATED Firebase project — do not point this at
// the quoting-app or callout-tracker Firebase project.
//
// See README.md ("Firebase setup") for step-by-step instructions to create
// the project and fill in the values below. These values are the public
// client config for a Firebase web app — they are safe to commit; access is
// controlled by the Firestore/Storage security rules (see firestore.rules
// and storage.rules), not by keeping this file secret.
// ---------------------------------------------------------------------------
window.RECEIPT_APP_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDilcwsdJHt0jfye8wqtEIahQMdECdKg4E",
  authDomain: "recipts-app.firebaseapp.com",
  projectId: "recipts-app",
  storageBucket: "recipts-app.firebasestorage.app",
  messagingSenderId: "493144127593",
  appId: "1:493144127593:web:a9eda578ed7443400bcaf8"
};
