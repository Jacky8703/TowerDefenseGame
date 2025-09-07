import { Direction, GAME_CONFIG, Position } from "./GameConfig";

export class GameMap {
    readonly width: number; 
    readonly height: number;
    readonly cellSize: number;
    readonly waypoints: Position[];
    readonly path: Position[];
    readonly buildableCells: Position[];

    constructor() {
        this.width = GAME_CONFIG.map.width;
        this.height = GAME_CONFIG.map.height;
        this.cellSize = GAME_CONFIG.map.cellSize;
        this.waypoints = this.centerCoordinates(GAME_CONFIG.map.waypointTopLeftCorners)
        this.path = this.buildFullPath(GAME_CONFIG.map.waypointTopLeftCorners);
        this.buildableCells = this.calculateBuildableCells();
    }

    private centerCoordinates(positions: Position[]): Position[] {
        return positions.map(p => ({
            x: p.x + this.cellSize/2,
            y: p.y + this.cellSize/2 
        }));
    }

    // the full path will be the one that links all waypoints
    private buildFullPath(pathAngles: Position[]): Position[] {
        let fullPath: Position[] = [];
        let curr: Position;
        let next: Position;
        let direction: Direction;
        let cellsCount = 0

        for (let i = 0; i < pathAngles.length-1; i++) {
            curr = pathAngles[i]
            next = pathAngles[i+1]
            direction = this.getDirectionBetweenPoints(curr, next)
            fullPath.push(curr)
            cellsCount = (Math.sqrt(Math.pow((curr.x - next.x), 2)+Math.pow((curr.y - next.y), 2))/this.cellSize)-1 // does not work for waypoints not aligned
            for (let j = 0; j < cellsCount; j++)
                fullPath.push({x: curr.x + (this.cellSize*(j+1)*direction.dx), y: curr.y + (this.cellSize*(j+1)*direction.dy)})
        }
        fullPath.push(pathAngles[pathAngles.length-1]) // add the last element
        fullPath = this.centerCoordinates(fullPath)

        return fullPath
    }

    private calculateBuildableCells(): Position[] {
        let buildableCells: Position[] = []
        let cell: Position;
        for (let x = 0; x < this.width; x += this.cellSize) {
            for (let y = 0; y < this.height; y += this.cellSize) {
                cell = {x: x + this.cellSize/2, y: y + this.cellSize/2} // center coordinates
                if (!this.path.some(p => p.x === cell.x && p.y === cell.y)) // is not part of the path
                    buildableCells.push({x: cell.x, y: cell.y})
            }
        }

        return buildableCells
    }

    getDirectionBetweenPoints(from: Position, to: Position): Direction {
        let dx = Math.sign(to.x - from.x) // "<-" -1, 0, 1 "->"
        let dy = Math.sign(to.y - from.y) // "^" -1, 0, 1 "v"
        return {dx: dx, dy: dy}
    }

}