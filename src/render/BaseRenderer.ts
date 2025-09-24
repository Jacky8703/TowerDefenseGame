import { Enemy, GAME_CONFIG, Tower, TowerType } from '../core/GameConfig.js';
import { GameMap } from '../core/GameMap.js';
import { CanvasRenderingContext2D as NodeCanvasRenderingContext2D } from 'canvas';
import { GameState } from '../core/GameState.js';

export const INFO_PANEL_HEIGHT = 50;
const SIDE_PANEL_WIDTH = 150;

export abstract class BaseRenderer {
    protected map: GameMap;
    protected canvasWidth: number;
    protected canvasHeight: number;
    protected ctx!: CanvasRenderingContext2D | NodeCanvasRenderingContext2D;

    constructor(map: GameMap) {
        this.map = map;
        this.canvasWidth = map.width + SIDE_PANEL_WIDTH;
        this.canvasHeight = map.height + INFO_PANEL_HEIGHT;
    }

    private drawPath() {
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

    private drawMap() {
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
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });
    }

    private drawInfoPanel(gameTime: number, waveNumber: number, money: number, lives: number) {
        const barHeight = 50;
        // set the text style
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textBaseline = 'middle'; // makes vertical alignment easier
        const textY = barHeight / 2;
        const sectionWidth = this.canvasWidth / 4;
        // draw each piece of information in its own section
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `Time: ${gameTime.toFixed(1)}s`,
            sectionWidth * 0.5,
            textY
        );
        this.ctx.fillText(
            `Wave: ${waveNumber}`,
            sectionWidth * 1.5,
            textY
        );
        this.ctx.fillText(`Money: $${money}`, sectionWidth * 2.5, textY);
        this.ctx.fillText(`Lives: ${'♥'.repeat(lives)}`, sectionWidth * 3.5, textY);

        const panelX = GAME_CONFIG.map.width;
        const panelY = 50; // start below the top info bar
        const panelHeight = GAME_CONFIG.map.height;
        // draw a slightly different background for the side panel
        this.ctx.fillStyle = '#2d3748';
        this.ctx.fillRect(panelX, panelY, SIDE_PANEL_WIDTH, panelHeight);
        let yOffset = panelY + 40;
        const towerSize = 30;
        // iterate over each tower type to display its info
        for (const type of Object.values(TowerType)) {
            const towerConfig = GAME_CONFIG.towers[type];
            const isUnlocked = waveNumber >= towerConfig.unlockWave;
            const canAfford = money >= towerConfig.cost;
            // set opacity if locked or unaffordable
            this.ctx.globalAlpha = isUnlocked && canAfford ? 1.0 : 0.5;
            // draw tower representation
            this.ctx.fillStyle = towerConfig.color;
            this.ctx.fillRect(panelX + 20, yOffset, towerSize, towerSize);
            // draw tower name and cost
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'top';
            this.ctx.fillText(`${type}`, panelX + 20 + towerSize + 10, yOffset);
            this.ctx.font = '14px Arial';
            this.ctx.fillText(
                `Cost: $${towerConfig.cost}`,
                panelX + 20 + towerSize + 10,
                yOffset + 18
            );
            // draw unlock wave if not yet unlocked
            if (!isUnlocked) {
                this.ctx.fillStyle = '#e53e3e'; // red color for locked status
                this.ctx.font = 'bold 12px Arial';
                this.ctx.fillText(
                    `Unlocks at Wave ${towerConfig.unlockWave}`,
                    panelX + 20,
                    yOffset + towerSize + 5
                );
            }
            // reset opacity
            this.ctx.globalAlpha = 1.0;
            // move down for the next tower entry
            yOffset += 100;
        }
    }

    protected render(gameState: GameState) {
        this.ctx.fillStyle = '#1a202c'; // use the panel color as the main background
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        // draw the info panel at the top
        this.drawInfoPanel(
            gameState.gameTime,
            gameState.waveNumber,
            gameState.money,
            gameState.lives
        );
        // save the current context state (un-translated)
        this.ctx.save();
        // translate the entire coordinate system down by INFO_PANEL_HEIGHT
        this.ctx.translate(0, INFO_PANEL_HEIGHT);
        // draw the game world (these methods now draw in the translated space)
        this.drawPath();
        this.drawMap();
        this.drawEnemies(gameState.enemies);
        this.drawTowers(gameState.towers, this.map.cellSize / 1.5);
        // restore the context to its original state (removes the translation)
        this.ctx.restore();
    }
}
