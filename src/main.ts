import { GameMap } from './core/GameMap';
import { Action, EnemyType, GAME_CONFIG, TowerType } from './core/GameConfig';
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
const towerManager = new TowerManager(map);
// const projectileManager = new ProjectileManager();
let engine = new GameEngine(map, waveManager, enemyManager, towerManager);
let renderer = new Renderer(canvas);

let action: Action = { type: 'NONE' };

let state: GameState = engine.getState();
renderer.render(state);

action = {
    type: 'BUILD_TOWER',
    towerType: TowerType.BASIC,
    position: { x: 125, y: 275 },
};
engine.step(action);
action = { type: 'NONE' };

// testing
// console.log('buildableCells:', map.buildableCells);
// let countInterval = 0
// let id = setInterval(() => {
//     engine.step(action);
//     state = engine.getState();
//     console.log("Firerate: %f", state.towers[0].fireRate);
//     state.enemies.forEach((e, i) => {
//         console.log("Enemy %d - Health: %f, Position: (%f, %f)", i, e.health, e.position.x, e.position.y);
//     });
//     renderer.render(state);
//     countInterval++;
//     if (countInterval > 12) clearInterval(id);
// }, 1000);

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
