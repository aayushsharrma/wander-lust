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
    // --- NORTH INDIA (Hindi Belt) ---
    "Delhi": { native: "Hindi", hello: "Namaste 🙏", thank: "Dhanyavaad" },
    "Uttar Pradesh": { native: "Hindi", hello: "Namaste 🙏", thank: "Dhanyavaad" },
    "Haryana": { native: "Haryanvi", hello: "Ram Ram 🙏", thank: "Dhanyavaad" },
    "Punjab": { native: "Punjabi", hello: "Sat Sri Akal 🙏", thank: "Dhanwad" },
    "Himachal Pradesh": { native: "Pahadi", hello: "Namaste 🙏", thank: "Shukriya" },
    "Uttarakhand": { native: "Garhwali", hello: "Pranam 🙏", thank: "Dhanyavaad" },
    "Jammu and Kashmir": { native: "Kashmiri", hello: "Salaam", thank: "Shukriya" },
    "Rajasthan": { native: "Rajasthani", hello: "Khamma Ghani 🙏", thank: "Dhanyavaad" },

    // --- WEST INDIA ---
    "Gujarat": { native: "Gujarati", hello: "Kem Cho? 👋", thank: "Aabhar" },
    "Maharashtra": { native: "Marathi", hello: "Namaskar 🙏", thank: "Dhanyavaad" },
    "Goa": { native: "Konkani", hello: "Deo Boro Dis Divum", thank: "Dev Borem Korum" },

    // --- SOUTH INDIA ---
    "Kerala": { native: "Malayalam", hello: "Namaskaram 🙏", thank: "Nanni" },
    "Tamil Nadu": { native: "Tamil", hello: "Vanakkam 🙏", thank: "Nandri" },
    "Karnataka": { native: "Kannada", hello: "Namaskara 🙏", thank: "Dhanyavadagalu" },
    "Andhra Pradesh": { native: "Telugu", hello: "Namaskaram 🙏", thank: "Dhanyavadalu" },
    "Telangana": { native: "Telugu", hello: "Namaskaram 🙏", thank: "Dhanyavadalu" },

    // --- EAST INDIA ---
    "West Bengal": { native: "Bengali", hello: "Nomoshkar 🙏", thank: "Dhanyabad" },
    "Odisha": { native: "Odia", hello: "Namaskar 🙏", thank: "Dhanyabad" },
    "Bihar": { native: "Bhojpuri/Hindi", hello: "Pranam 🙏", thank: "Dhanyavaad" },
    "Assam": { native: "Assamese", hello: "Nomoshkar 🙏", thank: "Xobai" },

    // --- DEFAULT FALLBACK ---
    "General": { native: "Hindi/English", hello: "Namaste/Hello 👋", thank: "Thank You" }
};

