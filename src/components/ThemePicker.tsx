import {useTheme} from '../theme/useTheme.js';
import './ThemePicker.css';

export function ThemePicker(): React.JSX.Element {
	const {mode, setMode} = useTheme();

	return (
		<div role="radiogroup" aria-label="Color theme" className="theme-mode-picker">
			{(['light', 'dark', 'system'] as const).map((m) => (
				<button
					key={m}
					type="button"
					role="radio"
					aria-checked={mode === m}
					className={`theme-mode-button ${mode === m ? 'theme-mode-active' : ''}`}
					onClick={() => setMode(m)}
				>
					{m === 'light' ? 'Light' : m === 'dark' ? 'Dark' : 'System'}
				</button>
			))}
		</div>
	);
}
