export interface PieceSetInfo {
	readonly id: string;
	readonly name: string;
}

export const PIECE_SETS: readonly PieceSetInfo[] = [
	{id: 'cburnett', name: 'Colin Burnett'},
	{id: 'staunty', name: 'Staunty'},
	{id: 'alpha', name: 'Alpha'},
	{id: 'anarcandy', name: 'Anarcandy'},
	{id: 'california', name: 'California'},
	{id: 'cardinal', name: 'Cardinal'},
	{id: 'gioco', name: 'Gioco'},
	{id: 'governor', name: 'Governor'},
	{id: 'horsey', name: 'Horsey'},
	{id: 'icpieces', name: 'IC Pieces'},
	{id: 'kosal', name: 'Kosal'},
	{id: 'leipzig', name: 'Leipzig'},
	{id: 'maestro', name: 'Maestro'},
	{id: 'merida', name: 'Merida'},
	{id: 'mpchess', name: 'MP Chess'},
	{id: 'pirouetti', name: 'Pirouetti'},
	{id: 'pixel', name: 'Pixel'},
	{id: 'tatiana', name: 'Tatiana'},
];

export const DEFAULT_PIECE_SET = 'cburnett';

export interface BoardTheme {
	readonly id: string;
	readonly name: string;
	readonly lightSquare: string;
	readonly darkSquare: string;
	readonly textured: boolean;
	readonly lightTexture?: string;
	readonly darkTexture?: string;
}

export const BOARD_THEMES: readonly BoardTheme[] = [
	{
		id: 'brown',
		name: 'Brown',
		lightSquare: '#f0d9b5',
		darkSquare: '#b58863',
		textured: false,
	},
	{
		id: 'green',
		name: 'Green',
		lightSquare: '#eeeed2',
		darkSquare: '#769656',
		textured: false,
	},
	{
		id: 'blue',
		name: 'Blue',
		lightSquare: '#dee3e6',
		darkSquare: '#8ca2ad',
		textured: false,
	},
	{
		id: 'purple',
		name: 'Purple',
		lightSquare: '#e8e0f0',
		darkSquare: '#9070a0',
		textured: false,
	},
	{
		id: 'walnut',
		name: 'Walnut',
		lightSquare: '#e8ceab',
		darkSquare: '#a67d5d',
		textured: false,
	},
	{
		id: 'bw',
		name: 'Black & White',
		lightSquare: '#ffffff',
		darkSquare: '#888888',
		textured: false,
	},
	{
		id: 'wood-light',
		name: 'Light Wood',
		lightSquare: '#e8d4a2',
		darkSquare: '#b5873a',
		textured: true,
		lightTexture: `repeating-linear-gradient(
			90deg,
			transparent,
			transparent 2px,
			rgba(0, 0, 0, 0.03) 2px,
			rgba(0, 0, 0, 0.03) 4px
		), repeating-linear-gradient(
			0deg,
			transparent,
			transparent 8px,
			rgba(0, 0, 0, 0.02) 8px,
			rgba(0, 0, 0, 0.02) 10px
		)`,
		darkTexture: `repeating-linear-gradient(
			90deg,
			transparent,
			transparent 2px,
			rgba(0, 0, 0, 0.05) 2px,
			rgba(0, 0, 0, 0.05) 4px
		), repeating-linear-gradient(
			0deg,
			transparent,
			transparent 8px,
			rgba(0, 0, 0, 0.03) 8px,
			rgba(0, 0, 0, 0.03) 10px
		)`,
	},
	{
		id: 'wood-dark',
		name: 'Dark Wood',
		lightSquare: '#c8a96e',
		darkSquare: '#6b4226',
		textured: true,
		lightTexture: `repeating-linear-gradient(
			85deg,
			transparent,
			transparent 3px,
			rgba(0, 0, 0, 0.04) 3px,
			rgba(0, 0, 0, 0.04) 5px
		), repeating-linear-gradient(
			175deg,
			transparent,
			transparent 10px,
			rgba(0, 0, 0, 0.02) 10px,
			rgba(0, 0, 0, 0.02) 12px
		)`,
		darkTexture: `repeating-linear-gradient(
			85deg,
			transparent,
			transparent 3px,
			rgba(0, 0, 0, 0.06) 3px,
			rgba(0, 0, 0, 0.06) 5px
		), repeating-linear-gradient(
			175deg,
			transparent,
			transparent 10px,
			rgba(0, 0, 0, 0.04) 10px,
			rgba(0, 0, 0, 0.04) 12px
		)`,
	},
];

export const DEFAULT_BOARD_THEME = 'brown';

export function getBoardTheme(id: string): BoardTheme {
	return BOARD_THEMES.find((t) => t.id === id) ?? BOARD_THEMES[0]!;
}

export function getPieceImagePath(pieceSet: string, color: 'white' | 'black', pieceType: string): string {
	const colorPrefix = color === 'white' ? 'w' : 'b';
	const typeMap: Record<string, string> = {
		king: 'K',
		queen: 'Q',
		rook: 'R',
		bishop: 'B',
		knight: 'N',
		pawn: 'P',
	};
	const typeSuffix = typeMap[pieceType] ?? pieceType.charAt(0).toUpperCase();
	return `/pieces/${pieceSet}/${colorPrefix}${typeSuffix}.svg`;
}
