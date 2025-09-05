import { GameMap } from "./GameMap";
import { GameState } from "./GameState";

export class GameEngine {
    private currentState: GameState;

    constructor(map: GameMap) {
        this.currentState = {
            gameTime: 0,
            waveNumber: 0,
            map: map,
            enemies: [],
            towers: [],
            projectiles: []
        };
    }

    step(deltaTime: number): GameState {
        // Update game state based on deltaTime
        return this.currentState;
    }

}