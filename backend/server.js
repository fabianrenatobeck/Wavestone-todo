require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
// NEU: Importieren des Sanitizers
const mongoSanitize = require('express-mongo-sanitize');

const Task = require('./models/Task');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- SECURITY: MONGO SANITIZE ---
// Dies entfernt "$" und "." aus dem Input, um NoSQL Injections zu verhindern.
// Wichtig: Muss NACH bodyParser kommen, aber VOR den Routen.
app.use(mongoSanitize());
// --------------------------------

// MongoDB Verbindung
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tasksdb';
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- AUTH MIDDLEWARE ---
let verifyFirebaseToken = (req, res, next) => next();

if (process.env.ENABLE_FIREBASE === 'true') {
    const { initializeFirebaseAdmin, verifyIdToken } = require('./firebaseAdmin');

    try {
        initializeFirebaseAdmin();
    } catch (e) {
        console.log("Firebase Admin Warnung:", e.message);
    }

    verifyFirebaseToken = async (req, res, next) => {
        const header = req.headers.authorization || '';
        if (!header.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing Bearer token' });
        }
        const idToken = header.split('Bearer ')[1];
        try {
            const decoded = await verifyIdToken(idToken);
            req.user = decoded;
            next();
        } catch (err) {
            console.error('Token verification failed', err);
            return res.status(401).json({ error: 'Invalid token' });
        }
    };
}

// --- ROUTEN ---

// GET /tasks
app.get('/tasks', verifyFirebaseToken, async (req, res) => {
    try {
        const filter = {};
        if (process.env.ENABLE_FIREBASE === 'true' && req.user) {
            filter.userId = req.user.uid;
        }
        const tasks = await Task.find(filter).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /tasks
app.post('/tasks', verifyFirebaseToken, async (req, res) => {
    try {
        const { title, description, priority, dueDate, completed } = req.body;

        // Mongoose Cast-Protection & Sanitize schützen hier zusätzlich
        const taskData = {
            title,
            description,
            priority,
            dueDate,
            completed: !!completed
        };

        if (process.env.ENABLE_FIREBASE === 'true' && req.user) {
            taskData.userId = req.user.uid;
        }

        const task = new Task(taskData);
        await task.save();
        res.status(201).json(task);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Invalid data' });
    }
});

// PATCH /tasks/:id
app.patch('/tasks/:id', verifyFirebaseToken, async (req, res) => {
    try {
        const filter = { _id: req.params.id };

        if (process.env.ENABLE_FIREBASE === 'true' && req.user) {
            filter.userId = req.user.uid;
        }

        const updatedTask = await Task.findOneAndUpdate(
            filter,
            req.body,
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found or authorized' });
        }

        res.json(updatedTask);
    } catch (err) {
        res.status(400).json({ error: 'Update failed' });
    }
});

// DELETE /tasks/:id
app.delete('/tasks/:id', verifyFirebaseToken, async (req, res) => {
    try {
        const filter = { _id: req.params.id };

        if (process.env.ENABLE_FIREBASE === 'true' && req.user) {
            filter.userId = req.user.uid;
        }

        const deletedTask = await Task.findOneAndDelete(filter);

        if (!deletedTask) {
            return res.status(404).json({ error: 'Task not found or authorized' });
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Delete failed' });
    }
});

// Serve React build (Single Dockerfile Logic)
const publicPath = path.join(__dirname, 'public');

// 1. Statische Dateien bereitstellen
app.use(express.static(publicPath));

// 2. Catch-All Route
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// Port
const PORT = process.env.PORT || 8080;
// Wir erzwingen 0.0.0.0 (bedeutet: "Höre auf alle Anfragen, egal woher")
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
