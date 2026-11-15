// Study for fun – Firebase settings.
// Copy these values from: Firebase console → Project settings → General → Your apps → Web app.
// They are not secret (the browser needs them); access is protected by firestore.rules.
window.SFF_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDDHe8rCMpZDNcACG5_AJD3lw_Q5j0Nj0I",
  authDomain: "study-for-fun-7b03c.firebaseapp.com",
  projectId: "study-for-fun-7b03c",
  storageBucket: "study-for-fun-7b03c.firebasestorage.app",
  messagingSenderId: "16935647883",
  appId: "1:16935647883:web:63eabfaeddaeb3877ff28e"
};

// Region of the Cloud Function that talks to Claude (functions/index.js).
window.SFF_FUNCTIONS_REGION = "europe-west1";

// Firebase JS SDK version loaded from gstatic.
window.SFF_FIREBASE_SDK = "10.14.1";

// Building practice sets with AI (Claude). Turn on once Blaze + the ANTHROPIC_API_KEY secret + the `ask` function are deployed.
window.SFF_AI_ENABLED = false;
// Building with AI before it opens to everyone: these accounts (SHA-256 of the email, so no address is published) can already build.
window.SFF_AI_TESTERS = ['ebf9003385d411ad744e12c85496c220e990903620afdc6ca2cf203c6bca7bef', '6106bfb901583efd98d73db3e8ffa3939b022e26a8cbdcd4474dc97c89dc8d51'];
