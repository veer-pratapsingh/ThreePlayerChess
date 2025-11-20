import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChessBoard from '../../components/game/ChessBoard/ChessBoard';
import ThemeSelector from '../../components/game/ThemeSelector/ThemeSelector';
import GameStatus from '../../components/game/GameStatus/GameStatus';
import GameOverModal from '../../components/game/GameOverModal/GameOverModal';
import { useGameState } from '../../hooks/useGameState';
import { usePlayerContext } from '../../context/PlayerContext';
import { useGameContext } from '../../context/GameContext';
import styles from './GamePage.module.css';

/**
 * Game Page Component - Main game interface with three-panel layout
 */
const GamePage = () => {
    const navigate = useNavigate();
    const { areAllPlayersSet } = usePlayerContext();
    const { gameOver, winner } = useGameContext();
    const { currentPlayer, error } = useGameState();

    // Redirect to landing page if players are not set
    useEffect(() => {
        if (!areAllPlayersSet()) {
            navigate('/');
        }
    }, [areAllPlayersSet, navigate]);

    // Initialize game on mount - removed to prevent infinite loop

    // Handle API errors
    useEffect(() => {
        if (error) {
            alert(`Game Error: ${error}. Please restart the game.`);
        }
    }, [error]);

    const handleCloseGameOver = () => {
        // Just close the modal, allow users to review the final board state
    };

    return (
        <div className={styles.container}>
            {/* Left Panel - Theme Selector */}
            <div className={styles.leftPanel}>
                <ThemeSelector />
            </div>

            {/* Middle Panel - Chess Board */}
            <div className={styles.middlePanel}>
                <h1 className={styles.title}>Three Player Chess Application</h1>
                <div className={styles.boardWrapper}>
                    <ChessBoard />
                </div>
            </div>

            {/* Right Panel - Game Status */}
            <div className={styles.rightPanel}>
                <GameStatus currentPlayer={currentPlayer} />
            </div>

            {/* Game Over Modal */}
            <GameOverModal
                isOpen={gameOver}
                winner={winner}
                onClose={handleCloseGameOver}
            />
        </div>
    );
};

export default GamePage;