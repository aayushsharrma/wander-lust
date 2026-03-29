// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './App.css';

function App() {
  // --- STATES ---
  // --- STATES ---
  const [formData, setFormData] = useState({ location: '', days: 0, budget: 0, season: 'winter', month: 'January' });
  const [itinerary, setItinerary] = useState(null);
  const [weather, setWeather] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [language, setLanguage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activePlace, setActivePlace] = useState('India');

  // Saved Trips & Expenses
  const [savedTrips, setSavedTrips] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ desc: '', cost: '' });

  // --- 💾 LOAD SAVED TRIPS ---
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('myTrips')) || [];
    setSavedTrips(saved);
  }, []);

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

  // 💾 Feature: Save Trip
  const saveTrip = () => {
    if (!itinerary) return;
    const newTrip = {
      id: Date.now(),
      location: formData.location,
      date: new Date().toLocaleDateString(),
      plan: { ...itinerary, weather, faqs, language } // Save everything
    };
    const updatedList = [newTrip, ...savedTrips];
    setSavedTrips(updatedList);
    localStorage.setItem('myTrips', JSON.stringify(updatedList));
    alert("Trip Saved Successfully! ✅");
  };

  const deleteTrip = (id) => {
    const updatedList = savedTrips.filter(t => t.id !== id);
    setSavedTrips(updatedList);
    localStorage.setItem('myTrips', JSON.stringify(updatedList));
  };

  // 📄 Feature: Download PDF (FIXED: Black Text Mode)
  const downloadPDF = () => {
    const input = document.getElementById('itinerary-content');
    if (!input) return;

    // Add class for Black Text
    input.classList.add('pdf-mode');

    html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Trip_To_${formData.location}.pdf`);

      // Remove class to go back to Dark Mode
      input.classList.remove('pdf-mode');
    });
  };

  // 🤝 Feature: Share
  const shareTrip = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Trip to ${formData.location}`,
          text: `Check out my plan for ${formData.location}!`,
          url: window.location.href,
        });
      } catch (err) { console.log('Share failed', err); }
    } else {
      alert("Sharing not supported on this browser.");
    }
  };

  // 💰 Expense Tracker Logic
  const addExpense = () => {
    if (!newExpense.desc || !newExpense.cost) return;
    setExpenses([...expenses, { id: Date.now(), desc: newExpense.desc, cost: parseInt(newExpense.cost) }]);
    setNewExpense({ desc: '', cost: '' });
  };
  const removeExpense = (id) => setExpenses(expenses.filter(e => e.id !== id));
  const getRemainingBudget = () => formData.budget - expenses.reduce((acc, curr) => acc + curr.cost, 0);

  // --- API CALL ---
  const generatePlan = async () => {
    if (!formData.location) { setError("Please enter a city!"); return; }
    setLoading(true); setError(''); setItinerary(null); setExpenses([]); setShowSaved(false);
    try {
      // ⚠️ Ensure this URL is correct
      const res = await axios.post('https://wander-lust-fcyz.onrender.com/api/plan', formData);
      if (res.data.success) {
        setItinerary(res.data);
        setActivePlace(formData.location);
        setWeather(res.data.weather);
        setFaqs(res.data.faqs);
        setLanguage(res.data.language);
      }
    } catch (err) { setError("Backend Error. Server might be sleeping. Try again in 30s."); }
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
      <div className={`glass-card ${itinerary || showSaved ? 'expanded' : ''}`} id="itinerary-content">

        <div className="creator-logo">Ayuh</div>

        <header>
          <div className="logo-group">
            <span className="logo-icon">✈️</span>
            <h1>A.T.L.A.S</h1>
            <span className="logo-icon">🌍</span>
          </div>
          <p>AI-Powered Travel Logic & Assistance System</p>
          <div className="nav-buttons">
            <button className="nav-btn" onClick={() => { setShowSaved(false); setItinerary(null); }}>🏠 Home</button>
            <button className="nav-btn" onClick={() => setShowSaved(true)}>❤️ My Trips ({savedTrips.length})</button>
          </div>
        </header>

        {/* INPUT FORM */}
        {!showSaved && (
          <div className="controls">
            <div className="search-box">
              <input type="text" name="location" placeholder="Where to? (e.g. Kerala)" value={formData.location} onChange={handleChange} />
              <span className="mic-icon" onClick={startListening}>🎤</span>
            </div>
            <div className="row">
              <input type="number" name="days" placeholder="Days" value={formData.days} onChange={handleChange} min="1" max="15" />
              <input type="number" name="budget" placeholder="Budget (₹)" value={formData.budget} onChange={handleChange} />

              {/* ⛅ NAYA SEASON DROPDOWN YAHAN HAI */}
              <select name="season" value={formData.season} onChange={handleChange} className="season-select">
                <option value="winter">Winter ❄️</option>
                <option value="summer">Summer ☀️</option>
                <option value="monsoon">Monsoon 🌧️</option>
              </select>
              {/* 🗓️ NAYA MONTH DROPDOWN */}
              <select name="month" value={formData.month} onChange={handleChange} className="season-select">
                <option value="January">January ❄️</option>
                <option value="February">February 🌼</option>
                <option value="March">March 🌸</option>
                <option value="April">April ☀️</option>
                <option value="May">May 🥵</option>
                <option value="June">June 🏖️</option>
                <option value="July">July 🌧️</option>
                <option value="August">August ☔</option>
                <option value="September">September 🌦️</option>
                <option value="October">October 🍂</option>
                <option value="November">November 🧣</option>
                <option value="December">December ⛄</option>
              </select>
            </div>
            <button className="main-btn" onClick={generatePlan} disabled={loading}>
              {loading ? 'Planning...' : 'Plan My Trip 🚀'}
            </button>
          </div>
        )}

        {error && <div className="error">{error}</div>}

        {/* SAVED TRIPS VIEW */}
        {showSaved && (
          <div className="saved-dashboard">
            <h2 style={{ textAlign: 'center' }}>❤️ Saved Trips</h2>
            {savedTrips.length === 0 ? <p style={{ textAlign: 'center' }}>No trips saved yet.</p> : (
              <div className="trips-grid">
                {savedTrips.map(trip => (
                  <div key={trip.id} className="saved-card">
                    <h3>{trip.location}</h3>
                    <small>{trip.date}</small>
                    <div style={{ marginTop: '10px' }}>
                      <button className="del-btn" onClick={() => deleteTrip(trip.id)}>🗑️</button>
                      <button className="view-btn" onClick={() => {
                        setItinerary(trip.plan);
                        setWeather(trip.plan.weather);
                        setFaqs(trip.plan.faqs);
                        setLanguage(trip.plan.language);
                        setShowSaved(false);
                      }}>View</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MAIN ITINERARY DASHBOARD */}
        {itinerary && !showSaved && (
          <div className="dashboard">
            {/* LEFT PANEL */}
            <div className="panel left">
              {weather && (
                <div className="weather-card">
                  <div className="temp">{weather.temp}</div>
                  <div className="cond">{weather.cond}</div>
                  <div className="text">{weather.text}</div>
                </div>
              )}

              {language && (
                <div className="lang-box">
                  <h3>🗣️ Local Lingo ({language.native})</h3>
                  <div className="lang-row"><span>👋 Hello:</span> <strong>{language.hello}</strong></div>
                  <div className="lang-row"><span>🙏 Thanks:</span> <strong>{language.thank}</strong></div>
                </div>
              )}

              <div className="action-buttons">
                <button className="action-btn save-btn" onClick={saveTrip}>💾 Save</button>
                <button className="action-btn pdf-btn" onClick={downloadPDF}>📄 PDF</button>
                <button className="action-btn share-btn" onClick={shareTrip}>🤝 Share</button>
              </div>
            </div>

            {/* CENTER PANEL */}
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

            {/* RIGHT PANEL */}
            <div className="panel right">
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(activePlace)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                title="map" loading="lazy"
                style={{ border: 0, borderRadius: '20px', width: '100%', height: '200px' }}
              ></iframe>

              {/* EXPENSE TRACKER */}
              <div className="expense-box">
                <h3>💰 Expense Tracker</h3>
                <div className="budget-summary">
                  <div>Budget: ₹{formData.budget}</div>
                  <div style={{ color: getRemainingBudget() < 0 ? '#ff4757' : '#2ed573' }}>
                    Left: ₹{getRemainingBudget()}
                  </div>
                </div>

                <div className="expense-input">
                  <input type="text" placeholder="Item" value={newExpense.desc} onChange={(e) => setNewExpense({ ...newExpense, desc: e.target.value })} />
                  <input type="number" placeholder="₹" value={newExpense.cost} onChange={(e) => setNewExpense({ ...newExpense, cost: e.target.value })} />
                  <button onClick={addExpense}>+</button>
                </div>

                <ul className="expense-list">
                  {expenses.map(e => (
                    <li key={e.id}>
                      <span>{e.desc}</span>
                      <span>₹{e.cost} <b onClick={() => removeExpense(e.id)} style={{ cursor: 'pointer', color: 'red', marginLeft: '10px' }}>×</b></span>
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