# Tic Tac Toe - Disappearing Moves Edition

A unique twist on the classic Tic Tac Toe game where every 3rd move erases the move from 3 turns ago, making ties nearly impossible!

## Game Rules

1. **Standard Tic Tac Toe**: Players X and O take turns placing their marks on a 3x3 grid
2. **The Twist**: Every 3rd move (moves 3, 6, 9, etc.) automatically erases the move from 3 turns before
3. **No Ties**: This mechanic keeps the board from filling up, making the game continue until someone wins

## How It Works

- Move 1: X places mark (nothing erased)
- Move 2: O places mark (nothing erased)
- Move 3: X places mark → **Move 1 is erased**
- Move 4: O places mark (nothing erased)
- Move 5: X places mark (nothing erased)
- Move 6: O places mark → **Move 4 is erased**
- And so on...

## Features

- **Visual Feedback**: Smooth animations when moves appear and disappear
- **Move History**: Track all moves and see which ones have been erased
- **Responsive Design**: Works on desktop and mobile devices
- **Beautiful UI**: Modern gradient design with smooth transitions

## How to Play

1. Open `index.html` in a web browser
2. Click on any empty cell to place your mark
3. Watch as older moves disappear automatically
4. First player to get three in a row wins!
5. Click "New Game" to start over

## Files

- `index.html` - Main HTML structure
- `style.css` - Styling and animations
- `script.js` - Game logic and mechanics

## Technical Details

The game keeps track of:
- Current board state
- Move history with timestamps
- Which moves have been erased
- Current player and move count

Enjoy the game! 🎮
