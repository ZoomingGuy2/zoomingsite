const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

// Set the size of each block and the game board
const BLOCK_SIZE = 40;
const ROWS = 20;
const COLS = 12;

// Function for stopping loop
let gameRunning = false;
// variable for pausing
let isPaused = false;

//score variable
let score = 0;
let scoreMultiplier = 1.0;

// Define variables for controlling game speed
let initialDropInterval = 1000; // Initial drop interval in milliseconds
let dropInterval = initialDropInterval; // Current drop interval
let speedScale = 0.99 ; // Amount to scale the drop interval by

// Function to display the score
function drawScore() {
    const scoreDisplay = document.getElementById('score');
    scoreDisplay.textContent = score;
}

// Function to update the score
function updateScore(linesCleared) {
    // Update score based on the number of lines cleared
    if (linesCleared === 1) {
        score += 20*scoreMultiplier; // Adjust score based on your scoring mechanism
    } else if (linesCleared === 2) {
        score += 80*scoreMultiplier; // Adjust score based on your scoring mechanism
    } else if (linesCleared === 3) {
        score += 320*scoreMultiplier; // Adjust score based on your scoring mechanism
    } else if (linesCleared === 4) {
        score += 1280*scoreMultiplier; // Adjust score based on your scoring mechanism
    }
    score = Math.round(score);
}

// Initialize the game board
const board = [];
for (let row = 0; row < ROWS; row++) {
    board[row] = [];
    for (let col = 0; col < COLS; col++) {
        board[row][col] = 0;
    }
}

// Function to create a Tetris piece
function createPiece(type) {
    if (type === 'T') {
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ];
    } else if (type === 'O') {
        return [
            [2, 2],
            [2, 2],
        ];
    } else if (type === 'L') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
        ];
    } else if (type === 'J') {
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0],
        ];
    } else if (type === 'I') {
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'Z') {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ];
    }
}

// Function to draw the current game state
function draw() {
    // Clear the canvas
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the game board
    drawMatrix(board, { x: 0, y: 0 });

    // Draw the current Tetris piece
    drawMatrix(player.matrix, {x: player.pos.x*BLOCK_SIZE, y: player.pos.y*BLOCK_SIZE});
}

// Function to draw a matrix (Tetris piece or game board) onto the canvas
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x*BLOCK_SIZE + offset.x, y*BLOCK_SIZE + offset.y, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
}

