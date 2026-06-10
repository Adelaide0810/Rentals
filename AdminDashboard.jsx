import React from 'react';

const AdminDashboard = ({ username, onLogout, allPatients }) => {
    const today = new Date().toISOString().split('T')[0];
    const todaysPatients = allPatients.filter(p => p.date === today);
    const totalDailyRevenue = todaysPatients.reduce((sum, p) => sum + Number(p.cost || 0), 0);

    return (
        <div style={styles.pageContainer}>
            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>Clinic Analytics</h1>
                    <p style={styles.subtitle}>Welcome back, {username}</p>
                </div>
                <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
            </header>

            <div style={styles.statsCard}>
                <h3 style={styles.statsLabel}>Total Revenue for {today}</h3>
                <div style={styles.revenueAmount}>₵{totalDailyRevenue.toLocaleString('en-GH', { minimumFractionDigits: 2 })}</div>
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>Patient</th>
                            <th style={styles.th}>Procedure</th>
                            <th style={styles.th}>Dentist</th>
                            <th style={styles.th}>Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        {todaysPatients.map((p, idx) => (
                            <tr key={idx} style={styles.tableRow}>
                                <td style={styles.td}>{p.patientName}</td>
                                <td style={styles.td}>{p.procedure}</td>
                                <td style={styles.td}>{p.dentistName}</td>
                                <td style={{...styles.td, fontWeight: '600', color: '#2e7d32'}}>₵{Number(p.cost).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const styles = {
    pageContainer: { 
        padding: '40px', 
        boxsizing: 'border-box',
        margin: '0',
        fontFamily: "'Segoe UI', Roboto, sans-serif", 
        backgroundColor: '#f8fafc', 
        minHeight: '100vh' 
    },
    header: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '40px' 
    },
    title: { fontSize: '28px', color: '#1e293b', margin: 0 },
    subtitle: { color: '#64748b', marginTop: '5px' },
    logoutBtn: { 
        padding: '10px 24px', 
        backgroundColor: '#ef4444', 
        color: 'white', 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer',
        fontWeight: '600'
    },
    statsCard: { 
        background: '#ffffff', 
        padding: '30px', 
        borderRadius: '16px', 
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', 
        marginBottom: '30px',
        borderLeft: '5px solid #2e7d32'
    },
    statsLabel: { color: '#64748b', margin: '0 0 10px 0', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' },
    revenueAmount: { fontSize: '36px', color: '#1e293b', fontWeight: 'bold' },
    tableContainer: { background: '#ffffff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '16px', color: '#64748b', borderBottom: '1px solid #e2e8f0' },
    td: { padding: '16px', borderBottom: '1px solid #f1f5f9', color: '#334155' },
    tableRow: { transition: 'background 0.2s' }
};

export default AdminDashboard;