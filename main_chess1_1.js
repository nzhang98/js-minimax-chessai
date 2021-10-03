// Main Script version 1.0
// v1.1 - Tentative update/optimization of evaluation function (sum score)
// Old ver- Positions evaluated: 3508
// Time: 0.184s
// Positions/s: 19065.217391304348


var board,
    game = new Chess();
var globalSum = 0;
// Minimax Routine starts here

var mmRoot = function(depth, game, isMaximisingPlayer, globalSum) {
    // Root of the minimax routine. 
    // legalMoves represents 'children' of node
    var legalMoves = game.ugly_moves();
    var bestMoveScore = -Infinity;
    var bestMove;
    
    console.log('depth: ', depth, 'globSum: ', globalSum)
    for(var i = 0; i < legalMoves.length; i++) {

        var newMove = legalMoves[i];
        prettyMove = game.ugly_move(newMove);
        
        console.log('prettyMove: ',prettyMove)
        var value = minimax(depth - 1, game, -Infinity, Infinity, !isMaximisingPlayer, globalSum);
        game.undo();

        if(value >= bestMoveScore) {
            bestMoveScore = value;
            bestMove = newMove;
        }
    }
    return [bestMove, bestMoveScore];
};

var minimax = function (depth, game, alpha, beta, isMaximisingPlayer, sum) {
    positionCount++;

    if (depth === 0) {
        return -evaluateBoard(game.board());
    }

    var legalMoves = game.ugly_moves();

    if (isMaximisingPlayer) {
        var bestMoveScore = -Infinity;
        for (var i = 0; i < legalMoves.length; i++) {
            var currMove = game.ugly_move(legalMoves[i]);
            console.log('depth: ', depth, currMove)
            var newSum = evaluateBoard_incremental(game, currMove, sum);
            bestMoveScore = Math.max(
                bestMoveScore, 
                minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer, newSum));
            alpha = Math.max(alpha, bestMoveScore);
            if (beta <= alpha) {
                return bestMoveScore;
            }
        }
        return bestMoveScore;
    } else {
        var bestMoveScore = Infinity;
        for (var i = 0; i < legalMoves.length; i++) {
            var currMove = game.ugly_move(legalMoves[i]);
            console.log('depth: ', depth, currMove)
            var newSum = evaluateBoard_incremental(game, currMove, sum);
            bestMoveScore = Math.min(
                bestMoveScore, 
                minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer, newSum));
            game.undo();
            beta = Math.min(beta, bestMoveScore);
            if (beta <= alpha) {
                return bestMoveScore;
            }
        }
        return bestMoveScore;
    }
};

// Board Evaluation functions starts here 

var evaluateBoard = function (board) {
    var totalEvaluation = 0;
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            totalEvaluation = totalEvaluation + getPieceValue(board[i][j], i ,j);
        }
    }
    return totalEvaluation;
};

