// Define the Minesweeper game object
const Minesweeper = {
    rows: 10,
    cols: 10,
    bombs: 20,
    grid: [],
    gameOver: false,
    debugMode: false, // Add a debug mode flag

    // Initialize the game
    init: function() {
        this.createGrid();
        this.placeBombs();
        this.calculateAdjacentBombs();
        if (this.debugMode) {
            this.revealAll(); // Reveal all cells in debug mode
        }
        this.renderGrid();
    },
    // Create the grid
    createGrid: function() {
        for (let i = 0; i < this.rows; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.cols; j++) {
                this.grid[i][j] = {
                    bomb: false,
                    revealed: false,
                    flagged: false,
                    value: 0 // Number of adjacent bombs
                };
            }
        }
    },
    // Place bombs randomly on the grid
    placeBombs: function() {
        let bombsPlaced = 0;
        while (bombsPlaced < this.bombs) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            if (!this.grid[row][col].bomb) {
                this.grid[row][col].bomb = true;
                bombsPlaced++;
            }
        }
    },
   // Calculate the number of adjacent bombs for each tile
    calculateAdjacentBombs: function() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (!this.grid[i][j].bomb) {
                    let count = 0;
                    for (let di = -1; di <= 1; di++) {
                        for (let dj = -1; dj <= 1; dj++) {
                            const ni = i + di;
                            const nj = j + dj;
                            if (ni >= 0 && ni < this.rows && nj >= 0 && nj < this.cols && !(di === 0 && dj === 0) && this.grid[ni][nj].bomb) {
                                count++;
                            }
                        }
                    }
                    this.grid[i][j].value = count;
                }
            }
        }
    },
    // Render the grid on the page
    renderGrid: function() {
        const container = document.getElementById('minesweeper');
        container.innerHTML = ''; // Clear the container before rendering

        // Add top border
        const topBorder = document.createElement('div');
        topBorder.classList.add('border');
        for (let j = 0; j < this.cols + 2; j++) {
            const borderTile = document.createElement('div');
            borderTile.classList.add('tile');
            if (j === 0) {
                borderTile.style.backgroundImage = "url('photos/top-left-corner.gif')";
            } else if (j === this.cols + 1) {
                borderTile.style.backgroundImage = "url('photos/top-right-corner.gif')";
            } else {
                borderTile.style.backgroundImage = "url('photos/side-bar.gif')";
            }
            topBorder.appendChild(borderTile);
        }
        container.appendChild(topBorder);

        for (let i = 0; i < this.rows; i++) {
            const rowContainer = document.createElement('div');
            rowContainer.classList.add('row-container');

            // Add left border
            const leftBorder = document.createElement('div');
            leftBorder.classList.add('tile');
            leftBorder.style.backgroundImage = "url('photos/up-bar.gif')"; // Using up-bar for left border
            rowContainer.appendChild(leftBorder);

            for (let j = 0; j < this.cols; j++) {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                if (this.grid[i][j].revealed) {
                    if (this.grid[i][j].bomb) {
                        tile.style.backgroundImage = "url('photos/bomb.gif')"; //bomb
                    } else {
                        const value = this.grid[i][j].value;
                        tile.style.backgroundImage = `url('photos/${value}.gif')`; // Assuming you have images named '1.gif' etc
                    }
                    tile.classList.add('revealed'); // Add revealed class to revealed tiles
                } else if (this.grid[i][j].flagged) {
                    const flagImage = document.createElement('img');
                    flagImage.src = "photos/flag.gif"; //flag
                    tile.appendChild(flagImage);
                    tile.classList.add('flagged'); // Add flagged class to flagged tiles
                } else {
                    tile.style.backgroundImage = "url('photos/unrevealed.gif')"; //unrevealed tile
                }
                // Add event listeners for clicking and right-clicking
                tile.addEventListener('click', () => this.reveal(i, j));
                tile.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.toggleFlag(i, j);
                });
                rowContainer.appendChild(tile);
            }

            // Add right border
            const rightBorder = document.createElement('div');
            rightBorder.classList.add('tile');
            rightBorder.style.backgroundImage = "url('photos/up-bar.gif')"; // Using up-bar for right border
            rowContainer.appendChild(rightBorder);

            container.appendChild(rowContainer);
        }

        // Add bottom border
        const bottomBorder = document.createElement('div');
        bottomBorder.classList.add('border');
        for (let j = 0; j < this.cols + 2; j++) {
            const borderTile = document.createElement('div');
            borderTile.classList.add('tile');
            if (j === 0) {
                borderTile.style.backgroundImage = "url('photos/bottom-left-corner.gif')"; //bottom left corner
            }
            if (j === this.cols + 1) {
                borderTile.style.backgroundImage = "url('photos/bottom-right-corner')"; //bottom right corner
            }
            else {
                borderTile.style.backgroundImage = "url('photos/side-bar.gif')"; //side bar of bototm border
            }
            bottomBorder.appendChild(borderTile);
        }
        container.appendChild(bottomBorder);
    },

    // Reveal a tile
    reveal: function(row, col) {
        if (this.gameOver || this.grid[row][col].revealed || this.grid[row][col].flagged) {
            return; // If game is over or tile is already revealed or flagged, do nothing
        }
        this.grid[row][col].revealed = true;
        if (this.grid[row][col].bomb) {
            this.gameOver = true;
            this.showGameOverMessage(); // Show custom game over message
        } else if (this.grid[row][col].value === 0) {
            // Reveal adjacent tiles if the current tile has no adjacent bombs
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    const ni = row + di;
                    const nj = col + dj;
                    if (ni >= 0 && ni < this.rows && nj >= 0 && nj < this.cols) {
                        this.reveal(ni, nj); // Recursively reveal adjacent tiles
                    }
                }
            }
        }
        // Update the rendered grid
        this.renderGrid();
    },
    // Toggle a flag on a tile
    toggleFlag: function(row, col) {
        if (this.gameOver || this.grid[row][col].revealed) {
            return; // If game is over or tile is already revealed, do not allow flagging
        }
        this.grid[row][col].flagged = !this.grid[row][col].flagged;
        // Update the rendered grid
        this.renderGrid();
    },
 // Show game over message
    showGameOverMessage: function() {
        const modal = document.createElement('div');
        modal.classList.add('modal');
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Restart';
        restartButton.addEventListener('click', () => {
            document.body.removeChild(modal);
            this.restart();
        });
        modal.innerHTML = `
            <div class="modal-content">
                Game Over! You clicked on a bomb.
                <br>
            </div>`;
        modal.appendChild(restartButton);
        document.body.appendChild(modal);
    },
     // Reveal all cells
    revealAll: function() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.grid[i][j].revealed = true;
            }
        }
    },
    // Restart the game
    restart: function() {
        this.gameOver = false;
        this.init(); // Reinitialize the game
    }
};

// Initialize the Minesweeper game
Minesweeper.init();
