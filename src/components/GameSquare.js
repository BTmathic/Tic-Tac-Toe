import React from 'react';
import PlayO from './PlayO';
import PlayX from './PlayX';

export default class GameSquare extends React.Component {
    state = {
        tileOccupied: false,
        tile: ''
    }

    makePlay = () => {
        if (!this.state.tileOccupied && !this.props.gameOver) {
            this.props.makePlay(this.props.position[0], this.props.position[1], this.props.tile);
            const tile = this.props.tile === 'X' ? <PlayX title={'Square in row ' + this.props.position[0] + ' and column ' + this.props.position[1]} /> : <PlayO title={'Square in row ' + this.props.position[0] + ' and column ' + this.props.position[1]} />
            this.setState(() => ({
                tileOccupied: true,
                tile
            }));
        }
    }

    render() {
        return (
            <div className='game-square-click' onClick={() => { this.makePlay() }}>
                {this.state.tile}
            </div>
        );
    }
}