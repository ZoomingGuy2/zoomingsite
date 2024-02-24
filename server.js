const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 7322;

app.use(express.static('public'));
app.use(express.json());

// Endpoint to serve leaderboard JSON
app.get('/leaderboard', (req, res) => {
    // Read the leaderboard JSON file
    fs.readFile('tetris2/leaderboard.json', 'utf8', (err, data) => {
	        if (err) {
			        console.error('Error reading leaderboard file:', err);
			        res.status(500).json({ error: 'Internal server error' });
			        return;
			    }

	        console.log('Data from file:', data); // Log data to console

	        // Parse the JSON data
	    	const leaderboardData = JSON.parse(data);
	    	// Send the leaderboard data as the response
	    	res.json(leaderboardData);
           });
});

// Endpoint to update leaderboard
app.post('/updateLeaderboard', (req, res) => {
    // Your code to update the leaderboard...
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

