var admin = require("firebase-admin");

var serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
