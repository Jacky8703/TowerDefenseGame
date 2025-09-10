import { Enemy, GAME_CONFIG, Tower } from './core/GameConfig';
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
        this.drawTowers(gameState.towers, gameState.map.cellSize / 1.5);
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
        const radius = 10;
        enemies.forEach((enemy) => {
            const healthPercent =
                enemy.health / GAME_CONFIG.enemies[enemy.type].health;
            // draw the outer contour (a full, empty circle)
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 2;
            this.ctx.arc(
                enemy.position.x,
                enemy.position.y,
                radius,
                0,
                2 * Math.PI
            );
            this.ctx.stroke();

            // draw the filled health arc
            this.ctx.beginPath();
            this.ctx.fillStyle = 'black';
            // move to the center to create a pie-slice shape
            this.ctx.moveTo(enemy.position.x, enemy.position.y);
            // draw the arc from the top (-90 degrees) clockwise
            this.ctx.arc(
                enemy.position.x,
                enemy.position.y,
                radius,
                -0.5 * Math.PI,
                -0.5 * Math.PI + healthPercent * 2 * Math.PI
            );
            this.ctx.closePath(); // close the path back to the center
            this.ctx.fill();
        });
    }

    private drawTowers(towers: Tower[], size: number) {
        this.ctx.fillStyle = 'grey';
        towers.forEach((tower) => {
            this.ctx.fillRect(
                tower.position.x - size / 2,
                tower.position.y - size / 2,
                size,
                size
            ); // top-left corner coordinates
            this.ctx.beginPath();
            this.ctx.arc(
                tower.position.x,
                tower.position.y,
                GAME_CONFIG.towers[tower.type].range,
                0,
                2 * Math.PI
            );
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
    }
}
