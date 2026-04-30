import {useState, useRef} from 'react';
import type {GameSettings} from '../types.js';
import {getPieceDefinition, getToggleablePieceTypes} from '../pieces/registry.js';
import {BOARD_THEMES, PIECE_SETS, getPieceImagePath} from '../themes.js';
import {buildBackRank} from '../game/boardSetup.js';
import './SettingsPanel.css';

interface SettingsPanelProps {
	readonly settings: GameSettings;
	readonly onSettingsChange: (update: Partial<GameSettings>) => void;
	readonly onReset: () => void;
	readonly onImport: (pgn: string) => void;
}

export function SettingsPanel({settings, onSettingsChange, onReset, onImport}: SettingsPanelProps): React.JSX.Element {
	const toggleablePieces = getToggleablePieceTypes();
	const backRank = buildBackRank(settings.enabledPieces, settings.boardSize);
	const [pgnText, setPgnText] = useState('');
	const [importError, setImportError] = useState<string>('');
	const fileInputRef = useRef<HTMLInputElement>(null);

	function handleBoardSizeChange(event: React.ChangeEvent<HTMLInputElement>): void {
		const size = Number(event.target.value) * 2;
		if (size >= 4 && size <= 16) {
			onSettingsChange({boardSize: size});
		}
	}

	function handleImport(text: string): void {
		const trimmed = text.trim();
		if (trimmed === '') {
			setImportError('Please enter PGN text.');
			return;
		}
		try {
			onImport(trimmed);
			setImportError('');
			setPgnText('');
		} catch (error) {
			setImportError(error instanceof Error ? error.message : 'Failed to import PGN.');
		}
	}

	function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>): void {
		const file = event.target.files?.[0];
		if (file === undefined) {
			return;
		}
		const reader = new FileReader();
		reader.onload = (readEvent) => {
			const content = readEvent.target?.result;
			if (typeof content === 'string') {
				setPgnText(content);
				handleImport(content);
			}
		};
		reader.readAsText(file);
		event.target.value = '';
	}

	function handlePieceToggle(pieceType: string): void {
		const next = new Set(settings.enabledPieces);
		if (next.has(pieceType)) {
			next.delete(pieceType);
		} else {
			next.add(pieceType);
		}
		onSettingsChange({enabledPieces: next});
	}

	return (
		<div className="settings-panel">
			<h2 className="settings-title">Settings</h2>

			<div className="setting-group">
				<label className="piece-toggle">
					<input
						type="checkbox"
						checked={settings.duckChess}
						onChange={() => onSettingsChange({duckChess: !settings.duckChess})}
					/>
					<span>🦆 Duck Chess</span>
				</label>
			</div>

			<div className="setting-group">
				<label className="setting-label" htmlFor="board-size">
					Board Size: {settings.boardSize}x{settings.boardSize}
				</label>
				<input
					id="board-size"
					type="range"
					min={2}
					max={8}
					value={settings.boardSize / 2}
					onChange={handleBoardSizeChange}
					className="board-size-slider"
				/>
			</div>

			<div className="setting-group">
				<label className="setting-label" htmlFor="piece-set">
					Piece Set
				</label>
				<select
					id="piece-set"
					className="setting-select"
					value={settings.pieceSet}
					onChange={(e) => onSettingsChange({pieceSet: e.target.value})}
				>
					{PIECE_SETS.map((set) => (
						<option key={set.id} value={set.id}>
							{set.name}
						</option>
					))}
				</select>
			</div>

			<div className="setting-group">
				<span className="setting-label">Board Theme</span>
				<div className="theme-grid">
					{BOARD_THEMES.map((theme) => (
						<button
							key={theme.id}
							type="button"
							className={`theme-swatch ${settings.boardTheme === theme.id ? 'theme-swatch-active' : ''}`}
							onClick={() => onSettingsChange({boardTheme: theme.id})}
							title={theme.name}
						>
							<span className="swatch-light" style={{backgroundColor: theme.lightSquare}} />
							<span className="swatch-dark" style={{backgroundColor: theme.darkSquare}} />
						</button>
					))}
				</div>
			</div>

			<div className="setting-group">
				<h3 className="setting-label">Pieces</h3>
				<div className="pieces-list">
					{toggleablePieces.map((type) => {
						const def = getPieceDefinition(type);
						return (
							<label key={type} className="piece-toggle">
								<input
									type="checkbox"
									checked={settings.enabledPieces.has(type)}
									onChange={() => handlePieceToggle(type)}
								/>
								<img
									src={getPieceImagePath(settings.pieceSet, 'white', type)}
									alt={def?.name ?? type}
									className="piece-toggle-icon"
								/>
								<span>{def?.name ?? type}</span>
								{def !== undefined && !def.isStandard && <span className="piece-badge">extra</span>}
							</label>
						);
					})}
				</div>
			</div>

			<div className="setting-group">
				<span className="setting-label">Back Rank Layout ({backRank.length} pieces)</span>
				<div className="back-rank-preview">
					{backRank.map((type, i) => (
						<img
							key={`${type}-${i}`}
							src={getPieceImagePath(settings.pieceSet, 'white', type)}
							alt={type}
							className="back-rank-piece"
							title={getPieceDefinition(type)?.name ?? type}
						/>
					))}
				</div>
			</div>

			<div className="setting-group">
				<h3 className="setting-label">Import PGN</h3>
				<textarea
					className="pgn-textarea"
					placeholder="Paste PGN text here..."
					value={pgnText}
					onChange={(e) => {
						setPgnText(e.target.value);
						setImportError('');
					}}
					rows={4}
				/>
				<div className="import-buttons">
					<button type="button" className="reset-button import-button" onClick={() => handleImport(pgnText)}>
						Load
					</button>
					<button
						type="button"
						className="reset-button import-button"
						onClick={() => fileInputRef.current?.click()}
					>
						Upload .pgn
					</button>
					<input
						ref={fileInputRef}
						type="file"
						accept=".pgn"
						className="file-input-hidden"
						onChange={handleFileUpload}
					/>
				</div>
				{importError !== '' && <p className="validation-error">{importError}</p>}
			</div>

			<button type="button" className="reset-button" onClick={onReset}>
				New Game
			</button>
		</div>
	);
}
