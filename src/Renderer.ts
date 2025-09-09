import { Enemy, GAME_CONFIG } from './core/GameConfig';
import { GameMap } from './core/GameMap';
import { GameState } from './core/GameState';

export class Renderer {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
    }

    render(gameState: GameState) {
        this.drawMap(gameState.map);
        this.drawPath(gameState.map);
        this.drawEnemies(gameState.enemies);
    }

    private drawMap(map: GameMap) {
        this.ctx.fillStyle = 'green';
        map.buildableCells.forEach((cell) => {
            this.ctx.fillRect(
                cell.x - map.cellSize / 2,
                cell.y - map.cellSize / 2,
                map.cellSize,
                map.cellSize
            ); // top-left corner coordinates
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(
                cell.x - map.cellSize / 2,
                cell.y - map.cellSize / 2,
                map.cellSize,
                map.cellSize
            );
        });
    }

    private drawPath(map: GameMap) {
        this.ctx.fillStyle = 'brown';
        map.path.allCells.forEach((cell) => {
            this.ctx.fillRect(
                cell.x - map.cellSize / 2,
                cell.y - map.cellSize / 2,
                map.cellSize,
                map.cellSize
            ); // top-left corner coordinates
        });
    }

    private drawEnemies(enemies: Enemy[]) {
        this.ctx.fillStyle = 'black';
        enemies.forEach((enemy) => {
            this.ctx.beginPath();
            this.ctx.arc(
                enemy.position.x,
                enemy.position.y,
                10,
                0,
                2 * Math.PI
            );
            this.ctx.fill();
        });
    }
}
