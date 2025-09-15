import {
    Action,
    Enemy,
    GAME_CONFIG,
    Tower,
    TowerType,
} from './core/GameConfig.js';
import { GameMap } from './core/GameMap.js';
import { GameState } from './core/GameState.js';

interface InfoPanel {
    timeDisplay: HTMLElement;
    moneyDisplay: HTMLElement;
    waveDisplay: HTMLElement;
    towerButtons: HTMLButtonElement[];
    gameOverScreen: HTMLElement;
    finalWaveNumber: HTMLElement;
}

export class Renderer {
    private map: GameMap;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private infoPanel: InfoPanel;
    private selectedTowerType: TowerType | null;
    action: Action;

    constructor(map: GameMap) {
        this.map = map;
        this.canvas = document.getElementById(
            'gameCanvas'
        ) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.infoPanel = {
            timeDisplay: document.getElementById('time-display')!,
            moneyDisplay: document.getElementById('money-display')!,
            waveDisplay: document.getElementById('wave-display')!,
            towerButtons: [],
            gameOverScreen: document.getElementById('game-over-screen')!,
            finalWaveNumber: document.getElementById('final-wave-number')!,
        };
        this.selectedTowerType = null;
        this.action = { type: 'NONE' };

        this.canvas.width = GAME_CONFIG.map.width;
        this.canvas.height = GAME_CONFIG.map.height;

        for (const type of Object.values(TowerType)) {
            const button = document.getElementById(
                type
            ) as HTMLButtonElement | null;
            if (!button) throw new Error(`${type} tower button id not found`);
            button.style.border = `2px solid ${GAME_CONFIG.towers[type as TowerType].color}`;
            button.addEventListener('click', () => {
                this.selectedTowerType = type as TowerType;
            });
            this.infoPanel.towerButtons.push(button);
        }

        this.manageInput();
    }

    render(gameState: GameState) {
        this.drawPath();
        this.drawMap();
        this.drawEnemies(gameState.enemies);
        this.drawTowers(gameState.towers, this.map.cellSize / 1.5);
        this.updateInfoPanel(
            gameState.gameTime,
            gameState.money,
            gameState.waveNumber,
            gameState.gameOver
        );
    }

    private manageInput() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.addEventListener('click', (event) => {
            if (this.selectedTowerType !== null) {
                // get click position relative to canvas
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                const gridCellIndexX = Math.floor(x / this.map.cellSize);
                const gridCellIndexY = Math.floor(y / this.map.cellSize);

                this.action = {
                    type: 'BUILD_TOWER',
                    // center coordinates
                    position: {
                        x:
                            this.map.cellSize / 2 +
                            gridCellIndexX * this.map.cellSize,
                        y:
                            this.map.cellSize / 2 +
                            gridCellIndexY * this.map.cellSize,
                    },
                    towerType: this.selectedTowerType,
                };
                this.selectedTowerType = null;
            }
        });
    }

    private updateInfoPanel(
        gameTime: number,
        money: number,
        waveNumber: number,
        gameOver: boolean
    ) {
        if (gameOver) {
            this.infoPanel.finalWaveNumber.textContent = waveNumber.toString();
            this.infoPanel.gameOverScreen.style.display = 'flex'; // make the screen visible
            return;
        }
        this.infoPanel.timeDisplay.textContent = `Time: ${Math.floor(gameTime)}s`;
        this.infoPanel.moneyDisplay.textContent = `Money: $${money}`;
        this.infoPanel.waveDisplay.textContent = `Wave: ${waveNumber}`;
        this.infoPanel.towerButtons.forEach((button) => {
            button.disabled =
                money < GAME_CONFIG.towers[button.id as TowerType].cost ||
                waveNumber <
                    GAME_CONFIG.towers[button.id as TowerType].unlockWave;
            button.textContent = `${button.id} - $${GAME_CONFIG.towers[button.id as TowerType].cost}`; // show tower cost
        });
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
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
    }
}
