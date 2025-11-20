import React from 'react';
import { usePlayerContext } from '../../../context/PlayerContext';
import { COLOR_MAP } from '../../../utils/constants';
import styles from './GameStatus.module.css';

/**
 * Game Status Component - Right panel showing current player
 * @param {Object} props
 * @param {string} props.currentPlayer - Current player color code ('R', 'G', 'B')
 */
const GameStatus = ({ currentPlayer }) => {
    const { players } = usePlayerContext();

    const colorName = COLOR_MAP[currentPlayer] || 'Unknown';
    const playerName = players[colorName] || 'Unknown';
    const colorClass = colorName ? colorName.toLowerCase() : 'unknown';

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Game Status</h2>
            <div className={styles.playerInfo}>
                <p className={styles.label}>Current Player:</p>
                <div className={styles.playerDisplay}>
                    <p className={styles.playerName}>{playerName}</p>
                    <span className={`${styles.kingIcon} ${styles[colorClass]}`}>
            ■
          </span>
                </div>
            </div>
        </div>
    );
};

export default GameStatus;