// Testable version of the game (without DOM dependencies for testing)
class TicTacToeGame {
    constructor() {
        this.reset();
    }

    reset() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.moveHistory = [];
        this.moveCount = 0;
    }

    makeMove(index) {
        if (this.board[index] !== null || !this.gameActive) {
            return false;
        }

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

        // Check for winner first
        if (this.checkWinner()) {
            this.gameActive = false;
            this.winner = this.currentPlayer;
            return true;
        }
        
        // Only erase if game is still active
        // Check for the special rule: every 3rd move erases the move from 3 turns ago
        if (this.moveCount >= 3 && this.moveCount % 3 === 0) {
            this.eraseOldMove();
        }

        // Switch player
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        return true;
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
            
            // Clear the cell
            this.board[cellIndex] = null;
            
            // Mark as erased in history
            moveToErase.erased = true;
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

    getUnerasedMoves() {
        return this.moveHistory.filter(m => !m.erased);
    }

    getBoard() {
        return [...this.board];
    }

    isGameActive() {
        return this.gameActive;
    }

    getWinner() {
        return this.winner || null;
    }

    getCurrentPlayer() {
        return this.currentPlayer;
    }

    getMoveCount() {
        return this.moveCount;
    }
}
