import {
    Enemy,
    GAME_CONFIG,
    Position,
    Tower,
    TowerType,
} from '../core/GameConfig.js';
import { CanvasRenderingContext2D as NodeCanvasRenderingContext2D } from 'canvas';
import { GameState } from '../core/GameState.js';
import { GameMap } from '../core/GameMap.js';

export const INFO_PANEL_HEIGHT = 50;
export const SIDE_PANEL_WIDTH = 150;
/**
 * Draws the grid lines for buildable cells.
 */
export function drawGrid(
    ctx: CanvasRenderingContext2D | NodeCanvasRenderingContext2D
) {
    ctx.fillStyle = 'forestgreen';
    ctx.fillRect(0, 0, GAME_CONFIG.map.width, GAME_CONFIG.map.height);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    for (let x = 0; x <= GAME_CONFIG.map.width; x += GAME_CONFIG.map.cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, GAME_CONFIG.map.height);
        ctx.stroke();
    }
    for (
        let y = 0;
        y <= GAME_CONFIG.map.height;
        y += GAME_CONFIG.map.cellSize
    ) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(GAME_CONFIG.map.width, y);
        ctx.stroke();
    }
}

/**
 * Draws a continuous path based on an array of center-point waypoints.
 */
export function drawPath(
    ctx: CanvasRenderingContext2D | NodeCanvasRenderingContext2D,
    waypoints: Position[],
    color: string
) {
    if (waypoints.length < 2) return;

    ctx.fillStyle = color;
    for (let i = 0; i < waypoints.length - 1; i++) {
        const start = waypoints[i];
        const end = waypoints[i + 1];

        if (start.x === end.x) {
            // vertical path segment
            const minY = Math.min(start.y, end.y);
            const length = Math.abs(start.y - end.y);
            ctx.fillRect(
                start.x - GAME_CONFIG.map.cellSize / 2,
                minY - GAME_CONFIG.map.cellSize / 2,
                GAME_CONFIG.map.cellSize,
                length + GAME_CONFIG.map.cellSize
            );
        } else {
            // horizontal path segment
            const minX = Math.min(start.x, end.x);
            const length = Math.abs(start.x - end.x);
            ctx.fillRect(
                minX - GAME_CONFIG.map.cellSize / 2,
                start.y - GAME_CONFIG.map.cellSize / 2,
                length + GAME_CONFIG.map.cellSize,
                GAME_CONFIG.map.cellSize
            );
        }
    }
}

/**
 * Draws enemies as circles with health bars above them.
 */
export function drawEnemies(
    ctx: CanvasRenderingContext2D | NodeCanvasRenderingContext2D,
    enemies: Enemy[]
) {
    const radius = 10;
    const barWidth = 20;
    const barHeight = 4;

    enemies.forEach((enemy) => {
        // 1. Draw the enemy's body (a simple circle)
        ctx.beginPath();
        ctx.fillStyle = GAME_CONFIG.enemies[enemy.type].color;
        ctx.arc(enemy.position.x, enemy.position.y, radius, 0, 2 * Math.PI);
        ctx.fill();

        // 2. Calculate health percentage
        const healthPercent = enemy.currentHealth / enemy.fullHealth;

        // 3. Calculate health bar position (above the enemy)
        const barX = enemy.position.x - barWidth / 2;
        const barY = enemy.position.y - radius - barHeight - 2; // 2px padding

        // 4. Draw the health bar background (the "empty" part)
        ctx.fillStyle = 'red';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // 5. Draw the health bar foreground (the actual health)
        ctx.fillStyle = 'green';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    });
}

/**
 * Draws towers as squares with their range indicated by a circle.
 */
export function drawTowers(
    ctx: CanvasRenderingContext2D | NodeCanvasRenderingContext2D,
    towers: Tower[],
    size: number
) {
    towers.forEach((tower) => {
        ctx.fillStyle = GAME_CONFIG.towers[tower.type].color;
        ctx.fillRect(
            tower.position.x - size / 2,
            tower.position.y - size / 2,
            size,
            size
        ); // top-left corner coordinates
        ctx.beginPath();
        ctx.arc(
            tower.position.x,
            tower.position.y,
            GAME_CONFIG.towers[tower.type].range,
            0,
            2 * Math.PI
        );
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
    });
}

