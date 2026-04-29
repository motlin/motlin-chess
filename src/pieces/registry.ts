import type {PieceType} from '../types.js';
import type {PieceDefinition} from './PieceDefinition.js';
import {amazonDefinition} from './definitions/amazon.js';
import {archbishopDefinition} from './definitions/archbishop.js';
import {bishopDefinition} from './definitions/bishop.js';
import {camelDefinition} from './definitions/camel.js';
import {centaurDefinition} from './definitions/centaur.js';
import {championDefinition} from './definitions/champion.js';
import {chancellorDefinition} from './definitions/chancellor.js';
import {dragonDefinition} from './definitions/dragon.js';
import {elephantDefinition} from './definitions/elephant.js';
import {kingDefinition} from './definitions/king.js';
import {knightDefinition} from './definitions/knight.js';
import {mannDefinition} from './definitions/mann.js';
import {pawnDefinition} from './definitions/pawn.js';
import {queenDefinition} from './definitions/queen.js';
import {rookDefinition} from './definitions/rook.js';
import {wizardDefinition} from './definitions/wizard.js';
import {zebraDefinition} from './definitions/zebra.js';

const pieceRegistry = new Map<PieceType, PieceDefinition>([
	['king', kingDefinition],
	['queen', queenDefinition],
	['rook', rookDefinition],
	['bishop', bishopDefinition],
	['knight', knightDefinition],
	['pawn', pawnDefinition],
	['archbishop', archbishopDefinition],
	['camel', camelDefinition],
	['chancellor', chancellorDefinition],
	['centaur', centaurDefinition],
	['amazon', amazonDefinition],
	['elephant', elephantDefinition],
	['zebra', zebraDefinition],
	['mann', mannDefinition],
	['champion', championDefinition],
	['wizard', wizardDefinition],
	['dragon', dragonDefinition],
]);

export function getPieceDefinition(type: PieceType): PieceDefinition | undefined {
	return pieceRegistry.get(type);
}

export function registerPiece(type: PieceType, definition: PieceDefinition): void {
	pieceRegistry.set(type, definition);
}

export function getExtraPieceTypes(): PieceType[] {
	return [...pieceRegistry.entries()].filter(([_, def]) => !def.isStandard).map(([type]) => type);
}

export function getToggleablePieceTypes(): PieceType[] {
	return [...pieceRegistry.entries()].filter(([_, def]) => def.toggleable).map(([type]) => type);
}

export function getAllPieceDefinitions(): ReadonlyMap<PieceType, PieceDefinition> {
	return pieceRegistry;
}
