import { Canvas, createCanvas } from 'canvas';
import { BaseRenderer } from './BaseRenderer.js';
import { GameMap } from '../core/GameMap.js';
import { GameState } from '../core/GameState.js';

export class ServerRenderer extends BaseRenderer {
    private canvas: Canvas;

    constructor(map: GameMap) {
        super(map);
        const canvas = createCanvas(this.canvasWidth, this.canvasHeight);
        this.ctx = canvas.getContext('2d', { alpha: false });
        this.canvas = canvas;
    }

    renderToBuffer(gameState: GameState): Buffer {
        this.render(gameState);
        return this.canvas.toBuffer('image/png');
    }
}
