import { CustomMap, GAME_CONFIG, Position } from './core/GameConfig.js';
import { drawGrid, drawPath } from './render/DrawingUtils.js';

const mapSelector = document.getElementById('mapSelector') as HTMLSelectElement;
const startGameButton = document.getElementById(
    'startGameButton'
) as HTMLButtonElement;
const previewCanvas = document.getElementById(
    'mapPreviewCanvas'
) as HTMLCanvasElement;
const previewCtx = previewCanvas.getContext('2d')!;
previewCanvas.width = GAME_CONFIG.map.width;
previewCanvas.height = GAME_CONFIG.map.height;

let allMaps: CustomMap[] = [];

function drawMapPreview(waypoints: Position[]) {
    drawGrid(previewCtx);
    drawPath(previewCtx, waypoints, 'saddlebrown');
}

function handleStartGame() {
    const selectedMapName = mapSelector.value;
    if (!selectedMapName) {
        alert('Please select a map!');
        return;
    }
    // redirect to the game page, passing the map name as a URL parameter
    window.location.href = `game.html?map=${encodeURIComponent(selectedMapName)}`;
}

const savedMaps = localStorage.getItem(GAME_CONFIG.LOCAL_STORAGE_KEY);
if (savedMaps) {
    allMaps = JSON.parse(savedMaps);
} else {
    // provide a default map if none are in local storage
    allMaps = [
        {
            name: GAME_CONFIG.map.default.name,
            waypoints: [...GAME_CONFIG.map.default.waypoints],
        },
    ];
}

// reset the selector and populate it
mapSelector.innerHTML = '';
let option = document.createElement('option');
option.value = GAME_CONFIG.map.default.name;
option.textContent = GAME_CONFIG.map.default.name;
mapSelector.appendChild(option);
allMaps.forEach((map) => {
    option = document.createElement('option');
    option.value = map.name;
    option.textContent = map.name;
    mapSelector.appendChild(option);
});

drawMapPreview([...GAME_CONFIG.map.default.waypoints]);

mapSelector.addEventListener('change', () => {
    const selectedMap = allMaps.find((map) => map.name === mapSelector.value);
    if (selectedMap) {
        drawMapPreview(selectedMap.waypoints);
    } else if (mapSelector.value === GAME_CONFIG.map.default.name) {
        drawMapPreview([...GAME_CONFIG.map.default.waypoints]);
    }
});

startGameButton.addEventListener('click', handleStartGame);
