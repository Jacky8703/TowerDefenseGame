import { Enemy, Tower, Projectile } from '../core/GameConfig';
import { GameMap } from './GameMap';

export interface GameState {
    gameTime: number;
    waveNumber: number;
    map: GameMap;
    enemies: Enemy[];
    towers: Tower[];
    projectiles: Projectile[];
    gameOver: boolean;
}
