import { Enemy, Tower } from '../core/GameConfig';
import { GameMap } from './GameMap';

export interface GameState {
    gameTime: number;
    waveNumber: number;
    map: GameMap;
    enemies: Enemy[];
    towers: Tower[];
    money: number;
    gameOver: boolean;
}
