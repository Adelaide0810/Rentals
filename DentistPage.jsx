import React, { useState, useEffect } from 'react';
import PaymentSummaryTab from './PaymentSummaryTab';

const DentistPage = ({ username = 'Doctor', onLogout , allPatients, setAllPatients }) => {
  const [patients, setPatients] = useState([]);
  const [archivePatients, setArchivePatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [toothData, setToothData] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);
  
  // Archive UI Management States
  const [showArchive, setShowArchive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [queueSearchQuery, setQueueSearchQuery] = useState(''); // Added for Attendance feed search
  const [viewingHistoryMode, setViewingHistoryMode] = useState(false);

  // Comprehensive Dental Assessment Structured States
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [historyPresentIllness, setHistoryPresentIllness] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [pastDentalHistory, setPastDentalHistory] = useState('');
  const [extraoralExam, setExtraoralExam] = useState('');
  const [intraoralSoftTissue, setIntraoralSoftTissue] = useState('');
  const [intraoralPeriodontal, setIntraoralPeriodontal] = useState('');
  const [diagnosticAids, setDiagnosticAids] = useState('');
  const [formulatedDiagnoses, setFormulatedDiagnoses] = useState('');
  const [phasedTreatmentPlan, setPhasedTreatmentPlan] = useState('');

  // Enhanced Billing States with Dropdown
  const [procedures, setProcedures] = useState([
    { id: 1, name: 'Consultation', price: 50 },
    { id: 2, name: 'Scaling & Polishing', price: 150 },
    { id: 3, name: 'Tooth Extraction', price: 300 },
    { id: 4, name: 'Root Canal Treatment (RCT)', price: 800 },
    { id: 5, name: 'Filling (Amalgam)', price: 200 },
    { id: 6, name: 'Filling (Composite)', price: 250 },
    { id: 7, name: 'Crown Placement', price: 1200 },
    { id: 8, name: 'Denture (Full)', price: 2000 },
    { id: 9, name: 'Denture (Partial)', price: 1500 },
    { id: 10, name: 'Cleaning & Fluoride', price: 100 }
  ]);
  
  const [selectedProcedures, setSelectedProcedures] = useState([]);
  const [totalBill, setTotalBill] = useState(0);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [pendingBills, setPendingBills] = useState([]);

  const upperTeeth = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
  const lowerTeeth = [32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17];

  const conditionSchema = {
    HEALTHY: { label: 'Healthy', color: '#10b981', symbol: '✓' },
    CARIES: { label: 'Caries (Decay)', color: '#ef4444', symbol: '●' },
    MISSING: { label: 'Missing', color: '#64748b', symbol: '✕' },
    RCT: { label: 'Root Canal (RCT)', color: '#3b82f6', symbol: '▲' }
  };

  // Load billing data when patient selected
  useEffect(() => {
    if (selectedPatient) {
      const savedBill = localStorage.getItem(`bill_${selectedPatient.unique_code}`);
      if (savedBill) {
        const parsed = JSON.parse(savedBill);
        setSelectedProcedures(parsed.items || []);
        setTotalBill(parsed.total || 0);
      } else {
        setSelectedProcedures([]);
        setTotalBill(0);
      }
      
      // Fetch pending bills
      const allBills = JSON.parse(localStorage.getItem('all_pending_bills') || '[]');
      setPendingBills(allBills);
    }
  }, [selectedPatient]);

  // Add procedure to billing
  const addProcedure = (procedure) => {
    if (viewingHistoryMode) return;
    
    const existingIndex = selectedProcedures.findIndex(p => p.id === procedure.id);
    let updated;
    
    if (existingIndex > -1) {
      updated = selectedProcedures.filter((_, i) => i !== existingIndex);
    } else {
      updated = [...selectedProcedures, procedure];
    }
    
    setSelectedProcedures(updated);
    const newTotal = updated.reduce((sum, item) => sum + item.price, 0);
    setTotalBill(newTotal);
  };

  // Save bill to localStorage and forward to receptionist
  const saveBillToReceptionist = () => {
    if (!selectedPatient || selectedProcedures.length === 0) {
      alert('Please select at least one procedure before saving.');
      return;
    }

    const billRecord = {
      id: Date.now(),
      patientCode: selectedPatient.unique_code,
      patientName: `${selectedPatient.first_name} ${selectedPatient.last_name}`,
      patientAge: selectedPatient.age,
      patientContact: selectedPatient.contact,
      procedures: selectedProcedures,
      total: totalBill,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      dentistName: username,
      paidAmount: 0
    };

    // 1. Save to dentist's individual patient key tracking cache
    localStorage.setItem(`bill_${selectedPatient.unique_code}`, JSON.stringify({
      items: selectedProcedures,
      total: totalBill
    }));

    // 2. Fetch fresh, push new record, and rewrite the global storage state
    const currentBillsRaw = localStorage.getItem('all_pending_bills');
    const allBills = currentBillsRaw ? JSON.parse(currentBillsRaw) : [];
    
    // Safety check to prevent duplicate pushes of identical timestamp records
    if (!allBills.some(b => b.id === billRecord.id)) {
      allBills.push(billRecord);
    }
    
    // Write fresh string payload array back to disk
    const stringifiedData = JSON.stringify(allBills);
    localStorage.setItem('all_pending_bills', stringifiedData);

    // 3. BROADCAST TRIGGER: Handles both multi-tab and same-tab SPA contexts
    // Native cross-tab broadcast trigger
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'all_pending_bills',
      newValue: stringifiedData,
      storageArea: localStorage
    }));

    // Explicit custom event dispatch fallback for same-tab / SPA components
    const customSyncEvent = new CustomEvent('localPendingBillsUpdate', { 
      detail: allBills 
    });
    window.dispatchEvent(customSyncEvent);

    alert(`Bill for ${selectedPatient.first_name} saved and forwarded to receptionist. Total: ₵${totalBill}`);
    setShowBillingModal(false);
  };

  // Override default browser body margins on mount
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.boxSizing = 'border-box';

    return () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
    };
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync Active Waiting Room Feed
  const fetchQueue = async () => {
    try {
      // UPDATED TO ABSOLUTE URL
      const response = await fetch('https://${API_BASE_URL}/dentist.php');
      if (!response.ok) throw new Error("Network error");
      const data = await response.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Queue sync error:", err);
      setErrorMessage("System link interrupted.");
    }
  };

  // Sync Past Case Files Archive Node
  const fetchArchive = async () => {
    try {
      // UPDATED TO ABSOLUTE URL
      const response = await fetch('https://${API_BASE_URL}/dentist.php?archive=true');
      if (!response.ok) throw new Error("Network error loading archive");
      const data = await response.json();
      setArchivePatients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Archive lookup error:", err);
    }
  };

  useEffect(() => {
    fetchQueue();
    fetchArchive();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectPatient = (patient, isFromHistory = false) => {
    setSelectedPatient(patient);
    setClinicalNotes(patient.dentist_notes || '');
    setViewingHistoryMode(isFromHistory);
    
    try {
      const parsedNotes = JSON.parse(patient.dentist_notes);
      setChiefComplaint(parsedNotes.chiefComplaint || '');
      setHistoryPresentIllness(parsedNotes.historyPresentIllness || '');
      setMedicalHistory(parsedNotes.medicalHistory || '');
      setPastDentalHistory(parsedNotes.pastDentalHistory || '');
      setExtraoralExam(parsedNotes.extraoralExam || '');
      setIntraoralSoftTissue(parsedNotes.intraoralSoftTissue || '');
      setIntraoralPeriodontal(parsedNotes.intraoralPeriodontal || '');
      setDiagnosticAids(parsedNotes.diagnosticAids || '');
      setFormulatedDiagnoses(parsedNotes.formulatedDiagnoses || '');
      setPhasedTreatmentPlan(parsedNotes.phasedTreatmentPlan || '');
    } catch (e) {
      setChiefComplaint('');
      setHistoryPresentIllness('');
      setMedicalHistory('');
      setPastDentalHistory('');
      setExtraoralExam('');
      setIntraoralSoftTissue('');
      setIntraoralPeriodontal('');
      setDiagnosticAids('');
      setFormulatedDiagnoses(patient.dentist_notes || '');
      setPhasedTreatmentPlan('');
    }

    try {
      setToothData(patient.tooth_data ? JSON.parse(patient.tooth_data) : {});
    } catch (e) {
      console.error("Malformed tooth data payload:", e);
      setToothData({});
    }
    if (isMobile && isFromHistory) setShowArchive(false);
  };

  const handleToothClick = (toothNum) => {
    if (viewingHistoryMode) return;
    
    const currentCondition = toothData[toothNum] || 'HEALTHY';
    const conditionsOrder = ['HEALTHY', 'CARIES', 'MISSING', 'RCT'];
    const nextIndex = (conditionsOrder.indexOf(currentCondition) + 1) % conditionsOrder.length;
    const nextCondition = conditionsOrder[nextIndex];

    setToothData({ ...toothData, [toothNum]: nextCondition });
  };

  const handleSaveClinicalRecord = async () => {
    if (!selectedPatient || viewingHistoryMode) return;

    const packedClinicalNotes = JSON.stringify({
      chiefComplaint,
      historyPresentIllness,
      medicalHistory,
      pastDentalHistory,
      extraoralExam,
      intraoralSoftTissue,
      intraoralPeriodontal,
      diagnosticAids,
      formulatedDiagnoses,
      phasedTreatmentPlan
    });

    try {
      // UPDATED TO ABSOLUTE URL
      const response = await fetch('https://${API_BASE_URL}/dentist.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unique_code: selectedPatient.unique_code,
          dentist_notes: packedClinicalNotes,
          tooth_data: JSON.stringify(toothData),
          status: 'Seen'
        })
      });

      const result = await response.json();
      if (result.success) {
        alert(`Clinical file signed and locked for ${selectedPatient.first_name}.`);
        setSelectedPatient(null);
        setClinicalNotes('');
        setToothData({});
        setSelectedProcedures([]);
        setTotalBill(0);
        
        setChiefComplaint('');
        setHistoryPresentIllness('');
        setMedicalHistory('');
        setPastDentalHistory('');
        setExtraoralExam('');
        setIntraoralSoftTissue('');
        setIntraoralPeriodontal('');
        setDiagnosticAids('');
        setFormulatedDiagnoses('');
        setPhasedTreatmentPlan('');

        fetchQueue();
        fetchArchive();
      } else {
        alert("Transaction failed: " + result.message);
      }
    } catch (err) {
      console.error("Transmission breakdown:", err);
    }
  };

  // Filter archived list
  const filteredArchive = archivePatients.filter(p => 
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.unique_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter attendance queue feed list
  const filteredPatients = patients.filter(p =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(queueSearchQuery.toLowerCase()) ||
    p.unique_code.toLowerCase().includes(queueSearchQuery.toLowerCase())
  );

  // Calculate distinct counts for dynamic waiting header numbers
  const trueWaitingCount = patients.filter(p => p.status !== 'Seen').length;

  const theme = {
    bgDark: '#070b14', bgPanel: '#0e1626', bgCard: '#172237',
    accentBlue: '#2563eb', accentGlow: '#3b82f6', textMain: '#f8fafc',
    textMuted: '#94a3b8', border: '#1e293b', warningYellow: '#f59e0b',
    successGreen: '#10b981'
  };

  const styles = {
    wrapper: { display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', padding: 0, margin: 0, backgroundColor: theme.bgDark, color: theme.textMain, fontFamily: 'system-ui, -apple-system, sans-serif', position: 'relative', overflow: 'hidden' },
    navbar: { backgroundColor: '#020617', borderBottom: `1px solid ${theme.border}`, padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, flexWrap: 'wrap', gap: '10px' },
    mainDashboard: { display: 'flex', flexDirection: isMobile ? 'column' : 'row', flex: 1, overflow: 'hidden', position: 'relative' },
    sidebarPanel: { width: isMobile ? '100%' : '360px', backgroundColor: theme.bgPanel, borderRight: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', minHeight: 0 },
    workspacePanel: { flex: 1, padding: isMobile ? '20px' : '35px', overflowY: 'auto', backgroundColor: theme.bgDark },
    archiveOverlay: { position: 'absolute', top: 0, right: showArchive ? 0 : '-400px', width: isMobile ? '100%' : '380px', height: '100%', backgroundColor: '#0b111e', borderLeft: `1px solid ${theme.border}`, boxShadow: '-8px 0 24px rgba(0,0,0,0.4)', transition: 'right 0.3s cubic-bezier(0.16, 1, 0.3, 1)', zIndex: 5, display: 'flex', flexDirection: 'column' },
    assessmentCard: { backgroundColor: theme.bgPanel, padding: '20px', borderRadius: '12px', border: `1px solid ${theme.border}`, marginBottom: '20px' },
    assessmentGrid: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '20px' },
    odontogramCard: { backgroundColor: theme.bgPanel, padding: '24px', borderRadius: '12px', border: `1px solid ${theme.border}`, marginBottom: '24px' },
    jawRow: { display: 'flex', justifyContent: 'space-between', gap: '6px', margin: '12px 0', overflowX: 'auto', paddingBottom: '5px', flexWrap: 'wrap' },
    toothBox: (condition) => {
      const target = conditionSchema[condition || 'HEALTHY'];
      return {
        flex: 1, minWidth: '42px', maxWidth: '55px', height: '65px', backgroundColor: theme.bgCard, border: `1px solid ${target.color}`, borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '6px 2px', cursor: viewingHistoryMode ? 'default' : 'pointer', transition: 'all 0.15s ease-in-out', boxShadow: condition && condition !== 'HEALTHY' ? `0 0 8px ${target.color}33` : 'none'
      };
    },
    clinicalInput: { width: '100%', height: '100px', padding: '12px', borderRadius: '8px', backgroundColor: theme.bgCard, border: `1px solid ${theme.border}`, fontSize: '14px', color: theme.textMain, boxSizing: 'border-box', outline: 'none', resize: 'vertical', marginTop: '6px', fontFamily: 'system-ui' },
    billingModal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' },
    billingModalContent: { backgroundColor: theme.bgPanel, borderRadius: '12px', border: `1px solid ${theme.border}`, padding: '30px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }
  };

  // Billing Modal Component
  const BillingModal = () => (
    <div style={styles.billingModal} onClick={() => setShowBillingModal(false)}>
      <div style={styles.billingModalContent} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '22px', color: theme.accentGlow, fontWeight: '700' }}>
            💰 Billing & Procedures
          </h2>
          <button 
            onClick={() => setShowBillingModal(false)}
            style={{ background: 'none', border: 'none', color: theme.textMuted, fontSize: '24px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <p style={{ color: theme.textMuted, marginBottom: '20px' }}>
          Patient: <strong>{selectedPatient?.first_name} {selectedPatient?.last_name}</strong>
        </p>

        {/* Procedures Dropdown */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ fontSize: '13px', color: theme.textMuted, fontWeight: '500', display: 'block', marginBottom: '10px' }}>
            Select Procedures
          </label>
          <select 
            onChange={(e) => {
              const procId = parseInt(e.target.value);
              const procedure = procedures.find(p => p.id === procId);
              if (procedure) {
                addProcedure(procedure);
              }
              e.target.value = '';
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.border}`,
              color: theme.textMain,
              fontSize: '14px',
              cursor: 'pointer',
              boxSizing: 'border-box'
            }}
            defaultValue=""
          >
            <option value="">-- Add a Procedure --</option>
            {procedures.map(proc => (
              <option key={proc.id} value={proc.id}>
                {proc.name} - ₵{proc.price}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Procedures List */}
        <div style={{ marginBottom: '25px', maxHeight: '300px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '14px', color: theme.accentGlow, marginBottom: '15px', fontWeight: '600' }}>
            Selected Procedures ({selectedProcedures.length})
          </h3>
          
          {selectedProcedures.length === 0 ? (
            <p style={{ color: theme.textMuted, fontSize: '13px', textAlign: 'center', padding: '20px' }}>
              No procedures selected yet. Add procedures using the dropdown above.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedProcedures.map((proc, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor: theme.bgCard,
                    borderRadius: '8px',
                    border: `1px solid ${theme.border}`
                  }}
                >
                  <div>
                    <p style={{ margin: '0 0 4px 0', color: theme.textMain, fontSize: '13px', fontWeight: '500' }}>
                      {proc.name}
                    </p>
                    <p style={{ margin: 0, color: theme.textMuted, fontSize: '12px' }}>
                      ₵{proc.price}
                    </p>
                  </div>
                  <button
                    onClick={() => addProcedure(proc)}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cost Summary */}
        <div style={{
          backgroundColor: theme.bgCard,
          padding: '20px',
          borderRadius: '8px',
          border: `1px solid ${theme.border}`,
          marginBottom: '25px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ color: theme.textMuted, fontSize: '14px' }}>Subtotal:</span>
            <span style={{ color: theme.textMain, fontSize: '14px', fontWeight: '600' }}>₵{totalBill}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: `1px solid ${theme.border}` }}>
            <span style={{ color: theme.accentGlow, fontSize: '16px', fontWeight: '700' }}>Total:</span>
            <span style={{ color: theme.successGreen, fontSize: '20px', fontWeight: '700' }}>₵{totalBill}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowBillingModal(false)}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: 'transparent',
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              color: theme.textMuted,
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Cancel
          </button>
          <button
            onClick={saveBillToReceptionist}
            disabled={selectedProcedures.length === 0}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: selectedProcedures.length === 0 ? theme.textMuted : theme.accentBlue,
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: selectedProcedures.length === 0 ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s',
              opacity: selectedProcedures.length === 0 ? 0.5 : 1
            }}
          >
            ✓ Send to Receptionist
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.wrapper}>
      {/* Top Banner */}
      <div style={styles.navbar}>
        <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: theme.successGreen }}></div>
          CareDental Clinical Console
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => { fetchArchive(); setShowArchive(true); }}
            style={{ backgroundColor: `${theme.warningYellow}15`, color: theme.warningYellow, padding: '6px 14px', border: `1px solid ${theme.warningYellow}44`, borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '13px' }}
          >
            📋 Patient Case Archives
          </button>
          <span style={{ fontSize: '13px', color: theme.textMuted }}>Dr. {username}</span>
          <button onClick={onLogout} style={{ backgroundColor: 'transparent', color: theme.textMuted, padding: '6px 12px', border: `1px solid ${theme.border}`, borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Sign Out</button>
        </div>
      </div>

      <div style={styles.mainDashboard}>
        {/* Waiting Sidebar */}
        <div style={styles.sidebarPanel}>
          <div style={{ padding: '20px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '600' }}>Attendance Feed</span>
            <span style={{ fontSize: '11px', padding: '3px 8px', backgroundColor: `${theme.accentBlue}22`, color: theme.accentGlow, borderRadius: '20px' }}>{trueWaitingCount} Waiting</span>
          </div>
          
          {/* Functional Feed Search Bar Container */}
          <div style={{ padding: '12px 15px', borderBottom: `1px solid ${theme.border}`, backgroundColor: '#0b1120' }}>
            <input 
              type="text" 
              placeholder="Search active room feed..."
              value={queueSearchQuery}
              onChange={(e) => setQueueSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', backgroundColor: theme.bgCard, border: `1px solid ${theme.border}`, color: theme.textMain, outline: 'none', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ overflowY: 'auto', flex: 1, padding: '15px' }}>
            {filteredPatients.length === 0 ? (
              <div style={{ textAlign: 'center', color: theme.textMuted, padding: '30px 10px', fontSize: '13px' }}>
                {queueSearchQuery ? "No matching entries found." : "Waiting room list is clear."}
              </div>
            ) : (
              filteredPatients.map((p) => {
                const isSeen = p.status === 'Seen';
                return (
                  <div 
                    key={p.id} 
                    style={{ padding: '16px', borderRadius: '10px', backgroundColor: (selectedPatient?.id === p.id && !viewingHistoryMode) ? `${theme.accentBlue}12` : theme.bgCard, border: (selectedPatient?.id === p.id && !viewingHistoryMode) ? `1px solid ${theme.accentGlow}` : `1px solid ${theme.border}`, marginBottom: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => handleSelectPatient(p, false)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: theme.textMain }}>{p.first_name} {p.last_name}</div>
                      
                      {/* Dynamic Waiting to Seen tags */}
                      <span style={{ 
                        fontSize: '10px', 
                        padding: '3px 8px', 
                        borderRadius: '4px', 
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        backgroundColor: isSeen ? `${theme.successGreen}15` : `${theme.warningYellow}15`,
                        color: isSeen ? theme.successGreen : theme.warningYellow,
                        border: `1px solid ${isSeen ? theme.successGreen : theme.warningYellow}33`
                      }}>
                        {p.status || 'Waiting'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: theme.textMuted, fontFamily: 'monospace', marginTop: '6px' }}>REF: {p.unique_code}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Dynamic Workspace Panel */}
        <div style={styles.workspacePanel}>
          {selectedPatient ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                  Patient File: {selectedPatient.first_name} {selectedPatient.last_name}
                </h2>
                {viewingHistoryMode && (
                  <span style={{ backgroundColor: `${theme.warningYellow}22`, color: theme.warningYellow, border: `1px solid ${theme.warningYellow}`, fontSize: '12px', padding: '4px 12px', borderRadius: '4px', fontWeight: '600' }}>
                    📜 HISTORICAL ARCHIVE RECORD (READ-ONLY)
                  </span>
                )}
              </div>

              {/* CLINICAL ASSESSMENT PHASE 1: SUBJECTIVE ANAMNESIS */}
              <div style={styles.assessmentCard}>
                <h3 style={{ fontSize: '15px', color: theme.accentGlow, margin: '0 0 15px 0', fontWeight: '600', borderBottom: `1px solid ${theme.border}`, paddingBottom: '8px' }}>
                  Step 1 & 2: Chief Complaint (CC) & History of Present Illness (HPI)
                </h3>
                <div style={styles.assessmentGrid}>
                  <div>
                    <label style={{ fontSize: '13px', color: theme.textMuted, fontWeight: '500' }}>Chief Complaint (CC)</label>
                    <textarea 
                      style={styles.clinicalInput}
                      value={chiefComplaint}
                      onChange={(e) => setChiefComplaint(e.target.value)}
                      disabled={viewingHistoryMode}
                      placeholder="Patient's primary reason for visit in their own words..."
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', color: theme.textMuted, fontWeight: '500' }}>History of Present Illness (HPI)</label>
                    <textarea 
                      style={styles.clinicalInput}
                      value={historyPresentIllness}
                      onChange={(e) => setHistoryPresentIllness(e.target.value)}
                      disabled={viewingHistoryMode}
                      placeholder="Explore onset, location, duration, character, aggravating/alleviating factors..."
                    />
                  </div>
                </div>
              </div>

              {/* CLINICAL ASSESSMENT PHASE 2: MEDICAL & HISTORICAL FILING */}
              <div style={styles.assessmentCard}>
                <h3 style={{ fontSize: '15px', color: theme.accentGlow, margin: '0 0 15px 0', fontWeight: '600', borderBottom: `1px solid ${theme.border}`, paddingBottom: '8px' }}>
                  Step 3 & 4: Medical History (MH) & Past Dental History (PDH)
                </h3>
                <div style={styles.assessmentGrid}>
                  <div>
                    <label style={{ fontSize: '13px', color: theme.textMuted, fontWeight: '500' }}>Medical History & Review of Systems</label>
                    <textarea 
                      style={styles.clinicalInput}
                      value={medicalHistory}
                      onChange={(e) => setMedicalHistory(e.target.value)}
                      disabled={viewingHistoryMode}
                      placeholder="Systemic conditions, allergies, active prescriptions, bleeding risks..."
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', color: theme.textMuted, fontWeight: '500' }}>Past Dental History</label>
                    <textarea 
                      style={styles.clinicalInput}
                      value={pastDentalHistory}
                      onChange={(e) => setPastDentalHistory(e.target.value)}
                      disabled={viewingHistoryMode}
                      placeholder="Previous dental interventions, frequency, local anesthetic complications, anxiety markers..."
                    />
                  </div>
                </div>
              </div>

              {/* CLINICAL ASSESSMENT PHASE 3: OBJECTIVE EXAMINATION PHYSICAL NODES */}
              <div style={styles.assessmentCard}>
                <h3 style={{ fontSize: '15px', color: theme.accentGlow, margin: '0 0 15px 0', fontWeight: '600', borderBottom: `1px solid ${theme.border}`, paddingBottom: '8px' }}>
                  Step 5 & 6: Extraoral & Intraoral Soft Tissue / Periodontal Examinations
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '13px', color: theme.textMuted, fontWeight: '500' }}>Extraoral Examination (EOE)</label>
                    <textarea 
                      style={styles.clinicalInput}
                      value={extraoralExam}
                      onChange={(e) => setExtraoralExam(e.target.value)}
                      disabled={viewingHistoryMode}
                      placeholder="Facial symmetry, lymph nodes, musculature, TMJ mobility status..."
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', color: theme.textMuted, fontWeight: '500' }}>Intraoral Soft Tissue Evaluation</label>
                    <textarea 
                      style={styles.clinicalInput}
                      value={intraoralSoftTissue}
                      onChange={(e) => setIntraoralSoftTissue(e.target.value)}
                      disabled={viewingHistoryMode}
                      placeholder="Lips, tongue, floor of mouth, palate, oral cancer screening observations..."
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', color: theme.textMuted, fontWeight: '500' }}>Periodontal Status Assessment</label>
                    <textarea 
                      style={styles.clinicalInput}
                      value={intraoralPeriodontal}
                      onChange={(e) => setIntraoralPeriodontal(e.target.value)}
                      disabled={viewingHistoryMode}
                      placeholder="Gingival description, probing depths, recession, plaque indexing metrics..."
                    />
                  </div>
                </div>
              </div>
              
              {/* INTERACTIVE ODONTOGRAM SECTION */}
              <div style={styles.odontogramCard}>
                <h3 style={{ fontSize: '15px', color: theme.accentGlow, margin: '0 0 15px 0', fontWeight: '600' }}>
                  {viewingHistoryMode ? "📖 Historical Treatment Map State" : "🦷 Step 6 (Continued): Anatomical Adult Odontogram Mapping Grid (Click teeth to change state)"}
                </h3>
                
                {/* Upper Maxillary Arch */}
                <div style={{ fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Maxillary Upper Arch</div>
                <div style={styles.jawRow}>
                  {upperTeeth.map((num) => {
                    const status = toothData[num] || 'HEALTHY';
                    return (
                      <div key={num} style={styles.toothBox(status)} onClick={() => handleToothClick(num)}>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: theme.textMuted }}>{num}</span>
                        <span style={{ fontSize: '16px', color: conditionSchema[status].color, fontWeight: 'bold' }}>{conditionSchema[status].symbol}</span>
                        <span style={{ fontSize: '9px', color: conditionSchema[status].color, opacity: 0.85 }}>{conditionSchema[status].label.split(' ')[0]}</span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ height: '1px', backgroundColor: theme.border, margin: '20px 0' }}></div>

                {/* Lower Mandibular Arch */}
                <div style={styles.jawRow}>
                  {lowerTeeth.map((num) => {
                    const status = toothData[num] || 'HEALTHY';
                    return (
                      <div key={num} style={styles.toothBox(status)} onClick={() => handleToothClick(num)}>
                        <span style={{ fontSize: '9px', color: conditionSchema[status].color, opacity: 0.85 }}>{conditionSchema[status].label.split(' ')[0]}</span>
                        <span style={{ fontSize: '16px', color: conditionSchema[status].color, fontWeight: 'bold' }}>{conditionSchema[status].symbol}</span>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: theme.textMuted }}>{num}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CLINICAL ASSESSMENT PHASE 4: DIAGNOSTIC AIDS & CONCLUSION REVIEWS */}
              <div style={styles.assessmentCard}>
                <h3 style={{ fontSize: '15px', color: theme.accentGlow, margin: '0 0 15px 0', fontWeight: '600', borderBottom: `1px solid ${theme.border}`, paddingBottom: '8px' }}>
                  Step 7, 8 & 9: Diagnostics, Diagnoses, and Phased Care Formulation
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '13px', color: theme.textMuted, fontWeight: '500' }}>Step 7: Diagnostic Aids & Radiographs</label>
                    <textarea 
                      style={{ ...styles.clinicalInput, height: '80px' }}
                      value={diagnosticAids}
                      onChange={(e) => setDiagnosticAids(e.target.value)}
                      disabled={viewingHistoryMode}
                      placeholder="X-ray interpretations (Bitewing, Periapical, Panoramic), thermal vitality values, percussion test data..."
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', color: theme.textMuted, fontWeight: '500' }}>Step 8: Formulating Diagnoses</label>
                    <textarea 
                      style={{ ...styles.clinicalInput, height: '80px' }}
                      value={formulatedDiagnoses}
                      onChange={(e) => setFormulatedDiagnoses(e.target.value)}
                      disabled={viewingHistoryMode}
                      placeholder="Document primary and secondary definitive diagnoses (e.g., Reversible pulpitis secondary to deep decay on #14)..."
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', color: theme.textMuted, fontWeight: '500' }}>Step 9: Phased Treatment Planning</label>
                    <textarea 
                      style={{ ...styles.clinicalInput, height: '110px' }}
                      value={phasedTreatmentPlan}
                      onChange={(e) => setPhasedTreatmentPlan(e.target.value)}
                      disabled={viewingHistoryMode}
                      placeholder="1. Emergency/Urgent Phase (Pain alleviation)&#10;2. Disease Control Phase (Scaling, extractions, active carie restorations)&#10;3. Restorative/Corrective Phase (Endodontics, crowns, prosthodontics)&#10;4. Maintenance Phase (Long term cleaning intervals)"
                    />
                  </div>
                </div>
              </div>

              {/* ENHANCED: Procedure Selection & Pending Bill Card */}
              {!viewingHistoryMode && (
                <div style={styles.assessmentCard}>
                  <h3 style={{ fontSize: '15px', color: theme.accentGlow, margin: '0 0 15px 0', fontWeight: '600' }}>
                    💰 Billing Overview
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: theme.bgCard, borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                    <div>
                      <p style={{ margin: '0 0 5px 0', color: theme.textMuted, fontSize: '12px' }}>Procedures Selected:</p>
                      <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: theme.accentGlow }}>{selectedProcedures.length}</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 5px 0', color: theme.textMuted, fontSize: '12px' }}>Total Amount:</p>
                      <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: theme.successGreen }}>₵{totalBill}</p>
                    </div>
                    <button 
                      onClick={() => setShowBillingModal(true)}
                      style={{
                        backgroundColor: theme.accentBlue,
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}
                    >
                      💳 Manage Billing
                    </button>
                  </div>
                </div>
              )}
              
              {/* Form Action Controls Button Node */}
              <div style={{ marginTop: '10px', marginBottom: '40px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {!viewingHistoryMode ? (
                  <button onClick={handleSaveClinicalRecord} style={{ flex: 1, minWidth: '200px', backgroundColor: theme.accentBlue, color: 'white', padding: '14px 28px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', boxShadow: `0 4px 12px ${theme.accentBlue}33` }}>
                    ✓ Lock & Sign Complete Assessment Record
                  </button>
                ) : (
                  <button onClick={() => setSelectedPatient(null)} style={{ flex: 1, minWidth: '200px', backgroundColor: 'transparent', color: theme.textMuted, padding: '12px 24px', border: `1px solid ${theme.border}`, borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                    ✕ Close Patient Archive View
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: theme.textMuted, marginTop: '20%' }}>
              <h3>No Profile Selected</h3>
              <p style={{ fontSize: '14px' }}>Select an entry from the attendance feed or click the Case Archives to pull patient history charts.</p>
            </div>
          )}
        </div>

        {/* SIDE-OVER SLIDE HISTORY SLATE ARCHIVE PANEL */}
        <div style={styles.archiveOverlay}>
          <div style={{ padding: '20px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#020617' }}>
            <span style={{ fontWeight: '600' }}>Database & Case History</span>
            <button 
              onClick={() => setShowArchive(false)}
              style={{ backgroundColor: 'transparent', border: 'none', color: theme.textMuted, fontSize: '20px', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
          
          {/* Quick Search Filtering Control Bar */}
          <div style={{ padding: '15px', borderBottom: `1px solid ${theme.border}` }}>
            <input 
              type="text" 
              placeholder="Search old patients by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', backgroundColor: theme.bgCard, border: `1px solid ${theme.border}`, color: theme.textMain, outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          {/* Historical Items Array Scroll Grid */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
            {filteredArchive.length === 0 ? (
              <div style={{ textAlign: 'center', color: theme.textMuted, marginTop: '20px', fontSize: '13px' }}>No records match your criteria.</div>
            ) : (
              filteredArchive.map((p) => (
                <div 
                  key={p.id} 
                  style={{ padding: '14px', borderRadius: '8px', backgroundColor: (selectedPatient?.id === p.id && viewingHistoryMode) ? `${theme.warningYellow}11` : theme.bgCard, border: (selectedPatient?.id === p.id && viewingHistoryMode) ? `1px solid ${theme.warningYellow}` : `1px solid ${theme.border}`, marginBottom: '10px', cursor: 'pointer', transition: 'border-color 0.15s' }}
                  onClick={() => handleSelectPatient(p, true)}
                >
                  <div style={{ fontWeight: '600', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{p.first_name} {p.last_name}</span>
                    <span style={{ fontSize: '11px', color: theme.textMuted }}>{p.age} Y/O</span>
                  </div>
                  <div style={{ fontSize: '11px', color: theme.textMuted, fontFamily: 'monospace', marginTop: '4px' }}>REF: {p.unique_code}</div>
                  {p.created_at && (
                    <div style={{ fontSize: '10px', color: theme.accentGlow, marginTop: '6px', textAlign: 'right' }}>
                      🗓️ {new Date(p.created_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Billing Modal */}
      {showBillingModal && selectedPatient && <BillingModal />}
      <PaymentSummaryTab patientsList={pendingBills} />
    </div>
  );
};

export default DentistPage;