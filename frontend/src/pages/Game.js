import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameBoard from '../components/GameBoard';
import { gameService } from '../services/gameService';
import '../styles/game.css';

const Game = () => {
  const [boardData, setBoardData] = useState({});
  const [highlightedPolygons, setHighlightedPolygons] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('');
  const [theme, setTheme] = useState('arialTheme');
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState('');
  const navigate = useNavigate();

  const colorMap = { 'R': 'Red', 'G': 'Green', 'B': 'Blue' };

  useEffect(() => {
    loadInitialGameState();
  }, []);

  const loadInitialGameState = async () => {
    try {
      const boardResponse = await gameService.getBoard();
      setBoardData(boardResponse.data);
      
      const playerResponse = await gameService.getCurrentPlayer();
      setCurrentPlayer(playerResponse.data);
    } catch (error) {
      console.error('Error loading game state:', error);
    }
  };

  const handlePolygonClick = async (polygonId) => {
    try {
      const response = await gameService.onClick(polygonId);
      const data = response.data;
      
      setBoardData(data.board || {});
      setHighlightedPolygons(data.highlightedPolygons || []);
      
      if (data.gameOver) {
        setGameOver(true);
        setWinner(data.winner);
      }
      
      // Update current player
      const playerResponse = await gameService.getCurrentPlayer();
      setCurrentPlayer(playerResponse.data);
    } catch (error) {
      console.error('Error handling polygon click:', error);
    }
  };

  const handleThemeChange = (themeName) => {
    setTheme(themeName);
  };

  const handleNewGame = () => {
    navigate('/');
  };

  const closePopup = () => {
    setGameOver(false);
  };

  const getCurrentPlayerName = () => {
    const colourName = colorMap[currentPlayer];
    return localStorage.getItem(colourName) || '';
  };

  const getWinnerName = () => {
    const colourName = colorMap[winner];
    return localStorage.getItem(colourName) || '';
  };

  return (
    <div className="gameview">
      <div className="leftpane">
        <h2 style={{ textAlign: 'center' }}>Themes</h2>
        <form>
          <input 
            type="radio" 
            name="font" 
            id="arialTheme" 
            checked={theme === 'arialTheme'}
            onChange={() => handleThemeChange('arialTheme')}
          />
          <label htmlFor="arialTheme">Arial</label><br />

          <input 
            type="radio" 
            name="font" 
            id="freeSerifTheme" 
            checked={theme === 'freeSerifTheme'}
            onChange={() => handleThemeChange('freeSerifTheme')}
          />
          <label htmlFor="freeSerifTheme">Free Serif</label><br />

          <input 
            type="radio" 
            name="font" 
            id="dejaVuSansTheme" 
            checked={theme === 'dejaVuSansTheme'}
            onChange={() => handleThemeChange('dejaVuSansTheme')}
          />
          <label htmlFor="dejaVuSansTheme">Dejavu Sans</label><br />
        </form>
      </div>

      <div className="middlepane">
        <h1 style={{ textAlign: 'center' }}>Three Player Chess Application</h1>
        
        {gameOver && (
          <div className="popup" style={{ display: 'block' }}>
            <h2>Game Over</h2>
            <p>{getWinnerName()} ({colorMap[winner]}) has won the Game!</p>
            <button onClick={handleNewGame}>New Game</button>
            <button onClick={closePopup}>Close</button>
          </div>
        )}

        <GameBoard 
          onPolygonClick={handlePolygonClick}
          boardData={boardData}
          highlightedPolygons={highlightedPolygons}
          theme={theme}
        />
      </div>

      <div className="rightpane">
        <h2 style={{ textAlign: 'center' }}>Game Status</h2>
        <p style={{ display: 'inline-block', marginRight: '10px' }}>Current Player:</p>
        <p style={{ textAlign: 'center', display: 'inline-block' }}>
          {getCurrentPlayerName()}
        </p>
        <p 
          style={{ 
            textAlign: 'center', 
            display: 'inline-block',
            color: colorMap[currentPlayer] || 'black'
          }}
        >
          ⬤
        </p>
      </div>
    </div>
  );
};

export default Game;