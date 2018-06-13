import React from 'react';
import Gameboard from './Gameboard';
import PlayX from './PlayX';
import PlayO from './PlayO';
import StationaryO from './StationaryO';
import StationaryX from './StationaryX';

export default class TicTacToe extends React.Component {
    state = {
        userWins: 0,
        compyWins: 0,
        difficultySelected: false,
        difficulty: '',
        tileSelected: false,
        playerTile: '',
        reset: false,
        gameover: false,
        playMessage: ''
    }

    gameOver = (winner) => {
        setTimeout(() => {
            if (winner === 'user') {
                this.setState((prevState) => ({
                    userWins: prevState.userWins + 1,
                    playMessage: 'Congratulations, you won!'
                }));
            } else if (winner === 'compy') {
                this.setState((prevState) => ({
                    compyWins: prevState.compyWins + 1,
                    playMessage: 'Tough luck, computer won!'
                }));
            } else {
                this.setState((prevState) => ({
                    playMessage: 'Tough luck, tie game!'
                }));
            }
            setTimeout(() => {
                this.setState(() => ({ gameover: true }));
            }, 2000);
        }, 25); // force this setState to not combine with those being called in <Gameboard />
    }

    displayPlayMessage = (player) => {
        let playMessage;
        if (player === 'user') {
            playMessage = 'Your turn!'
        } else {
            playMessage = "Computer's turn!"
        }
        this.setState(() => ({ playMessage }));
    }

    playAgain = () => {
        this.setState(() => ({ reset: true }));
        setTimeout(() => {
            this.setState(() => ({
                reset: false,
                gameover: false,
                playMessage: ''
            }));
        }, 5);
    }

    setDifficulty = (difficulty) => {
        this.setState(() => ({ 
            difficulty,
            difficultySelected: true,
        }));
    }

    setPlayerTile = (tile) => {
        this.setState(() => ({
            playerTile: tile,
            tileSelected: true
        }))
    }

    render() {
        return (
            <div id='container'>
                <div id='title'>Tic Tac Toe</div>
                { (this.state.difficultySelected && this.state.tileSelected) && 
                    <div id='gameplay'>
                        <div id='header'>
                            <div id='user-score'>You: {this.state.userWins}</div>
                            <div id='compy-score'>Computer: {this.state.compyWins}</div>
                        </div>
                        <div id='play'>
                            { this.state.playMessage }
                        </div>
                        <Gameboard
                            gameOver={this.gameOver}
                            reset={this.state.reset}
                            difficulty={this.state.difficulty}
                            playerTile={this.state.playerTile}
                            displayPlayMessage={this.displayPlayMessage}
                        />
                    </div>
                }
                { !this.state.difficultySelected && 
                    <div id='difficulty'>
                        <div id='play-easy' onClick={() => {this.setDifficulty('easy')}}>Easy</div>
                        <div id='play-medium' onClick={() => {this.setDifficulty('medium') }}>Medium</div>
                        <div id='play-nowin' onClick={() => {this.setDifficulty('nowin') }}>Unbeatable</div>
                        <div id='play-impossible' onClick={() => {this.setDifficulty('impossible') }}>Impossible</div>
                    </div>
                }
                { (!this.state.tileSelected && this.state.difficultySelected) && 
                    <div id='player-tile'>
                        <div className='select-tile' onClick={() => { this.setPlayerTile('X') }}>
                            <StationaryX />
                        </div>
                        <div className='select-tile' onClick={() => { this.setPlayerTile('O') }}>
                            <StationaryO />
                        </div>
                    </div>
                }
                {this.state.gameover &&
                    <div id='play-again' onClick={() => { this.playAgain() }}>
                        Play again
                    </div>
                }
            </div>
        );
    }
}