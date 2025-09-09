import { GameState } from '../core/GameState';
import { Direction, Enemy, GAME_CONFIG, Position } from '../core/GameConfig';
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

    spawnEnemy(type: string, gameEnemies: Enemy[]) {
        const startPosition: Position = {
            x:
                GAME_CONFIG.map.waypointTopLeftCorners[0].x +
                GAME_CONFIG.map.cellSize / 2,
            y:
                GAME_CONFIG.map.waypointTopLeftCorners[0].y +
                GAME_CONFIG.map.cellSize / 2,
        };
        // default enemy
        let basicEnemy: Enemy = {
            health: GAME_CONFIG.enemies.basic.health,
            speed: GAME_CONFIG.enemies.basic.speed,
            position: startPosition,
            currentWaypointIndex: 1,
            pathProgress: 0,
        };
        switch (type) {
            case 'advanced': // this will be a new type of enemy with different health and speed
                gameEnemies.push(basicEnemy);
                break;

            default:
                gameEnemies.push(basicEnemy);
                break;
        }
    }

    private move(enemy: Enemy, deltaTime: number) {
        const movement = enemy.speed * deltaTime;
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
