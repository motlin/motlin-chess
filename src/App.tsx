import {GameProvider} from './context/GameProvider.js';
import {ThemeProvider} from './theme/ThemeProvider.js';
import {Game} from './components/Game.js';
import './App.css';

export function App(): React.JSX.Element {
	return (
		<ThemeProvider>
			<GameProvider>
				<div className="app">
					<h1 className="app-title">Motlin Chess</h1>
					<Game />
				</div>
			</GameProvider>
		</ThemeProvider>
	);
}
