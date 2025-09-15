import { Enemy, Tower } from '../core/GameConfig.js';

export interface GameState {
    gameTime: number;
    waveNumber: number;
    enemies: Enemy[];
    towers: Tower[];
    money: number;
    gameOver: boolean;
}
