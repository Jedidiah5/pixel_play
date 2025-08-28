// Whack-a-Mole Game JavaScript
class WhackAMoleGame {
    constructor() {
        this.gameBoard = document.getElementById('gameBoard');
        this.scoreElement = document.getElementById('score');
        this.timeLeftElement = document.getElementById('timeLeft');
        this.overlay = document.getElementById('gameOverlay');
        this.overlayTitle = document.getElementById('overlayTitle');
        this.overlayMessage = document.getElementById('overlayMessage');
        this.startButton = document.getElementById('startButton');
        this.pauseButton = document.getElementById('pauseButton');
        this.restartButton = document.getElementById('restartButton');
        
        // Score elements
        this.highScoreElement = document.getElementById('highScore');
        this.gamesPlayedElement = document.getElementById('gamesPlayed');
        this.totalScoreElement = document.getElementById('totalScore');

        // Game state
        this.gameActive = false;
        this.gamePaused = false;
        this.score = 0;
        this.timeLeft = 30;
        this.gameTimer = null;
        this.moleTimer = null;
        this.currentMole = null;

        // Game settings
        this.gameDuration = 30; // seconds
        this.minMoleTime = 800; // milliseconds
        this.maxMoleTime = 2000; // milliseconds

        // Statistics (stored in localStorage)
        this.stats = this.loadStats();

        // Event listeners
        this.setupEventListeners();
        
        // Initial render
        this.updateDisplay();
        this.updateStatsDisplay();
    }

    setupEventListeners() {
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

        // Hole clicks
        this.gameBoard.addEventListener('click', (e) => {
            if (e.target.classList.contains('hole') || e.target.classList.contains('mole')) {
                this.handleHoleClick(e.target);
            }
        });
    }

    loadStats() {
        const saved = localStorage.getItem('whackAMoleStats');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            highScore: 0,
            gamesPlayed: 0,
            totalScore: 0
        };
    }

    saveStats() {
        localStorage.setItem('whackAMoleStats', JSON.stringify(this.stats));
    }

    startGame() {
        this.gameActive = true;
        this.gamePaused = false;
        this.score = 0;
        this.timeLeft = this.gameDuration;
        this.currentMole = null;
        
        this.overlay.style.display = 'none';
        this.updateDisplay();
        this.startGameTimer();
        this.spawnMole();
    }

    togglePause() {
        if (!this.gameActive) return;
        
        this.gamePaused = !this.gamePaused;
        this.pauseButton.textContent = this.gamePaused ? 'Resume' : 'Pause';
        
        if (this.gamePaused) {
            this.pauseGame();
        } else {
            this.resumeGame();
        }
    }

    pauseGame() {
        if (this.gameTimer) clearInterval(this.gameTimer);
        if (this.moleTimer) clearTimeout(this.moleTimer);
    }

    resumeGame() {
        this.startGameTimer();
        if (!this.currentMole) {
            this.spawnMole();
        }
    }

    restartGame() {
        this.endGame();
        this.startGame();
    }

    startGameTimer() {
        this.gameTimer = setInterval(() => {
            if (!this.gamePaused) {
                this.timeLeft--;
                this.updateDisplay();
                
                if (this.timeLeft <= 0) {
                    this.endGame();
                }
            }
        }, 1000);
    }

    spawnMole() {
        if (!this.gameActive || this.gamePaused) return;

        // Clear any existing mole
        this.clearCurrentMole();

        // Select a random hole
        const holes = this.gameBoard.children;
        const randomHole = holes[Math.floor(Math.random() * holes.length)];
        
        // Activate the mole
        randomHole.classList.add('active');
        this.currentMole = randomHole;

        // Set random duration for this mole
        const moleDuration = Math.random() * (this.maxMoleTime - this.minMoleTime) + this.minMoleTime;
        
        this.moleTimer = setTimeout(() => {
            this.clearCurrentMole();
            if (this.gameActive && !this.gamePaused) {
                this.spawnMole();
            }
        }, moleDuration);
    }

    clearCurrentMole() {
        if (this.currentMole) {
            this.currentMole.classList.remove('active');
            this.currentMole = null;
        }
        if (this.moleTimer) {
            clearTimeout(this.moleTimer);
            this.moleTimer = null;
        }
    }

    handleHoleClick(hole) {
        if (!this.gameActive || this.gamePaused) return;

        // Find the actual hole element
        const actualHole = hole.classList.contains('hole') ? hole : hole.parentElement;
        
        if (actualHole.classList.contains('active')) {
            // Whack the mole!
            this.whackMole(actualHole);
        }
    }

    whackMole(hole) {
        // Add whacked effect
        hole.classList.add('whacked');
        
        // Calculate score based on time left (faster = more points)
        const timeBonus = Math.floor(this.timeLeft / 5) + 1;
        const points = 10 + timeBonus;
        this.score += points;
        
        // Update display
        this.updateDisplay();
        
        // Clear the mole
        this.clearCurrentMole();
        
        // Remove whacked effect after a short delay
        setTimeout(() => {
            hole.classList.remove('whacked');
        }, 300);
        
        // Spawn a new mole after a short delay
        setTimeout(() => {
            if (this.gameActive && !this.gamePaused) {
                this.spawnMole();
            }
        }, 500);
    }

    endGame() {
        this.gameActive = false;
        this.gamePaused = false;
        
        // Clear timers
        if (this.gameTimer) clearInterval(this.gameTimer);
        if (this.moleTimer) clearTimeout(this.moleTimer);
        
        // Clear current mole
        this.clearCurrentMole();
        
        // Update statistics
        this.updateStats();
        
        // Show game over overlay
        this.overlayTitle.textContent = 'Game Over!';
        this.overlayMessage.textContent = `Final Score: ${this.score}`;
        this.overlay.style.display = 'flex';
        this.startButton.textContent = 'Play Again';
        
        // Update button state
        this.pauseButton.textContent = 'Pause';
    }

    updateStats() {
        this.stats.gamesPlayed++;
        this.stats.totalScore += this.score;
        
        if (this.score > this.stats.highScore) {
            this.stats.highScore = this.score;
        }
        
        this.saveStats();
        this.updateStatsDisplay();
    }

    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.timeLeftElement.textContent = this.timeLeft;
    }

    updateStatsDisplay() {
        this.highScoreElement.textContent = this.stats.highScore;
        this.gamesPlayedElement.textContent = this.stats.gamesPlayed;
        this.totalScoreElement.textContent = this.stats.totalScore;
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new WhackAMoleGame();
});
