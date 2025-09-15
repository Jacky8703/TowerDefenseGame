import { Direction, GAME_CONFIG, Position } from './GameConfig.js';

interface Waypoint {
    position: Position;
    readonly nextDirection: Direction; // direction to the next waypoint
    readonly distanceFromStart: number; // pixels
}

interface Path {
    readonly waypoints: Waypoint[];
    readonly allCells: Position[];
    readonly length: number; // pixels
}

export class GameMap {
    readonly width: number;
    readonly height: number;
    readonly cellSize: number;
    readonly path: Path;
    readonly buildableCells: Position[];

    constructor() {
        this.validateWaypointsConfig();
        this.width = GAME_CONFIG.map.width;
        this.height = GAME_CONFIG.map.height;
        this.cellSize = GAME_CONFIG.map.cellSize;
        this.path = this.buildFullPath([
            ...GAME_CONFIG.map.waypointTopLeftCorners,
        ]);
        this.buildableCells = this.calculateBuildableCells();
    }

    calculateDistanceBetweenPoints(from: Position, to: Position): number {
        return Math.sqrt(
            Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2)
        );
    }

    private validateWaypointsConfig() {
        for (
            let i = 0;
            i < GAME_CONFIG.map.waypointTopLeftCorners.length;
            i++
        ) {
            const curr = GAME_CONFIG.map.waypointTopLeftCorners[i];
            const next = GAME_CONFIG.map.waypointTopLeftCorners[i + 1];
            if (
                curr.x % GAME_CONFIG.map.cellSize !== 0 ||
                curr.y % GAME_CONFIG.map.cellSize !== 0
            ) {
                throw new Error(
                    `waypoint ${i} coordinates must be a multiple of cell size ${GAME_CONFIG.map.cellSize}`
                );
            }
            if (
                curr.x < 0 ||
                curr.x > GAME_CONFIG.map.width - GAME_CONFIG.map.cellSize ||
                curr.y < 0 ||
                curr.y > GAME_CONFIG.map.height - GAME_CONFIG.map.cellSize
            ) {
                throw new Error(
                    `waypoint ${i} coordinates must be within the map boundaries`
                );
            }
            if (i < GAME_CONFIG.map.waypointTopLeftCorners.length - 1) {
                // skip last waypoint
                if (curr.x !== next.x && curr.y !== next.y) {
                    throw new Error(
                        `waypoints ${i} and ${i + 1} must be aligned horizontally or vertically`
                    );
                }
            }
        }
    }

    private getDirectionBetweenPoints(from: Position, to: Position): Direction {
        const dx = Math.sign(to.x - from.x); // "<-" -1, 0, 1 "->"
        const dy = Math.sign(to.y - from.y); // "^" -1, 0, 1 "v"
        return { dx: dx, dy: dy };
    }

    private centerCoordinates(pos: Position): Position {
        return {
            x: pos.x + this.cellSize / 2,
            y: pos.y + this.cellSize / 2,
        };
    }

    // the full path will be the one that links all waypoints
    private buildFullPath(waypointsPos: Position[]): Path {
        let fullPath: Position[] = [];
        let curr: Position;
        let next: Position;
        let direction: Direction;
        let waypoints: Waypoint[] = [];
        let fullLength = 0;
        let cellsCount = 0;

        for (let i = 0; i < waypointsPos.length - 1; i++) {
            curr = waypointsPos[i];
            next = waypointsPos[i + 1];
            fullPath.push(curr);
            direction = this.getDirectionBetweenPoints(curr, next);
            const length = this.calculateDistanceBetweenPoints(curr, next);
            waypoints.push({
                position: waypointsPos[i],
                nextDirection: direction,
                distanceFromStart: fullLength,
            });
            fullLength += length;
            cellsCount = length / this.cellSize - 1; // does not work for waypoints not aligned
            for (let j = 0; j < cellsCount; j++)
                fullPath.push({
                    x: curr.x + this.cellSize * (j + 1) * direction.dx,
                    y: curr.y + this.cellSize * (j + 1) * direction.dy,
                });
        }
        fullPath.push(waypointsPos[waypointsPos.length - 1]); // add the last element
        waypoints.push({
            position: waypointsPos[waypointsPos.length - 1],
            nextDirection: { dx: 0, dy: 0 },
            distanceFromStart: fullLength,
        });
        waypoints.forEach(
            (w) => (w.position = this.centerCoordinates(w.position))
        ); // not reassigning reference but modifying properties so forEach does the work
        fullPath = fullPath.map((p) => (p = this.centerCoordinates(p)));

        return { waypoints: waypoints, allCells: fullPath, length: fullLength };
    }

    private calculateBuildableCells(): Position[] {
        let buildableCells: Position[] = [];
        let cell: Position;
        for (let x = 0; x < this.width; x += this.cellSize) {
            for (let y = 0; y < this.height; y += this.cellSize) {
                cell = { x: x + this.cellSize / 2, y: y + this.cellSize / 2 }; // center coordinates
                if (
                    !this.path.allCells.some(
                        (p) => p.x === cell.x && p.y === cell.y
                    )
                )
                    // is not part of the path
                    buildableCells.push({ x: cell.x, y: cell.y });
            }
        }

        return buildableCells;
    }
}
