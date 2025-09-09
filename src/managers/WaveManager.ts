import { Enemy, GAME_CONFIG, Position, Wave } from '../core/GameConfig';
import { EnemyManager } from './EnemyManager';

enum WaveState {
    WAITING = 'waiting',
    SPAWNING = 'spawning',
    FINISHED = 'finished',
}

export class WaveManager {
    private readonly enemyManager: EnemyManager;
    private waveState: WaveState;
    private currentWaveNumber: number;
    private currentEnemyCount: number;
    private waveDelay: number;
    private spawnDelay: number;

    constructor(enemyManager: EnemyManager) {
        this.enemyManager = enemyManager;
        this.waveState = WaveState.WAITING;
        this.currentWaveNumber = 0;
        this.currentEnemyCount = 0;
        this.waveDelay = GAME_CONFIG.waves.waveDelay;
        this.spawnDelay = GAME_CONFIG.waves.spawnDelay;
    }

    update(deltaTime: number, gameEnemies: Enemy[]) {
        switch (this.waveState) {
            case WaveState.WAITING:
                if (this.currentWaveNumber >= GAME_CONFIG.waves.list.length) {
                    this.waveState = WaveState.FINISHED;
                    break;
                }

                this.waveDelay -= deltaTime;
                if (this.waveDelay <= 0) {
                    this.currentWaveNumber++;
                    console.log('wave %d', this.currentWaveNumber);
                    this.currentEnemyCount = 0;
                    this.waveState = WaveState.SPAWNING;
                    this.waveDelay = GAME_CONFIG.waves.waveDelay;
                }
                break;

            case WaveState.SPAWNING:
                this.waveDelay -= deltaTime;
                this.spawnDelay -= deltaTime;

                if (
                    this.currentEnemyCount ===
                    GAME_CONFIG.waves.list[this.currentWaveNumber - 1]
                        .enemyCount
                ) {
                    this.waveState = WaveState.WAITING;
                    this.spawnDelay = GAME_CONFIG.waves.spawnDelay;
                } else if (this.spawnDelay <= 0) {
                    this.spawn(gameEnemies);
                    this.spawnDelay = GAME_CONFIG.waves.spawnDelay;
                }
                break;
            case WaveState.FINISHED:
                return;
            default:
                throw new Error('error with the wave manager state');
        }
    }

    getWaveNumber(): number {
        return this.currentWaveNumber;
    }

    private spawn(gameEnemies: Enemy[]) {
        this.enemyManager.spawnEnemy(
            GAME_CONFIG.waves.list[this.currentWaveNumber - 1].enemyType,
            gameEnemies
        );
        this.currentEnemyCount++;
    }
}
