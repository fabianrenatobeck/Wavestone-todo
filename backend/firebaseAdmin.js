const admin = require('firebase-admin');

function initializeFirebaseAdmin() {
    if (admin.apps.length > 0) return;

    // --- HIER WAR DER FEHLER ---
    // Wir nehmen jetzt die ID, die das Frontend uns im Token schickt (aus dem Log):
    const FIREBASE_PROJECT_ID = "auth-wavestone";
    // ---------------------------

    try {
        // VERSUCH 1: LOKAL
        const serviceAccount = require('./serviceAccountKey.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: FIREBASE_PROJECT_ID
        });
        console.log(">>> AUTH: Start Lokal mit Datei.");

    } catch (error) {
        // VERSUCH 2: CLOUD (IAM)
        console.log(">>> AUTH: Start Cloud IAM...");
        try {
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
                projectId: FIREBASE_PROJECT_ID
            });
            console.log(`>>> AUTH: Erfolgreich für Projekt ${FIREBASE_PROJECT_ID} gestartet.`);
        } catch (cloudError) {
            console.error(">>> AUTH FATAL:", cloudError);
            throw cloudError;
        }
    }
}

async function verifyIdToken(idToken) {
    return admin.auth().verifyIdToken(idToken);
}

module.exports = { initializeFirebaseAdmin, verifyIdToken };