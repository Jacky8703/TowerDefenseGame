import { Canvas, createCanvas } from 'canvas';
import { CanvasRenderingContext2D as NodeCanvasRenderingContext2D } from 'canvas';
import { GameMap } from '../core/GameMap.js';
import { GameState } from '../core/GameState.js';
import {
    INFO_PANEL_HEIGHT,
    renderGameLayout,
    SIDE_PANEL_WIDTH,
} from './DrawingUtils.js';

export class ServerRenderer {
    private readonly map: GameMap;
    private readonly canvas: Canvas;
    private readonly ctx: NodeCanvasRenderingContext2D;

    constructor(map: GameMap) {
        this.map = map;
        this.canvas = createCanvas(
            this.map.width + SIDE_PANEL_WIDTH,
            this.map.height + INFO_PANEL_HEIGHT
        );
        this.ctx = this.canvas.getContext('2d', { alpha: false });
    }

    renderToBuffer(gameState: GameState): Buffer {
        renderGameLayout(this.ctx, this.map, gameState);
        return this.canvas.toBuffer('image/png');
    }
}
