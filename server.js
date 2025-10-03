// server.js - The brain of the operation
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// This endpoint is the "Prediction API"
app.post('/predict-yield', (req, res) => {
    const { title, url } = req.body;
    // In a real-world scenario, you might get geo from a header like 'x-forwarded-for'
    // For this example, we'll keep the logic simple.

    let eCPM = 0.50; // Start with a base eCPM
    const keywords = (title + ' ' + url).toLowerCase();

    // --- YOUR DYNAMIC RULES GO HERE ---
    // This is where you can get creative. Check for valuable keywords.
    if (keywords.includes('finance') || keywords.includes('crypto') || keywords.includes('investing')) {
        eCPM += 2.50;
    }
    if (keywords.includes('tech') || keywords.includes('software') || keywords.includes('gaming')) {
        eCPM += 1.75;
    }
    // ------------------------------------

    const floorPrice = 1.00; // Set your minimum eCPM to load the full player

    console.log(`Prediction for "${title}": eCPM = $${eCPM.toFixed(2)}`);

    if (eCPM >= floorPrice) {
        res.json({ action: 'load_player', eCPM: eCPM.toFixed(2) });
    } else {
        res.json({ action: 'fallback', eCPM: eCPM.toFixed(2) });
    }
});

// This route serves your loader script when a publisher requests it.
app.get('/ads/nas-video.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'loader.js'));
});

// This serves the main player script when the loader requests it.
app.get('/player.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'player.js'));
});

// A simple analytics endpoint for Time-in-View data
app.post('/analytics', (req, res) => {
    console.log('Analytics Beacon Received:', req.body);
    res.sendStatus(204); // Send "No Content" response
});


app.listen(PORT, () => {
    console.log(`NasRev Ad Server running on http://localhost:${PORT}`);
});