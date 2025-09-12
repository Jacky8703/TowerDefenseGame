import {
    Enemy,
    EnemyType,
    GAME_CONFIG,
    Position,
} from '../core/GameConfig';
import { GameMap } from '../core/GameMap';

export class EnemyManager {
    private readonly map: GameMap;

    constructor(gameMap: GameMap) {
        this.map = gameMap;
    }

    update(deltaTime: number, gameEnemies: Enemy[], money: number): number {
        for (let i = gameEnemies.length - 1; i >= 0; i--) {
            // iterate backwards for safe removal
            if (gameEnemies[i].currentHealth <= 0) {
                money += GAME_CONFIG.enemies[gameEnemies[i].type].reward;
                gameEnemies.splice(i, 1);
            } else {
                this.move(gameEnemies[i], deltaTime);
            }
        }
        return money;
    }

    spawnEnemy(type: EnemyType, healthMultiplier: number, speedMultiplier: number, gameEnemies: Enemy[]) {
        const startPosition: Position = {
            x:
                GAME_CONFIG.map.waypointTopLeftCorners[0].x +
                GAME_CONFIG.map.cellSize / 2,
            y:
                GAME_CONFIG.map.waypointTopLeftCorners[0].y +
                GAME_CONFIG.map.cellSize / 2,
        };

        gameEnemies.push({
            type: type,
            fullHealth: GAME_CONFIG.enemies[type].health * healthMultiplier,
            currentHealth: GAME_CONFIG.enemies[type].health * healthMultiplier,
            currentSpeed: GAME_CONFIG.enemies[type].speed * speedMultiplier,
            position: startPosition,
            currentWaypointIndex: 1,
            pathProgress: 0,
        });
    }

    private move(enemy: Enemy, deltaTime: number) {
        const movement = enemy.currentSpeed * deltaTime;
        const direction =
            this.map.path.waypoints[enemy.currentWaypointIndex - 1]
                .nextDirection;
        enemy.position.x += movement * direction.dx;
        enemy.position.y += movement * direction.dy;

        let waypointReached = false;
        const targetWaypoint = this.map.path.waypoints[enemy.currentWaypointIndex];
        if (direction.dx > 0 && enemy.position.x >= targetWaypoint.position.x) {
            waypointReached = true; // >
        } else if (direction.dx < 0 && enemy.position.x <= targetWaypoint.position.x) {
            waypointReached = true; // <
        } else if (direction.dy > 0 && enemy.position.y >= targetWaypoint.position.y) {
            waypointReached = true; // v
        } else if (direction.dy < 0 && enemy.position.y <= targetWaypoint.position.y) {
            waypointReached = true; // ^
        }
        if (waypointReached) {
            enemy.position.x = targetWaypoint.position.x;
            enemy.position.y = targetWaypoint.position.y;
            enemy.currentWaypointIndex += 1;
        }

        enemy.pathProgress =
            (this.map.path.waypoints[enemy.currentWaypointIndex - 1]
                .distanceFromStart +
                this.map.calculateDistanceBetweenPoints(
                    enemy.position,
                    this.map.path.waypoints[enemy.currentWaypointIndex - 1]
                        .position
                )) /
            this.map.path.length;
    }
}
