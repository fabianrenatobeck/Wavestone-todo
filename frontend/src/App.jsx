import React, { useEffect, useState, useRef } from 'react';
import TaskList from './components/TaskListe.jsx';
import Dashboard from './components/Dashboard';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { signInWithGoogle } from "./firebase.js";
import { Toaster, toast } from 'react-hot-toast';
import Confetti from 'react-confetti'; // 🎉 NEU
import { useWindowSize } from 'react-use';
import "./App.css";

const auth = getAuth();

// Sound-Effekt (Online URL, damit du keine Datei runterladen musst)
const SUCCESS_SOUND = "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3";

function App() {
    // --- BASIC STATE ---
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');

    // --- 🚀 OVERKILL FEATURES STATE ---
    const [showConfetti, setShowConfetti] = useState(false);
    const [level, setLevel] = useState(1);
    const [xp, setXp] = useState(0);
    const [isListening, setIsListening] = useState(false); // Für Sprachsteuerung

    // Für Konfetti-Größe
    const { width, height } = useWindowSize();
    // Audio Player
    const audioRef = useRef(new Audio(SUCCESS_SOUND));

    // Forms
    const [editingTask, setEditingTask] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });
    const [form, setForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });

    // --- AUTH ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const accessToken = await currentUser.getIdToken();
                setUser(currentUser);
                setToken(accessToken);
            } else {
                setUser(null);
                setToken(null);
                setTasks([]);
            }
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // --- DATEN LADEN & GAMIFICATION ---
    const fetchTasks = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch("/tasks", { headers: { 'Authorization': `Bearer ${token}` } });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Server Fehler: ${res.status} ${res.statusText}`);
            }

            const data = await res.json();
            setTasks(data);

            // 🏆 LEVEL BERECHNUNG
            const completedCount = data.filter(t => t.completed).length;
            const newLevel = Math.floor(completedCount / 3) + 1; // Alle 3 Tasks ein Level-Up!
            const newXp = completedCount * 100;

            if (newLevel > level && level !== 1) {
                toast(`LEVEL UP! Willkommen in Level ${newLevel} ⚡️`, { icon: '🆙', duration: 4000 });
            }
            setLevel(newLevel);
            setXp(newXp);

        } catch (err) {
            console.error("Fetch Error:", err);
            toast.error("Verbindung fehlgeschlagen");
        }
        setLoading(false);
    };

    useEffect(() => {
        if (token && !authLoading) fetchTasks();
    }, [token, authLoading]);

    // --- 🎤 VOICE INPUT FEATURE ---
    const startListening = () => {
        // Browser-Check
        if (!('webkitSpeechRecognition' in window)) {
            toast.error("Dein Browser kann leider nicht hören 😢 (Nur Chrome/Edge)");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = 'de-DE';
        recognition.continuous = false;

        setIsListening(true);
        toast("Ich höre zu...", { icon: '👂' });

        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            setForm(prev => ({ ...prev, title: text }));
            toast.success(`Verstanden: "${text}"`);
            setIsListening(false);
        };

        recognition.onerror = () => {
            toast.error("Nichts verstanden");
            setIsListening(false);
        };

        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    // --- ACTIONS ---
    const handleLogin = async () => { try { await signInWithGoogle(); } catch (e) { toast.error("Login fehlgeschlagen"); } };
    const handleLogout = async () => { await signOut(auth); toast.success("Bis bald! 👋"); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) return;

        const payload = { ...form };
        if (!payload.dueDate) delete payload.dueDate;

        try {
            const res = await fetch("/tasks", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const created = await res.json();
                setTasks(prev => [created, ...prev]);
                setForm({ title: '', description: '', priority: 'medium', dueDate: '' });
                toast.success('Aufgabe erstellt! +50 XP ✨');
            } else { throw new Error(); }
        } catch (err) { toast.error('Fehler beim Erstellen'); }
    };

    const handleComplete = async (task) => {
        if (!token) return;

        // 🎉 KONFETTI & SOUND LOGIK
        if (!task.completed) {
            setShowConfetti(true);
            // Sound abspielen
            audioRef.current.volume = 0.5;
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {}); // Catch falls Autoplay blockiert

            toast.success("Fantastisch! Aufgabe erledigt! 🎉");

            // Konfetti nach 4 Sekunden stoppen
            setTimeout(() => setShowConfetti(false), 4000);
        }

        // Optimistisches Update
        const updatedTasks = tasks.map(t =>
            t._id === task._id ? { ...t, completed: !t.completed } : t
        );
        setTasks(updatedTasks);

        try {
            await fetch(`/tasks/${task._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ completed: !task.completed }),
            });
            fetchTasks(); // Wichtig für XP Update vom Server
        } catch (err) {
            toast.error("Fehler beim Speichern");
            fetchTasks();
        }
    };

    const handleDelete = async (taskId) => {
        if (!token) return;
        toast.promise(
            fetch(`/tasks/${taskId}`, { method: "DELETE", headers: { 'Authorization': `Bearer ${token}` } })
                .then(res => { if(!res.ok) throw new Error(); setTasks(prev => prev.filter(t => t._id !== taskId)); }),
            { loading: 'Lösche...', success: 'Gelöscht 🗑️', error: 'Fehler' }
        );
    };

    const submitEdit = async () => {
        if (!token || !editingTask) return;
        const payload = { ...editForm };
        if (!payload.dueDate) delete payload.dueDate;
        try {
            const res = await fetch(`/tasks/${editingTask._id}`, { method: "PATCH", headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) });
            if(res.ok) { setEditingTask(null); fetchTasks(); toast.success("Gespeichert ✅"); }
        } catch (err) { toast.error("Fehler"); }
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setEditForm({ title: task.title, description: task.description, priority: task.priority, dueDate: task.dueDate ? task.dueDate.slice(0,10) : '' });
    };

    // --- FILTER LOGIC ---
    const filteredTasks = tasks.filter(task => {
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
        if (filter === 'high') return task.priority === 'high';
        return true;
    });

    // --- RENDER ---
    if (authLoading) return <div className="loading-screen">Lade App...</div>;
    if (!user) return <div className="login-container"><h1 className="app-title">Aufgaben-Tracker</h1><button className="btn btn-google" onClick={handleLogin}>Mit Google anmelden</button><Toaster /></div>;

    return (
        <div className="app-container">
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#333', color: '#fff' } }}/>

            {/* 🎉 DAS KONFETTI OVERLAY */}
            {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={600} gravity={0.2} />}

            <header className="app-header">
                <div>
                    <h1 className="welcome-text">Hallo, {user.displayName}</h1>
                    {/* 🏆 GAMIFICATION BAR */}
                    <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ background: 'linear-gradient(45deg, #bb86fc, #7b1fa2)', padding: '4px 10px', borderRadius: '12px', color: 'white', fontWeight: 'bold', fontSize: '0.8rem', boxShadow: '0 2px 5px rgba(187,134,252,0.4)' }}>
                            LEVEL {level}
                        </div>
                        <div style={{ color: '#aaa', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                            XP: {xp}
                        </div>
                    </div>
                </div>
                <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
            </header>

            <div className="hero-section">
                <section className="create-task-section">
                    <h3>Neue Aufgabe</h3>
                    <form className="task-form" onSubmit={handleSubmit}>
                        <div className="form-group" style={{ position: 'relative' }}>
                            <input
                                className="input-title"
                                required
                                placeholder="Titel (oder diktieren...)"
                                value={form.title}
                                onChange={e => setForm({...form, title: e.target.value})}
                            />
                            {/* 🎤 VOICE BUTTON */}
                            <button
                                type="button"
                                onClick={startListening}
                                className="voice-btn"
                                style={{
                                    position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                                    background: isListening ? '#cf6679' : 'transparent',
                                    border: 'none', cursor: 'pointer', fontSize: '1.2rem',
                                    borderRadius: '50%', width: '32px', height: '32px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                                title="Spracheingabe"
                            >
                                {isListening ? '🛑' : '🎙️'}
                            </button>
                        </div>
                        <div className="form-group">
                            <textarea className="input-desc" placeholder="Beschreibung" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                        </div>
                        <div className="form-row">
                            <select className="select-priority" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                                <option value="low">Niedrig</option><option value="medium">Mittel</option><option value="high">Hoch</option>
                            </select>
                            <input className="input-date" type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
                        </div>
                        <button className="btn btn-create" type="submit">Erstellen</button>
                    </form>
                </section>

                <aside className="dashboard-wrapper">
                    <Dashboard tasks={tasks} />
                </aside>
            </div>

            <section className="task-list-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h2 style={{ margin: 0 }}>Aufgaben</h2>
                    <div className="filter-bar">
                        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Alle</button>
                        <button className={`filter-btn ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>Offen</button>
                        <button className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Fertig</button>
                        <button className={`filter-btn ${filter === 'high' ? 'active' : ''}`} onClick={() => setFilter('high')}>Prio 🔥</button>
                    </div>
                </div>

                {loading ? (
                    <div className="skeleton-container">
                        <div className="skeleton" style={{width: '100%', height: '80px'}}></div>
                        <div className="skeleton" style={{width: '100%', height: '80px', opacity: 0.7}}></div>
                    </div>
                ) : (
                    <TaskList tasks={filteredTasks} handleComplete={handleComplete} handleDelete={handleDelete} openEditModal={openEditModal} />
                )}
            </section>

            {editingTask && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Bearbeiten</h3>
                        <input className="input-title" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                        <textarea className="input-desc" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                        <div className="form-row">
                            <select className="select-priority" value={editForm.priority} onChange={e => setEditForm({...editForm, priority: e.target.value})}>
                                <option value="low">Niedrig</option><option value="medium">Mittel</option><option value="high">Hoch</option>
                            </select>
                            <input className="input-date" type="date" value={editForm.dueDate} onChange={e => setEditForm({...editForm, dueDate: e.target.value})} />
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-save" onClick={submitEdit}>Speichern</button>
                            <button className="btn btn-cancel" onClick={() => setEditingTask(null)}>Abbrechen</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;