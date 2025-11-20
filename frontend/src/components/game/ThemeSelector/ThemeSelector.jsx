import React, { useState } from 'react';
import styles from './ThemeSelector.module.css';

/**
 * Theme Selector Component - Left panel for selecting board colors
 */
const ThemeSelector = () => {
    const [selectedTheme, setSelectedTheme] = useState('classic');

    const boardThemes = [
        { id: 'classic', name: 'Classic', light: '#f5f5dc', dark: '#deb887' },
        { id: 'brown', name: 'Brown', light: '#f0d9b5', dark: '#b58863' },
        { id: 'blue', name: 'Blue', light: '#dee3e6', dark: '#8ca2ad' },
        { id: 'green', name: 'Green', light: '#ffffdd', dark: '#86a666' }
    ];

    const handleThemeChange = (theme) => {
        setSelectedTheme(theme.id);
        document.documentElement.style.setProperty('--board-light', theme.light);
        document.documentElement.style.setProperty('--board-dark', theme.dark);
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Board Colors</h2>
            <div className={styles.themeGrid}>
                {boardThemes.map((theme) => (
                    <div 
                        key={theme.id} 
                        className={`${styles.themeOption} ${selectedTheme === theme.id ? styles.selected : ''}`}
                        onClick={() => handleThemeChange(theme)}
                    >
                        <div className={styles.colorPreview}>
                            <div className={styles.lightSquare} style={{ backgroundColor: theme.light }}></div>
                            <div className={styles.darkSquare} style={{ backgroundColor: theme.dark }}></div>
                        </div>
                        <span className={styles.themeName}>{theme.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ThemeSelector;