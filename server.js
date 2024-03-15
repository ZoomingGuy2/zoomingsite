const express = require('express');
const fs = require('fs');
const cors = require('cors'); // Import the cors package
const https = require('https');
const app = express();
const path = require('path');
const PORT = 7322;

app.use(express.static('public'));
app.use(express.json());

// Use the cors middleware to enable CORS
app.use(cors());

// SSL/TLS Configuration
const sslOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/zoomingguy.duckdns.org-0002/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/zoomingguy.duckdns.org-0002/fullchain.pem'),
    ca: fs.readFileSync('/etc/letsencrypt/live/zoomingguy.duckdns.org-0002/chain.pem')
};

// Create HTTPS server
const server = https.createServer(sslOptions, app);

//TETRIS
// Endpoint to serve leaderboard JSON of Tetris
app.get('/leaderboard', (req, res) => {
    // Read the leaderboard JSON file
    fs.readFile('/var/www/html/tetris/leaderboard.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading leaderboard file:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        // Parse the JSON data
        const leaderboardData = JSON.parse(data);

        // Send the leaderboard data as the response
        res.json(leaderboardData);
    });
});

// Endpoint to update leaderboard of TETRIS
app.post('/updateLeaderboard', async (req, res) => {
    // Assuming the request body contains the new leaderboard entry
    const newEntry = req.body;

    // Construct the file path
    const filePath = path.join(__dirname, 'tetris', 'leaderboard.json');

    try {
        // Read the existing leaderboard data from the file
        let leaderboardData = await fs.promises.readFile(filePath, 'utf8');
        leaderboardData = JSON.parse(leaderboardData);

        // Ensure leaderboardData is an array
        if (!Array.isArray(leaderboardData)) {
            leaderboardData = [];
        }

        // Append the new entry to the existing data
        leaderboardData.push(newEntry);

        // Sort the leaderboard data by score (descending order)
        leaderboardData.sort((a, b) => b.score - a.score);

        // Keeponly the top 10 entries
        leaderboardData = leaderboardData.slice(0, 10);

        // Write the updated data back to the file
        await fs.promises.writeFile(filePath, JSON.stringify(leaderboardData, null, 2), 'utf8');

        console.log('Leaderboard updated successfully');
        res.status(200).json({ message: 'Leaderboard updated successfully' });
    } catch (err) {
        console.error('Error updating leaderboard:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//MINESWEEPER
// Endpoint to serve leaderboard JSON of MINESWEEPER
app.get('/leaderboardMinesweeper', (req, res) => {
    const mapSize = req.query.mapSize; // figure out which leaderboard to update
    // Read the leaderboard JSON file
    const filePath = path.join(__dirname, 'minesweeper', `leaderboard-${mapSize}.json`);
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading leaderboard file for ${mapSize} maps:`, err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        // Parse the JSON data
        const leaderboardData = JSON.parse(data);

        // Send the leaderboard data as the response
        res.json(leaderboardData);
    });
});

// Endpoint to update leaderboard of Minesweeper
app.post('/updateLeaderboardMinesweeper', async (req, res) => {
    // Assuming the request body contains the new leaderboard entry
    const newEntry = req.body;

    const mapSize = req.query.mapSize; // figure out which leaderboard to update
    // Construct the file path
    const filePath = path.join(__dirname, 'minesweeper', `leaderboard-${mapSize}.json`);

    try {
        // Read the existing leaderboard data from the file
        let leaderboardData = await fs.promises.readFile(filePath, 'utf8');
        leaderboardData = JSON.parse(leaderboardData);

        // Ensure leaderboardData is an array
        if (!Array.isArray(leaderboardData)) {
            leaderboardData = [];
        }

        // Append the new entry to the existing data
        leaderboardData.push(newEntry);

        // Sort the leaderboard data by score (ascending order)
        leaderboardData.sort((a, b) => a.score - b.score);

        // Keeponly the top 10 entries
        leaderboardData = leaderboardData.slice(0, 10);

        // Write the updated data back to the file
        await fs.promises.writeFile(filePath, JSON.stringify(leaderboardData, null, 2), 'utf8');

        console.log(`Leaderboard for ${mapSize} maps updated successfully`);
        res.status(200).json({ message: 'Leaderboard updated successfully' });
    } catch (err) {
        console.error(`Error updating leaderboard for ${mapSize} maps:`, err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start HTTPS server
server.listen(PORT, () => {
    console.log(`Server is running on https://localhost:${PORT}`);
});
