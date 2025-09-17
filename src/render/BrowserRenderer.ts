import { ca } from 'zod/locales';
import {
    Action,
    Enemy,
    GAME_CONFIG,
    Tower,
    TowerType,
} from '../core/GameConfig.js';
import { GameMap } from '../core/GameMap.js';
import { GameState } from '../core/GameState.js';
import { BaseRenderer } from './BaseRenderer.js';

interface InfoPanel {
    timeDisplay: HTMLElement;
    moneyDisplay: HTMLElement;
    waveDisplay: HTMLElement;
    towerButtons: HTMLButtonElement[];
    gameOverScreen: HTMLElement;
    finalWaveNumber: HTMLElement;
}

export class BrowserRenderer extends BaseRenderer {
    private canvas: HTMLCanvasElement;
    private infoPanel: InfoPanel;
    private selectedTowerType: TowerType | null;
    action: Action;

    constructor(map: GameMap) {
        const canvas = document.getElementById(
            'gameCanvas'
        ) as HTMLCanvasElement;
        super(map, canvas.getContext('2d')!);
        this.canvas = canvas;
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
}
