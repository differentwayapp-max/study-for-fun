// Study for fun – Firebase settings.
// Copy these values from: Firebase console → Project settings → General → Your apps → Web app.
// They are not secret (the browser needs them); access is protected by firestore.rules.
window.SFF_FIREBASE_CONFIG = {
  apiKey: "REPLACE_ME",
  authDomain: "study-for-fun.firebaseapp.com",
  projectId: "study-for-fun",
  storageBucket: "study-for-fun.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME"
};

// Region of the Cloud Function that talks to Claude (functions/index.js).
window.SFF_FUNCTIONS_REGION = "europe-west1";

// Firebase JS SDK version loaded from gstatic.
window.SFF_FIREBASE_SDK = "10.14.1";
