import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Ensure we don't crash if key is missing during dev, but alert user in UI
export const isApiKeyAvailable = () => !!apiKey;

const ai = new GoogleGenAI({ apiKey });

export const analyzeChessImage = async (base64Image: string): Promise<{ fen: string }> => {
  try {
    // Clean base64 string if it has a data URL prefix
    const data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', 
              data: data
            }
          },
          {
            text: `[NOTHINK] You are a Grandmaster-level chess engine with advanced computer vision capabilities. 
            Analyze this image of a chessboard. The image might be a digital screenshot OR a real-world photo with perspective distortion, shadows, and 3D pieces.

            Task:
            1. Identify the orientation of the board. 
               - Look for board coordinates (numbers 1-8, letters a-h) on the edges.
               - If no coordinates are visible, deduce orientation from the piece setup (e.g., White King is usually on e1, White Queen on d1; Black King on e8).
               - Note that in real photos, the side closest to the camera is usually the "bottom" (ranks 1 or 2 for white, 7 or 8 for black).
            2. Identify every piece on the board (King, Queen, Rook, Bishop, Knight, Pawn) and its color (White, Black).
            3. Generate the FEN (Forsyth–Edwards Notation) string representing this position.
            
            Critical Rules:
            - Accurately distinguish between similar pieces (e.g., Pawn vs Bishop, Queen vs King) even in low light or 3D angles.
            - If the board is viewed from the Black side (Black pieces at the bottom of the image), normalize the FEN so it represents the standard board state correctly (rank 8 at top, rank 1 at bottom).
            - Return ONLY the FEN string in the JSON response.
            - Default active color to 'w' unless the position strongly suggests otherwise (e.g. a check).
            `
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fen: {
              type: Type.STRING,
              description: "The FEN string of the chess position."
            }
          }
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from Gemini");

    const json = JSON.parse(resultText);
    return { fen: json.fen };
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};