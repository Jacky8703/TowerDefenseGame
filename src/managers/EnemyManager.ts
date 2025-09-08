import { GameState } from '../core/GameState';
import { Direction, Enemy, Position } from '../core/GameConfig';
import { GameMap } from '../core/GameMap';

export class EnemyManager {
    update(state: GameState, deltaTime: number) {
        state.enemies.forEach((enemy) => {
            if (enemy.health <= 0) {
                this.removeEnemy(enemy, state.enemies);
            } else {
                this.move(enemy, deltaTime, state.map);
            }
        });
    }

    private move(enemy: Enemy, deltaTime: number, map: GameMap) {
        const movement = enemy.speed * deltaTime;
        const direction =
            map.path.waypoints[enemy.currentWaypointIndex - 1].nextDirection;
        enemy.position.x += movement * direction.dx;
        enemy.position.y += movement * direction.dy;

        if (
            enemy.position.x >=
                map.path.waypoints[enemy.currentWaypointIndex + 1].position.x &&
            enemy.position.y >=
                map.path.waypoints[enemy.currentWaypointIndex + 1].position.y
        ) {
            // next waypoint reached
            enemy.position.x =
                map.path.waypoints[enemy.currentWaypointIndex + 1].position.x;
            enemy.position.y =
                map.path.waypoints[enemy.currentWaypointIndex + 1].position.y;
            enemy.currentWaypointIndex += 1;
        }

        enemy.pathProgress =
            (map.path.waypoints[enemy.currentWaypointIndex - 1]
                .distanceFromStart +
                movement) /
            map.path.length;
    }

    private removeEnemy(enemy: Enemy, array: Enemy[]) {
        array.splice(array.indexOf(enemy), 1);
    }
}
