import {
    Enemy,
    GAME_CONFIG,
    Position,
    Tower,
    TowerType,
} from '../core/GameConfig.js';
import { GameMap } from '../core/GameMap.js';

export class TowerManager {
    private readonly map: GameMap;

    constructor(gameMap: GameMap) {
        this.map = gameMap;
    }

    update(deltaTime: number, towers: Tower[], enemies: Enemy[]) {
        towers.forEach((t) => {
            t.attackCooldown = Math.max(0, t.attackCooldown - deltaTime);
        });
        this.findAndAttackEnemyInRange(towers, enemies);
    }

    buildTower(
        type: TowerType,
        position: Position,
        towers: Tower[],
        money: number
    ): number {
        if (money < GAME_CONFIG.towers[type].cost) {
            throw new Error(
                `not enough money (${money}) to build tower of type ${type}`
            );
        }
        // validate position
        if (
            !this.map.buildableCells.some(
                (c) => c.x === position.x && c.y === position.y
            ) ||
            towers.some(
                (t) =>
                    t.position.x === position.x && t.position.y === position.y
            )
        ) {
            throw new Error(
                `tower build position (${position.x}, ${position.y}) not valid`
            );
        }

        towers.push({
            type: type,
            position: position,
            attackCooldown: GAME_CONFIG.towers[type].attackCooldown,
        });
        return money - GAME_CONFIG.towers[type].cost;
    }

    // for each tower, check if it can fire, if yes check which enemies are in range and attack only the one with the highest progress along the path (the closest to the end)
    private findAndAttackEnemyInRange(towers: Tower[], enemies: Enemy[]) {
        towers.forEach((t) => {
            if (t.attackCooldown <= 0) {
                const enemiesInRange = enemies.filter(
                    (e) =>
                        this.map.calculateDistanceBetweenPoints(
                            t.position,
                            e.position
                        ) <= GAME_CONFIG.towers[t.type].range
                );
                if (enemiesInRange.length === 0) return;

                let target = enemiesInRange[0];
                for (let i = 1; i < enemiesInRange.length; i++) {
                    if (enemiesInRange[i].pathProgress > target.pathProgress) {
                        target = enemiesInRange[i];
                    }
                }
                target.currentHealth -= GAME_CONFIG.towers[t.type].damage;
                t.attackCooldown = GAME_CONFIG.towers[t.type].attackCooldown; // reset attack cooldown
            }
        });
    }
}
