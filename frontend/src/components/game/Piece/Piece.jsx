import React from 'react';
import styles from './Piece.module.css';

/**
 * Piece Component - Renders a chess piece on the board
 * @param {Object} props
 * @param {string} props.polygonId - ID of the polygon where piece is located
 * @param {string} props.pieceCode - Two character code (e.g., "BR" = Blue Rook)
 * @param {string} props.points - Polygon points to calculate center position
 */
const Piece = ({ polygonId, pieceCode, points }) => {
    if (!pieceCode || pieceCode.length < 2) return null;

    const colorCode = pieceCode[0]; // R, G, or B
    const pieceType = pieceCode[1]; // R, N, B, Q, K, P, J, W
    
    console.log('Rendering piece:', { polygonId, pieceCode, colorCode, pieceType });

    const { x, y } = getPolygonCenter(points);
    const imageSrc = getPieceImage(colorCode, pieceType);

    if (!imageSrc) return null;

    return (
        <image
            x={x - 20}
            y={y - 20}
            width="40"
            height="40"
            href={imageSrc}
            className={styles.piece}
        />
    );
};

/**
 * Helper function to get piece image path
 */
const getPieceImage = (colorCode, pieceType) => {
    const colorMap = { 'R': 'w', 'G': 'g', 'B': 'b' };
    const pieceMap = { 'R': 'rook', 'N': 'knight', 'B': 'bishop', 'Q': 'queen', 'K': 'king', 'P': 'pawn' };
    
    const color = colorMap[colorCode];
    const piece = pieceMap[pieceType];
    
    console.log('Piece mapping:', { colorCode, pieceType, color, piece });
    
    if (!color || !piece) {
        console.log('Missing mapping for:', { colorCode, pieceType });
        return null;
    }
    
    try {
        return require(`../../../images/${piece}-${color}.png`);
    } catch (error) {
        console.error('Failed to load image:', `${piece}-${color}.png`, error);
        return null;
    }
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