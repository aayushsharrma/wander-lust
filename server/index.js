// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- 🗺️ INDIA LANGUAGE & ZONE MAP ---
const stateLanguages = {
    // NORTH
    "Delhi": { native: "Hindi", hello: "Namaste 🙏", thank: "Dhanyavaad" },
    "Uttar Pradesh": { native: "Hindi", hello: "Namaste 🙏", thank: "Dhanyavaad" },
    "Haryana": { native: "Haryanvi", hello: "Ram Ram 🙏", thank: "Dhanyavaad" },
    "Punjab": { native: "Punjabi", hello: "Sat Sri Akal 🙏", thank: "Dhanwad" },
    "Himachal Pradesh": { native: "Pahadi", hello: "Namaste 🙏", thank: "Shukriya" },
    "Uttarakhand": { native: "Garhwali", hello: "Pranam 🙏", thank: "Dhanyavaad" },
    "Jammu and Kashmir": { native: "Kashmiri", hello: "Salaam", thank: "Shukriya" },
    "Rajasthan": { native: "Rajasthani", hello: "Khamma Ghani 🙏", thank: "Dhanyavaad" },

    // WEST
    "Gujarat": { native: "Gujarati", hello: "Kem Cho? 👋", thank: "Aabhar" },
    "Maharashtra": { native: "Marathi", hello: "Namaskar 🙏", thank: "Dhanyavaad" },
    "Goa": { native: "Konkani", hello: "Deo Boro Dis Divum", thank: "Dev Borem Korum" },

    // SOUTH
    "Kerala": { native: "Malayalam", hello: "Namaskaram 🙏", thank: "Nanni" },
    "Tamil Nadu": { native: "Tamil", hello: "Vanakkam 🙏", thank: "Nandri" },
    "Karnataka": { native: "Kannada", hello: "Namaskara 🙏", thank: "Dhanyavadagalu" },
    "Andhra Pradesh": { native: "Telugu", hello: "Namaskaram 🙏", thank: "Dhanyavadalu" },
    "Telangana": { native: "Telugu", hello: "Namaskaram 🙏", thank: "Dhanyavadalu" },

    // EAST
    "West Bengal": { native: "Bengali", hello: "Nomoshkar 🙏", thank: "Dhanyabad" },
    "Odisha": { native: "Odia", hello: "Namaskar 🙏", thank: "Dhanyabad" },
    "Bihar": { native: "Bhojpuri", hello: "Pranam 🙏", thank: "Dhanyavaad" },
    "Assam": { native: "Assamese", hello: "Nomoshkar 🙏", thank: "Xobai" },

    // FALLBACK
    "General": { native: "Hindi/English", hello: "Namaste/Hello 👋", thank: "Thank You" }
};

// --- 🧠 CURATED DATABASE ---
const curatedCities = {
    "manali": { lat: 32.2396, lon: 77.1887, state: "Himachal Pradesh" },
    "goa": { lat: 15.2993, lon: 74.1240, state: "Goa" },
    "rishikesh": { lat: 30.0869, lon: 78.2676, state: "Uttarakhand" },
    "udaipur": { lat: 24.5854, lon: 73.7125, state: "Rajasthan" },
    "auli": { lat: 30.5303, lon: 79.5649, state: "Uttarakhand" },
    "meerut": { lat: 28.9845, lon: 77.7064, state: "Uttar Pradesh" }
};

// --- 🌤️ SMART LOCATION ENGINE (Replaces getWeather) ---
async function getLocationData(city) {
    try {
        let latitude, longitude, stateName;
        const cityKey = city.toLowerCase().trim();

        // Check DB
        if (curatedCities[cityKey]) {
            console.log(`✅ Found in DB: ${cityKey}`);
            latitude = curatedCities[cityKey].lat;
            longitude = curatedCities[cityKey].lon;
            stateName = curatedCities[cityKey].state;
        }
        // Check API
        else {
            console.log(`🌍 Searching API for: ${city}`);
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json();

            if (geoData.results && geoData.results.length > 0) {
                latitude = geoData.results[0].latitude;
                longitude = geoData.results[0].longitude;
                stateName = geoData.results[0].admin1;
            } else {
                throw new Error("City Not Found");
            }
        }

        // Language Match
        let langData = stateLanguages[stateName];
        if (!langData) langData = stateLanguages["General"];

        // Weather Match
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        const temp = weatherData.current_weather.temperature;
        const code = weatherData.current_weather.weathercode;

        let cond = "Clear", emoji = "☀️";
        if (code > 3) { cond = "Cloudy"; emoji = "☁️"; }
        if (code > 45) { cond = "Foggy"; emoji = "🌫️"; }
        if (code > 50) { cond = "Rainy"; emoji = "🌧️"; }
        if (code > 70) { cond = "Snowy"; emoji = "❄️"; }

        return {
            weather: { temp: `${temp}°C`, cond: `${cond} ${emoji}`, text: `Live in ${city}` },
            language: langData
        };

    } catch (e) {
        console.log("❌ Location Error:", e.message);
        return {
            weather: { temp: "--", cond: "Unavailable", text: "Server Busy" },
            language: stateLanguages["General"]
        };
    }
}

// --- GENERIC PLAN GENERATOR ---
const generateGenericPlan = (city) => ({
    places: [
        { name: `${city} City Center`, type: "City", cost: 500 },
        { name: `${city} Market`, type: "Shopping", cost: 1000 },
        { name: `${city} Temple`, type: "Spiritual", cost: 0 },
        { name: `${city} Garden`, type: "Nature", cost: 50 },
        { name: `${city} Museum`, type: "History", cost: 200 }
    ],
    faqs: [{ q: `Best time?`, a: "Oct-March." }, { q: "Transport?", a: "Auto/Cab." }]
});

// --- API ENDPOINT ---
app.post('/api/plan', async (req, res) => {
    const { location, days, budget } = req.body;

    // 1. Get Smart Data (No getWeather call here!)
    const locationData = await getLocationData(location);

    // 2. Get Places
    let dbData = curatedCities[location.toLowerCase()];
    if (!dbData || !dbData.places) dbData = generateGenericPlan(location);

    // 3. Logic
    const dailyBudget = budget / days;
    const finalPlaces = dbData.places.filter(p => p.cost <= dailyBudget + 5000);
    const placesToUse = finalPlaces.length > 0 ? finalPlaces : dbData.places;

    const plan = [];
    let currentCost = 0;
    for (let i = 0; i < days; i++) {
        const place = placesToUse[i % placesToUse.length];
        plan.push({ day: i + 1, place: place.name, activity: place.type, cost: place.cost });
        currentCost += place.cost;
    }

    res.json({
        success: true,
        plan,
        totalCost: currentCost,
        aiDescription: `Explore ${location}! ✨`,
        weather: locationData.weather,
        language: locationData.language,
        faqs: dbData.faqs
    });
});

app.listen(5000, () => console.log("🚀 Server running on 5000"));