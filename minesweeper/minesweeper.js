initialClick = true;
global_size = 'small';
deathBomb = [-1, -1]; // coordinates of bomb that killed you (for red bomb effect)

leaderboardThresholds = {
    small: 0,
    medium: 0,
    large: 0,
    larger: 0
};


const Minesweeper = {
    rows: 10,
    cols: 10,
    bombs: 20,
    grid: [],
    gameOver: false,
    debugMode: false,

    minesLeft: 0,
    secondsElapsed: 0,
    timerInterval: null,



    initializeDigitDisplay: function() {
        clearInterval(this.timerInterval);
        this.renderDigitDisplay('mines', this.minesLeft);
        this.renderDigitDisplay('time', this.secondsElapsed);
    },

    startTimer: function() {
        this.timerInterval = setInterval(() => {
            this.secondsElapsed++;
            this.renderDigitDisplay('time', this.secondsElapsed);
        }, 1000);
    },
    renderDigitDisplay: function(type, value) {
        const container = document.getElementById(`${type}Display`);
        container.innerHTML = '';

        const digits = value.toString().padStart(3, '0').split('');
        for (let digit of digits) {
            const img = document.createElement('img');
            img.src = `photos/digits/${digit}.gif`;
            container.appendChild(img);
        }
    },
     // Define different map sizes
    mapSizes: {
        small: { rows: 10, cols: 10, bombs: 15},
        medium: { rows: 15, cols: 15, bombs: 35 },
        large: { rows: 20, cols: 20, bombs: 60 },
        larger: {rows: 20, cols: 40, bombs: 120}
    },

    init: function(size) {
        // Set the map size
        const mapSize = this.mapSizes[size];
        this.rows = mapSize.rows;
        this.cols = mapSize.cols;
        this.bombs = mapSize.bombs;
        this.revealedNonMines = 0;
        this.changedTiles = [];

        this.createGrid();
        this.minesLeft = this.bombs;
        this.setupGame();
        this.renderBorder();
        this.renderGrid();
        this.adjustGrayBoxWidth(16*this.cols);
        this.initializeDigitDisplay();
        this.enterScore('small', 0); // show all leaderbords:
        this.enterScore('medium', 0);
        this.enterScore('large', 0);
        this.enterScore('larger', 0);

    },

    createGrid: function() {
        this.totalNonMines = this.rows * this.cols - this.bombs;
        for (let i = 0; i < this.rows; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.cols; j++) {
                this.grid[i][j] = {
                    bomb: false,
                    revealed: false,
                    flagged: false,
                    value: 0
                };
            }
        }
    },

    setupGame: function() {
        this.calculateAdjacentBombs();
    },

    placeBombs: function(rowclick, colclick) {
        let bombsPlaced = 0;
        while (bombsPlaced < this.bombs) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            if (!this.grid[row][col].bomb && !(Math.abs(rowclick-row)<=1 && Math.abs(colclick-col)<=1)) {
                this.grid[row][col].bomb = true;
                bombsPlaced++;
            }
        }
    },

    calculateAdjacentBombs: function() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (!this.grid[i][j].bomb) {
                    let count = 0;
                    for (let di = -1; di <= 1; di++) {
                        for (let dj = -1; dj <= 1; dj++) {
                            const ni = i + di;
                            const nj = j + dj;
                            if (this.isInGrid(ni, nj) && this.grid[ni][nj].bomb) {
                                count++;
                            }
                        }
                    }
                    this.grid[i][j].value = count;
                }
            }
        }
    },

    isInGrid: function(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    },
    // render the grid on the page
    renderBorder: function() {
        //render top top border
        const containertop = document.getElementById('topborder');
        containertop.innerHTML = ''; // Clear the container before rendering
        for (let j = 0; j < this.cols+2; j++) {
            const tile = document.createElement('div');
            tile.classList.add('tile-border');
            // Create and set attributes for the image element
            const img = document.createElement('img');
            if(j===0){
                img.src = 'photos/top-left-corner.gif';
            }
            else if(j===this.cols+1){
                img.src = 'photos/top-right-corner.gif';
            }
            else{
                img.src = 'photos/side-bar.gif';
            }
            tile.appendChild(img);
            containertop.appendChild(tile);
        }
        //render top left border
        const containerlefttop = document.getElementById('topleftborder');
        containerlefttop.innerHTML = ''; // Clear the container before rendering
        for (let j = 0; j < 2; j++) {
            const tile = document.createElement('div');
            const rowContainer = document.createElement('div');
            rowContainer.classList.add('row-container');
            tile.classList.add('tile-border-vert');

            // Create and set attributes for the image element
            const img = document.createElement('img');
            img.src = 'photos/up-bar.gif';
            tile.appendChild(img);
            containerlefttop.appendChild(tile);
            containerlefttop.appendChild(rowContainer);

        }
        //render top right border
        const containerrighttop = document.getElementById('toprightborder');
        containerrighttop.innerHTML = ''; // Clear the container before rendering
        for (let j = 0; j < 2; j++) {
            const tile = document.createElement('div');
            const rowContainer = document.createElement('div');
            rowContainer.classList.add('row-container');
            tile.classList.add('tile-border-vert');

            // Create and set attributes for the image element
            const img = document.createElement('img');
            img.src = 'photos/up-bar.gif';
            tile.appendChild(img);
            containerrighttop.appendChild(tile);
            containerrighttop.appendChild(rowContainer);

        }
        //render middle border
        const containermiddle = document.getElementById('middleborder');
        containermiddle.innerHTML = ''; // Clear the container before rendering
        for (let j = 0; j < this.cols+2; j++) {
            const tile = document.createElement('div');
            tile.classList.add('tile-border');
            // Create and set attributes for the image element
            const img = document.createElement('img');
            if(j===0){
                img.src = 'photos/middle-left-corner.gif';
            }
            else if(j===this.cols+1){
                img.src = 'photos/middle-right-corner.gif';
            }
            else{
                img.src = 'photos/side-bar.gif';
            }
            tile.appendChild(img);
            containermiddle.appendChild(tile);

        }
        //render bottom left border
        const containerleft = document.getElementById('leftborder');
        containerleft.innerHTML = ''; // Clear the container before rendering
        for (let j = 0; j < this.rows; j++) {
            const tile = document.createElement('div');
            const rowContainer = document.createElement('div');
            rowContainer.classList.add('row-container');
            tile.classList.add('tile-border-vert');

            // Create and set attributes for the image element
            const img = document.createElement('img');
            img.src = 'photos/up-bar.gif';
            tile.appendChild(img);
            containerleft.appendChild(tile);
            containerleft.appendChild(rowContainer);

        }
        //render bottom right border
        const containerright = document.getElementById('rightborder');
        containerright.innerHTML = ''; // Clear the container before rendering
        for (let j = 0; j < this.rows; j++) {
            const tile = document.createElement('div');
            const rowContainer = document.createElement('div');
            rowContainer.classList.add('row-container');
            tile.classList.add('tile-border-vert');

            // Create and set attributes for the image element
            const img = document.createElement('img');
            img.src = 'photos/up-bar.gif';
            tile.appendChild(img);
            containerright.appendChild(tile);
            containerright.appendChild(rowContainer);

        }
        //render bottom border
        const containerbot = document.getElementById('bottomborder');
        containerbot.innerHTML = ''; // Clear the container before rendering
        for (let j = 0; j < this.cols+2; j++) {
            const tile = document.createElement('div');
            tile.classList.add('tile-border');
            // Create and set attributes for the image element
            const img = document.createElement('img');
            if(j===0){
                img.src = 'photos/bottom-left-corner.gif';
            }
            else if(j===this.cols+1){
                img.src = 'photos/bottom-right-corner.gif';
            }
            else{
                img.src = 'photos/side-bar.gif';
            }
            tile.appendChild(img);
            containerbot.appendChild(tile);

        }
    },
    // function to adjust the width of the gray box
    adjustGrayBoxWidth: function(width) {
        var grayBox = document.getElementById("grayBox");
        if (grayBox) {
            // adjust the width of the gray box here
            grayBox.style.width = width + "px";
        }
    },
    renderGrid: function() {
        const container = document.getElementById('minesweeper');
        container.innerHTML = ''; // Clear the container before rendering
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < this.rows; i++) {
            const rowContainer = document.createElement('div');
            rowContainer.classList.add('row-container');

            for (let j = 0; j < this.cols; j++) {
                const tile = document.createElement('div');
                tile.classList.add('tile');

                if (this.grid[i][j].revealed) {
                    if (this.grid[i][j].bomb) {
                        const bombImage = document.createElement('img');
                        if((deathBomb[0]==i)&&(deathBomb[1]==j)){ // If we are trying to render the bomb that killed us
                            bombImage.src = 'photos/bomb_red.gif';
                            deathBomb=[-1,-1];
                        }
                        else{
                            bombImage.src = 'photos/bomb.gif';
                        }
                        tile.appendChild(bombImage);
                    } else {
                        const value = this.grid[i][j].value;
                        tile.style.backgroundImage = `url('photos/${value}.gif')`;
                    }
                    tile.classList.add('revealed');
                } else if (this.grid[i][j].flagged && this.grid[i][j].bomb) { // If it was correctly flagged
                    const flagImage = document.createElement('img');
                    flagImage.src = "photos/flag.gif";
                    tile.appendChild(flagImage);
                    tile.classList.add('flagged');
                } else if (this.grid[i][j].flagged && !this.grid[i][j].bomb) {   // If it was incorrectly flagged
                    const flagImage = document.createElement('img');
                    flagImage.src = "photos/fake_flag.gif";
                    tile.appendChild(flagImage);
                    tile.classList.add('flagged');
                } else {
                    tile.style.backgroundImage = "url('photos/unrevealed.gif')";
                }

                // Add event listeners for clicking and right-clicking
                tile.addEventListener('click', () => this.reveal(i, j));
                tile.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.toggleFlag(i, j);
                });

                rowContainer.appendChild(tile);
            }

            fragment.appendChild(rowContainer);
        }

        container.appendChild(fragment);
    },
