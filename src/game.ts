import { GameMap } from './core/GameMap.js';
import { BrowserRenderer } from './render/BrowserRenderer.js';
import { GameState } from './core/GameState.js';
import { GameEngine } from './core/GameEngine.js';
import { TowerManager } from './managers/TowerManager.js';
import { EnemyManager } from './managers/EnemyManager.js';
import { WaveManager } from './managers/WaveManager.js';
import { CustomMap, GAME_CONFIG } from './core/GameConfig.js';

// parse URL parameters to get the selected map name
const urlParams = new URLSearchParams(window.location.search);
const selectedMapName = urlParams.get('map');
let selectedMap: CustomMap | undefined;

if (selectedMapName === GAME_CONFIG.map.default.name) {
    // if no custom map is selected, use the default map
    selectedMap = {
        name: GAME_CONFIG.map.default.name,
        waypoints: [...GAME_CONFIG.map.default.waypoints],
    };
} else {
    // load all maps from local storage to find the selected one
    const savedMaps = localStorage.getItem(GAME_CONFIG.LOCAL_STORAGE_KEY);
    const allMaps: CustomMap[] = savedMaps ? JSON.parse(savedMaps) : [];
    selectedMap = allMaps.find((map) => map.name === selectedMapName);

    if (!selectedMap) {
        alert(
            `Map "${selectedMapName}" not found. Redirecting to map selection.`
        );
        window.location.replace('/maps.html');
    }
}

const map = new GameMap(selectedMap!.waypoints);
const enemyManager = new EnemyManager(map);
const waveManager = new WaveManager(enemyManager);
const towerManager = new TowerManager(map);
const engine = new GameEngine(waveManager, enemyManager, towerManager, false);
const renderer = new BrowserRenderer(map);

function gameloop() {
    engine.step(renderer.getAction());
    const state = engine.getState();
    renderer.renderToBrowser(state);
    if (state.gameOver) {
        renderer.renderGameOverScreen(state.waveNumber);
        return;
    }
    requestAnimationFrame(gameloop);
}

gameloop();
