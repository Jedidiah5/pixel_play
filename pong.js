// Pong Game JavaScript
class PongGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.playerScoreElement = document.getElementById('playerScore');
        this.aiScoreElement = document.getElementById('aiScore');
        this.overlay = document.getElementById('gameOverlay');
        this.overlayTitle = document.getElementById('overlayTitle');
        this.overlayMessage = document.getElementById('overlayMessage');
        this.startButton = document.getElementById('startButton');
        this.pauseButton = document.getElementById('pauseButton');
        this.restartButton = document.getElementById('restartButton');

        // Game settings
        this.paddleHeight = 80;
        this.paddleWidth = 10;
        this.ballSize = 8;
        this.paddleSpeed = 5;
        this.ballSpeed = 4;

        // Game state
        this.gameRunning = false;
        this.gamePaused = false;
        this.playerScore = 0;
        this.aiScore = 0;
        this.gameWon = false;

        // Paddle positions
        this.playerPaddle = {
            x: 20,
            y: this.canvas.height / 2 - this.paddleHeight / 2
        };
        this.aiPaddle = {
            x: this.canvas.width - 30,
            y: this.canvas.height / 2 - this.paddleHeight / 2
        };

        // Ball properties
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            dx: this.ballSpeed,
            dy: this.ballSpeed
        };

        // Input handling
        this.keys = {
            up: false,
            down: false
        };

        // Event listeners
        this.setupEventListeners();
        
        // Initial render
        this.render();
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });

        document.addEventListener('keyup', (e) => {
            this.handleKeyUp(e);
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

    handleKeyDown(e) {
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
                this.keys.up = true;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                this.keys.down = true;
                break;
        }
    }

    handleKeyUp(e) {
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                this.keys.up = false;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                this.keys.down = false;
                break;
        }
    }

    startGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameWon = false;
        this.overlay.style.display = 'none';
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
        this.gameWon = false;
        this.playerScore = 0;
        this.aiScore = 0;
        this.resetBall();
        this.resetPaddles();
        this.updateScoreDisplay();
        this.pauseButton.textContent = 'Pause';
        this.overlay.style.display = 'flex';
        this.overlayTitle.textContent = 'Pong';
        this.overlayMessage.textContent = 'Press any key to start';
        this.render();
    }

    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.dx = this.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
        this.ball.dy = this.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
    }

    resetPaddles() {
        this.playerPaddle.y = this.canvas.height / 2 - this.paddleHeight / 2;
        this.aiPaddle.y = this.canvas.height / 2 - this.paddleHeight / 2;
    }

    updateScoreDisplay() {
        this.playerScoreElement.textContent = this.playerScore;
        this.aiScoreElement.textContent = this.aiScore;
    }

    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;

            this.update();
            this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        this.updatePaddles();
        this.updateBall();
        this.updateAI();
        this.checkCollisions();
        this.checkScoring();
    }

    updatePaddles() {
        // Player paddle movement
        if (this.keys.up && this.playerPaddle.y > 0) {
            this.playerPaddle.y -= this.paddleSpeed;
        }
        if (this.keys.down && this.playerPaddle.y < this.canvas.height - this.paddleHeight) {
            this.playerPaddle.y += this.paddleSpeed;
        }
    }

    updateAI() {
        // Simple AI - follow the ball
        const aiCenter = this.aiPaddle.y + this.paddleHeight / 2;
        const ballCenter = this.ball.y;
        
        if (aiCenter < ballCenter - 10 && this.aiPaddle.y < this.canvas.height - this.paddleHeight) {
            this.aiPaddle.y += this.paddleSpeed * 0.8; // Slightly slower than player
        } else if (aiCenter > ballCenter + 10 && this.aiPaddle.y > 0) {
            this.aiPaddle.y -= this.paddleSpeed * 0.8;
        }
    }

    updateBall() {
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
    }

    checkCollisions() {
        // Wall collisions (top and bottom)
        if (this.ball.y <= 0 || this.ball.y >= this.canvas.height - this.ballSize) {
            this.ball.dy = -this.ball.dy;
        }

        // Paddle collisions
        this.checkPaddleCollision(this.playerPaddle, true);
        this.checkPaddleCollision(this.aiPaddle, false);
    }

    checkPaddleCollision(paddle, isPlayer) {
        const paddleLeft = paddle.x;
        const paddleRight = paddle.x + this.paddleWidth;
        const paddleTop = paddle.y;
        const paddleBottom = paddle.y + this.paddleHeight;

        if (this.ball.x < paddleRight && 
            this.ball.x + this.ballSize > paddleLeft &&
            this.ball.y < paddleBottom && 
            this.ball.y + this.ballSize > paddleTop) {
            
            // Reverse ball direction
            this.ball.dx = -this.ball.dx;
            
            // Add some randomness to the bounce
            const hitPosition = (this.ball.y - paddleTop) / this.paddleHeight;
            this.ball.dy = (hitPosition - 0.5) * this.ballSpeed * 2;
            
            // Increase speed slightly
            this.ball.dx *= 1.05;
            this.ball.dy *= 1.05;
        }
    }

    checkScoring() {
        // Ball goes off left side (AI scores)
        if (this.ball.x <= 0) {
            this.aiScore++;
            this.updateScoreDisplay();
            this.resetBall();
            this.checkGameEnd();
        }
        // Ball goes off right side (Player scores)
        else if (this.ball.x >= this.canvas.width) {
            this.playerScore++;
            this.updateScoreDisplay();
            this.resetBall();
            this.checkGameEnd();
        }
    }

    checkGameEnd() {
        if (this.playerScore >= 11 || this.aiScore >= 11) {
            this.gameWon = true;
            this.gameRunning = false;
            this.overlay.style.display = 'flex';
            
            if (this.playerScore >= 11) {
                this.overlayTitle.textContent = 'You Win!';
                this.overlayMessage.textContent = `Final Score: ${this.playerScore} - ${this.aiScore}`;
            } else {
                this.overlayTitle.textContent = 'AI Wins!';
                this.overlayMessage.textContent = `Final Score: ${this.playerScore} - ${this.aiScore}`;
            }
            
            this.startButton.textContent = 'Play Again';
        }
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0f0f0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw center line
        this.ctx.strokeStyle = '#363636';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Draw paddles
        this.ctx.fillStyle = '#4ade80';
        this.ctx.fillRect(
            this.playerPaddle.x,
            this.playerPaddle.y,
            this.paddleWidth,
            this.paddleHeight
        );

        this.ctx.fillStyle = '#ef4444';
        this.ctx.fillRect(
            this.aiPaddle.x,
            this.aiPaddle.y,
            this.paddleWidth,
            this.paddleHeight
        );

        // Draw ball
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(
            this.ball.x,
            this.ball.y,
            this.ballSize,
            this.ballSize
        );

        // Draw scores on canvas
        this.ctx.fillStyle = '#4ade80';
        this.ctx.font = '32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.playerScore, this.canvas.width / 4, 50);
        
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fillText(this.aiScore, 3 * this.canvas.width / 4, 50);
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new PongGame();
});
