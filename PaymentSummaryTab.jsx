import React, { useState, useEffect } from 'react';

const PaymentSummaryTab = ({ patientsList }) => {
    const [totalPayments, setTotalPayments] = useState(0);

    useEffect(() => {
        // Automatically sum up payments whenever the patient list updates
        if (patientsList && patientsList.length > 0) {
            const sum = patientsList.reduce((acc, patient) => {
                // Ensure payment is treated as a number; adjust 'paymentAmount' to match your actual property name
                const payment = Number(patient.paymentAmount) || 0;
                return acc + payment;
            }, 0);
            setTotalPayments(sum);
        } else {
            setTotalPayments(0);
        }
    }, [patientsList]);

    return (
        <div style={styles.tabContainer}>
            <div style={styles.header}>Total Payments Received</div>
            <div style={styles.amount}>₵ {totalPayments.toFixed(2)}</div>
        </div>
    );
};

// Inline styles keep this completely isolated from your existing CSS
const styles = {
    tabContainer: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '12px 20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 9999, // Ensures it stays on top of other elements
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'inherit'
    },
    header: {
        fontSize: '12px',
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '6px'
    },
    amount: {
        fontSize: '22px',
        color: '#2e7d32', // A professional green for completed payments
        fontWeight: 'bold'
    }
};

export default PaymentSummaryTab;