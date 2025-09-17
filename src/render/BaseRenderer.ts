import { Enemy, GAME_CONFIG, Tower } from '../core/GameConfig.js';
import { GameMap } from '../core/GameMap.js';
import { CanvasRenderingContext2D as NodeCanvasRenderingContext2D } from 'canvas';

export abstract class BaseRenderer {
    protected map: GameMap;
    protected ctx: CanvasRenderingContext2D | NodeCanvasRenderingContext2D;

    constructor(
        map: GameMap,
        ctx: CanvasRenderingContext2D | NodeCanvasRenderingContext2D
    ) {
        this.map = map;
        this.ctx = ctx;
    }

    protected drawPath() {
        this.ctx.fillStyle = 'saddlebrown';
        this.map.path.allCells.forEach((cell) => {
            this.ctx.fillRect(
                cell.x - this.map.cellSize / 2,
                cell.y - this.map.cellSize / 2,
                this.map.cellSize,
                this.map.cellSize
            ); // top-left corner coordinates
        });
    }

    protected drawMap() {
        this.ctx.fillStyle = 'forestgreen';
        this.map.buildableCells.forEach((cell) => {
            this.ctx.fillRect(
                cell.x - this.map.cellSize / 2,
                cell.y - this.map.cellSize / 2,
                this.map.cellSize,
                this.map.cellSize
            ); // top-left corner coordinates
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(
                cell.x - this.map.cellSize / 2,
                cell.y - this.map.cellSize / 2,
                this.map.cellSize,
                this.map.cellSize
            );
        });
    }

    protected drawEnemies(enemies: Enemy[]) {
        const radius = 10;
        const barWidth = 20;
        const barHeight = 4;

        enemies.forEach((enemy) => {
            // 1. Draw the enemy's body (a simple circle)
            this.ctx.beginPath();
            this.ctx.fillStyle = GAME_CONFIG.enemies[enemy.type].color;
            this.ctx.arc(
                enemy.position.x,
                enemy.position.y,
                radius,
                0,
                2 * Math.PI
            );
            this.ctx.fill();

            // 2. Calculate health percentage
            const healthPercent = enemy.currentHealth / enemy.fullHealth;

            // 3. Calculate health bar position (above the enemy)
            const barX = enemy.position.x - barWidth / 2;
            const barY = enemy.position.y - radius - barHeight - 2; // 2px padding

            // 4. Draw the health bar background (the "empty" part)
            this.ctx.fillStyle = 'red';
            this.ctx.fillRect(barX, barY, barWidth, barHeight);

            // 5. Draw the health bar foreground (the actual health)
            this.ctx.fillStyle = 'green';
            this.ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        });
    }

    protected drawTowers(towers: Tower[], size: number) {
        towers.forEach((tower) => {
            this.ctx.fillStyle = GAME_CONFIG.towers[tower.type].color;
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
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });
    }
}
