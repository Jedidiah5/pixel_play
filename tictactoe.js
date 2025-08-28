// Tic Tac Toe Game JavaScript
class TicTacToeGame {
    constructor() {
        this.gameBoard = document.getElementById('gameBoard');
        this.gameStatus = document.getElementById('gameStatus');
        this.overlay = document.getElementById('gameOverlay');
        this.overlayTitle = document.getElementById('overlayTitle');
        this.overlayMessage = document.getElementById('overlayMessage');
        this.startButton = document.getElementById('startButton');
        this.restartButton = document.getElementById('restartButton');
        this.resetScoreButton = document.getElementById('resetScoreButton');
        
        // Score elements
        this.playerXScoreElement = document.getElementById('playerXScore');
        this.playerOScoreElement = document.getElementById('playerOScore');
        this.drawScoreElement = document.getElementById('drawScore');

        // Game state
        this.currentPlayer = 'X';
        this.gameActive = false;
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.scores = {
            X: 0,
            O: 0,
            draw: 0
        };

        // Winning combinations
        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];

        // Event listeners
        this.setupEventListeners();
        
        // Initial render
        this.renderBoard();
        this.updateScoreDisplay();
    }

    setupEventListeners() {
        // Board cell clicks
        this.gameBoard.addEventListener('click', (e) => {
            if (e.target.classList.contains('board-cell')) {
                this.handleCellClick(e.target);
            }
        });

        // Button controls
        this.startButton.addEventListener('click', () => {
            this.startNewGame();
        });

        this.restartButton.addEventListener('click', () => {
            this.restartGame();
        });

        this.resetScoreButton.addEventListener('click', () => {
            this.resetScores();
        });
    }

    handleCellClick(cell) {
        if (!this.gameActive) return;

        const index = parseInt(cell.dataset.index);
        
        if (this.board[index] !== '') return; // Cell already occupied

        // Make the move
        this.makeMove(index);
        
        // Check for win or draw
        if (this.checkWin()) {
            this.endGame('win');
        } else if (this.checkDraw()) {
            this.endGame('draw');
        } else {
            // Switch player
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.updateGameStatus();
        }
    }

    makeMove(index) {
        this.board[index] = this.currentPlayer;
        this.renderBoard();
    }

    checkWin() {
        for (let combination of this.winningCombinations) {
            const [a, b, c] = combination;
            if (this.board[a] && 
                this.board[a] === this.board[b] && 
                this.board[a] === this.board[c]) {
                
                // Highlight winning cells
                combination.forEach(index => {
                    const cell = this.gameBoard.children[index];
                    cell.classList.add('winning');
                });
                
                return true;
            }
        }
        return false;
    }

    checkDraw() {
        return this.board.every(cell => cell !== '');
    }

    endGame(result) {
        this.gameActive = false;
        
        if (result === 'win') {
            this.scores[this.currentPlayer]++;
            this.overlayTitle.textContent = `Player ${this.currentPlayer} Wins!`;
            this.overlayMessage.textContent = `Congratulations! Player ${this.currentPlayer} has won the game!`;
        } else if (result === 'draw') {
            this.scores.draw++;
            this.overlayTitle.textContent = "It's a Draw!";
            this.overlayMessage.textContent = "The game ended in a tie. Try again!";
        }
        
        this.updateScoreDisplay();
        this.overlay.style.display = 'flex';
        this.startButton.textContent = 'Play Again';
    }

    startNewGame() {
        this.gameActive = true;
        this.currentPlayer = 'X';
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.overlay.style.display = 'none';
        this.renderBoard();
        this.updateGameStatus();
    }

    restartGame() {
        this.startNewGame();
    }

    resetScores() {
        this.scores = { X: 0, O: 0, draw: 0 };
        this.updateScoreDisplay();
    }

    updateGameStatus() {
        this.gameStatus.textContent = `Player ${this.currentPlayer}'s Turn`;
    }

    updateScoreDisplay() {
        this.playerXScoreElement.textContent = this.scores.X;
        this.playerOScoreElement.textContent = this.scores.O;
        this.drawScoreElement.textContent = this.scores.draw;
    }

    renderBoard() {
        const cells = this.gameBoard.children;
        
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            const value = this.board[i];
            
            // Clear previous classes
            cell.className = 'board-cell';
            cell.textContent = '';
            
            // Add value and styling
            if (value === 'X') {
                cell.textContent = 'X';
                cell.classList.add('x');
            } else if (value === 'O') {
                cell.textContent = 'O';
                cell.classList.add('o');
            }
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToeGame();
});
