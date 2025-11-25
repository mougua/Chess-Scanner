import React from 'react';
import { EditMode, Piece, PieceColor, PieceType } from '../types';
import { PieceIcon } from './PieceIcon';

interface ControlsProps {
  editMode: EditMode;
  setEditMode: (mode: EditMode) => void;
  selectedPiece: Piece | null;
  setSelectedPiece: (piece: Piece | null) => void;
  activeColor: PieceColor;
  setActiveColor: (color: PieceColor) => void;
  onClear: () => void;
  onReset: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  editMode,
  setEditMode,
  selectedPiece,
  setSelectedPiece,
  activeColor,
  setActiveColor,
  onClear,
  onReset
}) => {

  const pieceTypes: PieceType[] = ['p', 'n', 'b', 'r', 'q', 'k'];

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      
      {/* iOS Segmented Control for Modes */}
      <div className="bg-gray-200/80 p-1 rounded-lg flex relative">
        {/* Sliding Background (Simplified via logic for now) */}
        <button 
            onClick={() => { setEditMode(EditMode.MOVE); setSelectedPiece(null); }}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${editMode === EditMode.MOVE ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
        >
            Move
        </button>
        <button 
            onClick={() => { setEditMode(EditMode.PLACE); if(!selectedPiece) setSelectedPiece({type:'p', color: activeColor}) }}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${editMode === EditMode.PLACE ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
        >
            Edit
        </button>
        <button 
            onClick={() => { setEditMode(EditMode.ERASE); setSelectedPiece(null); }}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${editMode === EditMode.ERASE ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
        >
            Erase
        </button>
      </div>

      {/* Contextual Interface */}
      {editMode === EditMode.PLACE ? (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="flex justify-center gap-2 mb-4">
                <button 
                    onClick={() => setActiveColor('w')} 
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${activeColor === 'w' ? 'bg-gray-50 border-gray-200 text-black' : 'bg-transparent border-transparent text-gray-400'}`}
                >
                    White
                </button>
                <button 
                    onClick={() => setActiveColor('b')} 
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${activeColor === 'b' ? 'bg-gray-900 border-gray-900 text-white' : 'bg-transparent border-transparent text-gray-400'}`}
                >
                    Black
                </button>
            </div>
            
            <div className="flex justify-between items-center gap-1">
                {pieceTypes.map(type => (
                    <button
                        key={type}
                        onClick={() => setSelectedPiece({ type, color: activeColor })}
                        className={`
                            w-10 h-10 flex items-center justify-center rounded-full transition-all
                            ${selectedPiece?.type === type && selectedPiece?.color === activeColor 
                                ? 'bg-blue-100 ring-2 ring-blue-500 ring-offset-2' 
                                : 'hover:bg-gray-50'
                            }
                        `}
                    >
                        <div className="w-8 h-8">
                             <PieceIcon piece={{ type, color: activeColor }} />
                        </div>
                    </button>
                ))}
            </div>
        </div>
      ) : (
        /* Action Buttons for Move/Erase modes */
         <div className="grid grid-cols-2 gap-3">
            <button 
                onClick={onReset}
                className="py-3 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
                Reset Board
            </button>
            <button 
                onClick={onClear}
                className="py-3 rounded-xl bg-gray-100 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors"
            >
                Clear All
            </button>
         </div>
      )}
    </div>
  );
};