markTileAsChanged: function(row, col) {
    this.changedTiles.push({ row, col });
},
reveal: function(row, col) {
    if (initialClick) {
        this.placeBombs(row, col);
        this.calculateAdjacentBombs();
        this.startTimer();

        initialClick = false;
    }

    if (this.gameOver || this.grid[row][col].revealed || this.grid[row][col].flagged) {
        return; // If game is over or tile is already revealed or flagged, do nothing
    }

    // Reveal the initially clicked tile
    this.grid[row][col].revealed = true;
    if (!this.grid[row][col].bomb) {
        this.revealedNonMines++;
    }

    if (this.grid[row][col].bomb) {
        this.gameOver = true;
        this.grid[row][col].imageSrc = 'photos/bomb_red.gif';
        deathBomb = [row, col];
        this.showGameOverMessage(); // show custom game over message

    } else if (this.revealedNonMines === this.totalNonMines) {
        this.showGameWonMessage();
    }

    this.markTileAsChanged(row, col); // Mark the clicked tile as changed

    // create a queue to store tiles that need to be revealed
    const queue = [];

    // if the clicked tile is 0, add its adjacent unrevealed tiles to the queue
    if (this.grid[row][col].value === 0) {
        for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
                const ni = row + di;
                const nj = col + dj;
                if (ni >= 0 && ni < this.rows && nj >= 0 && nj < this.cols && !this.grid[ni][nj].revealed) {
                    queue.push({ row: ni, col: nj });
                }
            }
        }
    }

    // iterate over the queue until it's empty
    while (queue.length > 0) {
        const { row, col } = queue.shift();

        // if the tile is already revealed or flagged, skip it
        if (this.grid[row][col].revealed || this.grid[row][col].flagged) {
            continue;
        }

        // mark the tile as revealed
        this.grid[row][col].revealed = true;

        // update the revealedNonMines count for non-mine tiles
        if (!this.grid[row][col].bomb) {
            this.revealedNonMines++;
        }

        this.markTileAsChanged(row, col); // Mark the current tile as changed

        // if the tile is 0, add its adjacent unrevealed tiles to the queue
        if (this.grid[row][col].value === 0) {
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    const ni = row + di;
                    const nj = col + dj;
                    if (ni >= 0 && ni < this.rows && nj >= 0 && nj < this.cols && !this.grid[ni][nj].revealed) {
                        queue.push({ row: ni, col: nj });
                    }
                }
            }
        }
    }
    this.renderChangedTiles(); // Render only the changed tiles
},
renderChangedTiles: function() {
    const container = document.getElementById('minesweeper');
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < this.changedTiles.length; i++) {
        const changedTile = this.changedTiles[i];
        const row = changedTile.row;
        const col = changedTile.col;
        const rowContainer = container.children[row];
        const tile = rowContainer.children[col];

        if (this.grid[row][col].revealed) {
            if (this.grid[row][col].bomb) {
                tile.style.backgroundImage = "url('photos/bomb.gif')";
            } else {
                const value = this.grid[row][col].value;
                tile.style.backgroundImage = `url('photos/${value}.gif')`;
            }
            tile.classList.add('revealed'); // Add revealed class to revealed tiles
        } else if (this.grid[row][col].flagged) {
            tile.style.backgroundImage = "url('photos/flag.gif')";
        } else {
            tile.style.backgroundImage = "url('photos/unrevealed.gif')"; //unrevealed tile
            tile.classList.remove('revealed', 'flagged');
        }
    }

    this.changedTiles = []; // Reset the changedTiles array
},
    // toggle a flag on a tile
