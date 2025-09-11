import {
    Enemy,
    EnemyType,
    GAME_CONFIG,
    Position,
    Wave,
} from '../core/GameConfig';
import { EnemyManager } from './EnemyManager';

enum WaveState {
    WAITING = 'waiting',
    SPAWNING = 'spawning',
}

export class WaveManager {
    private readonly enemyManager: EnemyManager;
    private waveState: WaveState;
    private currentWaveNumber: number;
    private currentEnemyCount: Record<EnemyType, number>;
    private waveDelay: number;
    private spawnDelay: number;

    constructor(enemyManager: EnemyManager) {
        this.enemyManager = enemyManager;
        this.waveState = WaveState.WAITING;
        this.currentWaveNumber = 0;
        this.currentEnemyCount = {
            [EnemyType.BASIC]: 0,
            [EnemyType.FAST]: 0,
            [EnemyType.TANK]: 0,
        };
        this.waveDelay = GAME_CONFIG.waves.waveDelay;
        this.spawnDelay = GAME_CONFIG.waves.spawnDelay;
    }

    update(deltaTime: number, gameEnemies: Enemy[]) {
        switch (this.waveState) {
            case WaveState.WAITING:
                this.waveDelay -= deltaTime;
                if (this.waveDelay <= 0) {
                    this.currentWaveNumber++;
                    this.currentEnemyCount = this.generateWave();
                    this.waveState = WaveState.SPAWNING;
                    this.waveDelay = GAME_CONFIG.waves.waveDelay;
                }
                break;

            case WaveState.SPAWNING:
                this.spawnDelay -= deltaTime;

                if (this.spawnDelay <= 0) {
                    for (const type of Object.values(EnemyType)) {
                        if (this.currentEnemyCount[type] > 0) {
                            this.spawn(type, gameEnemies);
                            return;
                        }
                    }
                    // all enemies for this wave have been spawned
                    this.waveState = WaveState.WAITING;
                }

                break;
            default:
                throw new Error('error with the wave manager state');
        }
    }

    getWaveNumber(): number {
        return this.currentWaveNumber;
    }

    private spawn(type: EnemyType, gameEnemies: Enemy[]) {
        this.enemyManager.spawnEnemy(type, gameEnemies);
        this.currentEnemyCount[type]--;
        this.spawnDelay = GAME_CONFIG.waves.spawnDelay;
    }

    private generateWave(): Record<EnemyType, number> {
        if (this.currentWaveNumber <= GAME_CONFIG.waves.list.length) {
            return {
                [EnemyType.BASIC]:
                    GAME_CONFIG.waves.list[this.currentWaveNumber - 1].basic,
                [EnemyType.FAST]:
                    GAME_CONFIG.waves.list[this.currentWaveNumber - 1].fast,
                [EnemyType.TANK]:
                    GAME_CONFIG.waves.list[this.currentWaveNumber - 1].tank,
            };
        } else {
            // create new waves based on the last predefined wave
            let multiplier = Math.pow(GAME_CONFIG.waves.growthFactor, this.currentWaveNumber-GAME_CONFIG.waves.list.length);
            return {
                [EnemyType.BASIC]: Math.ceil(
                    GAME_CONFIG.waves.list[GAME_CONFIG.waves.list.length - 1].basic * multiplier
                    ),
                [EnemyType.FAST]: Math.ceil(
                    GAME_CONFIG.waves.list[GAME_CONFIG.waves.list.length - 1].fast * multiplier
                ),
                [EnemyType.TANK]: Math.ceil(
                    GAME_CONFIG.waves.list[GAME_CONFIG.waves.list.length - 1].tank * multiplier
                ),
            };
        }
    }
}
