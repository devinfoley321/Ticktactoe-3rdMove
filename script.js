class TicTacToe {
    constructor() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.moveHistory = []; // Store {player, index, moveNumber}
        this.moveCount = 0;
        this.gameMode = 'classic'; // 'classic' or 'alternate'
        
        this.cells = document.querySelectorAll('.cell');
        this.statusDisplay = document.getElementById('game-status');
        this.resetBtn = document.getElementById('reset-btn');
        this.currentPlayerDisplay = document.getElementById('current-player');
        this.moveCountDisplay = document.getElementById('move-count');
        this.historyList = document.getElementById('history-list');
        this.warningMessage = document.getElementById('warning-message');
        this.subtitleDisplay = document.getElementById('game-mode-subtitle');
        this.modeClassicBtn = document.getElementById('mode-classic');
        this.modeAlternateBtn = document.getElementById('mode-alternate');
        
        this.initializeGame();
    }

    initializeGame() {
        this.cells.forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });
        
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.modeClassicBtn.addEventListener('click', () => this.switchMode('classic'));
        this.modeAlternateBtn.addEventListener('click', () => this.switchMode('alternate'));
        this.updateDisplay();
    }

    switchMode(mode) {
        this.gameMode = mode;
        
        // Update button states
        if (mode === 'classic') {
            this.modeClassicBtn.classList.add('active');
            this.modeAlternateBtn.classList.remove('active');
            this.subtitleDisplay.textContent = 'Every 3rd move erases the move from 3 turns ago!';
        } else {
            this.modeAlternateBtn.classList.add('active');
            this.modeClassicBtn.classList.remove('active');
            this.subtitleDisplay.textContent = 'Each player can only have 3 symbols on the board!';
        }
        
        // Reset the game when switching modes
        this.resetGame();
    }

    handleCellClick(event) {
        const cell = event.target;
        const index = parseInt(cell.getAttribute('data-index'));

        if (this.board[index] !== null || !this.gameActive) {
            return;
        }

        this.makeMove(index);
    }

    makeMove(index) {
        // Place the current move
        this.board[index] = this.currentPlayer;
        this.moveCount++;
        
        // Record the move
        this.moveHistory.push({
            player: this.currentPlayer,
            index: index,
            moveNumber: this.moveCount,
            erased: false
        });

        // Update the cell
        const cell = this.cells[index];
        cell.innerHTML = `<span class="cell-content">${this.currentPlayer}</span>`;
        cell.classList.add('taken', this.currentPlayer.toLowerCase(), 'appearing');
        
        // Check for winner BEFORE erasing
        if (this.checkWinner()) {
            this.statusDisplay.textContent = `Player ${this.currentPlayer} Wins! 🎉`;
            this.statusDisplay.classList.add('winner');
            this.gameActive = false;
            this.updateHistory();
            return;
        }
        
        // Apply erasure logic based on game mode
        if (this.gameMode === 'classic') {
            // Classic mode: every 3rd move erases the move from 3 turns ago
            if (this.moveCount >= 3 && this.moveCount % 3 === 0) {
                this.eraseOldMove();
            }
        } else {
            // Alternate mode: erase oldest symbol of current player if they have 4
            this.eraseOldestPlayerSymbol();
        }

        this.updateHistory();

        // Switch player
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateDisplay();
        this.updateCellIndicators();
    }

    eraseOldMove() {
        // Erase the move from 3 turns ago (with a gap of 2)
        // moveCount=3 erases move 1 (at index 0)
        // moveCount=6 erases move 4 (at index 3)
        // moveCount=9 erases move 7 (at index 6)
        // Pattern: erase at array index (moveCount - 3)
        const arrayIndex = this.moveCount - 3;
        const moveToErase = this.moveHistory[arrayIndex];
        
        if (moveToErase && !moveToErase.erased) {
            const cellIndex = moveToErase.index;
            const cell = this.cells[cellIndex];
            
            // Add disappearing animation
            cell.classList.add('disappearing');
            
            setTimeout(() => {
                // Clear the cell
                this.board[cellIndex] = null;
                cell.innerHTML = '';
                cell.classList.remove('taken', 'x', 'o', 'disappearing', 'will-disappear', 'next-to-disappear');
                
                // Mark as erased in history
                moveToErase.erased = true;
                this.updateHistory();
                this.updateCellIndicators();
            }, 500);
        }
    }

    eraseOldestPlayerSymbol() {
        // Count how many unerased symbols the current player has
        const playerMoves = this.moveHistory.filter(m => 
            m.player === this.currentPlayer && !m.erased
        );
        
        // If player has 4 symbols, erase the oldest one
        if (playerMoves.length >= 4) {
            const oldestMove = playerMoves[0];
            const cellIndex = oldestMove.index;
            const cell = this.cells[cellIndex];
            
            // Add disappearing animation
            cell.classList.add('disappearing');
            
            setTimeout(() => {
                // Clear the cell
                this.board[cellIndex] = null;
                cell.innerHTML = '';
                cell.classList.remove('taken', 'x', 'o', 'disappearing', 'will-disappear', 'next-to-disappear');
                
                // Mark as erased in history
                oldestMove.erased = true;
                this.updateHistory();
                this.updateCellIndicators();
            }, 500);
        }
    }

    checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        return winPatterns.some(pattern => {
            const [a, b, c] = pattern;
            return this.board[a] !== null &&
                   this.board[a] === this.board[b] &&
                   this.board[a] === this.board[c];
        });
    }

    updateDisplay() {
        this.currentPlayerDisplay.textContent = this.currentPlayer;
        this.currentPlayerDisplay.style.color = this.currentPlayer === 'X' ? '#667eea' : '#764ba2';
        this.moveCountDisplay.textContent = this.moveCount;
        this.updateWarningMessage();
    }

    updateWarningMessage() {
        this.warningMessage.className = 'warning-message';
        
        if (this.gameMode === 'classic') {
            const nextMoveNumber = this.moveCount + 1;
            
            // Check if next move will trigger an erasure (every 3rd move: 3, 6, 9, etc.)
            if (nextMoveNumber % 3 === 0 && nextMoveNumber >= 3) {
                const moveIndexToErase = nextMoveNumber - 3 - 1;
                if (moveIndexToErase >= 0 && moveIndexToErase < this.moveHistory.length) {
                    const moveToBeErased = this.moveHistory[moveIndexToErase];
                    if (!moveToBeErased.erased) {
                        this.warningMessage.innerHTML = `⚠️ <strong>Next move will erase</strong>`;
                        this.warningMessage.classList.add('next-removal');
                        return;
                    }
                }
            }
            
            // Check if the next move WILL BE erased
            if (nextMoveNumber % 3 === 1 && nextMoveNumber >= 1) {
                this.warningMessage.innerHTML = `⚠️ <strong>WARNING: TEMPORARY MOVE!</strong> ⚠️<br><span style="font-size: 0.9em;">Your ${this.currentPlayer} will disappear in 3 turns</span>`;
                this.warningMessage.classList.add('temporary-move');
            } else {
                this.warningMessage.textContent = '';
            }
        } else {
            // Alternate mode warnings
            const playerMoves = this.moveHistory.filter(m => 
                m.player === this.currentPlayer && !m.erased
            );
            
            if (playerMoves.length >= 3) {
                this.warningMessage.innerHTML = `⚠️ <strong>Next move will erase your oldest ${this.currentPlayer}</strong> ⚠️`;
                this.warningMessage.classList.add('next-removal');
            } else {
                this.warningMessage.textContent = '';
            }
        }
    }

    updateCellIndicators() {
        // Clear all indicators first
        this.cells.forEach(cell => {
            cell.classList.remove('will-disappear', 'next-to-disappear');
        });

        if (this.gameMode === 'classic') {
            // Classic mode indicators
            const nextErasureMove = Math.ceil((this.moveCount + 1) / 3) * 3;
            const turnsUntilErasure = nextErasureMove - this.moveCount;
            
            // Only highlight if erasure is within 2 turns
            if (turnsUntilErasure <= 2) {
                const moveIndexToErase = nextErasureMove - 3;
                
                if (moveIndexToErase >= 0 && moveIndexToErase < this.moveHistory.length) {
                    const moveToErase = this.moveHistory[moveIndexToErase];
                    
                    if (!moveToErase.erased) {
                        const cell = this.cells[moveToErase.index];
                        
                        if (turnsUntilErasure === 1) {
                            cell.classList.add('next-to-disappear');
                        } else if (turnsUntilErasure === 2) {
                            cell.classList.add('will-disappear');
                        }
                    }
                }
            }
        } else {
            // Alternate mode indicators
            // Highlight the oldest symbol of the current player if they have 3
            const playerMoves = this.moveHistory.filter(m => 
                m.player === this.currentPlayer && !m.erased
            );
            
            if (playerMoves.length >= 3) {
                const oldestMove = playerMoves[0];
                const cell = this.cells[oldestMove.index];
                
                if (playerMoves.length === 3) {
                    // Next move will erase this
                    cell.classList.add('next-to-disappear');
                }
            }
        }
    }

    updateHistory() {
        this.historyList.innerHTML = '';
        
        // Display history in reverse order (most recent first)
        for (let i = this.moveHistory.length - 1; i >= 0; i--) {
            const move = this.moveHistory[i];
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            if (move.erased) {
                historyItem.classList.add('erased');
            }
            
            const row = Math.floor(move.index / 3) + 1;
            const col = (move.index % 3) + 1;
            
            const playerClass = move.player === 'X' ? 'player-x' : 'player-o';
            historyItem.innerHTML = `
                <span>Move ${move.moveNumber}: <span class="${playerClass}">${move.player}</span> at (${row},${col})</span>
                <span>${move.erased ? '❌ Erased' : '✓'}</span>
            `;
            
            this.historyList.appendChild(historyItem);
        }
    }

    resetGame() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.moveHistory = [];
        this.moveCount = 0;
        
        this.cells.forEach(cell => {
            cell.innerHTML = '';
            cell.classList.remove('taken', 'x', 'o', 'appearing', 'disappearing', 'will-disappear', 'next-to-disappear');
        });
        
        this.statusDisplay.textContent = '';
        this.statusDisplay.classList.remove('winner');
        this.historyList.innerHTML = '';
        this.warningMessage.textContent = '';
        this.warningMessage.className = 'warning-message';
        
        this.updateDisplay();
        this.updateCellIndicators();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});
