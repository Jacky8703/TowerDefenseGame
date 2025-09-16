import { EnemyManager } from '../managers/EnemyManager.js';
import { TowerManager } from '../managers/TowerManager.js';
import { WaveManager } from '../managers/WaveManager.js';
import { Action, GAME_CONFIG } from './GameConfig.js';
import { GameState } from './GameState.js';

export class GameEngine {
    private readonly trainingModel: boolean;
    private readonly waveManager: WaveManager;
    private readonly enemyManager: EnemyManager;
    private readonly towerManager: TowerManager;
    private currentState: GameState;
    private lastUpdateTime: number;
    private deltaTime: number;

    constructor(
        waveManager: WaveManager,
        enemyManager: EnemyManager,
        towerManager: TowerManager,
        trainingModel: boolean
    ) {
        this.trainingModel = trainingModel;
        this.waveManager = waveManager;
        this.enemyManager = enemyManager;
        this.towerManager = towerManager;
        this.currentState = {
            gameTime: 0,
            waveNumber: 0,
            money: GAME_CONFIG.initialMoney,
            gameOver: false,
            enemies: [],
            towers: [],
        };
        this.lastUpdateTime = Date.now();
        this.trainingModel
            ? (this.deltaTime = GAME_CONFIG.FIXED_DELTA_TIME)
            : (this.deltaTime = 0);
    }

    step(action: Action) {
        if (!this.trainingModel) {
            const now = Date.now();
            this.deltaTime = (now - this.lastUpdateTime) / 1000.0; // in seconds
            this.lastUpdateTime = now;
        }
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
    }

    getState(): GameState {
        return this.currentState;
    }

    reset() {
        this.currentState = {
            gameTime: 0,
            waveNumber: 0,
            enemies: [],
            towers: [],
            money: GAME_CONFIG.initialMoney,
            gameOver: false,
        };
        this.lastUpdateTime = Date.now();
        this.trainingModel
            ? (this.deltaTime = GAME_CONFIG.FIXED_DELTA_TIME)
            : (this.deltaTime = 0);
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
