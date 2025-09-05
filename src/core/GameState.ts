import { Enemy } from "../entities/Enemy"
import { Tower } from "../entities/Tower"
import { Projectile } from "../entities/Projectile"
import { GameMap } from "./GameMap"

export interface GameState {
    readonly gameTime: number
    readonly waveNumber: number
    readonly map: GameMap
    readonly enemies: Enemy[]
    readonly towers: Tower[]
    readonly projectiles: Projectile[]
}