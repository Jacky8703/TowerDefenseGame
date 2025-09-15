import { Enemy, Tower } from '../core/GameConfig.js';

export interface GameState {
    gameTime: number;
    waveNumber: number;
    money: number;
    gameOver: boolean;
    enemies: Enemy[];
    towers: Tower[];
}
