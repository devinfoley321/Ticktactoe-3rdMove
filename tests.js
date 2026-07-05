// Simple test framework
class TestRunner {
    constructor() {
        this.suites = [];
        this.totalTests = 0;
        this.passedTests = 0;
        this.failedTests = 0;
    }

    describe(suiteName, callback) {
        const suite = {
            name: suiteName,
            tests: []
        };
        this.suites.push(suite);
        
        const it = (testName, testFn) => {
            suite.tests.push({ name: testName, fn: testFn });
        };
        
        callback(it);
    }

    async run() {
        this.totalTests = 0;
        this.passedTests = 0;
        this.failedTests = 0;
        const results = [];

        for (const suite of this.suites) {
            const suiteResults = {
                name: suite.name,
                tests: []
            };

            for (const test of suite.tests) {
                this.totalTests++;
                const result = { name: test.name };
                
                try {
                    await test.fn();
                    result.passed = true;
                    this.passedTests++;
                } catch (error) {
                    result.passed = false;
                    result.error = error.message;
                    this.failedTests++;
                }
                
                suiteResults.tests.push(result);
            }
            
            results.push(suiteResults);
        }

        return results;
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }

    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected}, but got ${actual}`);
        }
    }

    assertArrayEqual(actual, expected, message) {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(message || `Expected [${expected}], but got [${actual}]`);
        }
    }

    assertNull(value, message) {
        if (value !== null) {
            throw new Error(message || `Expected null, but got ${value}`);
        }
    }

    assertNotNull(value, message) {
        if (value === null) {
            throw new Error(message || 'Expected non-null value');
        }
    }
}

// Test suite definitions
const runner = new TestRunner();

// Test Suite 1: Basic Game Mechanics
runner.describe('Basic Game Mechanics', (it) => {
    it('should initialize with empty board and player X', () => {
        const game = new TicTacToeGame();
        runner.assertEqual(game.getCurrentPlayer(), 'X', 'Game should start with player X');
        runner.assertEqual(game.getMoveCount(), 0, 'Move count should be 0');
        runner.assert(game.isGameActive(), 'Game should be active');
        const board = game.getBoard();
        runner.assert(board.every(cell => cell === null), 'Board should be empty');
    });

    it('should place a move and switch players', () => {
        const game = new TicTacToeGame();
        game.makeMove(0);
        runner.assertEqual(game.getBoard()[0], 'X', 'Cell 0 should have X');
        runner.assertEqual(game.getCurrentPlayer(), 'O', 'Player should switch to O');
        runner.assertEqual(game.getMoveCount(), 1, 'Move count should be 1');
    });

    it('should not allow move on occupied cell', () => {
        const game = new TicTacToeGame();
        game.makeMove(0);
        const result = game.makeMove(0);
        runner.assertEqual(result, false, 'Should not allow move on occupied cell');
        runner.assertEqual(game.getCurrentPlayer(), 'O', 'Player should still be O');
    });

    it('should alternate between X and O players', () => {
        const game = new TicTacToeGame();
        game.makeMove(0); // X
        runner.assertEqual(game.getCurrentPlayer(), 'O');
        game.makeMove(1); // O
        runner.assertEqual(game.getCurrentPlayer(), 'X');
        game.makeMove(2); // X
        runner.assertEqual(game.getCurrentPlayer(), 'O');
    });
});

// Test Suite 2: Disappearing Moves Mechanic
runner.describe('Disappearing Moves Mechanic', (it) => {
    it('should erase move 1 on move 3', () => {
        const game = new TicTacToeGame();
        game.makeMove(0); // Move 1: X at 0
        game.makeMove(1); // Move 2: O at 1
        game.makeMove(2); // Move 3: X at 2 -> should erase move 1
        
        runner.assertNull(game.getBoard()[0], 'Cell 0 should be erased');
        runner.assertEqual(game.getBoard()[1], 'O', 'Cell 1 should still have O');
        runner.assertEqual(game.getBoard()[2], 'X', 'Cell 2 should have X');
        
        const unerased = game.getUnerasedMoves();
        runner.assertEqual(unerased.length, 2, 'Should have 2 unerased moves');
    });

    it('should erase move 2 on move 4 (not move 3)', () => {
        const game = new TicTacToeGame();
        game.makeMove(0); // Move 1: X at 0
        game.makeMove(1); // Move 2: O at 1
        game.makeMove(2); // Move 3: X at 2 -> erases move 1
        game.makeMove(3); // Move 4: O at 3
        
        runner.assertNull(game.getBoard()[0], 'Cell 0 should be erased');
        runner.assertEqual(game.getBoard()[1], 'O', 'Cell 1 should still have O');
        runner.assertEqual(game.getBoard()[3], 'O', 'Cell 3 should have O');
    });

    it('should erase move 4 on move 6', () => {
        const game = new TicTacToeGame();
        game.makeMove(0); // Move 1: X at 0
        game.makeMove(1); // Move 2: O at 1
        game.makeMove(2); // Move 3: X at 2 -> erases move 1 (X at 0)
        game.makeMove(3); // Move 4: O at 3
        game.makeMove(4); // Move 5: X at 4
        game.makeMove(5); // Move 6: O at 5 -> should erase move 4 (O at 3)
        
        runner.assertNull(game.getBoard()[0], 'Cell 0 should be erased (from move 3)');
        runner.assertNull(game.getBoard()[3], 'Cell 3 should be erased (from move 6)');
        runner.assertEqual(game.getBoard()[1], 'O', 'Cell 1 should have O');
        runner.assertEqual(game.getBoard()[2], 'X', 'Cell 2 should have X');
        
        const unerased = game.getUnerasedMoves();
        runner.assertEqual(unerased.length, 4, 'Should have 4 unerased moves');
    });

    it('should continue erasing pattern: moves 3,6,9,12...', () => {
        const game = new TicTacToeGame();
        // Use positions that won't create a winning line
        // X plays: 0, 3, 6 (left column - but 0 and 3 will be erased)
        // O plays: 1, 4, 7 (middle column - but 1 and 4 will be erased)
        const moves = [0, 1, 3, 4, 6, 7, 2, 5, 8];
        let movesPlaced = 0;
        moves.forEach(pos => {
            const success = game.makeMove(pos);
            if (success) movesPlaced++;
        });
        
        // Ensure all 9 moves were placed
        runner.assertEqual(movesPlaced, 9, 'All 9 moves should have been placed');
        runner.assertEqual(game.getMoveCount(), 9, 'Move count should be 9');
        
        // Move 3 erases move 1 (pos 0)
        // Move 6 erases move 4 (pos 4)
        // Move 9 erases move 7 (pos 2)
        // After 9 moves: erased at positions 0, 4, 2 (moves 1, 4, 7)
        runner.assertNull(game.getBoard()[0], 'Cell 0 (move 1) should be erased');
        runner.assertNull(game.getBoard()[4], 'Cell 4 (move 4) should be erased');
        runner.assertNull(game.getBoard()[2], 'Cell 2 (move 7) should be erased');
        
        const unerased = game.getUnerasedMoves();
        runner.assertEqual(unerased.length, 6, 'Should have 6 unerased moves after 9 moves');
    });
});

// Test Suite 3: Win Conditions
runner.describe('Win Conditions', (it) => {
    it('should detect horizontal win (top row)', () => {
        const game = new TicTacToeGame();
        game.makeMove(0); // X at 0
        game.makeMove(3); // O at 3
        game.makeMove(1); // X at 1 (move 3 erases move 1, so 0 is now empty!)
        // After move 3, cell 0 is erased! Need different approach
        game.makeMove(4); // O at 4
        game.makeMove(0); // X at 0 (replaces erased cell)
        game.makeMove(5); // O at 5
        game.makeMove(2); // X wins! (top row: 0,1,2 complete)
        
        runner.assertEqual(game.getWinner(), 'X', 'X should win with top row');
        runner.assert(!game.isGameActive(), 'Game should be over');
    });

    it('should detect vertical win (left column)', () => {
        const game = new TicTacToeGame();
        game.makeMove(0); // X at 0
        game.makeMove(1); // O at 1
        game.makeMove(3); // X at 3 (move 3 erases cell 0)
        game.makeMove(2); // O at 2
        game.makeMove(0); // X at 0 (reuse erased cell)
        game.makeMove(4); // O at 4
        game.makeMove(6); // X wins! (left column: 0,3,6)
        
        runner.assertEqual(game.getWinner(), 'X', 'X should win with left column');
        runner.assert(!game.isGameActive(), 'Game should be over');
    });

    it('should detect diagonal win (top-left to bottom-right)', () => {
        const game = new TicTacToeGame();
        game.makeMove(0); // X at 0
        game.makeMove(1); // O at 1
        game.makeMove(4); // X at 4 (move 3 erases cell 0)
        game.makeMove(2); // O at 2
        game.makeMove(0); // X at 0 (reuse erased cell)
        game.makeMove(3); // O at 3
        game.makeMove(8); // X wins! (diagonal: 0,4,8)
        
        runner.assertEqual(game.getWinner(), 'X', 'X should win with diagonal');
        runner.assert(!game.isGameActive(), 'Game should be over');
    });

    it('should detect diagonal win (top-right to bottom-left)', () => {
        const game = new TicTacToeGame();
        game.makeMove(2); // X at 2
        game.makeMove(0); // O at 0
        game.makeMove(4); // X at 4 (move 3 erases cell 2)
        game.makeMove(1); // O at 1
        game.makeMove(2); // X at 2 (reuse erased cell)
        game.makeMove(3); // O at 3
        game.makeMove(6); // X wins! (diagonal: 2,4,6)
        
        runner.assertEqual(game.getWinner(), 'X', 'X should win with other diagonal');
    });

    it('should allow O to win', () => {
        const game = new TicTacToeGame();
        game.makeMove(0); // Move 1: X at 0
        game.makeMove(3); // Move 2: O at 3
        game.makeMove(1); // Move 3: X at 1 (erases move 1, cell 0)
        game.makeMove(4); // Move 4: O at 4
        game.makeMove(2); // Move 5: X at 2
        game.makeMove(5); // Move 6: O at 5 (erases move 4, cell 4 - O's own piece!)
        // After move 6: O has 3 and 5, but not 4 anymore
        game.makeMove(6); // Move 7: X at 6
        game.makeMove(4); // Move 8: O at 4 (replace erased cell)
        // Now O has 3, 4, 5 - should win!
        
        runner.assertEqual(game.getWinner(), 'O', 'O should win');
    });
});

// Test Suite 4: Complex Scenarios
runner.describe('Complex Scenarios', (it) => {
    it('should handle win after a move is erased', () => {
        const game = new TicTacToeGame();
        game.makeMove(0); // Move 1: X at 0
        game.makeMove(1); // Move 2: O at 1
        game.makeMove(3); // Move 3: X at 3 (erases move 1, cell 0)
        game.makeMove(4); // Move 4: O at 4
        game.makeMove(5); // Move 5: X at 5
        game.makeMove(6); // Move 6: O at 6 (erases move 4, cell 4)
        
        // After move 3: cell 0 erased
        // After move 6: cell 4 erased
        runner.assertNull(game.getBoard()[0], 'Cell 0 should be erased');
        runner.assertNull(game.getBoard()[4], 'Cell 4 should be erased');
        
        // Continue playing to see if win detection still works
        runner.assert(game.isGameActive(), 'Game should still be active');
    });

    it('should not create a tie - game continues with disappearing moves', () => {
        const game = new TicTacToeGame();
        // Play 15 moves without winning
        const moves = [0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 1, 2, 3, 4, 5];
        
        let movesPlaced = 0;
        for (let i = 0; i < moves.length && game.isGameActive(); i++) {
            const success = game.makeMove(moves[i]);
            if (success) movesPlaced++;
        }
        
        // Board should never be completely full due to erasures
        const board = game.getBoard();
        const filledCells = board.filter(cell => cell !== null).length;
        runner.assert(filledCells <= 6, 'Board should not have more than 6 filled cells at once');
    });

    it('should maintain correct unerased move count', () => {
        const game = new TicTacToeGame();
        
        // Use a pattern that won't trigger a win
        // After 3 moves: 2 unerased (move 1 erased)
        game.makeMove(0); // X at 0
        game.makeMove(1); // O at 1
        game.makeMove(3); // X at 3 (erases 0)
        runner.assertEqual(game.getUnerasedMoves().length, 2, 'Should have 2 unerased after 3 moves');
        
        // After 6 moves: 4 unerased (moves 1,4 erased)
        game.makeMove(4); // O at 4
        game.makeMove(6); // X at 6
        game.makeMove(7); // O at 7 (erases 3)
        runner.assertEqual(game.getUnerasedMoves().length, 4, 'Should have 4 unerased after 6 moves');
        
        // After 9 moves: 6 unerased (moves 1,4,7 erased)
        game.makeMove(2); // X at 2
        game.makeMove(5); // O at 5
        game.makeMove(8); // X at 8 (erases 6)
        runner.assertEqual(game.getUnerasedMoves().length, 6, 'Should have 6 unerased after 9 moves');
    });

    it('should handle placing on previously erased cell', () => {
        const game = new TicTacToeGame();
        game.makeMove(0); // Move 1: X at 0
        game.makeMove(1); // Move 2: O at 1
        game.makeMove(2); // Move 3: X at 2 -> erases move 1 (cell 0)
        
        runner.assertNull(game.getBoard()[0], 'Cell 0 should be empty');
        
        // Now place at cell 0 again
        game.makeMove(0); // Move 4: O at 0
        runner.assertEqual(game.getBoard()[0], 'O', 'Cell 0 should now have O');
    });
});

// Test Suite 5: Edge Cases
runner.describe('Edge Cases', (it) => {
    it('should not allow moves after game is won', () => {
        const game = new TicTacToeGame();
        game.makeMove(0); // X at 0
        game.makeMove(3); // O at 3
        game.makeMove(1); // X at 1 (move 3 erases cell 0)
        game.makeMove(4); // O at 4
        game.makeMove(0); // X at 0 (reuse)
        game.makeMove(5); // O at 5
        game.makeMove(2); // X wins! (top row: 0,1,2)
        
        const result = game.makeMove(6);
        runner.assertEqual(result, false, 'Should not allow move after win');
        runner.assertNull(game.getBoard()[6], 'Cell 6 should remain empty');
    });

    it('should handle reset properly', () => {
        const game = new TicTacToeGame();
        game.makeMove(0);
        game.makeMove(1);
        game.makeMove(2);
        
        game.reset();
        
        runner.assertEqual(game.getMoveCount(), 0, 'Move count should be 0 after reset');
        runner.assertEqual(game.getCurrentPlayer(), 'X', 'Should reset to player X');
        runner.assert(game.isGameActive(), 'Game should be active after reset');
        const board = game.getBoard();
        runner.assert(board.every(cell => cell === null), 'Board should be empty after reset');
    });

    it('should handle all cells being valid targets after erasures', () => {
        const game = new TicTacToeGame();
        // Play enough to erase some cells
        for (let i = 0; i < 6; i++) {
            game.makeMove(i);
        }
        
        // Move 3 erases move 1 (cell 0), move 6 erases move 4 (cell 3)
        runner.assertNull(game.getBoard()[0], 'Cell 0 should be erased');
        runner.assertNull(game.getBoard()[3], 'Cell 3 should be erased');
        
        // Should be able to play on erased cells
        const result1 = game.makeMove(0);
        const result2 = game.makeMove(3);
        
        runner.assert(result1, 'Should be able to play on erased cell 0');
        runner.assert(result2, 'Should be able to play on erased cell 3');
    });
});

// Run tests and display results
async function runTests() {
    const resultsContainer = document.getElementById('test-results');
    const summaryContainer = document.getElementById('summary');
    
    resultsContainer.innerHTML = '<p>Running tests...</p>';
    summaryContainer.innerHTML = '';
    
    const results = await runner.run();
    
    // Display summary
    const allPassed = runner.failedTests === 0;
    summaryContainer.className = `summary ${allPassed ? 'all-passed' : 'has-failures'}`;
    summaryContainer.innerHTML = `
        <strong>Test Results:</strong> 
        ${runner.passedTests} passed, 
        ${runner.failedTests} failed, 
        ${runner.totalTests} total
        ${allPassed ? ' ✅' : ' ❌'}
    `;
    
    // Display detailed results
    resultsContainer.innerHTML = '';
    results.forEach(suite => {
        const suiteDiv = document.createElement('div');
        suiteDiv.className = 'test-suite';
        
        const header = document.createElement('div');
        header.className = 'test-suite-header';
        header.textContent = suite.name;
        suiteDiv.appendChild(header);
        
        suite.tests.forEach(test => {
            const testDiv = document.createElement('div');
            testDiv.className = `test-case ${test.passed ? 'passed' : 'failed'}`;
            
            const testName = document.createElement('div');
            testName.className = 'test-name';
            testName.textContent = test.name;
            testDiv.appendChild(testName);
            
            const status = document.createElement('div');
            status.className = `test-status ${test.passed ? 'passed' : 'failed'}`;
            status.textContent = test.passed ? '✓ PASSED' : '✗ FAILED';
            testDiv.appendChild(status);
            
            if (!test.passed && test.error) {
                const error = document.createElement('div');
                error.className = 'test-error';
                error.textContent = test.error;
                testDiv.appendChild(error);
            }
            
            suiteDiv.appendChild(testDiv);
        });
        
        resultsContainer.appendChild(suiteDiv);
    });
}

// Run tests on page load
document.addEventListener('DOMContentLoaded', runTests);
document.getElementById('run-tests').addEventListener('click', runTests);
