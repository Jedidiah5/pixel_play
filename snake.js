// Snake Game JavaScript
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.overlay = document.getElementById('gameOverlay');
        this.overlayTitle = document.getElementById('overlayTitle');
        this.overlayMessage = document.getElementById('overlayMessage');
        this.startButton = document.getElementById('startButton');
        this.pauseButton = document.getElementById('pauseButton');
        this.restartButton = document.getElementById('restartButton');

        // Ensure canvas is properly sized
        if (!this.canvas || !this.ctx) {
            console.error('Canvas or context not found!');
            return;
        }

        // Game settings
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        this.speed = 150;

        // Game state
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;

        // Snake properties
        this.snake = [
            { x: 10, y: 10 }
        ];
        this.dx = 0;
        this.dy = 0;
        this.nextDx = 0;
        this.nextDy = 0;

        // Food properties
        this.food = this.generateFood();

        // Event listeners
        this.setupEventListeners();
        
        // Initial render
        this.render();
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });

        // Button controls
        this.startButton.addEventListener('click', () => {
            this.startGame();
        });

        this.pauseButton.addEventListener('click', () => {
            this.togglePause();
        });

        this.restartButton.addEventListener('click', () => {
            this.restartGame();
        });
    }

    handleKeyPress(e) {
        if (!this.gameRunning) {
            this.startGame();
            return;
        }

        if (e.key === ' ') {
            e.preventDefault();
            this.togglePause();
            return;
        }

        if (this.gamePaused) return;

        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (this.dy !== 1) {
                    this.nextDx = 0;
                    this.nextDy = -1;
                }
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (this.dy !== -1) {
                    this.nextDx = 0;
                    this.nextDy = 1;
                }
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (this.dx !== 1) {
                    this.nextDx = -1;
                    this.nextDy = 0;
                }
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (this.dx !== -1) {
                    this.nextDx = 1;
                    this.nextDy = 0;
                }
                break;
        }
    }

    startGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.overlay.style.display = 'none';
        console.log('Game started!');
        this.gameLoop();
    }

    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        this.pauseButton.textContent = this.gamePaused ? 'Resume' : 'Pause';
        
        if (!this.gamePaused) {
            this.gameLoop();
        }
    }

    restartGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.snake = [{ x: 10, y: 10 }];
        this.dx = 0;
        this.dy = 0;
        this.nextDx = 0;
        this.nextDy = 0;
        this.food = this.generateFood();
        this.scoreElement.textContent = this.score;
        this.pauseButton.textContent = 'Pause';
        this.overlay.style.display = 'flex';
        this.overlayTitle.textContent = 'Snake Game';
        this.overlayMessage.textContent = 'Press any key to start';
        this.render();
    }

    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;

        setTimeout(() => {
            this.update();
            this.render();
            this.gameLoop();
        }, this.speed);
    }

    update() {
        // Update direction
        this.dx = this.nextDx;
        this.dy = this.nextDy;

        // Move snake
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };

        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }

        // Check self collision
        for (let i = 0; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.gameOver();
                return;
            }
        }

        // Add new head
        this.snake.unshift(head);

        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.scoreElement.textContent = this.score;
            this.food = this.generateFood();
            
            // Increase speed every 50 points
            if (this.score % 50 === 0) {
                this.speed = Math.max(50, this.speed - 10);
            }
        } else {
            // Remove tail if no food eaten
            this.snake.pop();
        }
    }

    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        
        return food;
    }

    gameOver() {
        this.gameRunning = false;
        this.overlay.style.display = 'flex';
        this.overlayTitle.textContent = 'Game Over!';
        this.overlayMessage.textContent = `Final Score: ${this.score}`;
        this.startButton.textContent = 'Play Again';
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0f0f0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.ctx.fillStyle = '#4ade80';
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Head
                this.ctx.fillStyle = '#22c55e';
            } else {
                // Body
                this.ctx.fillStyle = '#4ade80';
            }
            
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });

        // Draw food
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fillRect(
            this.food.x * this.gridSize + 2,
            this.food.y * this.gridSize + 2,
            this.gridSize - 4,
            this.gridSize - 4
        );

        // Draw grid (optional, for visual appeal)
        this.ctx.strokeStyle = '#1f1f1f';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});
