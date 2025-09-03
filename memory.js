// Memory Match Game JavaScript
class MemoryGame {
    constructor() {
        this.gameBoard = document.getElementById('gameBoard');
        this.moveCountElement = document.getElementById('moveCount');
        this.timeElapsedElement = document.getElementById('timeElapsed');
        this.overlay = document.getElementById('gameOverlay');
        this.overlayTitle = document.getElementById('overlayTitle');
        this.overlayMessage = document.getElementById('overlayMessage');
        this.startButton = document.getElementById('startButton');
        this.restartButton = document.getElementById('restartButton');
        this.resetScoreButton = document.getElementById('resetScoreButton');
        this.difficultySelect = document.getElementById('difficulty');
        
        // Score elements
        this.bestTimeElement = document.getElementById('bestTime');
        this.bestMovesElement = document.getElementById('bestMoves');
        this.gamesWonElement = document.getElementById('gamesWon');

        // Game state
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moveCount = 0;
        this.gameActive = false;
        this.gameTimer = null;
        this.startTime = 0;
        this.elapsedTime = 0;

        // Card symbols for different difficulties
        this.allSymbols = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎵', '🎸', '🎺', '🎻', '🎼', '🎹', '🎤', '🎧', '🎨', '🎭', '🎪', '🎯'];
        this.cardSymbols = this.getSymbolsForDifficulty('medium');

        // Best scores (stored in localStorage)
        this.bestScores = this.loadBestScores();

        // Event listeners
        this.setupEventListeners();
        
        // Initial render
        this.renderBoard();
        this.updateScoreDisplay();
    }

    setupEventListeners() {
        // Button controls
        this.startButton.addEventListener('click', () => {
            this.startNewGame();
        });

        this.restartButton.addEventListener('click', () => {
            this.restartGame();
        });

        this.resetScoreButton.addEventListener('click', () => {
            this.resetBestScores();
        });

        this.difficultySelect.addEventListener('change', () => {
            this.changeDifficulty();
        });
    }

    getSymbolsForDifficulty(difficulty) {
        switch (difficulty) {
            case 'easy':
                return this.allSymbols.slice(0, 6); // 6 pairs = 12 cards (3x4 grid)
            case 'medium':
                return this.allSymbols.slice(0, 8); // 8 pairs = 16 cards (4x4 grid)
            case 'hard':
                return this.allSymbols.slice(0, 18); // 18 pairs = 36 cards (6x6 grid)
            default:
                return this.allSymbols.slice(0, 8);
        }
    }

    changeDifficulty() {
        if (this.gameActive) {
            if (confirm('Are you sure you want to change difficulty? This will restart the current game.')) {
                this.cardSymbols = this.getSymbolsForDifficulty(this.difficultySelect.value);
                this.renderBoard();
                this.startNewGame();
            } else {
                // Reset the select to previous value
                this.difficultySelect.value = this.getCurrentDifficulty();
            }
        } else {
            this.cardSymbols = this.getSymbolsForDifficulty(this.difficultySelect.value);
            this.renderBoard();
        }
    }

    getCurrentDifficulty() {
        const symbolCount = this.cardSymbols.length;
        if (symbolCount === 6) return 'easy';
        if (symbolCount === 8) return 'medium';
        if (symbolCount === 18) return 'hard';
        return 'medium';
    }

