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
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_PROJECT.firebaseapp.com",
  projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_PROJECT.appspot.com",
  messagingSenderId: "REPLACE_WITH_YOUR_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID"
};
