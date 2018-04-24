import React from 'react';
import ReactDOM from 'react-dom';
import TicTacToe from './components/TicTacToe';

import 'normalize.css/normalize.css'; // reset all browser conventions
import './styles/styles.scss';

ReactDOM.render(<TicTacToe />, document.getElementById('app'));