// Function to merge the current piece into the game board
function merge() {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0 && board[y + player.pos.y]) {
                board[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}


// Function to move the current Tetris piece left
function moveLeft() {
    player.pos.x--;
    if (collide(board, player)) {
        player.pos.x++;
    }
}

// Function to move the current Tetris piece right
function moveRight() {
    player.pos.x++;
    if (collide(board, player)) {
        player.pos.x--;
    }
}

// Function to move the current Tetris piece down
function moveDown() {
    player.pos.y++;
    if (collide(board, player)) {
        player.pos.y--;
        merge();
        playerReset();
        clearLines();
        updateSpeed(); // Update game speed after each dropped block
    }
    dropCounter = 0;
}

// Function to drop the current Tetris piece to the bottom
function drop() {
    while (!collide(board, player)) {
        player.pos.y++;
    }
    player.pos.y--;
    merge();
    playerReset();
    clearLines();
    updateSpeed(); // Update game speed after each dropped block
    dropCounter = 0;
}

// Function to update game speed
function updateSpeed() {
    if (dropInterval > 100) { // Limit the maximum speed increase
        dropInterval = Math.round(dropInterval*speedScale); // Decrease drop interval
        scoreMultiplier = initialDropInterval/dropInterval;
    }
}

// Function to rotate the current Tetris piece clockwise
function rotate() {
    const rotatedPiece = [];
    for (let y = 0; y < player.matrix.length; y++) {
        rotatedPiece[y] = [];
        for (let x = 0; x < player.matrix.length; x++) {
            rotatedPiece[y][x] = player.matrix[player.matrix.length - 1 - x][y];
        }
    }

    // Check if the rotated piece will collide with the edges of the board or other blocks
    const offsetX = player.pos.x;
    const offsetY = player.pos.y;
    for (let y = 0; y < rotatedPiece.length; y++) {
        for (let x = 0; x < rotatedPiece[y].length; x++) {
            if (rotatedPiece[y][x] !== 0 &&
                (board[y + offsetY] === undefined || board[y + offsetY][x + offsetX] === undefined || board[y + offsetY][x + offsetX] !== 0)) {
                // If the rotated piece will collide, exit the function without applying the rotation
                return;
            }
        }
    }

    // If no collision is detected, apply the rotation
    player.matrix = rotatedPiece;
}


// Flag to track if the game over screen is currently displayed
let isGameOverScreenDisplayed = false;
// Function to draw game over screen
function gameOverScreen() {
    if (!isGameOverScreenDisplayed) {
        // Set the flag to indicate that the game over screen is displayed
        isGameOverScreenDisplayed = true;

        stopGame();
        // Draw overlay
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Draw game over message
        context.fillStyle = '#fff';
        context.font = '30px "Andale Mono", monospace';
        context.fillText('Game Over', canvas.width / 2 - 80, canvas.height / 2 - 30);

        // Draw buttons
        context.fillStyle = '#ff0000';
        context.fillRect(canvas.width / 2 - 80, canvas.height / 2 + 20, 160, 40);
        context.fillRect(canvas.width / 2 - 80, canvas.height / 2 + 80, 160, 40);

        // Draw button text
        context.fillStyle = '#fff';
        context.font = '20px "Andale Mono", monospace';
        context.fillText('Restart', canvas.width / 2 - 40, canvas.height / 2 + 45);
        context.fillText('Enter Score', canvas.width / 2 - 65, canvas.height / 2 + 105);

        // Create a Promise that resolves when a button is clicked
        return new Promise(resolve => {
            // Function to handle the click event
            function handleClick(event) {
                const rect = canvas.getBoundingClientRect();
                const mouseX = event.clientX - rect.left;
                const mouseY = event.clientY - rect.top;

                // Check if Restart button is clicked
                if (mouseX >= canvas.width / 2 - 80 && mouseX <= canvas.width / 2 + 80 &&
                    mouseY >= canvas.height / 2 + 20 && mouseY <= canvas.height / 2 + 60) {
                    // Reset the flag
                    isGameOverScreenDisplayed = false;

                    // Remove the event listener
                    document.removeEventListener('click', handleClick);

                    // Resolve the promise with 'restart'
                    resolve('restart');
                }

                // Check if Enter Score button is clicked
                if (mouseX >= canvas.width / 2 - 80 && mouseX <= canvas.width / 2 + 80 &&
                    mouseY >= canvas.height / 2 + 80 && mouseY <= canvas.height / 2 + 120) {
                    // Reset the flag
                    isGameOverScreenDisplayed = false;

                    // Remove the event listener
                    document.removeEventListener('click', handleClick);

                    // Resolve the promise with 'enterScore'
                    resolve('enterScore');
                }
            }

            // Add event listener to the document
            document.addEventListener('click', handleClick);
        }).then(result => {
            if (result === 'restart') {
                startGame();
            } else if (result === 'enterScore') {
                enterScore();
            }
        });
    }
}



function enterScore() {
    // Prompt user to enter name and score
    const playerName = prompt('Enter your name:');

    // Construct the data to send
    const newData = { name: playerName, score: score };

    // Send the data to the server-side endpoint to update the leaderboard
    fetch('http://zoomingguy.duckdns.org:7322/updateLeaderboard', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newData)
    })
    .then(response => {
        if (response.ok) {
            // If the request is successful, fetch the updated leaderboard data
            return fetch('http://zoomingguy.duckdns.org:7322/leaderboard');
        } else {
            throw new Error('Failed to update leaderboard');
        }
    })
    .then(response => response.json())
    .then(updatedLeaderboard => {
        // Once the data is successfully updated on the server, display the updated leaderboard
        displayLeaderboard(updatedLeaderboard);
    })
    .catch(error => {
        console.error('Error updating leaderboard:', error);
    });
}



// Function to display leaderboard
function displayLeaderboard(leaderboardData) {
    clearCanvas();
    drawLeaderboardTitle();
    drawLeaderboardEntries(leaderboardData);
    drawRestartButton();
}

// Function to clear the canvas
function clearCanvas() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
}

// Function to draw leaderboard title
function drawLeaderboardTitle() {
    context.fillStyle = '#fff';
    context.font = 'bold 30px "Andale Mono", monospace';
    context.fillText('LEADERBOARD', canvas.width / 2 - 100, 50);
}

function drawLeaderboardEntries(leaderboardData) {
    const maxLength = 20; // Maximum length of each line (including the number)
    context.font = 'bold 25px "Andale Mono", monospace'; // Using Courier New as a monospaced font
    leaderboardData.forEach((entry, index) => {
        const num = (index + 1).toString().padStart(3, ' '); // Number with leading space
        const name = entry.name.padEnd(5, '.'); // Name with trailing dots, adjusted for 10 characters
        const score = entry.score.toString().padStart(8, '.'); // Score with leading spaces

        // Concatenate num, name, and score, and pad the resulting string to match maxLength
        const line = `${num}. ${name}${score}`.padEnd(maxLength, '.');

        // Calculate y position based on index
        const y = 100 + index * 40;

        // Draw the line
        context.fillText(line, 50, y);
    });
}