/**
 * Draws the top info panel and the side panel with tower info.
 */
export function drawInfoPanel(
    ctx: CanvasRenderingContext2D | NodeCanvasRenderingContext2D,
    gameTime: number,
    waveNumber: number,
    money: number,
    lives: number
) {
    // set the text style
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.textBaseline = 'middle'; // makes vertical alignment easier
    const textY = INFO_PANEL_HEIGHT / 2;
    const sectionWidth = ctx.canvas.width / 4;
    // draw each piece of information in its own section
    ctx.textAlign = 'center';
    ctx.fillText(`Time: ${gameTime.toFixed(1)}s`, sectionWidth * 0.5, textY);
    ctx.fillText(`Wave: ${waveNumber}`, sectionWidth * 1.5, textY);
    ctx.fillText(`Money: $${money}`, sectionWidth * 2.5, textY);
    ctx.fillText(`Lives: ${'♥'.repeat(lives)}`, sectionWidth * 3.5, textY);

    const panelX = GAME_CONFIG.map.width;
    const panelY = 50; // start below the top info bar
    const panelHeight = GAME_CONFIG.map.height;
    // draw a slightly different background for the side panel
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(panelX, panelY, SIDE_PANEL_WIDTH, panelHeight);
    let yOffset = panelY + 40;
    const towerSize = 30;
    // iterate over each tower type to display its info
    for (const type of Object.values(TowerType)) {
        const towerConfig = GAME_CONFIG.towers[type];
        const isUnlocked = waveNumber >= towerConfig.unlockWave;
        const canAfford = money >= towerConfig.cost;
        // set opacity if locked or unaffordable
        ctx.globalAlpha = isUnlocked && canAfford ? 1.0 : 0.5;
        // draw tower representation
        ctx.fillStyle = towerConfig.color;
        ctx.fillRect(panelX + 20, yOffset, towerSize, towerSize);
        // draw tower name and cost
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`${type}`, panelX + 20 + towerSize + 10, yOffset);
        ctx.font = '14px Arial';
        ctx.fillText(
            `Cost: $${towerConfig.cost}`,
            panelX + 20 + towerSize + 10,
            yOffset + 18
        );
        // draw unlock wave if not yet unlocked
        if (!isUnlocked) {
            ctx.fillStyle = '#e53e3e'; // red color for locked status
            ctx.font = 'bold 12px Arial';
            ctx.fillText(
                `Unlocks at Wave ${towerConfig.unlockWave}`,
                panelX + 20,
                yOffset + towerSize + 5
            );
        }
        // reset opacity
        ctx.globalAlpha = 1.0;
        // move down for the next tower entry
        yOffset += 100;
    }
}

/**
 * Renders the entire game layout including panels, grid, path, towers, and enemies.
 */
export function renderGameLayout(
    ctx: CanvasRenderingContext2D | NodeCanvasRenderingContext2D,
    map: GameMap,
    gameState: GameState
) {
    ctx.fillStyle = '#1a202c'; // use the panel color as the main background
    ctx.fillRect(
        0,
        0,
        GAME_CONFIG.map.width + SIDE_PANEL_WIDTH,
        GAME_CONFIG.map.height + INFO_PANEL_HEIGHT
    );
    // draw the info panel at the top
    drawInfoPanel(
        ctx,
        gameState.gameTime,
        gameState.waveNumber,
        gameState.money,
        gameState.lives
    );
    // save the current context state (un-translated)
    ctx.save();
    // translate the entire coordinate system down by INFO_PANEL_HEIGHT
    ctx.translate(0, INFO_PANEL_HEIGHT);
    // draw the game world (these methods now draw in the translated space)
    drawGrid(ctx);
    drawPath(
        ctx,
        map.path.waypoints.map((w) => w.position),
        'saddlebrown'
    );
    drawEnemies(ctx, gameState.enemies);
    drawTowers(ctx, gameState.towers, GAME_CONFIG.map.cellSize / 1.5);
    // restore the context to its original state (removes the translation)
    ctx.restore();
}
