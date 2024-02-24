const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

// Set the size of each block and the game board
const BLOCK_SIZE = 20;
const ROWS = 20;
const COLS = 10;

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
    drawMatrix(player.matrix, player.pos);
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

// Function to reset the player position and select a new random piece
function playerReset() {
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = Math.floor(COLS / 2) - Math.floor(player.matrix.length / 2);
    if (collide(board, player)) {
        // Game over
        resetGame();
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

// Function to start the game
function startGame() {
    resetGame();
    document.addEventListener('keydown', handleKeyPress);
    dropCounter = 0;
    dropInterval = 1000; // milliseconds
    lastTime = 0;
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
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        moveDown();
    }
    draw();
    requestAnimationFrame(update);
}

// Start the game
startGame();

