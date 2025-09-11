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
const rect = canvas.getBoundingClientRect();

let action: Action = { type: 'NONE' };
let selectedTowerType: TowerType | null = null;

// UI tower buttons
const towerButtons: HTMLButtonElement[] = [];
for (const type of Object.values(TowerType)) {
    const button = document.getElementById(type) as HTMLButtonElement | null;
    if (!button) throw new Error(`${type} tower button id not found`);
    button.style.backgroundColor = GAME_CONFIG.towers[type].color;
    button.addEventListener('click', () => {
        selectedTowerType = type as TowerType;
    });
    towerButtons.push(button);
}

canvas.addEventListener('click', (event) => {
    if (selectedTowerType !== null) {
        // get click position relative to canvas
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const gridCellIndexX = Math.floor(x / GAME_CONFIG.map.cellSize);
        const gridCellIndexY = Math.floor(y / GAME_CONFIG.map.cellSize);

        action = {
            type: 'BUILD_TOWER',
            // center coordinates
            position: {
                x:
                    GAME_CONFIG.map.cellSize / 2 +
                    gridCellIndexX * GAME_CONFIG.map.cellSize,
                y:
                    GAME_CONFIG.map.cellSize / 2 +
                    gridCellIndexY * GAME_CONFIG.map.cellSize,
            },
            towerType: selectedTowerType,
        };
        selectedTowerType = null;
    }
});

const map = new GameMap();
const enemyManager = new EnemyManager(map);
const waveManager = new WaveManager(enemyManager);
const towerManager = new TowerManager(map);
// const projectileManager = new ProjectileManager();
let engine = new GameEngine(map, waveManager, enemyManager, towerManager);
let renderer = new Renderer(canvas, towerButtons);

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
    action = { type: 'NONE' }; // reset action
    requestAnimationFrame(gameloop);
}

gameloop();
