import React, { useState, useEffect, useRef } from 'react';
import PaymentSummaryTab from './PaymentSummaryTab';
import API_BASE_URL from '../config'; // Added import to fix the 'API_BASE_URL' is not defined error

const ReceptionistPage = ({ username, onLogout, allPatients, setAllPatients }) => {
  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [contact, setContact] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [relationship, setRelationship] = useState('');
  const [address, setAddress] = useState('');
  const [uniqueCode, setUniqueCode] = useState('');
  const [sex, setSex] = useState('Male');
  const [visitPurpose, setVisitPurpose] = useState('Consultation');

  // Database Search States
  const [dbSearchQuery, setDbSearchQuery] = useState('');
  const [dbSearchResults, setDbSearchResults] = useState([]);
  const [isSearchingDb, setIsSearchingDb] = useState(false);

  // Camera State
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');

  // Billing States
  const [pendingBills, setPendingBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showBillModal, setShowBillModal] = useState(false);
  // eslint-disable-next-line
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Responsive
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.backgroundColor = "#070b14";

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const isMobile = windowWidth <= 992;

  useEffect(() => {
    const loadBills = () => {
      const bills = JSON.parse(localStorage.getItem('all_pending_bills') || '[]');
      setPendingBills(bills);
    };
    loadBills();
    const interval = setInterval(loadBills, 3000); 
    return () => clearInterval(interval);
  }, []);

  const handleGenerateCode = () => {
    const year = new Date().getFullYear();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    setUniqueCode(`CDC-${year}-${randomDigits}`);
  };

  // Database Search Implementation
  const searchDatabase = async (query) => {
    setDbSearchQuery(query);
    if (query.length < 2) {
      setDbSearchResults([]);
      return;
    }
    setIsSearchingDb(true);
    try {
      const response = await fetch(`${API_BASE_URL}/search_patients.php?q=${query}`);
      const data = await response.json();
      setDbSearchResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Database search error:', err);
    }
    setIsSearchingDb(false);
  };

  // Pre-fill form from old patient record
  const loadOldPatient = (patient) => {
    setFirstName(patient.first_name || '');
    setLastName(patient.last_name || '');
    setAge(patient.age || '');
    setSex(patient.sex || 'Male');
    setContact(patient.contact || '');
    setEmergencyContact(patient.emergency_contact || '');
    setRelationship(patient.relationship || '');
    setAddress(patient.address || '');
    setUniqueCode(patient.unique_code || '');
    setDbSearchResults([]);
    setDbSearchQuery('');
    setVisitPurpose('Review'); // Default back to review/continuation
    alert(`File pulled for ${patient.first_name}. You can now queue them for a new consultation.`);
  };

  const completeBillPayment = () => {
    if (!selectedBill) return;

    const allPending = JSON.parse(localStorage.getItem('all_pending_bills') || '[]');
    const updatedBills = allPending.filter(bill => bill.id !== selectedBill.id);

    localStorage.setItem('all_pending_bills', JSON.stringify(updatedBills));
    localStorage.removeItem(`bill_${selectedBill.patientCode}`);
    
    setPendingBills(updatedBills);
    
    alert(`Payment received for ${selectedBill.patientName}. Receipt generated and bill removed from queue.`);
    setShowBillModal(false);
    setSelectedBill(null);
    setPaymentMethod('cash');
  };

  const printReceipt = () => {
  if (!selectedBill) return;
  // Use selectedBill.procedures instead of selectedBill.items
  const procedures = selectedBill.procedures || []; 
  
  const printContent = `
    <html>
      <head>
        <title>Receipt - CareDental Clinic</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: white; }
          .receipt-container { max-width: 400px; margin: 0 auto; border: 1px solid #ccc; padding: 20px; border-radius: 8px; }
          .receipt-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px; }
          .receipt-header h2 { margin: 0; color: #2563eb; }
          .receipt-body { margin: 15px 0; }
          .receipt-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .receipt-total { display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; margin-top: 15px; border-top: 2px solid #333; }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="receipt-header">
            <h2>🦷 CareDental Clinic</h2>
            <p>Receipt for: ${selectedBill.patientName}</p>
          </div>
          <div class="receipt-body">
            ${procedures.map(item => `
              <div class="receipt-item">
                <span>${item.name}</span>
                <span>₵${item.price}</span>
              </div>
            `).join('')}
            <div class="receipt-total">
              <span>Total:</span>
              <span>₵${selectedBill.total}</span>
            </div>
          </div>
        </div>
        <script>window.print();</script>
      </body>
    </html>
  `;
  const printWindow = window.open('', '_blank');
  printWindow.document.write(printContent);
  printWindow.document.close();
};

  const startCamera = async () => {
    setCameraError('');
    setPhoto(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 50);
    } catch (err) { setCameraError('Could not access camera.'); }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 350; canvas.height = 450;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, 350, 450);
      setPhoto(canvas.toDataURL('image/jpeg'));
      stopCamera();
    }
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE_URL}/register.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, age, sex, contact, visitPurpose, emergencyContact, relationship, address, uniqueCode, photo })
      });
      alert('Patient queued to the Dentist successfully!');
      setFirstName('');
      setLastName('');
      setAge('');
      setContact('');
      setEmergencyContact('');
      setRelationship('');
      setAddress('');
      setUniqueCode('');
      setPhoto(null);
    } catch (error) {
      console.error(error);
      alert('Registration failed. Please try again.');
    }
    // After successful registration:
    generatePatientCard({
        firstName,
        lastName,
        age,
        uniqueCode // Ensure this is the code you generated
    });
    
    alert("Patient registered and card generated!");
  };

  const generatePatientCard = (patientData) => {
  const cardContent = `
    <html>
      <head>
        <title>Patient ID Card</title>
        <style>
          body { font-family: sans-serif; display: flex; justify-content: center; padding: 20px; }
          .card { width: 350px; border: 2px solid #2563eb; padding: 20px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
          h2 { color: #2563eb; margin-top: 0; }
          p { margin: 8px 0; }
          .code { font-weight: bold; font-family: monospace; font-size: 18px; color: #10b981; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Patient ID Card</h2>
          <p><strong>Name:</strong> ${patientData.firstName} ${patientData.lastName}</p>
          <p><strong>Age:</strong> ${patientData.age}</p>
          <p><strong>Reference Code:</strong></p>
          <p class="code">${patientData.uniqueCode}</p>
          <p style="font-size: 12px; margin-top: 20px; color: #666;">Present this card at each visit.</p>
        </div>
        <script>window.print();</script>
      </body>
    </html>
  `;
  const printWindow = window.open('', '_blank');
  printWindow.document.write(cardContent);
  printWindow.document.close();
};

  const styles = {
    wrapper: { backgroundColor: '#050505', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', padding: isMobile ? '16px' : '32px' },
    header: { backgroundColor: 'rgba(15, 23, 42, 0.95)', borderBottom: '1px solid #1e293b', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px', marginBottom: '24px', backdropFilter: 'blur(10px)' },
    titleMain: { color: '#f8fafc', margin: 0, fontSize: '18px', fontWeight: '600' },
    container: { display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' },
    formCard: { backgroundColor: '#0f172a', border: '1px solid #1e293b', flex: 2, padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    cameraCard: { backgroundColor: '#0f172a', border: '1px solid #1e293b', flex: 1, padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    billsCard: { backgroundColor: '#0f172a', border: '1px solid #1e293b', flex: 1, padding: '24px', borderRadius: '16px', maxHeight: '600px', overflowY: 'auto' },
    sectionHeading: { color: '#3b82f6', fontSize: '18px', marginBottom: '24px', fontWeight: '600' },
    label: { color: '#94a3b8', fontSize: '12px', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' },
    input: { width: '100%', padding: '12px', marginBottom: '16px', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' },
    select: { width: '100%', padding: '12px', marginBottom: '16px', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' },
    passportFrame: { width: '100%', aspectRatio: '3/4', maxWidth: '210px', backgroundColor: '#020617', border: '2px dashed #1e293b', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', overflow: 'hidden' },
    btnGrey: { backgroundColor: '#334155', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' },
    btnBlue: { backgroundColor: '#2563eb', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', width: '100%', fontWeight: '600', fontSize: '14px', transition: 'background-color 0.2s' },
    billItem: { backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', marginBottom: '12px', cursor: 'pointer', border: '1px solid #334155', transition: 'border-color 0.2s' }
  };

  return (
    <div style={styles.wrapper}>
      {showBillModal && selectedBill && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div style={{ backgroundColor: '#0f172a', padding: '30px', borderRadius: '16px', maxWidth: '600px', width: '90%', border: '1px solid #1e293b' }}>
            <h2 style={{color: '#fff'}}>Payment for {selectedBill.patientName}</h2>
            
            <div style={{ backgroundColor: '#172237', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <h4 style={{ color: '#3b82f6', marginTop: 0 }}>Procedures</h4>
              {(selectedBill?.items || []).length > 0 ? (
                selectedBill.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', color: '#cbd5e1' }}>
                    <span>{item.name}</span>
                    <span style={{ fontWeight: '600' }}>₵{item.price}</span>
                  </div>
                ))
              ) : (
                <p>No procedures found.</p>
              )}
            </div>

            <button onClick={() => { completeBillPayment(); setTimeout(printReceipt, 500); }} style={styles.btnBlue}>Complete & Print</button>
            <button onClick={() => { setShowBillModal(false); setSelectedBill(null); }} style={{ marginTop: '10px', width: '100%', padding: '12px', background: 'transparent', border: '1px solid #475569', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.titleMain}>Care Dental Clinic | Portal: {username}</h2>
        <button onClick={onLogout} style={styles.btnGrey}>Sign Out</button>
      </div>

      {/* Main Container */}
      <div style={styles.container}>
        {/* Registration Form */}
        <div style={styles.formCard}>
          
          {/* DATABASE SEARCH BAR COMPONENT */}
          <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #1e293b' }}>
            <h3 style={{ ...styles.sectionHeading, color: '#10b981', marginBottom: '12px' }}>🔍 Fetch Patient Records</h3>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Search old patients by name or ID to re-book..."
                value={dbSearchQuery}
                onChange={(e) => searchDatabase(e.target.value)}
                style={{ ...styles.input, borderColor: '#10b981', marginBottom: '0' }}
              />
              {dbSearchResults.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', marginTop: '8px', maxHeight: '200px', overflowY: 'auto', zIndex: 10, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                  {dbSearchResults.map((patient, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => loadOldPatient(patient)}
                      style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b', cursor: 'pointer', color: '#fff', display: 'flex', justifyContent: 'space-between', transition: 'background-color 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <span>{patient.first_name} {patient.last_name}</span>
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>{patient.unique_code}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <h3 style={styles.sectionHeading}>Patient Registration & Queuing</h3>
          <form onSubmit={handleRegisterPatient}>
            
            {/* Custom gap applied successfully here */}
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '60px' }}>
              <div style={{ flex: 1, marginRight: isMobile ? '0' : '15px' }}>
                <label style={styles.label}>First Name</label>
                <input type="text" required style={styles.input} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" />
              </div>
              <div style={{ flex: 1, marginLeft: isMobile ? '0' : '15px' }}>
                <label style={styles.label}>Last Name</label>
                <input type="text" required style={styles.input} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '40px' }}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Age</label>
                <input type="number" required style={styles.input} value={age} onChange={(e) => setAge(e.target.value)} placeholder="Years" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Biological Sex</label>
                <select style={styles.select} value={sex} onChange={(e) => setSex(e.target.value)}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '40px' }}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Contact Number</label>
                <input type="tel" required style={styles.input} value={contact} onChange={(e) => setContact(e.target.value)} placeholder="+233..." />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Attendance Type</label>
                <select style={styles.select} value={visitPurpose} onChange={(e) => setVisitPurpose(e.target.value)}>
                  <option value="Consultation">Consultation</option>
                  <option value="Review">Review</option>
                  <option value="Continuation of Treatment">Continuation of Treatment</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '40px' }}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Emergency Contact</label>
                <input type="text" required style={styles.input} value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} placeholder="Jane Doe (+233...)" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Relationship</label>
                <input type="text" required style={styles.input} value={relationship} onChange={(e) => setRelationship(e.target.value)} placeholder="Spouse, Parent, Sibling" />
              </div>
            </div>

            <label style={styles.label}>Residential Address</label>
            <input type="text" required style={styles.input} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street name, City / District" />

            <div style={{ marginTop: '32px', borderTop: '1px solid #1e293b', paddingTop: '24px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px' }}>
              <div style={{ flex: isMobile ? '1' : '0 1 420px', width: '100%' }}>
                <label style={styles.label}>System Access Key</label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <input type="text" readOnly style={{ ...styles.input, marginBottom: 0, backgroundColor: '#020617', borderColor: '#3b82f6', color: '#3b82f6', fontWeight: '600', flex: 1, minWidth: '150px' }} value={uniqueCode} placeholder="Click Generate" />
                  <button type="button" onClick={handleGenerateCode} style={{ ...styles.btnGrey, height: '45px', whiteSpace: 'nowrap' }}>Generate</button>
                </div>
              </div>
              <button type="submit" style={{ ...styles.btnBlue, backgroundColor: '#2563eb', marginBottom: 0, width: isMobile ? '100%' : 'auto' }}>
                Queue Patient
              </button>
            </div>
          </form>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={styles.cameraCard}>
            <h3 style={{marginTop: 0, color: '#fff'}}>ID Passport Photo</h3>
            <div style={styles.passportFrame}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: isCameraActive ? 'block' : 'none' }} />
              {!isCameraActive && photo && <img src={photo} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            {!isCameraActive ? <button onClick={startCamera} style={styles.btnBlue}>Activate Camera</button> : <button onClick={capturePhoto} style={{ ...styles.btnBlue, backgroundColor: '#10b981' }}>Capture</button>}
          </div>

          <div style={styles.billsCard}>
            <h3 style={styles.sectionHeading}>💳 Pending Bills ({pendingBills.length})</h3>
            {pendingBills.map((bill, idx) => (
              <div key={idx} onClick={() => { setSelectedBill(bill); setShowBillModal(true); }} style={styles.billItem}>
                <p style={{ margin: 0, fontWeight: '600', color: '#fff' }}>{bill.patientName}</p>
                <p style={{ margin: 0, color: '#10b981', fontSize: '14px', marginTop: '4px' }}>₵{bill.total}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <PaymentSummaryTab patientsList={pendingBills} />
    </div>
  );
};

export default ReceptionistPage;