var board,
    game = new Chess();

// Engine Starts Here

// Transposition Table (Very simple (and not very efficient), uses fen strings as hash keys)
var ttable = {}
var updateTtable = function(hash, score, depth) {
    if (!(hash in ttable)) {
        ttable[hash] = {}
    }
    ttable[hash].score = score
    ttable[hash].depth = depth
}

// Move Ordering
var moveSort = function(movesList) {
    // Very simple move ordering logics. 
    // flags are: 2 -> Capture, 16-> Promotion, 18 -> Promotion+Capture
    var importances = {
        18: 15,
        16: 10,
        2: 5
    }

    for (let move of movesList) {
        if (move.flags in importances) {
            move.importance = importances[move.flags]
        }
        else {
            move.importance = 0
        }
    }
    return movesList.sort((a,b) => b.importance - a.importance);
}


// Root of the minimax routine. 
var mmRoot = function(game, depth,  isMaximisingPlayer) {
    // legalMoves represents children of node
    var legalMoves = game.ugly_moves();
    moveSort(legalMoves);

    var bestMoveScore = -Infinity;
    var bestMove;

    for(var i = 0; i < legalMoves.length; i++) {

        var newMove = legalMoves[i];
        game.ugly_move(newMove);

        var value = minimax(game, depth - 1, -Infinity, Infinity, !isMaximisingPlayer);
        game.undo();

        if(value >= bestMoveScore) {
            bestMoveScore = value;
            bestMove = newMove;
        }
    }
    return [bestMove, bestMoveScore];
};

