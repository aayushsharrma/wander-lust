// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './App.css';

function App() {
  // --- STATES ---
  const [formData, setFormData] = useState({ location: '', days: 3, budget: 15000 });
  const [itinerary, setItinerary] = useState(null);
  const [weather, setWeather] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [language, setLanguage] = useState(null); // 🗣️ Language State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activePlace, setActivePlace] = useState('India');

  // 💰 Expense Tracker States
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ desc: '', cost: '' });

  // --- HANDLERS ---
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // 🎤 Voice Search
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) { alert("Browser not supported"); return; }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();
    recognition.onresult = (e) => setFormData({ ...formData, location: e.results[0][0].transcript.replace('.', '') });
  };

  // 📄 Feature 2: Download PDF
  const downloadPDF = () => {
    const input = document.getElementById('itinerary-content');
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`AyuhVenture_${formData.location}.pdf`);
    });
  };

  // 🤝 Feature 5: Share Trip
  const shareTrip = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My Trip to ${formData.location}`,
          text: `Check out my awesome trip plan for ${formData.location} using AyuhVenture!`,
          url: window.location.href,
        });
      } catch (err) { console.log('Share failed', err); }
    } else {
      alert("Sharing not supported on this browser.");
    }
  };

  // 💰 Feature 3: Expense Tracker Logic
  const addExpense = () => {
    if (!newExpense.desc || !newExpense.cost) return;
    setExpenses([...expenses, { id: Date.now(), desc: newExpense.desc, cost: parseInt(newExpense.cost) }]);
    setNewExpense({ desc: '', cost: '' });
  };

  const removeExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const getTotalExpenses = () => expenses.reduce((acc, curr) => acc + curr.cost, 0);
  const getRemainingBudget = () => formData.budget - getTotalExpenses();

  // --- API CALL ---
  const generatePlan = async () => {
    if (!formData.location) { setError("Please enter a city!"); return; }
    setLoading(true); setError(''); setItinerary(null); setExpenses([]); // Reset expenses on new plan
    try {
      // ⚠️ Replace with your Render Backend URL
      const res = await axios.post('https://wander-lust-fcyz.onrender.com/api/plan', formData);
      if (res.data.success) {
        setItinerary(res.data);
        setActivePlace(formData.location);
        setWeather(res.data.weather);
        setFaqs(res.data.faqs);
        setLanguage(res.data.language); // Set Language Data
      }
    } catch (err) { setError("Backend Error. Check URL."); }
    setLoading(false);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Beach': return '🏖️'; case 'History': return '🏰'; case 'Nature': return '🌿';
      case 'Adventure': return '🪂'; case 'Spiritual': return '🕉️'; case 'City': return '🏙️';
      case 'Party': return '🍸'; case 'Shopping': return '🛍️'; default: return '📍';
    }
  };

  return (
    <div className="app-container">
      <div className={`glass-card ${itinerary ? 'expanded' : ''}`} id="itinerary-content">

        <div className="creator-logo">Ayuh</div>

        <header>
          <div className="logo-group">
            <span className="logo-icon">✈️</span>
            <h1>A.T.L.A.S</h1>
            <span className="logo-icon">🌍</span>
          </div>
          <p>Automated Travel Logic & Assistance System</p>
        </header>

        <div className="controls">
          <div className="search-box">
            <input type="text" name="location" placeholder="Where to? (e.g. Kerala)" value={formData.location} onChange={handleChange} />
            <span className="mic-icon" onClick={startListening}>🎤</span>
          </div>
          <div className="row">
            <input type="number" name="days" placeholder="Days" value={formData.days} onChange={handleChange} min="1" max="15" />
            <input type="number" name="budget" placeholder="Budget (₹)" value={formData.budget} onChange={handleChange} />
          </div>
          <button className="main-btn" onClick={generatePlan} disabled={loading}>
            {loading ? 'Planning your Adventure...' : 'Plan My Trip 🚀'}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {itinerary && (
          <div className="dashboard">
            {/* --- LEFT PANEL: Weather & Language --- */}
            <div className="panel left">
              {weather && (
                <div className="weather-card">
                  <div className="temp">{weather.temp}</div>
                  <div className="cond">{weather.cond}</div>
                  <div className="text">{weather.text}</div>
                </div>
              )}

              {/* 🗣️ FEATURE 4: LANGUAGE GUIDE */}
              {language && (
                <div className="lang-box">
                  <h3>🗣️ Local Lingo ({language.native})</h3>
                  <div className="lang-row"><span>👋 Hello:</span> <strong>{language.hello}</strong></div>
                  <div className="lang-row"><span>🙏 Thanks:</span> <strong>{language.thank}</strong></div>
                </div>
              )}

              <div className="action-buttons">
                <button className="action-btn pdf-btn" onClick={downloadPDF}>📄 PDF</button>
                <button className="action-btn share-btn" onClick={shareTrip}>🤝 Share</button>
              </div>
            </div>

            {/* --- CENTER PANEL: Itinerary --- */}
            <div className="panel center">
              <div className="vibe-check">{itinerary.aiDescription}</div>
              <div className="timeline-list">
                {itinerary.plan.map((item, index) => (
                  <div key={index} className="card" onClick={() => setActivePlace(`${item.place}, ${formData.location}`)}>
                    <div className="card-icon">{getIcon(item.activity)}</div>
                    <div className="card-info">
                      <h4>{item.place}</h4>
                      <div className="meta">
                        <span className="badge">Day {item.day}</span>
                        <span className="cost">₹{item.cost}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* --- RIGHT PANEL: Map & Expense Tracker --- */}
            <div className="panel right">
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(activePlace)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                title="map" loading="lazy"
              ></iframe>

              {/* 💰 FEATURE 3: EXPENSE TRACKER */}
              <div className="expense-box">
                <h3>💰 Expense Tracker</h3>
                <div className="budget-summary">
                  <div>Budget: ₹{formData.budget}</div>
                  <div style={{ color: getRemainingBudget() < 0 ? '#ff4757' : '#2ed573' }}>
                    Left: ₹{getRemainingBudget()}
                  </div>
                </div>

                <div className="expense-input">
                  <input type="text" placeholder="Item (e.g. Taxi)" value={newExpense.desc} onChange={(e) => setNewExpense({ ...newExpense, desc: e.target.value })} />
                  <input type="number" placeholder="₹" value={newExpense.cost} onChange={(e) => setNewExpense({ ...newExpense, cost: e.target.value })} />
                  <button onClick={addExpense}>+</button>
                </div>

                <ul className="expense-list">
                  {expenses.map(e => (
                    <li key={e.id}>
                      <span>{e.desc}</span>
                      <span>₹{e.cost} <b onClick={() => removeExpense(e.id)} style={{ cursor: 'pointer', color: 'red' }}>×</b></span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default App;