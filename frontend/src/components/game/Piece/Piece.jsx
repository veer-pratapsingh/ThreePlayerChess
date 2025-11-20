import React from 'react';
import { PIECE_MAP, COLOR_MAP } from '../../../utils/constants';
import { useTheme } from '../../../hooks/useTheme';
import styles from './Piece.module.css';

/**
 * Piece Component - Renders a chess piece on the board
 * @param {Object} props
 * @param {string} props.polygonId - ID of the polygon where piece is located
 * @param {string} props.pieceCode - Two character code (e.g., "BR" = Blue Rook)
 * @param {string} props.points - Polygon points to calculate center position
 */
const Piece = ({ polygonId, pieceCode, points }) => {
    const { currentTheme } = useTheme();

    if (!pieceCode || pieceCode.length < 2) return null;

    const colorCode = pieceCode[0]; // R, G, or B
    const pieceType = pieceCode[1]; // R, N, B, Q, K, P, J, W

    const colorName = COLOR_MAP[colorCode];
    const pieceSymbol = PIECE_MAP[pieceType] || '?';

    const { x, y } = getPolygonCenter(points);

    const pieceClasses = [
        styles.piece,
        styles[colorName.toLowerCase()],
        styles[currentTheme],
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <text
            x={x}
            y={y}
            className={pieceClasses}
            textAnchor="middle"
            dominantBaseline="middle"
        >
            {pieceSymbol}
        </text>
    );
};

/**
 * Helper function to calculate polygon center from points string
 */
const getPolygonCenter = (pointsString) => {
    const points = pointsString.split(' ');
    if (points.length < 3) return { x: 0, y: 0 };

    const firstPoint = points[0].split(',');
    const thirdPoint = points[2].split(',');

    const x = (parseFloat(firstPoint[0]) + parseFloat(thirdPoint[0])) / 2;
    const y = (parseFloat(firstPoint[1]) + parseFloat(thirdPoint[1])) / 2;

    return { x, y };
};

export default Piece;