function evaluateBoard_incremental(game, move, prevSum, color) {

    if (game.in_checkmate()) {
  
      // Opponent is in checkmate (good for us)
      if (move.color === color) {
        return Infinity;
      }
      // Our king's in checkmate (bad for us)
      else {
        return -Infinity;
      }
    }
  
    if (game.in_draw() || game.in_threefold_repetition() || game.in_stalemate())
    {
      return 0;
    }
  
    if (game.in_check()) {
      // Opponent is in check (good for us)
      if (move.color === color) {
        prevSum += 50;
      }
      // Our king's in check (bad for us)
      else {
        prevSum -= 50;
      }
    }
  
    var from = [
      8 - parseInt(move.from[1]),
      move.from.charCodeAt(0) - 'a'.charCodeAt(0),
    ];
    var to = [
      8 - parseInt(move.to[1]),
      move.to.charCodeAt(0) - 'a'.charCodeAt(0),
    ];
  
    // Change endgame behavior for kings
    if (prevSum < -1500) {
      if (move.piece === 'k') {
        move.piece = 'k_e';
      }
      // Kings can never be captured
      // else if (move.captured === 'k') {
      //   move.captured = 'k_e';
      // }
    }
  
    if ('captured' in move) {
      // Opponent piece was captured (good for us)
      if (move.color === color) {
        prevSum +=
          weights[move.captured] +
          pstOpponent[move.color][move.captured][to[0]][to[1]];
      }
      // Our piece was captured (bad for us)
      else {
        prevSum -=
          weights[move.captured] +
          pstSelf[move.color][move.captured][to[0]][to[1]];
      }
    }
  
    if (move.flags.includes('p')) {
      // NOTE: promote to queen for simplicity
      move.promotion = 'q';
  
      // Our piece was promoted (good for us)
      if (move.color === color) {
        prevSum -=
          weights[move.piece] + pstSelf[move.color][move.piece][from[0]][from[1]];
        prevSum +=
          weights[move.promotion] +
          pstSelf[move.color][move.promotion][to[0]][to[1]];
      }
      // Opponent piece was promoted (bad for us)
      else {
        prevSum +=
          weights[move.piece] + pstSelf[move.color][move.piece][from[0]][from[1]];
        prevSum -=
          weights[move.promotion] +
          pstSelf[move.color][move.promotion][to[0]][to[1]];
      }
    } else {
      // The moved piece still exists on the updated board, so we only need to update the position value
      console.log(move.piece)
      console.log(game.board()[to[0]][to[1]])
      console.log(to[0], to[1])
      prevSum += getPieceValue(game.board()[to[0]][to[1]], to[0], to[1])
      prevSum -= getPieceValue(game.board()[from[0]][from[1]], from[0], from[1])
      console.log(prevSum)
    }
  
    return prevSum;
  }
var reverseArray = function(array) {
    return array.slice().reverse();
};

