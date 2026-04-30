import {Fragment, useEffect, useRef, useState} from 'react';
import type {GameSettings, GameStatus, Move} from '../types.js';
import {formatPgn} from '../game/notation.js';
import {SettingsPanel} from './SettingsPanel.js';
import './MoveTranscript.css';

interface MoveTranscriptProps {
	readonly sans: readonly string[];
	readonly gameStatus: GameStatus;
	readonly settings: GameSettings;
	readonly moveHistory: readonly Move[];
	readonly onSettingsChange: (update: Partial<GameSettings>) => void;
	readonly onReset: () => void;
	readonly onImport: (pgn: string) => void;
}

export function MoveTranscript({
	sans,
	gameStatus,
	settings,
	moveHistory,
	onSettingsChange,
	onReset,
	onImport,
}: MoveTranscriptProps): React.JSX.Element {
	const [showSettings, setShowSettings] = useState(false);
	const [copied, setCopied] = useState(false);
	const moveListRef = useRef<HTMLDivElement>(null);
	const popoverRef = useRef<HTMLDivElement>(null);
	const gearRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (moveListRef.current !== null) {
			moveListRef.current.scrollTop = moveListRef.current.scrollHeight;
		}
	}, [sans.length]);

	useEffect(() => {
		if (!showSettings) {
			return;
		}

		function handleClickOutside(event: MouseEvent): void {
			if (
				popoverRef.current !== null &&
				!popoverRef.current.contains(event.target as Node) &&
				gearRef.current !== null &&
				!gearRef.current.contains(event.target as Node)
			) {
				setShowSettings(false);
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [showSettings]);

	function handleCopyPgn(): void {
		const pgn = formatPgn(settings, moveHistory, gameStatus);
		void navigator.clipboard.writeText(pgn).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		});
	}

	const movePairs: Array<{readonly number: number; readonly white: string; readonly black: string | undefined}> = [];
	for (let i = 0; i < sans.length; i += 2) {
		movePairs.push({
			number: Math.floor(i / 2) + 1,
			white: sans[i]!,
			black: sans[i + 1],
		});
	}

	return (
		<div className="move-transcript">
			<div className="transcript-header">
				<h2 className="transcript-title">Moves</h2>
				<button
					ref={gearRef}
					type="button"
					className={`gear-button ${showSettings ? 'gear-button-active' : ''}`}
					title="Settings"
					onClick={() => setShowSettings(!showSettings)}
				>
					&#x2699;
				</button>
			</div>

			{showSettings && (
				<div ref={popoverRef} className="settings-popover">
					<SettingsPanel
						settings={settings}
						onSettingsChange={onSettingsChange}
						onReset={onReset}
						onImport={onImport}
					/>
				</div>
			)}

			<div ref={moveListRef} className="move-list">
				{movePairs.map((pair) => (
					<Fragment key={pair.number}>
						<span className="move-number">{pair.number}.</span>
						<span className="move-san">{pair.white}</span>
						<span className="move-san">{pair.black ?? ''}</span>
					</Fragment>
				))}
			</div>

			<button
				type="button"
				className={`copy-button ${copied ? 'copy-button-copied' : ''}`}
				onClick={handleCopyPgn}
			>
				{copied ? 'Copied!' : 'Copy PGN'}
			</button>
		</div>
	);
}
