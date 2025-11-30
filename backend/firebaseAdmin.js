const admin = require('firebase-admin');

function initializeFirebaseAdmin() {
    // Verhindern, dass wir mehrfach initialisieren
    if (admin.apps.length > 0) {
        return;
    }

    try {
        // VERSUCH 1: LOKAL (mit Datei)
        // Wir versuchen, die Datei zu laden. Wenn sie fehlt, springt er in den 'catch'-Block.
        const serviceAccount = require('./serviceAccountKey.json');

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log(">>> AUTH: Firebase Admin mit LOKALER JSON-Datei gestartet.");

    } catch (error) {
        // VERSUCH 2: CLOUD (ohne Datei, via IAM)
        // Wenn die Datei fehlt, nutzen wir die Cloud Run Identität
        console.log(">>> AUTH: Keine lokale Key-Datei gefunden. Versuche Cloud-Identität (Application Default Credentials)...");

        try {
            admin.initializeApp({
                credential: admin.credential.applicationDefault()
            });
            console.log(">>> AUTH: Firebase Admin via CLOUD IAM gestartet.");
        } catch (cloudError) {
            console.error(">>> AUTH FATAL: Konnte Firebase auch nicht via Cloud starten:", cloudError);
            throw cloudError;
        }
    }
}

async function verifyIdToken(idToken) {
    return admin.auth().verifyIdToken(idToken);
}

module.exports = { initializeFirebaseAdmin, verifyIdToken };