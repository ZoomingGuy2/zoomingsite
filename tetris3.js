
        const canvas = document.getElementById('tetris');
        const context = canvas.getContext('2d');

        const scale = 20;
        context.scale(scale, scale);

        function draw() {
            context.fillStyle = '#000';
            context.fillRect(0, 0, canvas.width, canvas.height);

            drawMatrix(player.matrix, player.pos);
        }

        function drawMatrix(matrix, offset) {
            matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        context.fillStyle = colors[value];
                        context.fillRect(x + offset.x,
                            y + offset.y,
                            1, 1);
                    }
                });
            });
        }

        const colors = [
            null,
            '#FF0D72',
            '#0DC2FF',
            '#0DFF72',
            '#F538FF',
            '#FF8E0D',
            '#FFE138',
            '#3877FF',
        ];

        const pieces = 'ILJOTSZ';
        const player = {
            pos: { x: 0, y: 0 },
            matrix: createPiece(pieces[pieces.length * Math.random() | 0])
        };

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

        draw();
