import { Enemy, EnemyType, GAME_CONFIG } from '../core/GameConfig';
import { EnemyManager } from './EnemyManager';

enum WaveState {
    WAITING = 'waiting',
    SPAWNING = 'spawning',
}

interface Multipliers {
    enemyHealth: number;
    enemySpeed: number;
}

export class WaveManager {
    private readonly enemyManager: EnemyManager;
    private waveState: WaveState;
    private currentWaveNumber: number;
    private currentEnemyCount: Record<EnemyType, number>;
    private waveDelay: number;
    private spawnDelay: number;
    private multipliers: Multipliers;

    constructor(enemyManager: EnemyManager) {
        this.enemyManager = enemyManager;
        this.waveState = WaveState.WAITING;
        this.currentWaveNumber = 0;
        this.currentEnemyCount = {} as Record<EnemyType, number>;
        this.waveDelay = GAME_CONFIG.waves.waveDelay;
        this.spawnDelay = GAME_CONFIG.waves.spawnDelay;
        this.multipliers = {
            enemyHealth: 1,
            enemySpeed: 1,
        };

        for (const type of Object.values(EnemyType)) {
            this.currentEnemyCount[type] = 0;
        }
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
                            return; // spawn one enemy at a time
                        }
                    }
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
        this.enemyManager.spawnEnemy(
            type,
            this.multipliers.enemyHealth,
            this.multipliers.enemySpeed,
            gameEnemies
        );
        this.currentEnemyCount[type]--;
        this.spawnDelay = GAME_CONFIG.waves.spawnDelay;
    }

    private generateWave(): Record<EnemyType, number> {
        // update multipliers
        if (this.currentWaveNumber <= GAME_CONFIG.waves.list.length) {
            return {
                ...GAME_CONFIG.waves.list[this.currentWaveNumber - 1],
            };
        } else {
            // update multipliers
            const factor =
                this.currentWaveNumber - GAME_CONFIG.waves.list.length;
            this.multipliers.enemyHealth = Math.pow(
                GAME_CONFIG.waves.healthGrowthFactor,
                factor
            );
            this.multipliers.enemySpeed = Math.pow(
                GAME_CONFIG.waves.speedGrowthFactor,
                factor
            );
            console.log(
                'Wave %d multipliers: health %f. speed %f.',
                this.currentWaveNumber,
                this.multipliers.enemyHealth,
                this.multipliers.enemySpeed
            );
            return {
                ...GAME_CONFIG.waves.list[GAME_CONFIG.waves.list.length - 1],
            };
        }
    }
}
