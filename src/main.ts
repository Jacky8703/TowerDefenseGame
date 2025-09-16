import { GameMap } from './core/GameMap.js';
import { Renderer } from './Renderer.js';
import { GameState } from './core/GameState.js';
import { GameEngine } from './core/GameEngine.js';
import { TowerManager } from './managers/TowerManager.js';
import { EnemyManager } from './managers/EnemyManager.js';
import { WaveManager } from './managers/WaveManager.js';
import { GAME_CONFIG } from './core/GameConfig.js';

const map = new GameMap();
const enemyManager = new EnemyManager(map);
const waveManager = new WaveManager(enemyManager);
const towerManager = new TowerManager(map);
const engine = new GameEngine(waveManager, enemyManager, towerManager, false);
let state: GameState = engine.getState();

const renderer = new Renderer(map);
renderer.render(state);

function gameloop() {
    engine.step(renderer.action);
    state = engine.getState();
    renderer.render(state);
    if (state.gameOver) {
        console.log('Game Over!');
        return;
    }
    renderer.action = { type: 'NONE' }; // reset action
    requestAnimationFrame(gameloop);
}

gameloop();
