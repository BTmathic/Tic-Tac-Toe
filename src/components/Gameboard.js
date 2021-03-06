import React from 'react';
import PlayX from './PlayX';
import PlayO from './PlayO';
import StationaryX from './StationaryX';
import StationaryO from './StationaryO';

export default class Gameboard extends React.Component {
    state = {
        game: [[null, null, null], [null, null, null], [null, null, null]],
        board: [[null, null, null], [null, null, null], [null, null, null]],
        turn: '',
        user: '', // user is asked if they want to be X or O
        gameOver: false,
        timeDelay: 1250 // wouldn't be fun if the computer played instantly...
    }

    makePlay = (x, y, tile) => {
        const nextTurn = this.state.turn === 'O' ? 'X' : 'O';
        if (!this.state.gameOver && this.props.difficulty) {
            let currentGame = this.state.game;
            currentGame[x][y] = this.state.turn;
            let currentBoard = this.state.board;
            if (this.state.turn === 'X') {
                currentBoard[x][y] = <PlayX />;
                setTimeout(() => {
                    currentBoard[x][y] = <StationaryX />;
                }, 700);
            } else {
                currentBoard[x][y] = <PlayO />;
                setTimeout(() => {
                    currentBoard[x][y] = <StationaryO />;
                }, 700);
                
            }
            this.setState(() => ({
                game: currentGame,
                board: currentBoard,
                turn: nextTurn
            }));
            setTimeout(() => {
                this.setState(() => ({
                    board: currentBoard,
                }));
            }, 700);
            const gameOver = this.checkGameOver();
            if (gameOver[0]) {
                this.setState(() => ({
                    gameOver: true
                }));
                if (this.state.user === gameOver[1]) {
                    this.props.gameOver('user');
                } else if (gameOver[1] === 'tie') {
                    this.props.gameOver('tie');
                } else {
                    this.props.gameOver('compy');
                }
            } else {
                if (nextTurn !== this.state.user) {
                    this.props.displayPlayMessage('computer');
                    if (this.props.difficulty === 'easy') {
                        setTimeout(() => { this.easyCompyPlay() }, this.state.timeDelay);
                    } else if (this.props.difficulty === 'medium' || this.props.difficulty === 'impossible') {
                        setTimeout(() => { this.mediumCompyPlay() }, this.state.timeDelay);
                    } else {
                        setTimeout(() => { this.nowinCompyPlay() }, this.state.timeDelay);
                    }
                }
            }
        }
    }

    userPlay = (x, y, tile) => {
        if (this.state.turn === this.state.user) {
            let board = this.state.board;
            if (board[x][y] === null) {
                this.makePlay(x, y, tile);
            }
        }
    }

    checkForWin = (tile) => {
        let currentGame = this.state.game;
        for (let i=0; i < 3; i++) {
            for (let j=0; j < 3; j++) {
                if (!currentGame[i][j]) {
                    currentGame[i][j] = tile;
                    const winningMove = this.checkPlayerWin(currentGame, tile);
                    if (winningMove) {
                        return [i,j];
                    } else {
                        currentGame[i][j] = null;
                    }
                }
            }
        }
    }

    /*
    ** Easy difficulty is without any strategy, simply pick a tile at random
    ** and play if available. Keep picking until a move has been made
    */
    easyCompyPlay = () => {
        let compyPlayed = false;
        while (!compyPlayed) {
            const x = Math.floor(3*Math.random());
            const y = Math.floor(3*Math.random());
            if (!this.state.game[x][y]) {
                this.makePlay(x,y, this.state.turn);
                compyPlayed = true;
            }
        }
        this.props.displayPlayMessage('user');
    }
    
    /*
    ** Medium difficulty is only slightly strategy based. The computer
    ** first searches for a winning move and takes one if found. If no
    ** winning move exists, see if the user can win next turn and block
    ** such a turn if found. If neither of these moves exist, just play
    ** randomly like easy difficulty
    */
    mediumCompyPlay = () => {
        let compyPlayed = false;
        while (!compyPlayed) {
            const winningSpot = this.checkForWin(this.state.turn);
            if (!!winningSpot) {
                compyPlayed = true;
                this.makePlay(winningSpot[0], winningSpot[1], this.state.turn);
            } else {
                const counterWinSpot = this.checkForWin(this.state.user);
                if (!!counterWinSpot) {
                    compyPlayed = true;
                    this.makePlay(counterWinSpot[0], counterWinSpot[1], this.state.turn);
                } else {
                    compyPlayed = true;
                    this.easyCompyPlay();
                }
            }
        }
        this.props.displayPlayMessage('user');
    }

