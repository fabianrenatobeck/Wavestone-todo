import React from 'react';
import "../App.css"

const TaskList = ({ tasks, handleComplete, handleDelete, openEditModal }) => {

    if (tasks.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#a0a0a0',
                border: '2px dashed #444',
                borderRadius: '12px'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📝</div>
                <h3>Alles erledigt! (Oder noch nichts vor?)</h3>
                <p>Erstelle deine erste Aufgabe oben links.</p>
            </div>
        );
    } // <--- HIER HAT DIE KLAMMER GEFEHLT!

    return (
        <ul className="task-list">
            {tasks.map(task => (
                <li key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`}>

                    {/* LINKER BEREICH: CONTENT */}
                    <div className="task-content-wrapper">

                        {/* REGLER (SLIDER) */}
                        <div
                            className={`toggle-switch ${task.completed ? 'active' : ''}`}
                            onClick={() => handleComplete(task)}
                        >
                            <div className="toggle-slider" />
                        </div>

                        {/* TEXT INFOS */}
                        <div className="task-details">
                            <span className="task-title">{task.title}</span>
                            <div className="task-meta">
                                <span className="task-desc">{task.description}</span>
                                {task.dueDate && <span className="task-date">📅 {task.dueDate.slice(0,10)}</span>}
                                <span className={`task-prio prio-${task.priority}`}>
                                    {task.priority}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* RECHTER BEREICH: BUTTONS */}
                    <div className="task-actions">
                        <button
                            className="btn-icon btn-edit"
                            onClick={() => openEditModal(task)}
                            title="Bearbeiten"
                        >
                            ✏️
                        </button>

                        <button
                            className="btn-icon btn-delete"
                            onClick={() => handleDelete(task._id)}
                            title="Löschen"
                        >
                            🗑️
                        </button>
                    </div>

                </li>
            ))}
        </ul>
    );
};

export default TaskList;