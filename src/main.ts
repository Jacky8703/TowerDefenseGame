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
let map = new GameMap();
console.log(map.path.waypoints);
let engine = new GameEngine(
    map,
    new WaveManager(),
    new EnemyManager(),
    new TowerManager(),
    new ProjectileManager()
);

let action: Action = { type: 'NONE' };

let renderer = new Renderer(canvas);
//renderer.render(engine.step(action));
renderer.render({
    gameTime: 0,
    waveNumber: 0,
    map: map,
    enemies: [],
    towers: [],
    projectiles: [],
    gameOver: false,
});
