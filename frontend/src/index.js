import React, { useEffect, useState } from 'react';
import TaskList from './components/TaskList';

function App() {
    const [tasks, setTasks] = useState([]);
    const [form, setForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });
    const [loading, setLoading] = useState(false);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await fetch('/tasks');
            const data = await res.json();
            setTasks(data);
        } catch (err) {
            console.error(err);
            alert('Fehler beim Laden der Aufgaben');
        }
        setLoading(false);
    };

    useEffect(() => { fetchTasks(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...form };
        try {
            const res = await fetch('/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Fehler');
            const created = await res.json();
            setTasks(prev => [created, ...prev]);
            setForm({ title: '', description: '', priority: 'medium', dueDate: '' });
        } catch (err) {
            console.error(err);
            alert('Fehler beim Erstellen der Aufgabe');
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
            <h1>Aufgaben-Tracker</h1>

            <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
                <input required placeholder="Titel" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                <br />
                <textarea placeholder="Beschreibung" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                <br />
                <label>
                    Priorität:
                    <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                        <option value="low">niedrig</option>
                        <option value="medium">mittel</option>
                        <option value="high">hoch</option>
                    </select>
                </label>
                <br />
                <label>
                    Fälligkeitsdatum:
                    <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
                </label>
                <br />
                <button type="submit">Aufgabe erstellen</button>
            </form>

            <h2>Aufgaben</h2>
            {loading ? <p>Lade...</p> : <TaskList tasks={tasks} refresh={fetchTasks} />}
        </div>
    );
}

export default App;
