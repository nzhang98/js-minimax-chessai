# Minimax with AlphaBeta Pruning for Chess
Simple Chess AI using minimax with alpha-beta pruning implemented in Javascript; with rudimentary move-ordering and transposition table.

## Installation
Requires [nodejs](https://nodejs.org/en/)/[npm](https://docs.npmjs.com/).\
The chess engine may be installed locally as follows:

``` 
git clone https://github.com/FreeTheOtter/js-minimax-chessai.git
cd js-minimax-chessai
npm install
```

## Usage
Once installed locally, one may play against the chess engine by running `npm start` and accessing http://127.0.0.1:8080

## Structure
The main script is under `src/`.\
It contains both the engine part and the board visualization and actual game state handling.

`index.html` and `style.css` for the GUI.

`composer.json` and `index.php` are for hosting on Heroku.

## Credits and Resources
Nick Zhang (nick.zhang@studbocconi.it)

Makes use of: 
 - [Chessboardjs](https://chessboardjs.com/) for board visualization.
 - [Chessjs](https://github.com/jhlywa/chess.js/blob/master/README.md), a Javascript chess library that handles chess move generation/validation, piece placement/movement, and check/checkmate/stalemate detection.

[Chess Programming Wiki](https://www.chessprogramming.org/) is an incredible resource for both theory, ideas, applications and pseudocode for chess engines.

Minimax:\
[Wikipedia](https://en.wikipedia.org/wiki/Minimax)\
[Chess Programming Wiki](https://www.chessprogramming.org/Minimax)

Alphabeta:\
[Wikipedia](https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning)\
[Chess Programming Wiki](https://www.chessprogramming.org/Alpha-Beta)

Final Project for the course [Computer Science (Algorithms) - 20602](https://didattica.unibocconi.eu/ts/tsn_anteprima.php?cod_ins=20602&anno=2021&IdPag=6164), with professors C.Feinauer and F.Pittorino.

