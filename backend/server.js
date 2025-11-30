require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');

const Task = require('./models/Task');

// --- SETUP ---
const app = express();
const PORT = process.env.PORT || 8080;

// WICHTIG: Loggen, dass der Server startet
console.log(">>> STARTUP: Initialisiere Server...");

app.use(cors());
app.use(bodyParser.json());
app.use(mongoSanitize());

// --- MONGODB VERBINDUNG (Nicht-blockierend) ---
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tasksdb';
console.log(">>> DB: Versuche Verbindung zu:", mongoUri.startsWith('mongodb+srv') ? 'Atlas Cloud' : 'Localhost');

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log(">>> DB: VERBUNDEN! ✅"))
.catch(err => console.error(">>> DB FEHLER: ❌", err.message));

// --- AUTH MIDDLEWARE ---
let verifyFirebaseToken = (req, res, next) => next();

if (process.env.ENABLE_FIREBASE === 'true') {
    try {
        const { initializeFirebaseAdmin, verifyIdToken } = require('./firebaseAdmin');
        initializeFirebaseAdmin();
        console.log(">>> AUTH: Firebase Admin geladen.");
        
        verifyFirebaseToken = async (req, res, next) => {
            const header = req.headers.authorization || '';
            if (!header.startsWith('Bearer ')) return res.status(401).json({ error: 'No Token' });
            try {
                const idToken = header.split('Bearer ')[1];
                const decoded = await verifyIdToken(idToken);
                req.user = decoded;
                next();
                // ...
            } catch (err) {
                // WICHTIG: Den genauen Fehler ausgeben!
                console.error('>>> TOKEN ERROR DETAILS:', JSON.stringify(err, null, 2));
                console.error('>>> Error Code:', err.code);
                console.error('>>> Error Message:', err.message);
                return res.status(401).json({ error: 'Invalid token', details: err.message });
            }
        };
    } catch (e) {
        console.log(">>> AUTH WARNUNG: Firebase konnte nicht geladen werden:", e.message);
    }
}

// --- ROUTEN ---
app.get('/health', (req, res) => res.send('OK')); // Health Check für Cloud Run

app.get('/tasks', verifyFirebaseToken, async (req, res) => {
    try {
        const filter = {};
        if (process.env.ENABLE_FIREBASE === 'true' && req.user) filter.userId = req.user.uid;
        const tasks = await Task.find(filter).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        console.error("GET Error:", err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/tasks', verifyFirebaseToken, async (req, res) => {
    try {
        const taskData = { ...req.body, completed: !!req.body.completed };
        if (process.env.ENABLE_FIREBASE === 'true' && req.user) taskData.userId = req.user.uid;
        const task = new Task(taskData);
        await task.save();
        res.status(201).json(task);
    } catch (err) { res.status(400).json({ error: 'Invalid data' }); }
});

app.patch('/tasks/:id', verifyFirebaseToken, async (req, res) => {
    try {
        const filter = { _id: req.params.id };
        if (process.env.ENABLE_FIREBASE === 'true' && req.user) filter.userId = req.user.uid;
        const updated = await Task.findOneAndUpdate(filter, req.body, { new: true });
        res.json(updated || { error: 'Not found' });
    } catch (err) { res.status(400).json({ error: 'Update failed' }); }
});

app.delete('/tasks/:id', verifyFirebaseToken, async (req, res) => {
    try {
        const filter = { _id: req.params.id };
        if (process.env.ENABLE_FIREBASE === 'true' && req.user) filter.userId = req.user.uid;
        await Task.findOneAndDelete(filter);
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: 'Delete failed' }); }
});

// --- STATIC FILES ---
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));
app.get('*', (req, res) => res.sendFile(path.join(publicPath, 'index.html')));

// --- SERVER START (WICHTIG: 0.0.0.0) ---
app.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> SERVER LÄUFT auf Port ${PORT} 🚀`);
    console.log(`>>> Erreichbar unter http://0.0.0.0:${PORT}`);
});
