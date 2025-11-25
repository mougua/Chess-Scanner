import React, { useState, useEffect } from 'react';
import { BoardState, Piece, PieceColor, EditMode } from '../types';
import { PieceIcon } from './PieceIcon';
import { getSquareName } from '../utils/chessLogic';

interface ChessBoardProps {
  board: BoardState;
  isFlipped: boolean;
  editMode: EditMode;
  selectedPieceForPlacement: Piece | null;
  onBoardChange: (newBoard: BoardState) => void;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  isFlipped,
  editMode,
  selectedPieceForPlacement,
  onBoardChange,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);

  // Reset selection if mode changes
  useEffect(() => {
    setSelectedSquare(null);
  }, [editMode]);

  const handleSquareClick = (index: number) => {
    if (editMode === EditMode.PLACE) {
      if (selectedPieceForPlacement) {
        const newBoard = [...board];
        newBoard[index] = { ...selectedPieceForPlacement };
        onBoardChange(newBoard);
      }
      return;
    }

    if (editMode === EditMode.ERASE) {
      const newBoard = [...board];
      newBoard[index] = null;
      onBoardChange(newBoard);
      return;
    }

    // EditMode.MOVE logic
    if (selectedSquare === index) {
      // Deselect
      setSelectedSquare(null);
    } else if (selectedSquare !== null) {
      // Move piece
      const newBoard = [...board];
      newBoard[index] = newBoard[selectedSquare];
      newBoard[selectedSquare] = null;
      onBoardChange(newBoard);
      setSelectedSquare(null);
    } else {
      // Select if piece exists
      if (board[index]) {
        setSelectedSquare(index);
      }
    }
  };

  const renderSquare = (i: number) => {
    // Visual row/col calculation
    let boardIndex = i;
    if (isFlipped) {
        boardIndex = 63 - i;
    }

    const row = Math.floor(boardIndex / 8);
    const col = boardIndex % 8;
    const isDark = (row + col) % 2 === 1;
    
    // Apple/Standard Style: High legibility
    // Light: Cream/White (#EBECD0)
    // Dark: Green (#739552) - The standard Lichess/Chess.com green is easiest on eyes
    const bgClass = isDark ? 'bg-[#739552]' : 'bg-[#EBECD0]';
    const textClass = isDark ? 'text-[#EBECD0]' : 'text-[#739552]';

    const piece = board[boardIndex];
    const isSelected = selectedSquare === boardIndex;

    return (
      <div
        key={i}
        className={`${bgClass} w-full h-full flex items-center justify-center relative cursor-pointer select-none`}
        onClick={() => handleSquareClick(boardIndex)}
      >
        {/* Coordinate Labels (Only on edges) */}
        {/* Rank (numbers) on left edge */}
        {(isFlipped ? col === 7 : col === 0) && (
            <span className={`absolute top-0.5 left-0.5 text-[9px] font-semibold ${textClass}`}>
                {getSquareName(boardIndex).charAt(1)}
            </span>
        )}
        {/* File (letters) on bottom edge */}
        {(isFlipped ? row === 0 : row === 7) && (
            <span className={`absolute bottom-0 right-0.5 text-[9px] font-semibold ${textClass}`}>
                {getSquareName(boardIndex).charAt(0)}
            </span>
        )}

        {/* Selection Ring (iOS style focus) */}
        {isSelected && editMode === EditMode.MOVE && (
            <div className="absolute inset-0 bg-[#f5f500] opacity-50 z-0"></div>
        )}

        {/* Piece */}
        {piece && (
          <div className={`w-[90%] h-[90%] relative z-10 transition-transform duration-200 ${isSelected ? '-translate-y-1' : ''}`}>
             <PieceIcon piece={piece} />
          </div>
        )}
        
        {/* Edit Mode Overlays */}
        {editMode === EditMode.PLACE && (
           <div className="absolute inset-0 hover:bg-blue-500/20 transition-colors z-20"></div>
        )}
         {editMode === EditMode.ERASE && (
           <div className="absolute inset-0 hover:bg-red-500/20 transition-colors z-20"></div>
        )}
      </div>
    );
  };

  // 8x8 Grid
  const squares = [];
  for (let i = 0; i < 64; i++) {
    squares.push(renderSquare(i));
  }

  return (
    <div className="aspect-square w-full max-w-md mx-auto rounded-lg overflow-hidden shadow-xl ring-1 ring-black/5">
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {squares}
      </div>
    </div>
  );
};