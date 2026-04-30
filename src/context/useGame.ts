import {useContext} from 'react';
import {GameContext} from './GameContext.js';
import type {GameContextValue} from './GameContext.js';

export function useGame(): GameContextValue {
	const context = useContext(GameContext);
	if (context === null) {
		throw new Error('useGame must be used within a GameProvider');
	}
	return context;
}