// --- 🧠 1. CURATED DATABASE (Added Language Field) ---
const curatedCities = {
    "manali": {
        lat: 32.2396, lon: 77.1887,
        language: { hello: "Namaste", thank: "Dhanyavaad", native: "Hindi/Pahadi" },
        places: [
            { name: "Solang Valley", type: "Adventure", cost: 1000 },
            { name: "Hidimba Temple", type: "Spiritual", cost: 0 },
            { name: "Mall Road", type: "City", cost: 500 },
            { name: "Jogini Falls", type: "Nature", cost: 0 },
            { name: "Old Manali", type: "City", cost: 0 }
        ],
        faqs: [{ q: "Snow?", a: "Dec-Feb." }, { q: "Clothes?", a: "Heavy Woolens." }]
    },
    "goa": {
        lat: 15.2993, lon: 74.1240,
        language: { hello: "Deo Boro Dis Divum", thank: "Dev Borem Korum", native: "Konkani" },
        places: [
            { name: "Calangute Beach", type: "Beach", cost: 0 },
            { name: "Tito's Club", type: "Party", cost: 2000 },
            { name: "Fort Aguada", type: "History", cost: 300 },
            { name: "Dudhsagar Falls", type: "Nature", cost: 500 },
            { name: "Anjuna Market", type: "Shopping", cost: 0 }
        ],
        faqs: [{ q: "Rent bike?", a: "₹400/day." }, { q: "Best season?", a: "Nov-Feb." }]
    },
    "kerala": {
        lat: 10.8505, lon: 76.2711,
        language: { hello: "Namaskaram", thank: "Nanni", native: "Malayalam" },
        places: [
            { name: "Alleppey Houseboat", type: "Nature", cost: 5000 },
            { name: "Munnar Tea Gardens", type: "Nature", cost: 200 },
            { name: "Varkala Beach", type: "Beach", cost: 0 },
            { name: "Kochi Fort", type: "History", cost: 100 },
            { name: "Periyar Wildlife", type: "Adventure", cost: 500 }
        ],
        faqs: [{ q: "Best time?", a: "Sep-March." }, { q: "Food?", a: "Try Sadya." }]
    },
    "udaipur": {
        lat: 24.5854, lon: 73.7125,
        language: { hello: "Khamma Ghani", thank: "Dhanyavaad", native: "Rajasthani" },
        places: [
            { name: "City Palace", type: "History", cost: 400 },
            { name: "Lake Pichola", type: "Nature", cost: 500 },
            { name: "Jag Mandir", type: "History", cost: 300 },
            { name: "Fateh Sagar", type: "Nature", cost: 0 },
            { name: "Vintage Car Museum", type: "History", cost: 250 }
        ],
        faqs: [{ q: "Romantic spot?", a: "Ambrai Ghat." }, { q: "Food?", a: "Dal Baati Churma." }]
    },
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

// --- 🌤️ WEATHER ENGINE (Same as before) ---
async function getLocationData(city) {
    try {
        let latitude, longitude, stateName;

        // Step 1: Check Geocoding API to find State & Coords
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (geoData.results && geoData.results.length > 0) {
            latitude = geoData.results[0].latitude;
            longitude = geoData.results[0].longitude;
            stateName = geoData.results[0].admin1; // Yahan se STATE milega (e.g., "Gujarat")
        } else {
            // Fallback for curated cities if API fails
            if (curatedCities[city.toLowerCase()]) {
                latitude = curatedCities[city.toLowerCase()].lat;
                longitude = curatedCities[city.toLowerCase()].lon;
                stateName = "General";
            } else {
                throw new Error("City Not Found");
            }
        }

        // Step 2: Determine Language based on State
        let langData = stateLanguages[stateName] || stateLanguages["General"];

        // Step 3: Get Weather
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        const temp = weatherData.current_weather.temperature;
        const code = weatherData.current_weather.weathercode;

        let cond = "Clear", emoji = "☀️";
        if (code > 3) { cond = "Cloudy"; emoji = "☁️"; }
        else if (code > 45) { cond = "Foggy"; emoji = "🌫️"; }
        else if (code > 50) { cond = "Rainy"; emoji = "🌧️"; }
        else if (code > 70) { cond = "Snowy"; emoji = "❄️"; }

        return {
            weather: { temp: `${temp}°C`, cond: `${cond} ${emoji}`, text: `Live in ${city}` },
            language: langData
        };

    } catch (e) {
        console.log("Error:", e.message);
        return {
            weather: { temp: "--", cond: "Unavailable", text: "Server Busy" },
            language: stateLanguages["General"]
        };
    }
}

// --- GENERIC GENERATOR (With Default Language) ---
const generateGenericPlan = (city) => ({
    language: { hello: "Namaste", thank: "Thank You", native: "Hindi/English" },
    places: [
        { name: `${city} Main Market`, type: "Shopping", cost: 1000 },
        { name: `${city} City Center`, type: "City", cost: 500 },
        { name: `${city} Famous Temple`, type: "Spiritual", cost: 0 },
        { name: `${city} Local Park`, type: "Nature", cost: 50 },
        { name: `${city} Museum`, type: "History", cost: 200 }
    ],
    faqs: [{ q: `Best time to visit?`, a: "Oct-March is ideal." }, { q: "Local transport?", a: "Autos and Cabs available." }]
});

app.post('/api/plan', async (req, res) => {
    const { location, days, budget } = req.body;
    const cityKey = location.toLowerCase().trim();

    let dbData = curatedCities[cityKey];
    if (!dbData) dbData = generateGenericPlan(location);

    const weather = await getWeather(cityKey, dbData);

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
        aiDescription: `Explore the amazing ${location}! ✨`,
        weather: weather,
        faqs: dbData.faqs,
        language: dbData.language // Sending Language Data
    });
});

app.listen(5000, () => console.log("🚀 Server running on 5000"));