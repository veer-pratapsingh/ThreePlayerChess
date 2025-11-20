import React from 'react';
import { useTheme } from '../../../hooks/useTheme';
import { THEME_OPTIONS } from '../../../utils/constants';
import styles from './ThemeSelector.module.css';

/**
 * Theme Selector Component - Left panel for selecting piece fonts
 */
const ThemeSelector = () => {
    const { currentTheme, changeTheme } = useTheme();

    const handleThemeChange = (e) => {
        changeTheme(e.target.value);
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Themes</h2>
            <form className={styles.form}>
                {THEME_OPTIONS.map((theme) => (
                    <div key={theme.id} className={styles.radioGroup}>
                        <input
                            type="radio"
                            id={theme.id}
                            name="theme"
                            value={theme.value}
                            checked={currentTheme === theme.value}
                            onChange={handleThemeChange}
                            className={styles.radio}
                        />
                        <label htmlFor={theme.id} className={styles.label}>
                            {theme.label}
                        </label>
                    </div>
                ))}
            </form>
        </div>
    );
};

export default ThemeSelector;