    /*
    ** Using the minimax algorithm the computer can always make a 'best'
    ** move possible, which will eventually result in a win if the user
    ** is not careful, or a stalement. This is the most boring as the user
    ** can never win, but algorithmically/strategically the most interesting
    ** We outline the strategy with short comments, for more details see, e.g.,
    ** https://en.wikipedia.org/wiki/Tic-tac-toe#Strategy
    */
    nowinCompyPlay = () => {
        let game = this.state.game;
        let compyPlayed = false;
        let tileToPlay = null;
        while (!compyPlayed) {
            // if there is a winning move, take it
            tileToPlay = this.checkForWin(this.state.turn);
            if (!tileToPlay) {
                // search for and block a move that allows the user to win next turn
                tileToPlay = this.checkForWin(this.props.playerTile);
            }
            if (!tileToPlay) {
                // search for forks to play
                tileToPlay = this.searchForForks(this.state.turn);
            }
            if (!tileToPlay) {
                // search for and block a move that would allow to create a fork next turn
                tileToPlay = this.searchForForks(this.props.playerTile);
            }
            if (!tileToPlay) {
                // if available, take the center square
                if (game[1][1] === null) {
                    tileToPlay = [1,1];
                }
            }
            if (!tileToPlay) {
                // if there is a corner available opposite a user held corner, take it
                if (game[0][0] === this.props.playerTile && game[2][2] === null) {
                    tileToPlay = [2,2];
                } else if (game[2][2] === this.props.playerTile && game[0][0] === null) {
                    tileToPlay = [0, 0];
                } else if (game[2][0] === this.props.playerTile && game[0][2] === null) {
                    tileToPlay = [0, 2];
                } else if (game[0][2] === this.props.playerTile && game[2][0] === null) {
                    tileToPlay = [2, 0];
                }
            }
            if (!tileToPlay) {
                // if there is an open corner, take it
                if (game[0][0] === null) {
                    tileToPlay = [0,0];
                } else if (game[2][0] === null) {
                    tileToPlay = [2, 0];
                } else if (game[0][2] === null) {
                    tileToPlay = [0, 2];
                } else if (game[2][2] === null) {
                    tileToPlay = [2, 2];
                }
            }
            if (!tileToPlay) {
                // if nothing has been selected yet there are only empty sides, pick any
                if (game[1][0] === null) {
                    tileToPlay = [1, 0];
                } else if (game[0][1] === null) {
                    tileToPlay = [0, 1];
                } else if (game[1][2] === null) {
                    tileToPlay = [1, 2];
                } else if (game[2][1] === null) {
                    tileToPlay = [2, 1];
                }
            }

            compyPlayed = true;
            this.makePlay(tileToPlay[0], tileToPlay[1], this.state.turn);
            this.props.displayPlayMessage('user');
        }
    }