toggleFlag: function(row, col) {
    if (this.gameOver || this.grid[row][col].revealed) {
        return; // if game is over or tile is already revealed, do not allow flagging
    }
    if (this.grid[row][col].flagged) {
    this.minesLeft++;
} else {
    this.minesLeft--;
}
this.renderDigitDisplay('mines', this.minesLeft);
this.grid[row][col].flagged = !this.grid[row][col].flagged;
this.markTileAsChanged(row, col);
this.renderChangedTiles();
},
 // set smiley to dead guy
    showGameOverMessage: function() {
        resetButton.src = 'photos/dead.gif'
        // loop through the grid and reveal all bomb tiles
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.grid[i][j].bomb) {
                    this.grid[i][j].revealed = true;
                }
            }
        }
        // Update the rendered grid
        this.renderGrid();
        clearInterval(this.timerInterval); // stop the timer

    },
    showGameWonMessage: function() {
        // Set smiley to cool guy
        resetButton.src = 'photos/cool.gif';
        this.gameOver = true;
        clearInterval(this.timerInterval); // Stop the timer
        if(this.secondsElapsed < leaderboardThresholds[global_size]){ // If the score is worthy,
            this.enterScore(global_size, 1); // Write to the selected leaderboard and display it
        }
    },

    // Restart the game
    restart: function(size) {
        this.gameOver = false;
        this.init(size); // Reinitialize the game
        initialClick = 1;this.enterScore(global_size, 0);
        resetButton.src = 'photos/smiley.gif'
        this.secondsElapsed = 0; // Reset the secondsElapsed variable
        this.renderDigitDisplay('time', 0); // Reset the time display to 0
    },
    // If enterScore is passed with 0 that means read, fetch the leaderboard. Passed with 1 means write, update and fetch.
    enterScore: function(mapSize, readWrite) {
        if(!readWrite){ // Read fetch
            fetch(`https://zoomingguy.duckdns.org:7322/leaderboardMinesweeper?mapSize=${mapSize}`)
            .then(response => response.json())
            .then(updatedLeaderboard => {
                // Once the data is successfully updated on the server, display the updated leaderboard
                this.displayLeaderboard(mapSize, updatedLeaderboard);
            })
            .catch(error => {
                console.error('Error reading leaderboard:', error);
            });
        }
        if(readWrite){ // Write, update and fetch
            // Prompt user to enter name and score
            const playerName = prompt('Enter your name:');

            // Construct the data to send
            const newData = { name: playerName, score: this.secondsElapsed };

            // Send the data to the server-side endpoint to update the leaderboard
            fetch(`https://zoomingguy.duckdns.org:7322/updateLeaderboardMinesweeper?mapSize=${mapSize}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newData)
            })
            .then(response => {
                if (response.ok) {
                    // If the request is successful, fetch the updated leaderboard data
                    return fetch(`https://zoomingguy.duckdns.org:7322/leaderboardMinesweeper?mapSize=${mapSize}`);
                } else {
                    throw new Error('Failed to update leaderboard');
                }
            })
            .then(response => response.json())
            .then(updatedLeaderboard => {
                // Once the data is successfully updated on the server, display the updated leaderboard
                this.displayLeaderboard(mapSize, updatedLeaderboard);
            })
            .catch(error => {
                console.error('Error updating leaderboard:', error);
            });
        }
    },
    displayLeaderboard: function(mapSize, leaderboardData) {

        const maxLength = 20; // Maximum length of each line (including the number)

        const leaderboardDiv = document.getElementById(`leaderboard-${mapSize}`);
        leaderboardDiv.innerHTML = ''; // Clear existing content
        let leaderboardText = '';

        for (let i = 0; i < leaderboardData.length; i++) {
            const entry = leaderboardData[i];
            const num = (i + 1).toString().padStart(2, '\u00A0'); // Number padded with non breaking space
            const name = entry.name.padEnd(14, '.'); // Name with trailing dots, padded to 14 characters
            const score = entry.score.toString().padStart(3, '.'); // Score with leading spaces, padded to 8 characters
            if(i===(leaderboardData.length-1)){ // If its the worst score
                leaderboardThresholds[mapSize] = entry.score;
            }
            // Concatenate num, name, and score, and pad the resulting string to match maxLength
            leaderboardText += `${num}. ${name}${score}\n`.padEnd(maxLength, '.');
            //leaderboardText += `${entry.name.padEnd(20)} ${entry.score}\n`;
        }

        const leaderboardPre = document.createElement('pre');
        leaderboardPre.textContent = leaderboardText;
        leaderboardDiv.appendChild(leaderboardPre);
    }
};

// Initialize the Minesweeper game
Minesweeper.init('small');


// Function to handle size change
function changeMapSize(size) {
    Minesweeper.restart(size);
    global_size = size;
}
function restart(){
    Minesweeper.restart(global_size);
}
