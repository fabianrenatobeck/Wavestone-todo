import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis } from 'recharts';

const Dashboard = ({ tasks }) => {
    // 1. Daten berechnen
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    // Schutz vor "Durch 0 teilen"
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    // --- LOGIK FÜR LEEREN ZUSTAND ---

    // Wenn keine Aufgaben da sind, zeigen wir einen grauen "Platzhalter-Kreis" (Wert 1)
    const isEmpty = total === 0;

    const statusData = isEmpty
        ? [{ name: 'Leer', value: 1 }] // Fake-Daten für grauen Ring
        : [
            { name: 'Erledigt', value: completed },
            { name: 'Offen', value: pending },
        ];

    // Farben: Wenn leer -> Dunkelgrau. Sonst -> Teal & Schwarzgrau
    const COLORS = isEmpty
        ? ['#2a2a2a']
        : ['#03dac6', '#444'];


    // Prio Daten (bleiben einfach 0, das sieht beim Balkendiagramm okay aus)
    const low = tasks.filter(t => t.priority === 'low').length;
    const medium = tasks.filter(t => t.priority === 'medium').length;
    const high = tasks.filter(t => t.priority === 'high').length;

    const prioData = [
        { name: 'Low', count: low },
        { name: 'Mid', count: medium },
        { name: 'High', count: high },
    ];

    // WICHTIG: Die Zeile "if (total === 0) return null;" wurde GELÖSCHT!
    // Wir rendern immer den Container, damit das Layout stabil bleibt.

    return (
        <div className="dashboard-container">

            {/* LINKER TEIL: Text & Progress */}
            <div className="dashboard-stat">
                <h3>Fortschritt</h3>
                {/* Farbe ändert sich zu Grau, wenn 0 Tasks da sind */}
                <div className="progress-text" style={{ color: isEmpty ? '#555' : '#03dac6' }}>
                    {progress}%
                </div>
                <p className="sub-text">
                    {isEmpty ? "Keine Aufgaben" : `${completed} / ${total} erledigt`}
                </p>
            </div>

            {/* MITTE: Donut Chart */}
            <div className="dashboard-chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={60}
                            paddingAngle={isEmpty ? 0 : 5} // Kein Abstand beim grauen Ring
                            dataKey="value"
                            stroke="none"
                        >
                            {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        {!isEmpty && (
                            <Tooltip
                                contentStyle={{ background: '#333', border: 'none', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                        )}
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* RECHTS: Prio Chart */}
            <div className="dashboard-chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prioData}>
                        <XAxis dataKey="name" stroke="#a0a0a0" fontSize={10} tickLine={false} axisLine={false} />
                        {!isEmpty && (
                            <Tooltip
                                cursor={{fill: 'rgba(255,255,255,0.1)'}}
                                contentStyle={{ background: '#333', border: 'none', borderRadius: '8px' }}
                            />
                        )}
                        <Bar dataKey="count" fill="#bb86fc" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Dashboard;