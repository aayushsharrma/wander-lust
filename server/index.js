// server/index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios'); // State pata karne ke liye wapas laya gaya

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- 🗺️ INDIA LANGUAGE MAP (Expanded) ---
const stateLanguages = {
    "Delhi": { native: "Hindi", hello: "Namaste 🙏", thank: "Dhanyavaad" },
    "Uttar Pradesh": { native: "Hindi", hello: "Namaste 🙏", thank: "Dhanyavaad" },
    "Himachal Pradesh": { native: "Pahadi", hello: "Namaste 🙏", thank: "Shukriya" },
    "Uttarakhand": { native: "Garhwali", hello: "Pranam 🙏", thank: "Dhanyavaad" },
    "Rajasthan": { native: "Rajasthani", hello: "Khamma Ghani 🙏", thank: "Dhanyavaad" },
    "Gujarat": { native: "Gujarati", hello: "Kem Cho? 👋", thank: "Aabhar" },
    "Maharashtra": { native: "Marathi", hello: "Namaskar 🙏", thank: "Dhanyavaad" },
    "Goa": { native: "Konkani", hello: "Deo Boro Dis Divum", thank: "Dev Borem Korum" },
    "Kerala": { native: "Malayalam", hello: "Namaskaram 🙏", thank: "Nanni" },
    "Tamil Nadu": { native: "Tamil", hello: "Vanakkam 🙏", thank: "Nandri" },
    "Karnataka": { native: "Kannada", hello: "Namaskara 🙏", thank: "Dhanyavadagalu" },
    "West Bengal": { native: "Bengali", hello: "Nomoshkar 🙏", thank: "Dhanyabad" },
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

// --- 🧠 CURATED DATABASE ---
const curatedCities = {
    "manali": { state: "Himachal Pradesh" },
    "goa": { state: "Goa" },
    "rishikesh": { state: "Uttarakhand" },
    "kerala": { state: "Kerala" },
    "meerut": { state: "Uttar Pradesh" }
};

// 🗓️ SMART MONTH-TO-SEASON CONVERTER
function getSeasonFromMonth(monthName) {
    const month = monthName.toLowerCase();
    const winter = ['november', 'december', 'january', 'february'];
    const summer = ['march', 'april', 'may', 'june'];
    // Baaki bache huye (July, Aug, Sept, Oct) Monsoon hain

    if (winter.includes(month)) return 'winter';
    if (summer.includes(month)) return 'summer';
    return 'monsoon';
}

// 🎯 SIMULATED WEATHER ENGINE
function getSimulatedWeather(stateName, requestedSeason) {
    const season = requestedSeason || 'summer';
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

// 🚀 HYBRID LOCATION ENGINE (API for State + Sim for Weather)
async function getLocationData(city, requestedSeason) {
    let stateName = "General"; // Default
    const cityKey = city.toLowerCase().trim();

    try {
        // 1. Agar Database mein hai toh direct uthao
        if (curatedCities[cityKey]) {
            stateName = curatedCities[cityKey].state;
        }
        // 2. Agar nahi hai toh Axios API se State pata lagao (Sahi Lingo ke liye)
        else {
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
            const geoRes = await axios.get(geoUrl);
            if (geoRes.data && geoRes.data.results && geoRes.data.results.length > 0) {
                stateName = geoRes.data.results[0].admin1; // Returns state (e.g., "Kerala")
            }
        }
    } catch (e) {
        console.log("Geocoding Error (Fallback to General):", e.message);
    }

    // 🗣️ MATCH LOCAL LINGO based on detected state
    let langData = stateLanguages[stateName] || stateLanguages["General"];

    // 🌤️ GENERATE FAKE WEATHER
    const simWeather = getSimulatedWeather(stateName, requestedSeason);

    return {
        weather: { temp: simWeather.temp, cond: simWeather.cond, text: `Planned for ${requestedSeason || 'Summer'}` },
        language: langData
    };
}

// --- PLAN GENERATOR ---
const generateGenericPlan = (city) => ({
    places: [
        { name: `${city} City Center`, type: "City", cost: 500 },
        { name: `${city} Market`, type: "Shopping", cost: 1000 },
        { name: `${city} Main Temple`, type: "Spiritual", cost: 0 },
        { name: `${city} Viewpoint`, type: "Nature", cost: 50 }
    ],
    faqs: [{ q: `Local Transport?`, a: "Auto/Cab." }]
});

// --- API ENDPOINT ---
// --- API ENDPOINT ---
app.post('/api/plan', async (req, res) => {
    // 💡 Frontend se ab 'month' receive ho raha hai
    const { location, days, budget, month } = req.body;

    // 💡 Month ko padh kar automatically Season pata lagao
    const detectedSeason = getSeasonFromMonth(month || 'january');

    // 💡 Season ko engine mein bhejo temperature nikalne ke liye
    const locationData = await getLocationData(location, detectedSeason);

    let dbData = curatedCities[location.toLowerCase()];
    if (!dbData || !dbData.places) dbData = generateGenericPlan(location);

    const dailyBudget = budget / days;
    const finalPlaces = dbData.places ? dbData.places.filter(p => p.cost <= dailyBudget + 5000) : [];
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
        // 💡 AI Description mein ab Month ka naam aayega (e.g., "Explore Manali this December!")
        aiDescription: `Explore ${location} this ${month || 'January'}! ✨`,
        aiDescription: `Explore ${location} this ${season || 'summer'}! ✨`,
        weather: {
            temp: locationData.weather.temp,
            cond: locationData.weather.cond,
            text: `Forecast for ${month || 'January'}` // 💡 Weather text mein bhi Month update
        },
        language: locationData.language,
        faqs: dbData.faqs
    });
});
app.listen(5000, () => console.log("🚀 Server running on 5000"));