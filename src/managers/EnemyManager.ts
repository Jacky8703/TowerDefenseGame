import { GameState } from '../core/GameState';
import {
    Direction,
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

    update(deltaTime: number, gameEnemies: Enemy[]) {
        for (let i = gameEnemies.length - 1; i >= 0; i--) {
            // iterate backwards for safe removal
            if (gameEnemies[i].health <= 0) {
                gameEnemies.splice(i, 1);
            } else {
                this.move(gameEnemies[i], deltaTime);
            }
        }
    }

    spawnEnemy(type: EnemyType, gameEnemies: Enemy[]) {
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
            health: GAME_CONFIG.enemies[type].health,
            position: startPosition,
            currentWaypointIndex: 1,
            pathProgress: 0,
        });
    }

    private move(enemy: Enemy, deltaTime: number) {
        const movement = GAME_CONFIG.enemies[enemy.type].speed * deltaTime;
        const direction =
            this.map.path.waypoints[enemy.currentWaypointIndex - 1]
                .nextDirection;
        enemy.position.x += movement * direction.dx;
        enemy.position.y += movement * direction.dy;

        if (
            enemy.position.x >=
                this.map.path.waypoints[enemy.currentWaypointIndex].position
                    .x &&
            enemy.position.y >=
                this.map.path.waypoints[enemy.currentWaypointIndex].position.y
        ) {
            // next waypoint reached, works only for right and down directions
            enemy.position.x =
                this.map.path.waypoints[enemy.currentWaypointIndex].position.x;
            enemy.position.y =
                this.map.path.waypoints[enemy.currentWaypointIndex].position.y;
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
