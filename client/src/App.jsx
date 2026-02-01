// client/src/App.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [formData, setFormData] = useState({ location: '', days: 3, budget: 15000 });
  const [itinerary, setItinerary] = useState(null);
  const [weather, setWeather] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activePlace, setActivePlace] = useState('India');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const getIcon = (type) => {
    switch (type) {
      case 'Beach': return '🏖️'; case 'History': return '🏰'; case 'Nature': return '🌿';
      case 'Adventure': return '🪂'; case 'Spiritual': return '🕉️'; case 'City': return '🏙️';
      case 'Party': return '🍸'; case 'Shopping': return '🛍️'; default: return '📍';
    }
  };

  const generatePlan = async () => {
    if (!formData.location) { setError("Please enter a city!"); return; }
    setLoading(true); setError(''); setItinerary(null);
    try {
      // Example URL, apni wali use karna
      const res = await axios.post('https://wander-lust-fcyz.onrender.com/api/plan', formData);
      if (res.data.success) {
        setItinerary(res.data);
        setActivePlace(formData.location);
        setWeather(res.data.weather);
        setFaqs(res.data.faqs);
      }
    } catch (err) { setError("Backend not running!"); }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <div className={`glass-card ${itinerary ? 'expanded' : ''}`}>

        <header>
          <div className="logo-group">
            <span className="logo-icon">✈️</span>
            <h1>WANDER-LUST</h1>
            <span className="logo-icon">🌍</span>
          </div>
          <p>AI-Powered India Travel Planner</p>
        </header>

        <div className="controls">
          <input type="text" name="location" placeholder="Search City (e.g. Rishikesh)" value={formData.location} onChange={handleChange} />
          <div className="row">
            <input type="number" name="days" placeholder="Days" value={formData.days} onChange={handleChange} min="1" max="10" />
            <input type="number" name="budget" placeholder="Budget (₹)" value={formData.budget} onChange={handleChange} />
          </div>
          <button onClick={generatePlan} disabled={loading}>
            {loading ? 'Generating...' : 'Plan My Trip 🚀'}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {itinerary && (
          <div className="dashboard">
            {/* LEFT: INFO */}
            <div className="panel left">
              {weather && (
                <div className="weather-card">
                  <div className="temp">{weather.temp}</div>
                  <div className="cond">{weather.cond}</div>
                  <div className="text">{weather.text}</div>
                </div>
              )}
              <div className="faq-box">
                <h3>💡 Local Tips</h3>
                {faqs.map((f, i) => (
                  <div key={i} className="faq"><small>Q: {f.q}</small><p>{f.a}</p></div>
                ))}
              </div>
            </div>

            {/* CENTER: TIMELINE */}
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

            {/* RIGHT: MAP */}
            <div className="panel right">
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(activePlace)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                title="map" loading="lazy"
              ></iframe>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default App;