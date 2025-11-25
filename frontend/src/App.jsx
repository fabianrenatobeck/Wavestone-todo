import React, { useEffect, useState } from 'react';
import TaskList from './components/TaskListe.jsx';
import Dashboard from './components/Dashboard'; // Stelle sicher, dass Dashboard.jsx existiert
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { signInWithGoogle } from "./firebase.js";
import { Toaster, toast } from 'react-hot-toast';
import "./App.css";

const auth = getAuth();

function App() {
    // --- STATE ---
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filter State
    const [filter, setFilter] = useState('all');

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

    // --- DATEN LADEN ---
    const fetchTasks = async () => {
        if (!token) return;
        setLoading(true);
        try {
            // Nutzung relativer Pfade für Docker/Proxy Support
            const res = await fetch("/tasks", {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // WICHTIG: Prüfen ob Antwort OK ist (z.B. kein Fehler 500)
            if (!res.ok) {
                const text = await res.text(); // Text lesen statt JSON bei Fehler
                throw new Error(`Server Fehler: ${res.status} ${res.statusText}`);
            }

            const data = await res.json();
            setTasks(data);
        } catch (err) {
            console.error("Fetch Error:", err);
            toast.error("Konnte Aufgaben nicht laden.");
        }
        setLoading(false);
    };

    useEffect(() => {
        if (token && !authLoading) fetchTasks();
    }, [token, authLoading]);

    // --- ACTIONS ---

    const handleLogin = async () => {
        try { await signInWithGoogle(); } catch (e) { toast.error("Login fehlgeschlagen"); }
    };

    const handleLogout = async () => {
        await signOut(auth);
        toast.success("Erfolgreich ausgeloggt 👋");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) return;

        const loadingToast = toast.loading('Erstelle Aufgabe...');

        try {
            const res = await fetch("/tasks", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                const created = await res.json();
                setTasks(prev => [created, ...prev]);
                setForm({ title: '', description: '', priority: 'medium', dueDate: '' });
                toast.success('Aufgabe erstellt! 🚀', { id: loadingToast });
            } else {
                throw new Error("Fehler beim Erstellen");
            }
        } catch (err) {
            toast.error('Fehler beim Erstellen', { id: loadingToast });
        }
    };

    const handleDelete = async (taskId) => {
        if (!token) return;

        toast.promise(
            async () => {
                const res = await fetch(`/tasks/${taskId}`, {
                    method: "DELETE",
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("Fehler");
                setTasks(prev => prev.filter(t => t._id !== taskId));
            },
            {
                loading: 'Lösche...',
                success: 'Aufgabe gelöscht 🗑️',
                error: 'Konnte nicht gelöscht werden',
            }
        );
    };

    const handleComplete = async (task) => {
        if (!token) return;

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
        } catch (err) {
            console.error(err);
            toast.error("Fehler beim Speichern");
            fetchTasks(); // Rollback
        }
    };

    const submitEdit = async () => {
        if (!token || !editingTask) return;
        try {
            const res = await fetch(`/tasks/${editingTask._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(editForm),
            });
            if(res.ok) {
                setEditingTask(null);
                fetchTasks();
                toast.success("Änderungen gespeichert ✅");
            }
        } catch (err) { toast.error("Fehler beim Speichern"); }
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setEditForm({
            title: task.title,
            description: task.description,
            priority: task.priority,
            dueDate: task.dueDate ? task.dueDate.slice(0,10) : ''
        });
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

    if (!user) {
        return (
            <div className="login-container">
                <h1 className="app-title">Aufgaben-Tracker</h1>
                <button className="btn btn-google" onClick={handleLogin}>Mit Google anmelden</button>
                <Toaster />
            </div>
        );
    }

    return (
        <div className="app-container">
            <Toaster position="bottom-right" toastOptions={{
                style: { background: '#333', color: '#fff' }
            }}/>

            <header className="app-header">
                <h1 className="welcome-text">Hallo, {user.displayName}</h1>
                <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
            </header>

            {/* HERO SECTION */}
            <div className="hero-section">
                {/* Links: Form */}
                <section className="create-task-section">
                    <h3>Neue Aufgabe</h3>
                    <form className="task-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <input
                                className="input-title"
                                required
                                placeholder="Titel"
                                value={form.title}
                                onChange={e => setForm({...form, title: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <textarea
                                className="input-desc"
                                placeholder="Beschreibung"
                                value={form.description}
                                onChange={e => setForm({...form, description: e.target.value})}
                            />
                        </div>
                        <div className="form-row">
                            <select className="select-priority" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                                <option value="low">Niedrig</option>
                                <option value="medium">Mittel</option>
                                <option value="high">Hoch</option>
                            </select>
                            <input className="input-date" type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
                        </div>
                        <button className="btn btn-create" type="submit">Erstellen</button>
                    </form>
                </section>

                {/* Rechts: Dashboard */}
                <aside className="dashboard-wrapper">
                    <Dashboard tasks={tasks} />
                </aside>
            </div>

            {/* LISTE SECTION */}
            <section className="task-list-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h2 style={{ margin: 0 }}>Aufgaben</h2>

                    {/* Filter Buttons */}
                    <div className="filter-bar">
                        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Alle</button>
                        <button className={`filter-btn ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>Offen</button>
                        <button className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Fertig</button>
                        <button className={`filter-btn ${filter === 'high' ? 'active' : ''}`} onClick={() => setFilter('high')}>Prio</button>
                    </div>
                </div>

                {loading ? (
                    <div className="skeleton-container">
                        <div className="skeleton" style={{width: '100%', height: '80px'}}></div>
                        <div className="skeleton" style={{width: '100%', height: '80px', opacity: 0.7}}></div>
                        <div className="skeleton" style={{width: '80%', height: '80px', opacity: 0.5}}></div>
                    </div>
                ) : (
                    <TaskList
                        tasks={filteredTasks}
                        handleComplete={handleComplete}
                        handleDelete={handleDelete}
                        openEditModal={openEditModal}
                    />
                )}
            </section>

            {/* EDIT MODAL */}
            {editingTask && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Aufgabe bearbeiten</h3>
                        <input className="input-title" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                        <textarea className="input-desc" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                        <div className="form-row">
                            <select className="select-priority" value={editForm.priority} onChange={e => setEditForm({...editForm, priority: e.target.value})}>
                                <option value="low">Niedrig</option> <option value="medium">Mittel</option> <option value="high">Hoch</option>
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