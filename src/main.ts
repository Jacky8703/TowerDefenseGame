import { GameMap } from './core/GameMap';
import { Action, GAME_CONFIG } from './core/GameConfig';
import { Renderer } from './Renderer';
import { GameState } from './core/GameState';
import { GameEngine } from './core/GameEngine';
import { ProjectileManager } from './managers/ProjectileManager';
import { TowerManager } from './managers/TowerManager';
import { EnemyManager } from './managers/EnemyManager';
import { WaveManager } from './managers/WaveManager';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
canvas.width = GAME_CONFIG.map.width;
canvas.height = GAME_CONFIG.map.height;

const map = new GameMap();
const enemyManager = new EnemyManager(map);
const waveManager = new WaveManager(enemyManager);
const towerManager = new TowerManager();
// const projectileManager = new ProjectileManager();
let engine = new GameEngine(map, waveManager, enemyManager, towerManager);
let renderer = new Renderer(canvas);

let action: Action = { type: 'NONE' };

let state: GameState = engine.getState();
renderer.render(state);

function gameloop() {
    engine.step(action);
    state = engine.getState();
    renderer.render(state);
    if (state.gameOver) {
        console.log('Game Over!');
        return;
    }
    requestAnimationFrame(gameloop);
}

gameloop();
