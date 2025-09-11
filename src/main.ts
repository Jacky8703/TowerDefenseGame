import { GameMap } from './core/GameMap';
import { Action, EnemyType, GAME_CONFIG, TowerType } from './core/GameConfig';
import { Renderer } from './Renderer';
import { GameState } from './core/GameState';
import { GameEngine } from './core/GameEngine';
import { ProjectileManager } from './managers/ProjectileManager';
import { TowerManager } from './managers/TowerManager';
import { EnemyManager } from './managers/EnemyManager';
import { WaveManager } from './managers/WaveManager';

const map = new GameMap();
const enemyManager = new EnemyManager(map);
const waveManager = new WaveManager(enemyManager);
const towerManager = new TowerManager(map);
// const projectileManager = new ProjectileManager();
let engine = new GameEngine(map, waveManager, enemyManager, towerManager);
let renderer = new Renderer();

let state: GameState = engine.getState();
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
