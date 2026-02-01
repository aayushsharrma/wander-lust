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

// --- 🧠 CITY DATABASE (Places & FAQs) ---
const cityDatabase = {
    "rishikesh": {
        places: [
            { name: "Laxman Jhula", type: "City", cost: 0 },
            { name: "River Rafting", type: "Adventure", cost: 1500 },
            { name: "Beatles Ashram", type: "History", cost: 600 },
            { name: "Triveni Ghat", type: "Spiritual", cost: 0 },
            { name: "Neer Waterfall", type: "Nature", cost: 50 }
        ],
        faqs: [{ q: "Rafting age?", a: "14+" }, { q: "Alcohol?", a: "Prohibited." }]
    },
    "nainital": {
        places: [
            { name: "Naini Lake", type: "Nature", cost: 300 },
            { name: "Naina Devi", type: "Spiritual", cost: 0 },
            { name: "Mall Road", type: "Shopping", cost: 500 },
            { name: "Snow View", type: "Nature", cost: 150 },
            { name: "Tiffin Top", type: "Adventure", cost: 0 }
        ],
        faqs: [{ q: "Is it cold?", a: "Yes, carry jackets." }, { q: "Best view?", a: "Snow View Point." }]
    },
    "goa": {
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
        places: [
            { name: "City Palace", type: "History", cost: 400 },
            { name: "Lake Pichola", type: "Nature", cost: 500 },
            { name: "Jag Mandir", type: "History", cost: 300 },
            { name: "Fateh Sagar", type: "Nature", cost: 0 },
            { name: "Vintage Car Museum", type: "History", cost: 250 }
        ],
        faqs: [{ q: "Romantic spot?", a: "Ambrai Ghat." }, { q: "Food?", a: "Dal Baati Churma." }]
    },
    "manali": {
        places: [
            { name: "Solang Valley", type: "Adventure", cost: 1000 },
            { name: "Hidimba Temple", type: "Spiritual", cost: 0 },
            { name: "Mall Road", type: "City", cost: 500 },
            { name: "Jogini Falls", type: "Nature", cost: 0 },
            { name: "Old Manali", type: "City", cost: 0 }
        ],
        faqs: [{ q: "Snow?", a: "Dec-Feb." }, { q: "Clothes?", a: "Heavy Woolens." }]
    },
    "meerut": {
        places: [
            { name: "Augarnath Temple", type: "Spiritual", cost: 0 },
            { name: "Gandhi Bagh", type: "Nature", cost: 20 },
            { name: "Suraj Kund Park", type: "Nature", cost: 10 },
            { name: "St. John's Church", type: "History", cost: 0 },
            { name: "Shopprix Mall", type: "Shopping", cost: 500 }
        ],
        faqs: [{ q: "Famous for?", a: "Sports Goods & History." }, { q: "Best food?", a: "Nankhatai." }]
    },
    "pune": {
        places: [
            { name: "Shaniwar Wada", type: "History", cost: 50 },
            { name: "Aga Khan Palace", type: "History", cost: 50 },
            { name: "Sinhagad Fort", type: "Adventure", cost: 100 },
            { name: "Phoenix Mall", type: "Shopping", cost: 0 },
            { name: "Osho Ashram", type: "Spiritual", cost: 1000 }
        ],
        faqs: [{ q: "Best time?", a: "Monsoon & Winter." }, { q: "Food?", a: "Misal Pav." }]
    }
};

// --- 🌤️ ROBUST WEATHER FUNCTION (Open-Meteo + Backup) ---
async function getWeather(city) {
    try {
        // STEP 1: Geocoding (City -> Lat/Lon)
        // Ye API free hai aur exact location dhoondti hai
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found in Geocoding");
        }

        const { latitude, longitude, name } = geoData.results[0];

        // STEP 2: Weather Fetching
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        const temp = weatherData.current_weather.temperature;
        const code = weatherData.current_weather.weathercode;

        // STEP 3: Code to Emoji Mapping
        let cond = "Clear";
        let emoji = "☀️";

        // WMO Weather interpretation codes
        if (code >= 1 && code <= 3) { cond = "Cloudy"; emoji = "☁️"; }
        else if (code >= 45 && code <= 48) { cond = "Foggy"; emoji = "🌫️"; }
        else if (code >= 51 && code <= 67) { cond = "Rainy"; emoji = "🌧️"; }
        else if (code >= 71 && code <= 77) { cond = "Snowy"; emoji = "❄️"; }
        else if (code >= 80 && code <= 82) { cond = "Showers"; emoji = "🌦️"; }
        else if (code >= 95) { cond = "Thunderstorm"; emoji = "⛈️"; }

        return {
            temp: `${temp}°C`,
            cond: `${cond} ${emoji}`,
            text: `Live in ${name}`
        };

    } catch (error) {
        console.error("Open-Meteo failed, trying backup:", error.message);

        // BACKUP: wttr.in (Simple text fallback)
        try {
            const backupRes = await fetch(`https://wttr.in/${city}?format=%t+%C`);
            if (backupRes.ok) {
                const text = await backupRes.text(); // e.g., "+24°C Sunny"
                // Basic cleanup
                const parts = text.trim().split(" ");
                const temp = parts[0] || "--";
                const cond = parts.slice(1).join(" ") || "Unknown";

                return {
                    temp: temp,
                    cond: `${cond} 🌤️`,
                    text: "Live Report (Backup)"
                };
            }
        } catch (e) {
            console.error("Backup failed too");
        }

        // Last Resort (Should almost never happen)
        return { temp: "--", cond: "Unavailable", text: "Server Busy" };
    }
}

// --- GENERIC GENERATOR ---
const generateGenericPlan = (city) => ({
    places: [
        { name: `${city} City Center`, type: "City", cost: 500 },
        { name: `${city} Market`, type: "Shopping", cost: 1000 },
        { name: `${city} Main Temple`, type: "Spiritual", cost: 0 },
        { name: `${city} Central Park`, type: "Nature", cost: 50 },
        { name: `${city} Museum`, type: "History", cost: 200 }
    ],
    faqs: [{ q: `Best time for ${city}?`, a: "Oct-March." }, { q: "Transport?", a: "Local cabs/autos." }]
});

app.post('/api/plan', async (req, res) => {
    const { location, days, budget } = req.body;
    const cityKey = location.toLowerCase().trim();

    console.log(`🚀 Generating Plan for: ${location}`);

    // 1. Get Data
    let dbData = cityDatabase[cityKey];
    if (!dbData) dbData = generateGenericPlan(location);

    // 2. Get ROBUST Weather
    const weather = await getWeather(location);

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
        aiDescription: `Explore the beauty of ${location}! ✨`,
        weather: weather,
        faqs: dbData.faqs
    });
});

app.listen(5000, () => console.log("🚀 Server running on 5000"));