var minimax = function (game, depth, alpha, beta, isMaximisingPlayer) {
    positionCount++;
    if (depth === 0) {
        return -evaluateBoard(game.board());
    }
    // Transposition table, return previously computed score if 
    // position already reached at same or higher depth than current
    let hash = game.fen()
    if (hash in ttable) {
        if (ttable[hash].depth >= depth) {
            hashedCount++
            return ttable[hash].score
        }
    }

    var legalMoves = game.ugly_moves();
    moveSort(legalMoves);
    if (isMaximisingPlayer) {
        var bestMoveScore = -Infinity;
        for (var i = 0; i < legalMoves.length; i++) {
            game.ugly_move(legalMoves[i]);
            bestMoveScore = Math.max(bestMoveScore, 
                minimax(game, depth - 1, alpha, beta, !isMaximisingPlayer));
            game.undo();
            alpha = Math.max(alpha, bestMoveScore);
            if (beta <= alpha) {
                break
            }
        }
        updateTtable(hash, bestMoveScore, depth);
        return bestMoveScore;
    } 
    else {
        var bestMoveScore = Infinity;
        for (var i = 0; i < legalMoves.length; i++) {
            game.ugly_move(legalMoves[i]);
            bestMoveScore = Math.min(bestMoveScore, 
                minimax(game, depth - 1, alpha, beta, !isMaximisingPlayer));
            game.undo();
            beta = Math.min(beta, bestMoveScore);
            if (beta <= alpha) {

                break
            }
        }
        updateTtable(hash, bestMoveScore, depth);
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

// Values for Piece Square Table taken from https://www.chessprogramming.org/Simplified_Evaluation_Function
var pst = {
    'p': [
        [ 0,   0,   0,   0,   0,   0,   0,   0],
        [50,  50,  50,  50,  50,  50,  50,  50],
        [10,  10,  20,  30,  30,  20,  10,  10],
        [ 5,   5,  10,  25,  25,  10,   5,   5],
        [ 0,   0,   0,  20,  20,   0,   0,   0],
        [ 5, - 5, -10,   0,   0, -10, - 5,   5],
        [ 5,  10,  10, -20, -20,  10,  10,   5],
        [ 0,   0,   0,   0,   0,   0,   0,   0]
    ],
    
    'n': [
        [-50, -40, -30, -30, -30, -30, -40, -50],
        [-40, -20,   0,   0,   0,   0, -20, -40],
        [-30,   0,  10,  15,  15,  10,   0, -30],
        [-30,   5,  15,  20,  20,  15,   5, -30],
        [-30,   0,  15,  20,  20,  15,   0, -30],
        [-30,   5,  10,  15,  15,  10,   5, -30],
        [-40, -20,   0,   5,   5,   0, -20, -40],
        [-50, -40, -30, -30, -30, -30, -40, -50]
    ],

    'b': [
        [ -20, -10, -10, -10, -10, -10, -10, -20],
        [ -10,   0,   0,   0,   0,   0,   0, -10],
        [ -10,   0,   5,  10,  10,   5,   0, -10],
        [ -10,   5,   5,  10,  10,   5,   5, -10],
        [ -10,   0,  10,  10,  10,  10,   0, -10],
        [ -10,  10,  10,  10,  10,  10,  10, -10],
        [ -10,   5,   0,   0,   0,   0,   5, -10],
        [ -20, -10, -10, -10, -10, -10, -10, -20]
    ],

    'r': [
        [   0,   0,   0,   0,   0,   0,   0,   0],
        [   5,  10,  10,  10,  10,  10,  10,   5],
        [ - 5,   0,   0,   0,   0,   0,   0, - 5],
        [ - 5,   0,   0,   0,   0,   0,   0, - 5],
        [ - 5,   0,   0,   0,   0,   0,   0, - 5],
        [ - 5,   0,   0,   0,   0,   0,   0, - 5],
        [ - 5,   0,   0,   0,   0,   0,   0, - 5],
        [   0,    0,  0,   5,   5,   0,   0,   0]
    ],

    'q': [
        [ -20, -10, -10, - 5, - 5, -10, -10, -20],
        [ -10,   0,   0,   0,   0,   0,   0, -10],
        [ -10,   0,   5,   5,   5,   5,   0, -10],
        [ - 5,   0,   5,   5,   5,   5,   0, - 5],
        [   0,   0,   5,   5,   5,   5,   0, - 5],
        [ -10,   5,   5,   5,   5,   5,   0, -10],
        [ -10,   0,   5,   0,   0,   0,   0, -10],
        [ -20, -10, -10, - 5, - 5, -10, -10, -20]
    ],

    'k': [
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-20, -30, -30, -40, -40, -30, -30, -20],
        [-10, -20, -20, -20, -20, -20, -20, -10],
        [ 20,  20,   0,   0,   0,   0,  20,  20],
        [ 20,  30,  10,   0,   0,  10,  30,  20]
    ]
}

// Weights for pieces, same source as above
var weights = {
    'p': 100,
    'n': 320,
    'b': 330,
    'r': 500,
    'q': 900,
    'k':20000
}

var reverseArray = function(array) {
    return array.slice().reverse();
};

var getPieceValue = function (piece, x, y) {
    if (piece === null) {
        return 0;
    }
    return piece.color === 'w' ?  weights[piece.type] + pst[piece.type][y][x]:
            -(weights[piece.type] + reverseArray(pst[piece.type])[y][x])
};

// Game state and Board Visualization Configurations
var onDragStart = function (source, piece, position, orientation) {
    if (game.in_checkmate() === true || game.in_draw() === true ||
        piece.search(/^b/) !== -1) {
        return false;
    }
};

// Option to manually set fen position
$("#SetFen").click(function () {
	var fenStr = $("#fenIn").val();	
    console.log('Inputting: ', fenStr)
    game.reset();
	game.load(fenStr);		
    board.position(game.fen());
    console.log(game.turn())
    if (game.turn() === 'b') {
        setTimeout(() => {makeBestMove(); }, 1000);
    }
});

// makeBestMove is called by onDrop (after you make a move)
var makeBestMove = function () {
    var bestMove = getBestMove(game);
    game.ugly_move(bestMove);
    board.position(game.fen());
    renderMoveHistory(game.history());
    
    if (game.game_over()) {
        alert('Game over');
    }
};

// mmRoot called here, additional information variables such as positionCount, 
// performance computation and others are also handled here
var positionCount;
var hashedCount;
var getBestMove = function (game) {
    if (game.game_over()) {
        alert('Game over');
    }

    positionCount = 0;
    hashedCount = 0;
    var depth = parseInt($('#search-depth').find(':selected').text());

    var d = new Date().getTime();
    var [bestMove, bestMoveScore] = mmRoot(game, depth, true);
    var d2 = new Date().getTime();
    var moveTime = (d2 - d);
    var positionsPerS = ( positionCount * 1000 / moveTime);

    $('#position-count').text(positionCount);
    $('#hashed-count').text(hashedCount)
    $('#time').text(moveTime/1000 + 's');
    $('#positions-per-s').text(positionsPerS);
    $('#current-board-evaluation').text(evaluateBoard(game.board())/100)
    $('#ai-board-evaluation').text(-bestMoveScore/100)
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