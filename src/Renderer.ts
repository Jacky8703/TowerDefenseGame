import { GAME_CONFIG } from './core/GameConfig';
import { GameState } from './core/GameState';

export class Renderer {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
    }

    render(gameState: GameState) {
        this.drawMap(gameState);
        // Further rendering methods for enemies, towers, projectiles would go here
    }

    private drawMap(gameState: GameState) {
        this.ctx.fillStyle = 'green';
        gameState.map.buildableCells.forEach((cell) => {
            this.ctx.fillRect(
                cell.x - gameState.map.cellSize / 2,
                cell.y - gameState.map.cellSize / 2,
                gameState.map.cellSize,
                gameState.map.cellSize
            ); // top-left corner coordinates
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(
                cell.x - gameState.map.cellSize / 2,
                cell.y - gameState.map.cellSize / 2,
                gameState.map.cellSize,
                gameState.map.cellSize
            );
        });
    }
}
