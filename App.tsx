import React, { useState, useRef } from 'react';
import { ChessBoard } from './components/ChessBoard';
import { Controls } from './components/Controls';
import { BoardState, EditMode, Piece, PieceColor } from './types';
import { fenToBoard, boardToFen, rotateBoard, INITIAL_FEN } from './utils/chessLogic';
import { analyzeChessImage } from './services/geminiService';

// Helper function to compress and resize images
const resizeImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 1024; // Cap max dimension to 1024px to save tokens
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
        }
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        // Convert to JPEG with 0.7 quality
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = (e) => reject(e);
    };
    reader.onerror = (e) => reject(e);
  });
};

const App: React.FC = () => {
  // State
  const [board, setBoard] = useState<BoardState>(fenToBoard(INITIAL_FEN));
  const [isFlipped, setIsFlipped] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>(EditMode.MOVE);
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [activeColor, setActiveColor] = useState<PieceColor>('w');
  
  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turn, setTurn] = useState<PieceColor>('w');
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null); // Camera
  const importInputRef = useRef<HTMLInputElement>(null); // Local File

  // Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset the input so the same file can be selected again if needed
    e.target.value = '';

    setIsAnalyzing(true);
    setError(null);

    try {
        // Compress image locally before sending to API
        const compressedBase64 = await resizeImage(file);
        
        const { fen } = await analyzeChessImage(compressedBase64);
        setBoard(fenToBoard(fen));
        if (fen.includes(' b ')) setTurn('b');
        else setTurn('w');
    } catch (err: any) {
        console.error(err);
        setError("Could not analyze image. Please try again.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const exportToLichess = () => {
    const fen = boardToFen(board, turn);
    const url = `https://lichess.org/analysis/${fen.replace(/ /g, '_')}`;
    window.open(url, '_blank');
  };
  
  const copyFen = () => {
      const fen = boardToFen(board, turn);
      navigator.clipboard.writeText(fen);
      alert("FEN copied to clipboard"); 
  };

  const handleRotateBoard = () => {
      setBoard(rotateBoard(board));
  };

  return (
    <div className="min-h-screen w-full bg-[#F2F2F7] text-[#1c1c1e] font-sans flex flex-col">
      
      {/* Header - Glassmorphism */}
      <header className="glass-panel sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight">Chess Scanner</h1>
        <div className="flex gap-2">
            {/* Camera Input (Force Camera on mobile) */}
            <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*" 
                capture="environment"
                className="hidden"
                onChange={handleFileUpload}
            />
            {/* File Input (Allows Gallery/Files) */}
            <input 
                type="file" 
                ref={importInputRef}
                accept="image/*" 
                className="hidden"
                onChange={handleFileUpload}
            />

            <button 
                onClick={() => importInputRef.current?.click()}
                disabled={isAnalyzing}
                className="bg-gray-200/80 active:bg-gray-300 text-gray-900 px-4 py-2 rounded-full text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
                title="Import from Photos"
            >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
               <span className="hidden sm:inline">Photos</span>
            </button>

            <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="bg-[#007AFF] active:bg-[#005FCC] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
            >
               {isAnalyzing ? (
                   <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               ) : (
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
               )}
               <span>Scan</span>
            </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center max-w-2xl mx-auto w-full p-4 gap-6">
        
        {/* Error Message */}
        {error && (
            <div className="w-full bg-red-50 text-red-500 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {error}
            </div>
        )}

        {/* Main Card */}
        <div className="w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-4 md:p-6">
            
            {/* Board Toolbar */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                    <button onClick={() => setIsFlipped(!isFlipped)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title="Flip Board">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path></svg>
                    </button>
                    <button onClick={handleRotateBoard} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title="Rotate Position">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    </button>
                </div>
                <button 
                    onClick={() => setTurn(turn === 'w' ? 'b' : 'w')} 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                >
                    <div className={`w-3 h-3 rounded-full border border-gray-300 ${turn === 'w' ? 'bg-white' : 'bg-black'}`}></div>
                    {turn === 'w' ? 'White to play' : 'Black to play'}
                </button>
            </div>

            <ChessBoard 
                board={board}
                isFlipped={isFlipped}
                editMode={editMode}
                selectedPieceForPlacement={selectedPiece}
                onBoardChange={setBoard}
            />

            <div className="mt-6">
                <Controls 
                    editMode={editMode}
                    setEditMode={setEditMode}
                    selectedPiece={selectedPiece}
                    setSelectedPiece={setSelectedPiece}
                    activeColor={activeColor}
                    setActiveColor={setActiveColor}
                    onClear={() => setBoard(new Array(64).fill(null))}
                    onReset={() => setBoard(fenToBoard(INITIAL_FEN))}
                />
            </div>
        </div>

        {/* FEN & Export Actions */}
        <div className="w-full flex flex-col gap-3">
            <button 
                onClick={exportToLichess}
                className="w-full bg-[#007AFF] active:bg-[#005FCC] text-white py-3.5 rounded-xl font-semibold text-base shadow-md shadow-blue-500/20 transition-all flex justify-center items-center gap-2"
            >
                <span>Analyze on Lichess</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </button>

            <button 
                onClick={copyFen}
                className="w-full bg-white text-gray-700 py-3.5 rounded-xl font-semibold text-base shadow-sm border border-gray-200 hover:bg-gray-50 transition-all"
            >
                Copy FEN
            </button>
        </div>

      </main>
    </div>
  );
};

export default App;