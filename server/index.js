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

// --- 🌤️ ULTIMATE WEATHER FUNCTION (3 Layers) ---
async function getWeather(city, dbCoords) {
    try {
        let latitude, longitude;

        // LAYER 1: Database Check (Best)
        if (dbCoords && dbCoords.lat && dbCoords.lon) {
            latitude = dbCoords.lat;
            longitude = dbCoords.lon;
        }
        // LAYER 2: Geocoding API (For unknown cities)
        else {
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json();

            if (!geoData.results || geoData.results.length === 0) {
                throw new Error("City not found");
            }
            latitude = geoData.results[0].latitude;
            longitude = geoData.results[0].longitude;
        }

        // Fetch Weather using Lat/Lon
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        const temp = weatherData.current_weather.temperature;
        const code = weatherData.current_weather.weathercode;

        // Code to Emoji
        let cond = "Clear";
        let emoji = "☀️";
        if (code >= 1 && code <= 3) { cond = "Cloudy"; emoji = "☁️"; }
        else if (code >= 45 && code <= 48) { cond = "Foggy"; emoji = "🌫️"; }
        else if (code >= 51 && code <= 67) { cond = "Rainy"; emoji = "🌧️"; }
        else if (code >= 71 && code <= 77) { cond = "Snowy"; emoji = "❄️"; }
        else if (code >= 95) { cond = "Storm"; emoji = "⛈️"; }

        // Formatting Name
        const displayName = city.charAt(0).toUpperCase() + city.slice(1);

        return {
            temp: `${temp}°C`,
            cond: `${cond} ${emoji}`,
            text: `Live in ${displayName}`
        };

    } catch (error) {
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