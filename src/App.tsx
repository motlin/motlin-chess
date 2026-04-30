import {GameProvider} from './context/GameProvider.js';
import {Game} from './components/Game.js';
import './App.css';

export function App(): React.JSX.Element {
	return (
		<GameProvider>
			<div className="app">
				<h1 className="app-title">Motlin Chess</h1>
				<Game />
			</div>
		</GameProvider>
	);
}