    searchForForks = (tile) => {
        let tileToPlay = null;
        let game = this.state.game;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (game[i][j] === null && !tileToPlay) {
                    game[i][j] = this.state.turn;
                    const winningSpot = this.checkForWin(this.state.turn);
                    if (!!winningSpot) {
                        game[winningSpot[0]][winningSpot[1]] = this.props.playerTile;
                        const secondWinningSpot = this.checkForWin(this.state.turn);
                        if (!!secondWinningSpot) {
                            tileToPlay = [i, j];
                        }
                        game[winningSpot[0]][winningSpot[1]] = null;
                    }
                    game[i][j] = null;
                }
            }
        }
        return tileToPlay;
    }

    checkGameOver = () => {
        // since there are so few ways to win we simply check each
        if (this.checkPlayerWin(this.state.game, 'X')) {
            return [true, 'X'];
        } else if (this.checkPlayerWin(this.state.game, 'O')) {
            return [true, 'O'];
        } else if (this.isBoardFull()) {
            return [true, 'tie'];
        }
        return [false]
    }

    isBoardFull = () => {
        let game = this.state.game;
        if (game[0].indexOf(null) === -1 && game[1].indexOf(null) === -1 && game[2].indexOf(null) === -1) {
            return true;
        }
        return false;
    }

    checkPlayerWin = (gameboard, tile) => {
        if ((gameboard[0][0] === tile && gameboard[0][1] === tile && gameboard[0][2] === tile) ||
            (gameboard[1][0] === tile && gameboard[1][1] === tile && gameboard[1][2] === tile) ||
            (gameboard[2][0] === tile && gameboard[2][1] === tile && gameboard[2][2] === tile) ||
            (gameboard[0][0] === tile && gameboard[1][0] === tile && gameboard[2][0] === tile) ||
            (gameboard[0][1] === tile && gameboard[1][1] === tile && gameboard[2][1] === tile) ||
            (gameboard[0][2] === tile && gameboard[1][2] === tile && gameboard[2][2] === tile) ||
            (gameboard[0][0] === tile && gameboard[1][1] === tile && gameboard[2][2] === tile) ||
            (gameboard[0][2] === tile && gameboard[1][1] === tile && gameboard[2][0] === tile)) {
                return true;
            }
            return false;
    }

    loadImpossibleBoard = () => {
        let compySquare, compyTile, userSquare;

        if (this.props.playerTile === 'X') {
            compySquare = <PlayO />;
            compyTile = 'O';
            userSquare = <PlayX />
        } else {
            compySquare = <PlayX />
            compyTile = 'X';
            userSquare = <PlayO />
        }
        let game = this.state.game;
        let board = this.state.board;

        game[0][0] = this.props.playerTile;
        board[0][0] = userSquare;
        game[1][2] = this.props.playerTile;
        board[1][2] = userSquare;

        game[0][2] = compyTile;
        game[1][1] = compyTile;
        game[2][1] = compyTile;
        board[0][2] = compySquare;
        board[1][1] = compySquare;
        board[2][1] = compySquare;

        this.setState(() => {
            board,
            game
        });
    }

    initializeGame = () => {
        let whoStarts = Math.random() < 0.5 ? 'X' : 'O';
        if (this.props.difficulty === 'impossible') {
            // To ensure maximum degree of suffering we always force the player
            // to go first to really think about how impossible this difficulty is
            whoStarts = this.props.playerTile;
            // To make the no win mode seem a little less dire, we also have this
            // impossible mode where the board is pre-filled to ensure the user cannot win
            this.loadImpossibleBoard();
        }

        if (whoStarts === this.props.playerTile) {
            this.props.displayPlayMessage('user');
        } else {
            this.props.displayPlayMessage('computer');
        }

        this.setState(() => ({
            user: this.props.playerTile,
            turn: whoStarts
        }));

        if (whoStarts !== this.props.playerTile) {
            if (this.props.difficulty === 'easy') {
                setTimeout(() => { this.easyCompyPlay() }, this.state.timeDelay);
            } else if (this.props.difficulty === 'medium') {
                setTimeout(() => { this.mediumCompyPlay() }, this.state.timeDelay);
            } else {
                setTimeout(() => { this.nowinCompyPlay() }, this.state.timeDelay);
            }
        }
    }

    componentDidMount() {
        this.initializeGame();
    }

    componentWillReceiveProps(props) {
        if (props.reset) {
            const newGame = [[null, null, null], [null, null, null], [null, null, null]];
            const newBoard = [[null, null, null], [null, null, null], [null, null, null]];
            this.setState(() => ({
                game: newGame,
                board: newBoard,
                gameOver: false
            }));
            setTimeout(() => {
                this.initializeGame();
            }, 25); // force the setState in initializeGame to occur after the reset here
        }
    }

    render() {
        return (
            <div id='gameboard'>
                <div className='gameboard-row gameboard-row-bottom'>
                    <div id='top-left' className='game-square gameboard-right'
                        onClick={() => {this.userPlay(0,0)}}>
                        { this.state.board[0][0] }
                    </div>
                    <div id='top-middle' className='game-square gameboard-right'
                        onClick={() => { this.userPlay(0, 1) }}>
                        {this.state.board[0][1] }
                    </div>
                    <div id='top-right' className='game-square'
                        onClick={() => { this.userPlay(0, 2) }}>
                        {this.state.board[0][2] }
                    </div>
                </div>
                <div className='gameboard-row gameboard-row-bottom'>
                    <div id='mid-left' className='game-square gameboard-right'
                        onClick={() => { this.userPlay(1, 0) }}>
                        {this.state.board[1][0] }
                    </div>
                    <div className='game-square gameboard-right'
                        onClick={() => { this.userPlay(1, 1) }}>
                        {this.state.board[1][1] }
                    </div>
                    <div id='mid-right' className='game-square'
                        onClick={() => { this.userPlay(1, 2) }}>
                        {this.state.board[1][2] }
                    </div>
                </div>
                <div className='gameboard-row'>
                    <div id='bot-left' className='game-square gameboard-right'
                        onClick={() => { this.userPlay(2, 0) }}>
                        {this.state.board[2][0] }
                    </div>
                    <div id='bot-middle' className='game-square gameboard-right'
                        onClick={() => { this.userPlay(2, 1) }}>
                        {this.state.board[2][1] }
                    </div>
                    <div id='bot-right' className='game-square'
                        onClick={() => { this.userPlay(2, 2) }}>
                        {this.state.board[2][2] }
                    </div>
                </div>
            </div>
        );
    }
}