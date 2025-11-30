const admin = require('firebase-admin');

function initializeFirebaseAdmin() {
    if (admin.apps.length > 0) return;

    // HIER DEINE FIREBASE PROJEKT ID EINTRAGEN!
    // (Das stand in deinem JSON File von vorhin)
    const FIREBASE_PROJECT_ID = "task-manager-476be";

    try {
        // VERSUCH 1: LOKAL
        const serviceAccount = require('./serviceAccountKey.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: FIREBASE_PROJECT_ID // Wichtig!
        });
        console.log(">>> AUTH: Start Lokal mit Datei.");

    } catch (error) {
        // VERSUCH 2: CLOUD (IAM)
        console.log(">>> AUTH: Start Cloud IAM...");
        try {
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
                projectId: FIREBASE_PROJECT_ID // <--- DAS FIXT DAS PROBLEM!
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