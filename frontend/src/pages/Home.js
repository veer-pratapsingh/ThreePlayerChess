import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameService } from '../services/gameService';
import '../styles/index.css';

const Home = () => {
  const [players, setPlayers] = useState({ pl1: '', pl2: '', pl3: '' });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setPlayers({ ...players, [e.target.id]: e.target.value });
  };

  const isFormValid = () => {
    return players.pl1 !== '' && players.pl2 !== '' && players.pl3 !== '';
  };

  const handleNewGame = async () => {
    try {
      localStorage.setItem('Blue', players.pl1);
      localStorage.setItem('Green', players.pl2);
      localStorage.setItem('Red', players.pl3);

      await gameService.newGame();
      navigate('/game');
    } catch (error) {
      console.error('Error starting new game:', error);
    }
  };

  return (
    <div>
      <h1>Welcome to 3 player chess!</h1>
      <div id="newgame">
        <div>
          <label htmlFor="pl1">Blue Player</label>
          <input 
            id="pl1" 
            type="text" 
            placeholder="Player 1" 
            value={players.pl1}
            onChange={handleInputChange}
          />
          <span id="blueKing">♔</span>
        </div>
        <div>
          <label htmlFor="pl2">Green Player</label>
          <input 
            id="pl2" 
            type="text" 
            placeholder="Player 2" 
            value={players.pl2}
            onChange={handleInputChange}
          />
          <span id="greenKing">♔</span>
        </div>
        <div>
          <label htmlFor="pl3">Red Player</label>
          <input 
            id="pl3" 
            type="text" 
            placeholder="Player 3" 
            value={players.pl3}
            onChange={handleInputChange}
          />
          <span id="redKing">♔</span>
        </div>
        <button 
          id="newgamebtn" 
          onClick={handleNewGame} 
          disabled={!isFormValid()}
        >
          New Game
        </button>
      </div>
    </div>
  );
};

export default Home;