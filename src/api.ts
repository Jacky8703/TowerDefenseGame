import express from 'express';
import { z } from 'zod';
import { GameMap } from './core/GameMap.js';
import { EnemyManager } from './managers/EnemyManager.js';
import { WaveManager } from './managers/WaveManager.js';
import { TowerManager } from './managers/TowerManager.js';
import { GameEngine } from './core/GameEngine.js';
import {
    Enemy,
    EnemyType,
    GAME_CONFIG,
    Position,
    Tower,
    TowerType,
} from './core/GameConfig.js';
import { ServerRenderer } from './render/ServerRenderer.js';

interface GameInfo {
    max_global_info: {
        gameTime: number;
        waveNumber: number;
        money: number;
        lives: number;
        gameOver: boolean;
    };
    actions: Action[];
    map: {
        width: number;
        height: number;
        cell_size: number;
        path_length: number;
        path_cells: Position[];
    };
    towers: {
        type: TowerType;
        range: number;
        dps: number; // damage per second
        cost: number;
        unlock_wave: number;
    }[];
    slower_tower_sample: Tower; // pick the slower tower type for future normalization
    waves: {
        wave_delay: number;
        spawn_delay: number;
        max_enemies: number;
        enemy_types: EnemyType[];
        slower_enemy_sample: Enemy; // pick the slower enemy type for future calculations of max number of enemies on map
    };
}

const buildTowerActionSchema = z.object({
    type: z.literal('BUILD_TOWER'),
    towerType: z.enum(TowerType),
    position: z.object({
        x: z.number(),
        y: z.number(),
    }),
});

const noneActionSchema = z.object({
    type: z.literal('NONE'),
});

const actionSchema = z.discriminatedUnion('type', [
    buildTowerActionSchema,
    noneActionSchema,
]);

// overwrite Action with the inferred type from the schema, it will be the same as before
type Action = z.infer<typeof actionSchema>;

const app = express();
const port = 3000;

app.use(express.json());

const map = new GameMap();
const enemyManager = new EnemyManager(map);
const waveManager = new WaveManager(enemyManager);
const towerManager = new TowerManager(map);
const engine = new GameEngine(waveManager, enemyManager, towerManager, true); // set to true to train the model

const renderer = new ServerRenderer(map);

app.get('/', (req, res) => {
    res.send('Tower Defense Game API');
});

// info for building the action_space and the observation_space
app.get('/info', (req, res) => {
    res.json(getGameInfo());
});

app.post('/reset', (req, res) => {
    engine.reset();
    res.json(engine.getState());
});

app.post('/step', (req, res) => {
    try {
        const action = actionSchema.parse(req.body);
        engine.step(action);
        res.json(engine.getState());
    } catch (err) {
        if (err instanceof z.ZodError) {
            console.error('Invalid action format:', err);
            return res.status(400).json({
                message: 'Invalid action format',
                errors: z.treeifyError(err),
            });
        } else if (err instanceof Error) {
            // handle other errors thrown in the game logic
            console.error('Game Logic Error:', err.message);
            return res.status(400).json({ message: err.message });
        }
        // handle unexpected errors
        console.error('Unexpected Internal Server Error:', err);
        return res.status(500).json({ message: 'Internal server error:' });
    }
});

app.get('/render', (req, res) => {
    const gameState = engine.getState();
    const imageBuffer = renderer.renderToBuffer(gameState);
    res.set('Content-Type', 'image/png');
    res.send(imageBuffer);
});

app.listen(port, () => {
    console.log(
        `Tower Defense API server listening on http://localhost:${port}`
    );
});

function getGameInfo(): GameInfo {
    let towers = [];
    let slowerTowerType: TowerType = TowerType.ARCHER;
    for (const type of Object.values(TowerType)) {
        towers.push({
            type,
            range: GAME_CONFIG.towers[type].range,
            dps:
                GAME_CONFIG.towers[type].damage /
                GAME_CONFIG.towers[type].attackCooldown,
            cost: GAME_CONFIG.towers[type].cost,
            unlock_wave: GAME_CONFIG.towers[type].unlockWave,
        });
        if (
            GAME_CONFIG.towers[type].attackCooldown >
            GAME_CONFIG.towers[slowerTowerType].attackCooldown
        ) {
            slowerTowerType = type;
        }
    }
    let enemyTypes = [];
    let slowerEnemyType: EnemyType = EnemyType.BASIC;
    for (const type of Object.values(EnemyType)) {
        enemyTypes.push(type);
        if (
            GAME_CONFIG.enemies[type].speed <
            GAME_CONFIG.enemies[slowerEnemyType].speed
        ) {
            slowerEnemyType = type;
        }
    }
    return {
        max_global_info: {
            gameTime: 1300, // enough time to reach wave 50
            waveNumber: 50, // not even possible with current config, the health of enemies will be too high (multiplied by more than 1400 at wave 50)
            money: 999,
            lives: GAME_CONFIG.startingLives,
            gameOver: false,
        },
        actions: [
            { type: 'NONE' },
            {
                type: 'BUILD_TOWER',
                towerType: TowerType.ARCHER,
                position: { x: 0, y: 0 },
            },
        ],
        map: {
            width: map.width,
            height: map.height,
            cell_size: map.cellSize,
            path_length: map.path.length,
            path_cells: map.path.allCells,
        },
        towers: towers,
        slower_tower_sample: {
            type: slowerTowerType,
            position: { x: 0, y: 0 },
            attackCooldown: GAME_CONFIG.towers[slowerTowerType].attackCooldown,
        },
        waves: {
            wave_delay: GAME_CONFIG.waves.waveDelay,
            spawn_delay: GAME_CONFIG.waves.spawnDelay,
            max_enemies: Math.max(
                ...GAME_CONFIG.waves.list.map((w) => w.basic + w.fast + w.tank)
            ),
            enemy_types: enemyTypes,
            slower_enemy_sample: {
                type: slowerEnemyType,
                fullHealth: GAME_CONFIG.enemies[slowerEnemyType].health,
                currentHealth: GAME_CONFIG.enemies[slowerEnemyType].health,
                currentSpeed: GAME_CONFIG.enemies[slowerEnemyType].speed,
                position: { x: 0, y: 0 },
                direction: { dx: 0, dy: 0 },
                currentWaypointIndex: 1,
                pathProgress: 0,
            },
        },
    };
}
