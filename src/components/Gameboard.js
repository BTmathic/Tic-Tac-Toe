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
        user: '', // ask user if they want to be X or O
        gameOver: false
    }

    makePlay = (x, y, tile) => {
        const nextTurn = this.state.turn === 'O' ? 'X' : 'O';
        if (!this.state.gameOver && this.props.difficulty) {
            let currentGame = this.state.game;
            currentGame[x][y] = this.state.turn;
            let currentBoard = this.state.board;
            if (this.state.turn === 'X') {
                currentBoard[x][y] = <PlayX />;
            } else {
                currentBoard[x][y] = <PlayO />;
            }
            this.setState(() => ({
                game: currentGame,
                board: currentBoard,
                turn: nextTurn
            }));
            const gameOver = this.checkGameOver();
            if (gameOver[0]) {
                // add a win/lose message
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
                    // compy turn
                    if (this.props.difficulty === 'easy') {
                        setTimeout(() => { this.easyCompyPlay() }, 1000);
                    } else if (this.props.difficulty === 'medium') {
                        setTimeout(() => { this.mediumCompyPlay() }, 1000);
                    }
                }
            }
        }
    }

    checkForWin = (tile) => {
        let currentGame = this.state.game;
        let currentBoard = this.state.board;
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

    /* Easy difficulty is without any strategy, simply pick a tile at random
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
    }
    
    /* Medium difficulty is only slightly strategy based. The computer
    ** first searches for a winning move and takes one if found. If no
    ** winning move exists, see if the user can win next turn and block
    ** such a turn if found. If neither of these moves exist, just play
    ** randomly like easy difficulty
    */
    mediumCompyPlay = () => {
        console.log('dur');
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
    }

    /* Using the minimax algorithm the computer can always make a 'best'
    ** move possible, which will eventually result in a win if the user
    ** is not careful, or a stalement. This is the most boring as the user
    ** can never win, but algorithmically/strategically the most interesting
    */
    nowinCompyPlay = () => {
        easyCompyPlay();
    }

    /* To make the no win mode seem a little less dire, we also have this
    ** impossible mode where the board is pre-filled to ensure the user
    ** always loses. Why not?
    */
    impossibleCompyPlay = () => {
        easyCompytPlay();
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
        //console.log('dur');
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

    componentDidMount() {
        const whoStarts = Math.random() < 0.5 ? 'X' : 'O';
        this.setState(() => ({
            user: this.props.playerTile,
            turn: whoStarts
        }));
        console.log(whoStarts, this.props.playerTile);
        if (whoStarts !== this.props.playerTile) {
            if (this.props.difficulty === 'easy') {
                setTimeout(() => { this.easyCompyPlay() }, 1000);
            } else if (this.props.difficulty === 'medium') {
                setTimeout(() => { this.mediumCompyPlay() }, 1000);
            }
        }
        // make a message about whether you or compy go first
        // Then if compy, make compy go
    }

    componentWillReceiveProps(props) {
        if (!props.reset) {
            const newGame = [[null, null, null], [null, null, null], [null, null, null]];
            const newBoard = [[null, null, null], [null, null, null], [null, null, null]];
            const whoStarts = Math.random() < 0.5 ? 'X' : 'O';
            this.setState(() => ({
                game: newGame,
                board: newBoard,
                user: this.props.playerTile,
                turn: whoStarts,
                gameOver: false
            }));
        }
    }

    render() {
        return (
            <div id='gameboard'>
                <div className='gameboard-row gameboard-row-bottom'>
                    <div id='top-left' className='game-square gameboard-right'
                        onClick={() => {this.makePlay(0,0)}}>
                        { this.state.board[0][0] }
                    </div>
                    <div id='top-middle' className='game-square gameboard-right'
                        onClick={() => { this.makePlay(0, 1) }}>
                        {this.state.board[0][1] }
                    </div>
                    <div id='top-right' className='game-square'
                        onClick={() => { this.makePlay(0, 2) }}>
                        {this.state.board[0][2] }
                    </div>
                </div>
                <div className='gameboard-row gameboard-row-bottom'>
                    <div id='mid-left' className='game-square gameboard-right'
                        onClick={() => { this.makePlay(1, 0) }}>
                        {this.state.board[1][0] }
                    </div>
                    <div className='game-square gameboard-right'
                        onClick={() => { this.makePlay(1, 1) }}>
                        {this.state.board[1][1] }
                    </div>
                    <div id='mid-right' className='game-square'
                        onClick={() => { this.makePlay(1, 2) }}>
                        {this.state.board[1][2] }
                    </div>
                </div>
                <div className='gameboard-row'>
                    <div id='bot-left' className='game-square gameboard-right'
                        onClick={() => { this.makePlay(2, 0) }}>
                        {this.state.board[2][0] }
                    </div>
                    <div id='bot-middle' className='game-square gameboard-right'
                        onClick={() => { this.makePlay(2, 1) }}>
                        {this.state.board[2][1] }
                    </div>
                    <div id='bot-right' className='game-square'
                        onClick={() => { this.makePlay(2, 2) }}>
                        {this.state.board[2][2] }
                    </div>
                </div>
            </div>
        );
    }
}