var pawnEvalWhite =
    [
        [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
        [5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0],
        [1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0],
        [0.5,  0.5,  1.0,  2.5,  2.5,  1.0,  0.5,  0.5],
        [0.0,  0.0,  0.0,  2.0,  2.0,  0.0,  0.0,  0.0],
        [0.5, -0.5, -1.0,  0.0,  0.0, -1.0, -0.5,  0.5],
        [0.5,  1.0, 1.0,  -2.0, -2.0,  1.0,  1.0,  0.5],
        [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]
    ];

var pawnEvalBlack = reverseArray(pawnEvalWhite);

var knightEval =
    [
        [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
        [-4.0, -2.0,  0.0,  0.0,  0.0,  0.0, -2.0, -4.0],
        [-3.0,  0.0,  1.0,  1.5,  1.5,  1.0,  0.0, -3.0],
        [-3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0],
        [-3.0,  0.0,  1.5,  2.0,  2.0,  1.5,  0.0, -3.0],
        [-3.0,  0.5,  1.0,  1.5,  1.5,  1.0,  0.5, -3.0],
        [-4.0, -2.0,  0.0,  0.5,  0.5,  0.0, -2.0, -4.0],
        [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
    ];

var bishopEvalWhite = [
    [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
    [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0],
    [ -1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0],
    [ -1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0],
    [ -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0],
    [ -1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0],
    [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
];

var bishopEvalBlack = reverseArray(bishopEvalWhite);

var rookEvalWhite = [
    [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
    [  0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [  0.0,   0.0, 0.0,  0.5,  0.5,  0.0,  0.0,  0.0]
];

var rookEvalBlack = reverseArray(rookEvalWhite);

var evalQueen = [
    [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
    [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
    [ -0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
    [  0.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
    [ -1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
];

var kingEvalWhite = [

    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
    [ -1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
    [  2.0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0 ],
    [  2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0 ]
];

var kingEvalBlack = reverseArray(kingEvalWhite);




var getPieceValue = function (piece, x, y) {
    if (piece === null) {
        return 0;
    }
    var getAbsoluteValue = function (piece, isWhite, x, y) {
        if (piece.type === 'p') {
            return 10 + ( isWhite ? pawnEvalWhite[y][x]: pawnEvalBlack[y][x]);
        } else if (piece.type === 'r') {
            return 50 + ( isWhite ? rookEvalWhite[y][x]: rookEvalBlack[y][x]);
        } else if (piece.type === 'n') {
            return 30 + knightEval[y][x];
        } else if (piece.type === 'b') {
            return 30 + ( isWhite ? bishopEvalWhite[y][x]: bishopEvalBlack[y][x]);
        } else if (piece.type === 'q') {
            return 90 + evalQueen[y][x];
        } else if (piece.type === 'k') {
            return 900 + ( isWhite ? kingEvalWhite[y][x]: kingEvalBlack[y][x]);
        }
        throw "Unknown piece type: " + piece.type;
    };

    var absoluteValue = getAbsoluteValue(piece, piece.color === 'w', x ,y);
    return piece.color === 'w' ? absoluteValue : -absoluteValue;
};


// Game state and Board Visualization Configurations start here

var onDragStart = function (source, piece, position, orientation) {
    if (game.in_checkmate() === true || game.in_draw() === true ||
        piece.search(/^b/) !== -1) {
        return false;
    }
};

var makeBestMove = function () {
    var bestMove = getBestMove(game);
    game.ugly_move(bestMove);
    board.position(game.fen());
    renderMoveHistory(game.history());
    
    if (game.game_over()) {
        alert('Game over');
    }
};

var positionCount;
var getBestMove = function (game) {
    if (game.game_over()) {
        alert('Game over');
    }
    var globalSum = evaluateBoard(game.board());
    positionCount = 0;
    var depth = parseInt($('#search-depth').find(':selected').text());

    var d = new Date().getTime();
    var [bestMove, bestMoveScore] = mmRoot(depth, game, true, globalSum);
    console.log('bestMove :', bestMove, 'bestMoveScore: ', bestMoveScore)
    var d2 = new Date().getTime();
    var moveTime = (d2 - d);
    var positionsPerS = ( positionCount * 1000 / moveTime);

    $('#position-count').text(positionCount);
    $('#time').text(moveTime/1000 + 's');
    $('#positions-per-s').text(positionsPerS);
    $('#current-board-evaluation').text(evaluateBoard(game.board())/10)
    $('#ai-board-evaluation').text(-bestMoveScore/10)
    return bestMove;
};

var renderMoveHistory = function (moves) {
    var historyElement = $('#move-history').empty();
    historyElement.empty();
    for (var i = 0; i < moves.length; i = i + 2) {
        historyElement.append('<span>' + moves[i] + ' ' + ( moves[i + 1] ? moves[i + 1] : ' ') + '</span><br>')
    }
    historyElement.scrollTop(historyElement[0].scrollHeight);

};

var onDrop = function (source, target) {

    var move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    });

    removeGreySquares();
    if (move === null) {
        return 'snapback';
    }

    renderMoveHistory(game.history());
    window.setTimeout(makeBestMove, 250);
};

var onSnapEnd = function () {
    board.position(game.fen());
};

var onMouseoverSquare = function(square, piece) {
    var moves = game.moves({
        square: square,
        verbose: true
    });

    if (moves.length === 0) return;

    greySquare(square);

    for (var i = 0; i < moves.length; i++) {
        greySquare(moves[i].to);
    }
};

var onMouseoutSquare = function(square, piece) {
    removeGreySquares();
};

var removeGreySquares = function() {
    $('#board .square-55d63').css('background', '');
};

var greySquare = function(square) {
    var squareEl = $('#board .square-' + square);

    var background = '#a9a9a9';
    if (squareEl.hasClass('black-3c85d') === true) {
        background = '#696969';
    }

    squareEl.css('background', background);
};

var cfg = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
    onSnapEnd: onSnapEnd
};
board = ChessBoard('board', cfg);