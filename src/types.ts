export type Color = 'white' | 'black';

export type StandardPieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';

export type PieceType = StandardPieceType | (string & {});

export interface Piece {
	readonly type: PieceType;
	readonly color: Color;
	readonly hasMoved: boolean;
}

export interface Position {
	readonly row: number;
	readonly col: number;
}

export interface Move {
	readonly from: Position;
	readonly to: Position;
	readonly captured: Piece | null;
	readonly isEnPassant: boolean;
	readonly isCastle: boolean;
	readonly promotion: PieceType | null;
}

export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate';

export interface GameState {
	readonly board: Board;
	readonly currentTurn: Color;
	readonly selectedPosition: Position | null;
	readonly validMoves: readonly Move[];
	readonly moveHistory: readonly Move[];
	readonly boardSize: number;
	readonly gameStatus: GameStatus;
	readonly enPassantTarget: Position | null;
	readonly pendingPromotion: Move | null;
}

export type Board = ReadonlyArray<ReadonlyArray<Piece | null>>;

export interface GameSettings {
	readonly boardSize: number;
	readonly enabledPieces: ReadonlySet<string>;
	readonly pieceSet: string;
	readonly boardTheme: string;
}
