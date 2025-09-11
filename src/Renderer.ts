import { Enemy, GAME_CONFIG, Tower, TowerType } from './core/GameConfig';
import { GameMap } from './core/GameMap';
import { GameState } from './core/GameState';

export class Renderer {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    towerButtons: HTMLButtonElement[];

    constructor(canvas: HTMLCanvasElement, towerButtons: HTMLButtonElement[]) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.towerButtons = towerButtons;
    }

    render(gameState: GameState) {
        this.drawPath(gameState.map);
        this.drawMap(gameState.map);
        this.drawEnemies(gameState.enemies);
        this.drawTowers(gameState.towers, gameState.map.cellSize / 1.5);
        this.updateButtons(gameState.towerBuildCooldowns, gameState.waveNumber);
    }

    private drawMap(map: GameMap) {
        this.ctx.fillStyle = 'forestgreen';
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
        this.ctx.fillStyle = 'saddlebrown';
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
            const healthPercent =
                enemy.health / GAME_CONFIG.enemies[enemy.type].health;

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

    private drawTowers(towers: Tower[], size: number) {
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
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
    }

    private updateButtons(cooldowns: Record<TowerType, number>, waveNumber: number) {
        this.towerButtons.forEach((button) => {
            button.disabled = cooldowns[button.id as TowerType] > 0 || waveNumber < GAME_CONFIG.towers[button.id as TowerType].unlockWave;
            button.textContent = `${button.id} - ${cooldowns[button.id as TowerType].toFixed(1)}`; // show remaining cooldown time
        });
    }
}
