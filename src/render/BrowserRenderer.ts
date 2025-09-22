import { Action, GAME_CONFIG, TowerType } from '../core/GameConfig.js';
import { GameMap } from '../core/GameMap.js';
import { GameState } from '../core/GameState.js';
import { BaseRenderer, INFO_PANEL_HEIGHT } from './BaseRenderer.js';

interface BrowserPanel {
    towerButtons: HTMLButtonElement[];
    gameOverScreen: HTMLElement;
    finalWaveNumber: HTMLElement;
}

export class BrowserRenderer extends BaseRenderer {
    private canvas: HTMLCanvasElement;
    private browserPanel: BrowserPanel;
    private selectedTowerType: TowerType | null;
    action: Action;

    constructor(map: GameMap) {
        const canvas = document.getElementById(
            'gameCanvas'
        ) as HTMLCanvasElement;
        super(map);
        this.ctx = canvas.getContext('2d')!;
        this.canvas = canvas;
        this.browserPanel = {
            towerButtons: [],
            gameOverScreen: document.getElementById('game-over-screen')!,
            finalWaveNumber: document.getElementById('final-wave-number')!,
        };
        this.selectedTowerType = null;
        this.action = { type: 'NONE' };
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;

        for (const type of Object.values(TowerType)) {
            const button = document.getElementById(
                type
            ) as HTMLButtonElement | null;
            if (!button) throw new Error(`${type} tower button id not found`);
            button.style.border = `2px solid ${GAME_CONFIG.towers[type as TowerType].color}`;
            button.addEventListener('click', () => {
                this.selectedTowerType = type as TowerType;
            });
            this.browserPanel.towerButtons.push(button);
        }

        this.manageInput();
    }

    renderToBrowser(gameState: GameState) {
        this.render(gameState);
        this.updateBrowserPanel(
            gameState.money,
            gameState.waveNumber,
            gameState.gameOver
        );
    }

    private manageInput() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.addEventListener('click', (event) => {
            if (this.selectedTowerType !== null) {
                // get click position relative to canvas (it has the panel height top offset)
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top - INFO_PANEL_HEIGHT; // account for the offset

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

    private updateBrowserPanel(
        money: number,
        waveNumber: number,
        gameOver: boolean
    ) {
        if (gameOver) {
            this.browserPanel.finalWaveNumber.textContent =
                waveNumber.toString();
            this.browserPanel.gameOverScreen.style.display = 'flex'; // make the screen visible
            return;
        }
        this.browserPanel.towerButtons.forEach((button) => {
            button.disabled =
                money < GAME_CONFIG.towers[button.id as TowerType].cost ||
                waveNumber <
                    GAME_CONFIG.towers[button.id as TowerType].unlockWave;
            button.textContent = `${button.id} - $${GAME_CONFIG.towers[button.id as TowerType].cost}`; // show tower cost
        });
    }
}
