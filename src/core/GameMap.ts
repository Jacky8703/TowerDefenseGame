import { GAME_CONFIG, Point } from "./GameConfig";

export class GameMap {
    readonly width: number; 
    readonly height: number;
    readonly cellSize: number;
    readonly path: Point[];
    readonly buildableCells: Point[];

    constructor() {
        this.width = GAME_CONFIG.map.width;
        this.height = GAME_CONFIG.map.height;
        this.cellSize = GAME_CONFIG.map.cellSize;
        this.path = this.buildFullPath(GAME_CONFIG.map.pathAngles);
        this.buildableCells = this.calculateBuildableCells(this.path);
    }
    
    // the full path will be the one that links all angles
    private buildFullPath(pathAngles: Point[]): Point[] {
        let fullPath: Point[] = [];
        let curr: Point;
        let next: Point;
        let cellsCount = 0
        for (let i = 0; i < pathAngles.length-1; i++) {
            curr = pathAngles[i]
            next = pathAngles[i+1]
            fullPath.push(curr)
            if (curr.x === next.x) { // build vertically
                cellsCount = (Math.abs(curr.y - next.y)/this.cellSize)-1
                for (let j = 0; j < cellsCount; j++)
                    fullPath.push({x: curr.x, y: curr.y + this.cellSize*(j+1)})
            } else if (curr.y === next.y) { // build horizontally
                cellsCount = (Math.abs(curr.x - next.x)/this.cellSize)-1
                for (let j = 0; j < cellsCount; j++)
                    fullPath.push({x: curr.x + this.cellSize*(j+1), y: curr.y})
            } else {
                throw new Error("path points are not aligned")
            }
        }
        fullPath.push(pathAngles[pathAngles.length-1]) // add the last element
        return fullPath
    }

    private calculateBuildableCells(path: Point[]): Point[] {
        let buildableCells: Point[] = []
        let cell: Point;
        for (let x = 0; x < this.width; x += this.cellSize) {
            for (let y = 0; y < this.height; y += this.cellSize) {
                cell = {x: x, y: y}
                if (!path.some(p => p.x === cell.x && p.y === cell.y)) // is not part of the path
                    buildableCells.push(cell)
            }
        }
        return buildableCells
    }

}