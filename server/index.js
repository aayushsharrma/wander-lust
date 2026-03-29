// server/index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios'); // State find karne ke liye

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- 🗺️ INDIA LANGUAGE MAP ---
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

// --- 🌤️ MEGA SIMULATED WEATHER DATABASE (All 28 States) ---
const weatherZones = {
    "Andhra Pradesh": { winter: [18, 30], summer: [30, 42], monsoon: [25, 32] },
    "Arunachal Pradesh": { winter: [-2, 12], summer: [15, 25], monsoon: [15, 22] },
    "Assam": { winter: [10, 22], summer: [25, 35], monsoon: [24, 30] },
    "Bihar": { winter: [10, 22], summer: [30, 42], monsoon: [26, 32] },
    "Chhattisgarh": { winter: [12, 25], summer: [35, 45], monsoon: [25, 32] },
    "Goa": { winter: [20, 32], summer: [25, 35], monsoon: [24, 29] },
    "Gujarat": { winter: [12, 28], summer: [30, 42], monsoon: [26, 32] },
    "Haryana": { winter: [5, 22], summer: [35, 45], monsoon: [25, 32] },
    "Himachal Pradesh": { winter: [-5, 15], summer: [15, 30], monsoon: [15, 22] },
    "Jharkhand": { winter: [10, 24], summer: [30, 40], monsoon: [24, 30] },
    "Karnataka": { winter: [15, 28], summer: [28, 38], monsoon: [22, 28] },
    "Kerala": { winter: [22, 32], summer: [28, 36], monsoon: [24, 29] },
    "Madhya Pradesh": { winter: [10, 25], summer: [30, 45], monsoon: [24, 30] },
    "Maharashtra": { winter: [15, 30], summer: [25, 40], monsoon: [22, 28] },
    "Manipur": { winter: [4, 14], summer: [20, 30], monsoon: [22, 28] },
    "Meghalaya": { winter: [4, 15], summer: [15, 25], monsoon: [12, 20] },
    "Mizoram": { winter: [11, 21], summer: [20, 29], monsoon: [18, 25] },
    "Nagaland": { winter: [4, 15], summer: [16, 30], monsoon: [18, 24] },
    "Odisha": { winter: [15, 28], summer: [30, 40], monsoon: [25, 32] },
    "Punjab": { winter: [4, 20], summer: [35, 45], monsoon: [25, 32] },
    "Rajasthan": { winter: [10, 25], summer: [35, 48], monsoon: [25, 35] },
    "Sikkim": { winter: [-5, 10], summer: [15, 25], monsoon: [12, 20] },
    "Tamil Nadu": { winter: [20, 30], summer: [30, 40], monsoon: [25, 32] },
    "Telangana": { winter: [15, 28], summer: [32, 42], monsoon: [24, 31] },
    "Tripura": { winter: [10, 25], summer: [28, 35], monsoon: [25, 30] },
    "Uttar Pradesh": { winter: [8, 24], summer: [30, 45], monsoon: [25, 32] },
    "Uttarakhand": { winter: [0, 15], summer: [15, 35], monsoon: [15, 25] },
    "West Bengal": { winter: [12, 25], summer: [30, 40], monsoon: [25, 32] },
    "Delhi": { winter: [5, 20], summer: [28, 42], monsoon: [25, 32] },
    "General": { winter: [10, 25], summer: [25, 38], monsoon: [22, 30] }
};

// --- 🧠 CURATED DATABASE ---
const curatedCities = {
    "manali": { state: "Himachal Pradesh" }, "kasol": { state: "Himachal Pradesh" }, "spiti": { state: "Himachal Pradesh" },
    "rishikesh": { state: "Uttarakhand" }, "auli": { state: "Uttarakhand" }, "nainital": { state: "Uttarakhand" },
    "meerut": { state: "Uttar Pradesh" }, "agra": { state: "Uttar Pradesh" }, "varanasi": { state: "Uttar Pradesh" },
    "amritsar": { state: "Punjab" }, "delhi": { state: "Delhi" }, "goa": { state: "Goa" },
    "udaipur": { state: "Rajasthan" }, "jaisalmer": { state: "Rajasthan" }, "jaipur": { state: "Rajasthan" },
    "mumbai": { state: "Maharashtra" }, "lonavala": { state: "Maharashtra" }, "rann of kutch": { state: "Gujarat" },
    "kerala": { state: "Kerala" }, "munnar": { state: "Kerala" }, "alleppey": { state: "Kerala" },
    "coorg": { state: "Karnataka" }, "hampi": { state: "Karnataka" }, "bengaluru": { state: "Karnataka" },
    "ooty": { state: "Tamil Nadu" }, "chennai": { state: "Tamil Nadu" }, "tirupati": { state: "Andhra Pradesh" },
    "hyderabad": { state: "Telangana" }, "kolkata": { state: "West Bengal" }, "darjeeling": { state: "West Bengal" },
    "puri": { state: "Odisha" }, "bodh gaya": { state: "Bihar" }, "kaziranga": { state: "Assam" },
    "guwahati": { state: "Assam" }, "tawang": { state: "Arunachal Pradesh" }, "gangtok": { state: "Sikkim" },
    "shillong": { state: "Meghalaya" }
};

// 🎯 SIMULATED WEATHER ENGINE
function getSimulatedWeather(stateName, requestedSeason) {
    // 💡 Frontend se jo season aaya hai usko pakdo
    const season = requestedSeason ? requestedSeason.toLowerCase() : 'summer';
    const stateWeather = weatherZones[stateName] || weatherZones["General"];

    // Safety check incase requestedSeason is invalid
    const seasonData = stateWeather[season] || stateWeather['summer'];
    const [min, max] = seasonData;

    const randomTemp = Math.floor(Math.random() * (max - min + 1)) + min;

    let cond = "Clear", emoji = "☀️";
    if (season === 'monsoon') { cond = "Rainy"; emoji = "🌧️"; }
    else if (randomTemp <= 10) { cond = "Cold"; emoji = "❄️"; }
    else if (randomTemp >= 35) { cond = "Hot"; emoji = "🥵"; }
    else { cond = "Pleasant"; emoji = "🌤️"; }

    return { temp: `${randomTemp}°C`, cond: `${cond} ${emoji}` };
}

// 🚀 LOCATION ENGINE
async function getLocationData(city, requestedSeason) {
    let stateName = "General";
    const cityKey = city.toLowerCase().trim();

    try {
        if (curatedCities[cityKey]) {
            stateName = curatedCities[cityKey].state;
        } else {
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
            const geoRes = await axios.get(geoUrl);
            if (geoRes.data && geoRes.data.results && geoRes.data.results.length > 0) {
                stateName = geoRes.data.results[0].admin1;
            }
        }
    } catch (e) {
        console.log("Geocoding Error:", e.message);
    }

    let langData = stateLanguages[stateName] || stateLanguages["General"];
    const simWeather = getSimulatedWeather(stateName, requestedSeason);

    return {
        // Text mein proper Season dikhayega
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
app.post('/api/plan', async (req, res) => {
    try {
        // 💡 YAHAN SE HATA DIYA HAI GETWEATHER KA NAAM
        const { location, days, budget, season } = req.body;

        const locationData = await getLocationData(location, season);

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
            aiDescription: `Explore ${location} this ${season || 'Summer'}! ✨`,
            weather: locationData.weather,
            language: locationData.language,
            faqs: dbData.faqs
        });
    } catch (error) {
        console.log("Server Crash Prevented:", error);
        res.status(500).json({ success: false, message: "Server error fixed" });
    }
});

app.listen(5000, () => console.log("🚀 Server running on 5000"));