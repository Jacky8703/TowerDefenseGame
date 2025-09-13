import { Enemy, Tower } from '../core/GameConfig.js';
import { GameMap } from './GameMap.js';

export interface GameState {
    gameTime: number;
    waveNumber: number;
    map: GameMap;
    enemies: Enemy[];
    towers: Tower[];
    money: number;
    gameOver: boolean;
}
