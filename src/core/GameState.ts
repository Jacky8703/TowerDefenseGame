import { Enemy, Tower, Projectile } from '../core/GameConfig';
import { GameMap } from './GameMap';

export interface GameState {
    readonly gameTime: number;
    readonly waveNumber: number;
    readonly map: GameMap;
    readonly enemies: Enemy[];
    readonly towers: Tower[];
    readonly projectiles: Projectile[];
    readonly gameOver: boolean;
}
