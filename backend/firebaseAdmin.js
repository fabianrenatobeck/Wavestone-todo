// Backend / firebaseAdmin.js
const admin = require('firebase-admin');

// Pfad zu der Datei, die du gerade heruntergeladen hast
const serviceAccount = require('./serviceAccountKey.json');

function initializeFirebaseAdmin() {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("Firebase Admin initialisiert!");
    }
}

async function verifyIdToken(idToken) {
    return admin.auth().verifyIdToken(idToken);
}

module.exports = { initializeFirebaseAdmin, verifyIdToken };