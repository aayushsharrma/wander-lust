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

// --- 🧠 CITY DATABASE (With Exact Coordinates) ---
const cityDatabase = {
    "manali": {
        // Himachal Pradesh Coordinates
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
    },
    "pune": {
        lat: 18.5204, lon: 73.8567,
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

// --- 🌤️ EXACT LOCATION WEATHER FUNCTION ---
async function getWeather(city, dbCoords) {
    try {
        let latitude, longitude, name;

        // METHOD 1: Agar Database mein Coordinates hain toh wahin use karo (100% Accurate)
        if (dbCoords && dbCoords.lat && dbCoords.lon) {
            latitude = dbCoords.lat;
            longitude = dbCoords.lon;
            name = city; // Naam wahi rakho jo user ne dala
        }
        // METHOD 2: Agar naya shehar hai, toh search karo (Lekin India laga ke)
        else {
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city + " India")}&count=1&language=en&format=json`;
            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json();

            if (!geoData.results || geoData.results.length === 0) {
                throw new Error("City not found");
            }
            latitude = geoData.results[0].latitude;
            longitude = geoData.results[0].longitude;
            name = geoData.results[0].name;
        }

        // Fetch Exact Weather
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        const temp = weatherData.current_weather.temperature;
        const code = weatherData.current_weather.weathercode;

        // Code Interpretation
        let cond = "Clear";
        let emoji = "☀️";

        if (code >= 1 && code <= 3) { cond = "Cloudy"; emoji = "☁️"; }
        else if (code >= 45 && code <= 48) { cond = "Foggy"; emoji = "🌫️"; }
        else if (code >= 51 && code <= 67) { cond = "Rainy"; emoji = "🌧️"; }
        else if (code >= 71 && code <= 77) { cond = "Snowy"; emoji = "❄️"; }
        else if (code >= 80 && code <= 82) { cond = "Showers"; emoji = "🌦️"; }
        else if (code >= 95) { cond = "Thunderstorm"; emoji = "⛈️"; }

        // Capitalize Name properly
        const displayName = city.charAt(0).toUpperCase() + city.slice(1);

        return {
            temp: `${temp}°C`,
            cond: `${cond} ${emoji}`,
            text: `Live in ${displayName}`
        };

    } catch (error) {
        console.error("Weather failed:", error.message);
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

    console.log(`🚀 Plan requested for: ${location}`);

    // 1. Get Data from DB
    let dbData = cityDatabase[cityKey];

    // 2. Get Weather (Pass DB coordinates if available)
    const weather = await getWeather(location, dbData); // Yahan dbData pass kiya

    // Fallback for Places if not in DB
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
        aiDescription: `Explore the magic of ${location}! ✨`,
        weather: weather,
        faqs: dbData.faqs
    });
});

app.listen(5000, () => console.log("🚀 Server running on 5000"));