    loadBestScores() {
        const saved = localStorage.getItem('memoryGameBestScores');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            bestTime: null,
            bestMoves: null,
            gamesWon: 0
        };
    }

    saveBestScores() {
        localStorage.setItem('memoryGameBestScores', JSON.stringify(this.bestScores));
    }

    startNewGame() {
        this.gameActive = true;
        this.matchedPairs = 0;
        this.moveCount = 0;
        this.flippedCards = [];
        this.startTime = Date.now();
        this.elapsedTime = 0;
        
        this.updateDisplay();
        this.overlay.style.display = 'none';
        this.startTimer();
    }

    restartGame() {
        this.startNewGame();
    }

    resetBestScores() {
        this.bestScores = {
            bestTime: null,
            bestMoves: null,
            gamesWon: 0
        };
        this.saveBestScores();
        this.updateScoreDisplay();
    }

    startTimer() {
        this.gameTimer = setInterval(() => {
            this.elapsedTime = Date.now() - this.startTime;
            this.updateDisplay();
        }, 1000);
    }

    stopTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    updateDisplay() {
        this.moveCountElement.textContent = this.moveCount;
        this.timeElapsedElement.textContent = this.formatTime(this.elapsedTime);
    }

    createCard(symbol, index) {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.dataset.symbol = symbol;
        
        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';
        cardFront.textContent = symbol;
        
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        
        card.appendChild(cardFront);
        card.appendChild(cardBack);
        
        card.addEventListener('click', () => this.handleCardClick(card));
        
        return card;
    }

    handleCardClick(card) {
        if (!this.gameActive || card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }

        // Flip the card
        card.classList.add('flipped');
        this.flippedCards.push(card);

        // Check if we have two flipped cards
        if (this.flippedCards.length === 2) {
            this.moveCount++;
            this.updateDisplay();
            this.checkMatch();
        }
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const symbol1 = card1.dataset.symbol;
        const symbol2 = card2.dataset.symbol;

        // Add checking animation
        card1.classList.add('checking');
        card2.classList.add('checking');

        if (symbol1 === symbol2) {
            // Match found!
            setTimeout(() => {
                card1.classList.remove('checking');
                card2.classList.remove('checking');
                card1.classList.add('matched');
                card2.classList.add('matched');
                this.matchedPairs++;
                this.flippedCards = [];
                
                if (this.matchedPairs === this.cardSymbols.length) {
                    this.gameWon();
                }
            }, 500);
        } else {
            // No match, flip cards back
            setTimeout(() => {
                card1.classList.remove('checking');
                card2.classList.remove('checking');
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                this.flippedCards = [];
            }, 1000);
        }
    }

    gameWon() {
        this.gameActive = false;
        this.stopTimer();
        
        // Update best scores
        const gameTime = this.elapsedTime;
        const gameMoves = this.moveCount;
        
        if (!this.bestScores.bestTime || gameTime < this.bestScores.bestTime) {
            this.bestScores.bestTime = gameTime;
        }
        
        if (!this.bestScores.bestMoves || gameMoves < this.bestScores.bestMoves) {
            this.bestScores.bestMoves = gameMoves;
        }
        
        this.bestScores.gamesWon++;
        this.saveBestScores();
        this.updateScoreDisplay();
        
        // Show win overlay
        this.overlayTitle.textContent = 'Congratulations!';
        this.overlayMessage.textContent = `You won in ${this.formatTime(gameTime)} with ${gameMoves} moves!`;
        this.overlay.style.display = 'flex';
        this.startButton.textContent = 'Play Again';
    }

    renderBoard() {
        this.gameBoard.innerHTML = '';
        
        // Set the correct CSS class for the difficulty
        this.gameBoard.className = 'game-board ' + this.getCurrentDifficulty();
        
        // Create pairs of cards
        const allSymbols = [...this.cardSymbols, ...this.cardSymbols];
        
        // Shuffle the symbols
        for (let i = allSymbols.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allSymbols[i], allSymbols[j]] = [allSymbols[j], allSymbols[i]];
        }
        
        // Create and add cards to the board
        allSymbols.forEach((symbol, index) => {
            const card = this.createCard(symbol, index);
            this.gameBoard.appendChild(card);
        });
    }

    updateScoreDisplay() {
        this.bestTimeElement.textContent = this.bestScores.bestTime ? 
            this.formatTime(this.bestScores.bestTime) : '--:--';
        this.bestMovesElement.textContent = this.bestScores.bestMoves || '--';
        this.gamesWonElement.textContent = this.bestScores.gamesWon;
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});
