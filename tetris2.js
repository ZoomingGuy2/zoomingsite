const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

// Set the size of each block and the game board
const BLOCK_SIZE = 20;
const ROWS = 20;
const COLS = 12;

// Function for stopping loop
let gameRunning = false;

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
            if (value !== 0) {
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
    }
    dropCounter = 0;
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
    player.matrix = rotatedPiece;
    if (collide(board, player)) {
        // Revert rotation if it causes a collision
        player.matrix = originalPiece;
    }
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
        context.font = '30px Arial';
        context.fillText('Game Over', canvas.width / 2 - 80, canvas.height / 2 - 30);

        // Draw buttons
        context.fillStyle = '#ff0000';
        context.fillRect(canvas.width / 2 - 60, canvas.height / 2 + 20, 120, 40);
        context.fillRect(canvas.width / 2 - 60, canvas.height / 2 + 80, 120, 40);

        // Draw button text
        context.fillStyle = '#fff';
        context.font = '20px Arial';
        context.fillText('Restart', canvas.width / 2 - 35, canvas.height / 2 + 45);
        context.fillText('Enter Score', canvas.width / 2 - 50, canvas.height / 2 + 105);

        // Create a Promise that resolves when a button is clicked
        return new Promise(resolve => {
            // Function to handle the click event
            function handleClick(event) {
                const rect = canvas.getBoundingClientRect();
                const mouseX = event.clientX - rect.left;
                const mouseY = event.clientY - rect.top;

                // Check if Restart button is clicked
                if (mouseX >= canvas.width / 2 - 60 && mouseX <= canvas.width / 2 + 60 &&
                    mouseY >= canvas.height / 2 + 20 && mouseY <= canvas.height / 2 + 60) {
                    // Reset the flag
                    isGameOverScreenDisplayed = false;

                    // Remove the event listener
                    document.removeEventListener('click', handleClick);

                    // Resolve the promise with 'restart'
                    resolve('restart');
                }

                // Check if Enter Score button is clicked
                if (mouseX >= canvas.width / 2 - 60 && mouseX <= canvas.width / 2 + 60 &&
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
    const playerScore = 1;

    // Construct the data to send
    const newData = { name: playerName, score: playerScore };

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
    context.font = '30px Arial';
    context.fillText('Leaderboard', canvas.width / 2 - 80, 50);
}

// Function to draw leaderboard entries
function drawLeaderboardEntries(leaderboardData) {
    context.font = '20px Arial';
    leaderboardData.forEach((entry, index) => {
        const y = 100 + index * 30;
        context.fillText(`${entry.name}: ${entry.score}`, canvas.width / 2 - 80, y);
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
    context.font = '20px Arial';
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

// Function to clear completed lines
function clearLines() {
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
    }
}

function stopGame(){
	gameRunning = false;
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
}

// Function to update the game state
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
	if(gameRunning){
	    dropCounter += deltaTime;
	    if (dropCounter > dropInterval) {
		moveDown();
	    }
	    draw();
	    requestAnimationFrame(update);
	}
}


// Start the game
startGame();

