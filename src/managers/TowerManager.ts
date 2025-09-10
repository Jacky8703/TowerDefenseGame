import {
    Enemy,
    GAME_CONFIG,
    Position,
    Tower,
    TowerType,
} from '../core/GameConfig';
import { GameMap } from '../core/GameMap';

export class TowerManager {
    private readonly map: GameMap;

    constructor(gameMap: GameMap) {
        this.map = gameMap;
    }

    update(
        deltaTime: number,
        towers: Tower[],
        buildCooldowns: Record<TowerType, number>,
        enemies: Enemy[]
    ) {
        // valuta se passare tutto lo stato
        // substract cooldowns, find and attack enemies
        for (const towerType in buildCooldowns) {
            const type = towerType as TowerType;
            buildCooldowns[type] = Math.max(
                0,
                buildCooldowns[type] - deltaTime
            );
        }
        towers.forEach((t) => {
            t.fireRate = Math.max(0, t.fireRate - deltaTime);
        });
        this.findAndAttackEnemyInRange(towers, enemies);
    }

    buildTower(
        type: TowerType,
        position: Position,
        towers: Tower[],
        buildCooldowns: Record<TowerType, number>
    ) {
        // check cooldown
        if (buildCooldowns[type] > 0) {
            console.log('tower type is on cooldown');
            return;
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
            throw new Error('tower build position not valid');
        }

        towers.push({
            type: type,
            position: position,
            fireRate: GAME_CONFIG.towers[type].attackSpeed,
        });
        buildCooldowns[type] = GAME_CONFIG.towers[type].buildCooldown;
    }

    // for each tower, check if it can fire, if yes check which enemies are in range and attack only the one with the highest progress along the path (the closest to the end)
    private findAndAttackEnemyInRange(towers: Tower[], enemies: Enemy[]) {
        towers.forEach((t) => {
            if (t.fireRate <= 0) {
                let enemiesInRange = enemies.filter(
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
                target.health -= GAME_CONFIG.towers[t.type].damage;
                t.fireRate = GAME_CONFIG.towers[t.type].attackSpeed; // reset fire rate
            }
        });
    }
}
