import { BoardState, Piece, PieceColor, PieceType } from '../types';

export const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const fenToBoard = (fen: string): BoardState => {
  const board: BoardState = new Array(64).fill(null);
  const [position] = fen.split(' ');
  const rows = position.split('/');
  
  let squareIndex = 0;
  for (const row of rows) {
    for (const char of row) {
      if (/\d/.test(char)) {
        squareIndex += parseInt(char, 10);
      } else {
        const color: PieceColor = char === char.toUpperCase() ? 'w' : 'b';
        const type = char.toLowerCase() as PieceType;
        board[squareIndex] = { type, color };
        squareIndex++;
      }
    }
  }
  return board;
};

export const boardToFen = (board: BoardState, activeColor: PieceColor = 'w'): string => {
  let fen = '';
  let emptyCount = 0;

  for (let i = 0; i < 64; i++) {
    const piece = board[i];
    
    if (i > 0 && i % 8 === 0) {
      if (emptyCount > 0) {
        fen += emptyCount;
        emptyCount = 0;
      }
      fen += '/';
    }

    if (!piece) {
      emptyCount++;
    } else {
      if (emptyCount > 0) {
        fen += emptyCount;
        emptyCount = 0;
      }
      const char = piece.type;
      fen += piece.color === 'w' ? char.toUpperCase() : char;
    }
  }
  
  if (emptyCount > 0) fen += emptyCount;

  return `${fen} ${activeColor} - - 0 1`;
};

// Rotates the board state 180 degrees.
// A piece at index 0 (a8) moves to index 63 (h1).
// A piece at index 56 (a1) moves to index 7 (h8).
export const rotateBoard = (board: BoardState): BoardState => {
  return [...board].reverse();
};

export const getSquareName = (index: number): string => {
  const file = index % 8;
  const rank = 7 - Math.floor(index / 8);
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  return `${files[file]}${rank + 1}`;
};
