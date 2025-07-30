// firebase.js
const admin = require('firebase-admin');

// Use a service account key from Firebase Console
const serviceAccount = require('./path-to-your-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
