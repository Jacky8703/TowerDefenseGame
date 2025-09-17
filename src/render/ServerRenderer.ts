import { Canvas, createCanvas } from 'canvas';
import { BaseRenderer } from './BaseRenderer.js';
import { GameMap } from '../core/GameMap.js';
import { GAME_CONFIG, TowerType } from '../core/GameConfig.js';
import { GameState } from '../core/GameState.js';

const INFO_PANEL_HEIGHT = 50;
const SIDE_PANEL_WIDTH = 150;

export class ServerRenderer extends BaseRenderer {
    private canvas: Canvas;

    constructor(map: GameMap) {
        const canvas = createCanvas(
            GAME_CONFIG.map.width + SIDE_PANEL_WIDTH,
            GAME_CONFIG.map.height + INFO_PANEL_HEIGHT
        );
        super(map, canvas.getContext('2d', { alpha: false }));
        this.canvas = canvas;
    }

    renderToBuffer(gameState: GameState): Buffer {
        this.ctx.fillStyle = '#1a202c'; // use the panel color as the main background
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // draw the info panel at the top
        this.drawInfoPanel(
            gameState.gameTime,
            gameState.waveNumber,
            gameState.money
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

        return this.canvas.toBuffer('image/png');
    }

    private drawInfoPanel(gameTime: number, waveNumber: number, money: number) {
        const barHeight = 50;
        // set the text style
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textBaseline = 'middle'; // makes vertical alignment easier
        const textY = barHeight / 2;
        const sectionWidth = this.canvas.width / 3;
        // draw each piece of information in its own section
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `Time: ${gameTime.toFixed(1)}s`,
            sectionWidth / 2,
            textY
        );
        this.ctx.fillText(
            `Wave: ${waveNumber}`,
            sectionWidth + sectionWidth / 2,
            textY
        );
        this.ctx.fillText(
            `Money: $${money}`,
            sectionWidth * 2 + sectionWidth / 2,
            textY
        );

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
}
