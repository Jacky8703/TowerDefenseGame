import { GameMap } from "./core/GameMap";
import { GAME_CONFIG } from "./core/GameConfig";
import { Renderer } from "./Renderer";
import { GameState } from "./core/GameState";
import { GameEngine } from "./core/GameEngine";

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
canvas.width = GAME_CONFIG.map.width;
canvas.height = GAME_CONFIG.map.height;
let map = new GameMap()
let engine = new GameEngine(map);

let renderer = new Renderer(canvas);
renderer.render(engine.step(0));