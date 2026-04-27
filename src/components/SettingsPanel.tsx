import type {GameSettings} from '../types.js';
import {getExtraPieceTypes} from '../pieces/registry.js';
import {getPieceDefinition} from '../pieces/registry.js';
import './SettingsPanel.css';

interface SettingsPanelProps {
	readonly settings: GameSettings;
	readonly onSettingsChange: (update: Partial<GameSettings>) => void;
	readonly onReset: () => void;
}

export function SettingsPanel({settings, onSettingsChange, onReset}: SettingsPanelProps): React.JSX.Element {
	const extraPieceTypes = getExtraPieceTypes();

	function handleBoardSizeChange(event: React.ChangeEvent<HTMLInputElement>): void {
		const size = Number(event.target.value);
		if (size >= 8 && size <= 16) {
			onSettingsChange({boardSize: size});
		}
	}

	function handleExtraPieceToggle(pieceType: string): void {
		const next = new Set(settings.enabledExtraPieces);
		if (next.has(pieceType)) {
			next.delete(pieceType);
		} else {
			next.add(pieceType);
		}
		onSettingsChange({enabledExtraPieces: next});
	}

	return (
		<div className="settings-panel">
			<h2 className="settings-title">Settings</h2>

			<div className="setting-group">
				<label className="setting-label" htmlFor="board-size">
					Board Size: {settings.boardSize}x{settings.boardSize}
				</label>
				<input
					id="board-size"
					type="range"
					min={8}
					max={16}
					value={settings.boardSize}
					onChange={handleBoardSizeChange}
					className="board-size-slider"
				/>
			</div>

			<div className="setting-group">
				<h3 className="setting-label">Extra Pieces</h3>
				{extraPieceTypes.length === 0 ? (
					<p className="no-extra-pieces">No extra pieces available</p>
				) : (
					<div className="extra-pieces-list">
						{extraPieceTypes.map((type) => {
							const def = getPieceDefinition(type);
							return (
								<label key={type} className="extra-piece-toggle">
									<input
										type="checkbox"
										checked={settings.enabledExtraPieces.has(type)}
										onChange={() => handleExtraPieceToggle(type)}
									/>
									<span>{def?.name ?? type}</span>
								</label>
							);
						})}
					</div>
				)}
			</div>

			<button type="button" className="reset-button" onClick={onReset}>
				New Game
			</button>
		</div>
	);
}
