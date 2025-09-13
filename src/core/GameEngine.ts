import { EnemyManager } from '../managers/EnemyManager.js';
import { TowerManager } from '../managers/TowerManager.js';
import { WaveManager } from '../managers/WaveManager.js';
import { Action, GAME_CONFIG } from './GameConfig.js';
import { GameMap } from './GameMap.js';
import { GameState } from './GameState.js';

export class GameEngine {
    private readonly waveManager: WaveManager;
    private readonly enemyManager: EnemyManager;
    private readonly towerManager: TowerManager;
    private currentState: GameState;
    private lastUpdateTime: number;
    private deltaTime: number;

    constructor(
        map: GameMap,
        waveManager: WaveManager,
        enemyManager: EnemyManager,
        towerManager: TowerManager
    ) {
        this.waveManager = waveManager;
        this.enemyManager = enemyManager;
        this.towerManager = towerManager;
        this.currentState = {
            gameTime: 0,
            waveNumber: 0,
            map: map,
            enemies: [],
            towers: [],
            money: GAME_CONFIG.initialMoney,
            gameOver: false,
        };
        this.lastUpdateTime = Date.now();
        this.deltaTime = 0;
    }

    step(action: Action) {
        this.deltaTime = (Date.now() - this.lastUpdateTime) / 1000.0; // in seconds
        // handle action
        if (
            action.type === 'BUILD_TOWER' &&
            action.position &&
            action.towerType
        ) {
            this.currentState.money = this.towerManager.buildTower(
                action.towerType,
                action.position,
                this.currentState.towers,
                this.currentState.money
            );
        }
        // update all managers
        this.waveManager.update(this.deltaTime, this.currentState.enemies);
        this.currentState.money = this.enemyManager.update(
            this.deltaTime,
            this.currentState.enemies,
            this.currentState.money
        );
        this.towerManager.update(
            this.deltaTime,
            this.currentState.towers,
            this.currentState.enemies
        );
        // update game state
        this.currentState.waveNumber = this.waveManager.getWaveNumber();
        this.currentState.gameTime += this.deltaTime;
        this.currentState.gameOver = this.checkGameOver();

        this.lastUpdateTime += this.deltaTime * 1000;
    }

    getState(): GameState {
        return this.currentState;
    }

    reset() {
        this.currentState = {
            gameTime: 0,
            waveNumber: 0,
            map: this.currentState.map,
            enemies: [],
            towers: [],
            money: GAME_CONFIG.initialMoney,
            gameOver: false,
        };
        this.lastUpdateTime = Date.now();
        this.deltaTime = 0;
        this.waveManager.reset();
    }

    private checkGameOver(): boolean {
        if (
            this.currentState.enemies.some((enemy) => enemy.pathProgress >= 1)
        ) {
            return true;
        } else {
            return false;
        }
    }
}
