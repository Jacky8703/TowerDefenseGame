import { CustomMap, GAME_CONFIG, Position } from './core/GameConfig.js';
import { drawGrid, drawPath } from './render/DrawingUtils.js';

const canvas = document.getElementById('editorCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const mapNameInput = document.getElementById(
    'map-name-input'
) as HTMLInputElement;
const saveButton = document.getElementById('saveButton') as HTMLButtonElement;
const resetButton = document.getElementById('resetButton') as HTMLButtonElement;

let waypoints: Position[] = [];
let allMaps: CustomMap[] = [];

function isOnEdge(position: Position): boolean {
    return (
        position.x === GAME_CONFIG.map.cellSize / 2 ||
        position.x === GAME_CONFIG.map.width - GAME_CONFIG.map.cellSize / 2 ||
        position.y === GAME_CONFIG.map.cellSize / 2 ||
        position.y === GAME_CONFIG.map.height - GAME_CONFIG.map.cellSize / 2
    );
}

function loadMapsFromLocalStorage() {
    const savedData = localStorage.getItem(GAME_CONFIG.LOCAL_STORAGE_KEY);
    if (savedData) {
        try {
            allMaps = JSON.parse(savedData);
            console.log(`${allMaps.length} maps loaded from local storage.`);
        } catch (e) {
            console.error('Failed to parse maps from local storage:', e);
            allMaps = [];
        }
    }
}

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // center coordinates
    const waypointX =
        Math.floor(x / GAME_CONFIG.map.cellSize) * GAME_CONFIG.map.cellSize +
        GAME_CONFIG.map.cellSize / 2;
    const waypointY =
        Math.floor(y / GAME_CONFIG.map.cellSize) * GAME_CONFIG.map.cellSize +
        GAME_CONFIG.map.cellSize / 2;

    const lastWaypoint =
        waypoints.length > 0 ? waypoints[waypoints.length - 1] : null;

    // check if the first waypoint is on the edge of the map
    if (waypoints.length === 0 && !isOnEdge({ x: waypointX, y: waypointY })) {
        alert('First waypoint must be on the edge of the map.');
        return;
    }
    // prevent duplicate waypoints
    if (waypoints.some((p) => p.x === waypointX && p.y === waypointY)) {
        alert('This waypoint is already in the path.');
        return;
    }
    // ensure the new waypoint is aligned with the last one
    if (lastWaypoint) {
        // ensure the new waypoint is aligned horizontally or vertically
        if (waypointX !== lastWaypoint.x && waypointY !== lastWaypoint.y) {
            alert('Waypoints must be aligned horizontally or vertically.');
            return;
        }
    }

    // add the valid waypoint with coordinates centered to the path and redraw
    waypoints.push({ x: waypointX, y: waypointY });
    ctx.fillStyle = GAME_CONFIG.map.pathColor;
    ctx.fillRect(
        waypointX - GAME_CONFIG.map.cellSize / 2,
        waypointY - GAME_CONFIG.map.cellSize / 2,
        GAME_CONFIG.map.cellSize,
        GAME_CONFIG.map.cellSize
    );
    ctx.strokeRect(
        waypointX - GAME_CONFIG.map.cellSize / 2,
        waypointY - GAME_CONFIG.map.cellSize / 2,
        GAME_CONFIG.map.cellSize,
        GAME_CONFIG.map.cellSize
    );
    drawPath(ctx, waypoints, GAME_CONFIG.map.pathColor);
});

resetButton.addEventListener('click', () => {
    waypoints = [];
    drawGrid(ctx);
});

saveButton.addEventListener('click', () => {
    if (waypoints.length < 2) {
        alert('Add at least two waypoints before saving.');
        return;
    }
    if (!isOnEdge(waypoints[waypoints.length - 1])) {
        alert('Last waypoint must be on the edge of the map.');
        return;
    }
    const mapName = mapNameInput.value.trim();
    if (mapName === '') {
        alert('Please enter a map name.');
        return;
    }
    const newMap = {
        name: mapName,
        waypoints: waypoints,
    };
    const existingMapIndex = allMaps.findIndex((map) => map.name === mapName);
    if (existingMapIndex !== -1) {
        if (confirm(`A map named "${mapName}" already exists. Overwrite it?`)) {
            allMaps[existingMapIndex] = newMap;
        } else {
            return;
        }
    } else {
        allMaps.push(newMap);
    }

    localStorage.setItem(
        GAME_CONFIG.LOCAL_STORAGE_KEY,
        JSON.stringify(allMaps)
    );
    alert(`Map "${mapName}" saved successfully!`);
    mapNameInput.value = '';
    waypoints = [];
    drawGrid(ctx);
});

canvas.width = GAME_CONFIG.map.width;
canvas.height = GAME_CONFIG.map.height;
loadMapsFromLocalStorage();
drawGrid(ctx);
