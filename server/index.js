// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- 🗺️ INDIA LANGUAGE MAP ---
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

// --- 🌤️ SIMULATED WEATHER DATABASE ---
const weatherZones = {
    "Himachal Pradesh": { winter: [-5, 12], summer: [10, 25], monsoon: [15, 22] },
    "Uttarakhand": { winter: [-2, 15], summer: [12, 28], monsoon: [16, 24] },
    "Jammu and Kashmir": { winter: [-10, 8], summer: [10, 25], monsoon: [12, 20] },
    "Rajasthan": { winter: [8, 22], summer: [30, 45], monsoon: [25, 34] },
    "Goa": { winter: [20, 32], summer: [25, 35], monsoon: [24, 29] },
    "Kerala": { winter: [22, 32], summer: [26, 35], monsoon: [24, 29] },
    "Maharashtra": { winter: [15, 30], summer: [25, 38], monsoon: [22, 28] },
    "Uttar Pradesh": { winter: [7, 22], summer: [25, 40], monsoon: [24, 32] },
    "Delhi": { winter: [5, 20], summer: [28, 42], monsoon: [25, 32] },
    "General": { winter: [10, 25], summer: [25, 38], monsoon: [22, 30] }
};

// --- DB ---
const curatedCities = {
    "manali": { lat: 32.2396, lon: 77.1887, state: "Himachal Pradesh" },
    "goa": { lat: 15.2993, lon: 74.1240, state: "Goa" },
    "rishikesh": { lat: 30.0869, lon: 78.2676, state: "Uttarakhand" }
};

// 🎯 USER DRIVEN WEATHER ENGINE
function getSimulatedWeather(stateName, requestedSeason) {
    const season = requestedSeason || 'summer'; // Default to summer if empty
    const stateWeather = weatherZones[stateName] || weatherZones["General"];
    const [min, max] = stateWeather[season];

    const randomTemp = Math.floor(Math.random() * (max - min + 1)) + min;

    let cond = "Clear", emoji = "☀️";
    if (season === 'monsoon') { cond = "Rainy"; emoji = "🌧️"; }
    else if (randomTemp <= 10) { cond = "Cold"; emoji = "❄️"; }
    else if (randomTemp >= 35) { cond = "Hot"; emoji = "🥵"; }
    else { cond = "Pleasant"; emoji = "🌤️"; }

    return { temp: `${randomTemp}°C`, cond: `${cond} ${emoji}` };
}

// 🌤️ LOCATION ENGINE (Now accepts 'season')
async function getLocationData(city, requestedSeason) {
    try {
        let stateName;
        const cityKey = city.toLowerCase().trim();

        if (curatedCities[cityKey]) {
            stateName = curatedCities[cityKey].state;
        } else {
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
            const geoRes = await axios.get(geoUrl);
            if (geoRes.data.results && geoRes.data.results.length > 0) {
                stateName = geoRes.data.results[0].admin1;
            } else {
                stateName = "General";
            }
        }

        let langData = stateLanguages[stateName] || stateLanguages["General"];

        // 🚀 Generate Weather based on USER'S SELECTED SEASON
        const simWeather = getSimulatedWeather(stateName, requestedSeason);

        return {
            weather: { temp: simWeather.temp, cond: simWeather.cond, text: `Planned for ${requestedSeason}` },
            language: langData
        };

    } catch (e) {
        console.log("❌ Location Error:", e.message);
        const backupWeather = getSimulatedWeather("General", requestedSeason);
        return {
            weather: { temp: backupWeather.temp, cond: backupWeather.cond, text: `Planned for ${requestedSeason}` },
            language: stateLanguages["General"]
        };
    }
}

// --- PLAN GENERATOR ---
const generateGenericPlan = (city) => ({
    places: [
        { name: `${city} City Center`, type: "City", cost: 500 },
        { name: `${city} Market`, type: "Shopping", cost: 1000 },
        { name: `${city} Temple`, type: "Spiritual", cost: 0 },
        { name: `${city} Viewpoint`, type: "Nature", cost: 50 }
    ],
    faqs: [{ q: `Local Transport?`, a: "Auto/Cab." }]
});

// --- API ENDPOINT ---
app.post('/api/plan', async (req, res) => {
    // 💡 Frontend se 'season' receive ho raha hai yahan
    const { location, days, budget, season } = req.body;

    // 💡 'season' ko engine mein bhej rahe hain
    const locationData = await getLocationData(location, season);

    let dbData = curatedCities[location.toLowerCase()];
    if (!dbData || !dbData.places) dbData = generateGenericPlan(location);

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
        aiDescription: `Explore ${location} this ${season}! ✨`,
        weather: locationData.weather,
        language: locationData.language,
        faqs: dbData.faqs
    });
});

app.listen(5000, () => console.log("🚀 Server running on 5000"));