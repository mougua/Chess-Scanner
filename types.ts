export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export type BoardState = (Piece | null)[];

export interface AnalysisResult {
  fen: string;
  description?: string;
}

export enum EditMode {
  MOVE = 'MOVE',
  ERASE = 'ERASE',
  PLACE = 'PLACE'
}
