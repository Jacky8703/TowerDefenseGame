import { Enemy, Tower, Projectile, TowerType } from '../core/GameConfig';
import { GameMap } from './GameMap';

export interface GameState {
    gameTime: number;
    waveNumber: number;
    map: GameMap;
    enemies: Enemy[];
    towers: Tower[];
    projectiles: Projectile[];
    towerBuildCooldowns: Record<TowerType, number>;
    gameOver: boolean;
}
