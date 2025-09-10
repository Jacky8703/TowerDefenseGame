import { EnemyManager } from '../managers/EnemyManager';
import { ProjectileManager } from '../managers/ProjectileManager';
import { TowerManager } from '../managers/TowerManager';
import { WaveManager } from '../managers/WaveManager';
import { Action, GAME_CONFIG, TowerType } from './GameConfig';
import { GameMap } from './GameMap';
import { GameState } from './GameState';

export class GameEngine {
    private currentState: GameState;
    private waveManager: WaveManager;
    private enemyManager: EnemyManager;
    private towerManager: TowerManager;
    private projectileManager?: ProjectileManager;
    private lastUpdateTime: number;
    private deltaTime: number;

    constructor(
        map: GameMap,
        waveManager: WaveManager,
        enemyManager: EnemyManager,
        towerManager: TowerManager,
        projectileManager?: ProjectileManager
    ) {
        this.currentState = {
            gameTime: 0,
            waveNumber: 0,
            map: map,
            enemies: [],
            towers: [],
            projectiles: [],
            towerBuildCooldowns: this.setTowerBuildCooldowns(),
            gameOver: false,
        };
        this.waveManager = waveManager;
        this.enemyManager = enemyManager;
        this.towerManager = towerManager;
        this.projectileManager = projectileManager;
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
            this.towerManager.buildTower(
                action.towerType,
                action.position,
                this.currentState.towers,
                this.currentState.towerBuildCooldowns
            );
        }
        // update all managers
        this.waveManager.update(this.deltaTime, this.currentState.enemies);
        this.enemyManager.update(this.deltaTime, this.currentState.enemies);
        this.towerManager.update(
            this.deltaTime,
            this.currentState.towers,
            this.currentState.towerBuildCooldowns,
            this.currentState.enemies
        );
        //this.projectileManager.update(this.deltaTime);
        // update game state
        this.currentState.waveNumber = this.waveManager.getWaveNumber();
        this.currentState.gameTime += this.deltaTime;
        this.currentState.gameOver = this.checkGameOver();

        this.lastUpdateTime += this.deltaTime * 1000;
    }

    getState(): GameState {
        return this.currentState;
    }

    private setTowerBuildCooldowns(): Record<TowerType, number> {
        const cooldowns = {} as Record<TowerType, number>;
        for (const towerType in GAME_CONFIG.towers) {
            cooldowns[towerType as TowerType] = 0;
        }
        return cooldowns;
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
