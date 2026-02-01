// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/wanderlust')
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ DB Error:", err));

// --- 🧠 CITY DATABASE (Expanded with Coordinates) ---
const cityDatabase = {
    // HIMACHAL
    "manali": {
        lat: 32.2396, lon: 77.1887,
        places: [
            { name: "Solang Valley", type: "Adventure", cost: 1000 },
            { name: "Hidimba Temple", type: "Spiritual", cost: 0 },
            { name: "Mall Road", type: "City", cost: 500 },
            { name: "Jogini Falls", type: "Nature", cost: 0 },
            { name: "Old Manali", type: "City", cost: 0 }
        ],
        faqs: [{ q: "Snow?", a: "Dec-Feb." }, { q: "Clothes?", a: "Heavy Woolens." }]
    },
    // UTTARAKHAND
    "auli": {
        lat: 30.5303, lon: 79.5649,
        places: [
            { name: "Skiing Point", type: "Adventure", cost: 2000 },
            { name: "Auli Artificial Lake", type: "Nature", cost: 0 },
            { name: "Cable Car Ride", type: "Adventure", cost: 1000 },
            { name: "Gurso Bugyal", type: "Nature", cost: 0 },
            { name: "View Point", type: "Nature", cost: 0 }
        ],
        faqs: [{ q: "Best for Skiing?", a: "Jan-March." }, { q: "Altitude?", a: "High (2800m)." }]
    },
    "rishikesh": {
        lat: 30.0869, lon: 78.2676,
        places: [
            { name: "Laxman Jhula", type: "City", cost: 0 },
            { name: "River Rafting", type: "Adventure", cost: 1500 },
            { name: "Beatles Ashram", type: "History", cost: 600 },
            { name: "Triveni Ghat", type: "Spiritual", cost: 0 },
            { name: "Neer Waterfall", type: "Nature", cost: 50 }
        ],
        faqs: [{ q: "Rafting age?", a: "14+" }, { q: "Alcohol?", a: "Prohibited." }]
    },
    "mussoorie": {
        lat: 30.4598, lon: 78.0664,
        places: [
            { name: "Kempty Falls", type: "Nature", cost: 50 },
            { name: "Gun Hill", type: "Adventure", cost: 100 },
            { name: "Mall Road", type: "Shopping", cost: 0 },
            { name: "Lal Tibba", type: "Nature", cost: 0 },
            { name: "Company Garden", type: "Nature", cost: 20 }
        ],
        faqs: [{ q: "Best View?", a: "Lal Tibba." }, { q: "Traffic?", a: "High on weekends." }]
    },
    "nainital": {
        lat: 29.3919, lon: 79.4542,
        places: [
            { name: "Naini Lake", type: "Nature", cost: 300 },
            { name: "Naina Devi", type: "Spiritual", cost: 0 },
            { name: "Mall Road", type: "Shopping", cost: 500 },
            { name: "Snow View", type: "Nature", cost: 150 },
            { name: "Tiffin Top", type: "Adventure", cost: 0 }
        ],
        faqs: [{ q: "Is it cold?", a: "Yes, carry jackets." }, { q: "Best view?", a: "Snow View Point." }]
    },
    // OTHERS
    "goa": {
        lat: 15.2993, lon: 74.1240,
        places: [
            { name: "Calangute Beach", type: "Beach", cost: 0 },
            { name: "Tito's Club", type: "Party", cost: 2000 },
            { name: "Fort Aguada", type: "History", cost: 300 },
            { name: "Dudhsagar Falls", type: "Nature", cost: 500 },
            { name: "Anjuna Market", type: "Shopping", cost: 0 }
        ],
        faqs: [{ q: "Rent bike?", a: "₹400/day." }, { q: "Best season?", a: "Nov-Feb." }]
    },
    "udaipur": {
        lat: 24.5854, lon: 73.7125,
        places: [
            { name: "City Palace", type: "History", cost: 400 },
            { name: "Lake Pichola", type: "Nature", cost: 500 },
            { name: "Jag Mandir", type: "History", cost: 300 },
            { name: "Fateh Sagar", type: "Nature", cost: 0 },
            { name: "Vintage Car Museum", type: "History", cost: 250 }
        ],
        faqs: [{ q: "Romantic spot?", a: "Ambrai Ghat." }, { q: "Food?", a: "Dal Baati Churma." }]
    },
    "meerut": {
        lat: 28.9845, lon: 77.7064,
        places: [
            { name: "Augarnath Temple", type: "Spiritual", cost: 0 },
            { name: "Gandhi Bagh", type: "Nature", cost: 20 },
            { name: "Suraj Kund Park", type: "Nature", cost: 10 },
            { name: "St. John's Church", type: "History", cost: 0 },
            { name: "Shopprix Mall", type: "Shopping", cost: 500 }
        ],
        faqs: [{ q: "Famous for?", a: "Sports Goods & History." }, { q: "Best food?", a: "Nankhatai." }]
    }
};
const capitalCoordinates = {
    "port blair": { lat: 11.6234, lon: 92.7265 },
    "amaravati": { lat: 16.5131, lon: 80.5165 },
    "itanagar": { lat: 27.0844, lon: 93.6053 },
    "dispur": { lat: 26.1433, lon: 91.7898 },
    "patna": { lat: 25.5941, lon: 85.1376 },
    "chandigarh": { lat: 30.7333, lon: 76.7794 },
    "raipur": { lat: 21.2514, lon: 81.6296 },
    "silvassa": { lat: 20.2763, lon: 73.0083 },
    "new delhi": { lat: 28.6139, lon: 77.2090 },
    "delhi": { lat: 28.6139, lon: 77.2090 },
    "panaji": { lat: 15.4909, lon: 73.8278 },
    "gandhinagar": { lat: 23.2156, lon: 72.6369 },
    "shimla": { lat: 31.1048, lon: 77.1734 },
    "srinagar": { lat: 34.0837, lon: 74.7973 },
    "jammu": { lat: 32.7266, lon: 74.8570 },
    "ranchi": { lat: 23.3441, lon: 85.3096 },
    "bengaluru": { lat: 12.9716, lon: 77.5946 },
    "bangalore": { lat: 12.9716, lon: 77.5946 },
    "thiruvananthapuram": { lat: 8.5241, lon: 76.9366 },
    "kavaratti": { lat: 10.5667, lon: 72.6417 },
    "bhopal": { lat: 23.2599, lon: 77.4126 },
    "mumbai": { lat: 19.0760, lon: 72.8777 },
    "imphal": { lat: 24.8170, lon: 93.9368 },
    "shillong": { lat: 25.5788, lon: 91.8933 },
    "aizawl": { lat: 23.7307, lon: 92.7173 },
    "kohima": { lat: 25.6751, lon: 94.1086 },
    "bhubaneswar": { lat: 20.2961, lon: 85.8245 },
    "puducherry": { lat: 11.9416, lon: 79.8083 },
    "jaipur": { lat: 26.9124, lon: 75.7873 },
    "gangtok": { lat: 27.3314, lon: 88.6138 },
    "chennai": { lat: 13.0827, lon: 80.2707 },
    "hyderabad": { lat: 17.3850, lon: 78.4867 },
    "agartala": { lat: 23.8315, lon: 91.2868 },
    "lucknow": { lat: 26.8467, lon: 80.9462 },
    "dehradun": { lat: 30.3165, lon: 78.0322 },
    "kolkata": { lat: 22.5726, lon: 88.3639 },
    "leh": { lat: 34.1526, lon: 77.5770 }
};
// --- 🌤️ WEATHER ENGINE ---
async function getWeather(city, fixedCoords) {
    try {
        let latitude, longitude;

        // Check 1: Curated Database
        if (fixedCoords && fixedCoords.lat) {
            latitude = fixedCoords.lat;
            longitude = fixedCoords.lon;
        }
        // Check 2: Capital Cities List
        else if (capitalCoordinates[city]) {
            latitude = capitalCoordinates[city].lat;
            longitude = capitalCoordinates[city].lon;
        }
        // Check 3: Geocoding API (Fallback)
        else {
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
            const geoData = await geoRes.json();
            if (!geoData.results) throw new Error("City not found");
            latitude = geoData.results[0].latitude;
            longitude = geoData.results[0].longitude;
        }

        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        const data = await weatherRes.json();

        const temp = data.current_weather.temperature;
        const code = data.current_weather.weathercode;

        let cond = "Clear", emoji = "☀️";
        if (code > 3) { cond = "Cloudy"; emoji = "☁️"; }
        if (code > 45) { cond = "Foggy"; emoji = "🌫️"; }
        if (code > 50) { cond = "Rainy"; emoji = "🌧️"; }
        if (code > 70) { cond = "Snowy"; emoji = "❄️"; }

        return { temp: `${temp}°C`, cond: `${cond} ${emoji}`, text: `Live in ${city}` };
    } catch (e) {
        console.error(`Primary Weather Failed for ${city}, trying Backup...`);

        // LAYER 3: wttr.in BACKUP (Never show "Server Busy")
        try {
            const backupRes = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=%t+%C`);
            if (backupRes.ok) {
                const text = await backupRes.text(); // e.g., "+15°C Sunny"
                // Clean up string
                const cleanText = text.replace('+', '').trim();
                const parts = cleanText.split(' ');
                const temp = parts[0] || "20°C";
                const cond = parts.slice(1).join(' ') || "Fair";

                return {
                    temp: temp,
                    cond: `${cond} 🌤️`,
                    text: `Live Report`
                };
            }
        } catch (e) {
            console.error("Backup Failed");
        }

        // Absolute Last Resort (Very Rare)
        return { temp: "--", cond: "Unavailable", text: "Try again" };
    }
}

// --- GENERIC PLAN GENERATOR ---
const generateGenericPlan = (city) => ({
    places: [
        { name: `${city} City Center`, type: "City", cost: 500 },
        { name: `${city} Local Market`, type: "Shopping", cost: 1000 },
        { name: `${city} Famous Temple`, type: "Spiritual", cost: 0 },
        { name: `${city} Nature Park`, type: "Nature", cost: 50 },
        { name: `${city} Historical Site`, type: "History", cost: 200 }
    ],
    faqs: [{ q: `Best time?`, a: "Oct-March." }, { q: "Transport?", a: "Local cabs." }]
});

app.post('/api/plan', async (req, res) => {
    const { location, days, budget } = req.body;
    const cityKey = location.toLowerCase().trim();

    console.log(`🚀 Plan requested for: ${location}`);

    // 1. Database Data
    let dbData = cityDatabase[cityKey];

    // 2. Weather (Pass DB Coords if available)
    const weather = await getWeather(location, dbData);

    // Fallback if city not in DB
    if (!dbData) dbData = generateGenericPlan(location);

    // 3. Plan Logic
    const dailyBudget = budget / days;
    const finalPlaces = dbData.places.filter(p => p.cost <= dailyBudget + 5000);

    const plan = [];
    let currentCost = 0;
    for (let i = 0; i < days; i++) {
        const place = finalPlaces[i % finalPlaces.length];
        plan.push({
            day: i + 1,
            place: place.name,
            activity: place.type,
            cost: place.cost
        });
        currentCost += place.cost;
    }

    res.json({
        success: true,
        plan,
        totalCost: currentCost,
        aiDescription: `Explore ${location}! ✨`,
        weather: weather,
        faqs: dbData.faqs
    });
});

app.listen(5000, () => console.log("🚀 Server running on 5000"));