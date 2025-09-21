import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const HighRiskEmployees = () => {
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEmployees = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const highRiskEmployees = await api.getHighRiskEmployees();
                setEmployees(highRiskEmployees);
            } catch (err) {
                setError('Failed to fetch employee data.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEmployees();
    }, []);

    const styles = {
        container: {
            padding: '1rem 0',
        },
        title: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
        },
        th: {
            borderBottom: '2px solid #ddd',
            padding: '0.75rem',
            textAlign: 'left',
            backgroundColor: '#f9f9f9',
        },
        td: {
            borderBottom: '1px solid #eee',
            padding: '0.75rem',
        },
    };

    if (isLoading) return <p>Loading employees...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Employee Churn Risk Overview</h2>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Employee Name</th>
                        <th style={styles.th}>Department</th>
                        <th style={styles.th}>Position</th>
                        <th style={styles.th}>Churn Risk Score</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map(emp => (
                        <tr key={emp.id}>
                            <td style={styles.td}>{emp.name}</td>
                            <td style={styles.td}>{emp.department}</td>
                            <td style={styles.td}>{emp.position}</td>
                            <td style={styles.td}>{emp.churn_risk_score ? emp.churn_risk_score.toFixed(2) : 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default HighRiskEmployees;