// Function to draw restart button
function drawRestartButton() {
    const buttonX = canvas.width / 2 - 60;
    const buttonY = canvas.height - 80;
    const buttonWidth = 120;
    const buttonHeight = 40;

    context.fillStyle = '#ff0000';
    context.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    context.fillStyle = '#fff';
    context.font = '20px "Andale Mono"';
    context.fillText('Restart', buttonX + 25, buttonY + 25);

    canvas.addEventListener('click', handleRestartClick);
}

// Function to handle click on restart button
function handleRestartClick(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const buttonX = canvas.width / 2 - 60;
    const buttonY = canvas.height - 80;
    const buttonWidth = 120;
    const buttonHeight = 40;

    if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth &&
        mouseY >= buttonY && mouseY <= buttonY + buttonHeight) {
        canvas.removeEventListener('click', handleRestartClick);
        startGame();
    }
}


// Function to reset the player position and select a new random piece
function playerReset() {
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = Math.floor(COLS / 2) - Math.floor(player.matrix.length / 2);
    if (collide(board, player)) {
        // Game over
	console.log('Game over condition reached.');
	gameOverScreen();
    }
}

// Function to handle clearing lines
function clearLines() {
    let linesCleared = 0;
    outer: for (let y = board.length - 1; y >= 0; y--) {
        for (let x = 0; x < board[y].length; x++) {
            if (board[y][x] === 0) {
                continue outer;
            }
        }
        // Remove the completed line and shift all lines above it down
        const removedRow = board.splice(y, 1)[0].fill(0);
        board.unshift(removedRow);
        y++;
        linesCleared++;
    }
    if (linesCleared > 0) {
        updateScore(linesCleared);
    }
}

// Function to check for collisions between the current piece and the game board
function collide(board, player) {
    const matrix = player.matrix;
    const pos = player.pos;
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < matrix[y].length; ++x) {
            if (matrix[y][x] !== 0 &&
                (board[y + pos.y] && board[y + pos.y][x + pos.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

// Object representing the current player
const player = {
    pos: { x: 0, y: 0 },
    matrix: createPiece('T'), // Initial piece
};

// Array of colors corresponding to each Tetris piece type
const colors = [
    null,          // Empty cell
    '#FF0D72',     // T
    '#0DC2FF',     // O
    '#0DFF72',     // L
    '#F538FF',     // J
    '#FF8E0D',     // I
    '#FFE138',     // S
    '#3877FF',     // Z
];

// Function to handle keyboard input
function handleKeyPress(event) {
    if (event.keyCode === 37) { // Left arrow
        moveLeft();
    } else if (event.keyCode === 39) { // Right arrow
        moveRight();
    } else if (event.keyCode === 40) { // Down arrow
        moveDown();
    } else if (event.keyCode === 38) { // Up arrow (rotate)
        rotate();
    } else if (event.keyCode === 32) { // Spacebar
        drop();
    } else if (event.keyCode === 80) { // "P" key
        togglePause();
    }
}

// Function to toggle the game pause state
function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        stopGame(); // Stop the game loop or any ongoing actions
        drawPauseScreen(); // Draw the pause screen
    } else {
        resumeGame(); // Resume the game loop or actions
        clearPauseScreen(); // Clear the pause screen
        requestAnimationFrame(update); // Continue the game loop
    }
}


// Function to draw the pause screen
function drawPauseScreen() {
    // Draw overlay to gray out the background
    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw "Paused" text
    context.fillStyle = '#fff';
    context.font = '30px "Andale Mono", monospace';
    context.fillText('Paused', canvas.width / 2 - 50, canvas.height / 2);
}

// Function to clear the pause screen
function clearPauseScreen() {
    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
}

// Function to handle game over
function handleGameOver() {
    // Display game over screen
    gameOverScreen().then(result => {
        if (result === 'restart') {
            resetGame();
            score = 0;
            startGame();
        } else if (result === 'enterScore') {
            enterScore();
        }
    });
}

// Function to check if game over condition is reached
function checkGameOver() {
    if (collide(board, player)) {
        handleGameOver();
    }
}

function stopGame(){
	gameRunning = false;
}

// Function to resume the game loop and actions
function resumeGame() {
    gameRunning = true;
}


// Function to start the game
function startGame() {
    resetGame();
    document.addEventListener('keydown', handleKeyPress);
    dropCounter = 0;
    dropInterval = 1000; // milliseconds
    lastTime = 0;
    gameRunning = true;
    requestAnimationFrame(update);
}

// Function to reset the game
function resetGame() {
    // Clear the game board
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            board[row][col] = 0;
        }
    }
    score = 0;
}

// Function to update the game state
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    if (gameRunning) {
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            moveDown();
        }
        checkGameOver(); // Check for game over condition
        draw(); // Draw game state
        drawScore(); // Draw score
        requestAnimationFrame(update);
    }
}



// Start the game
startGame();

