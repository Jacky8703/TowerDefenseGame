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

interface GameInfo {
    max_global_info: {
        game_time: number;
        wave_number: number;
        money: number;
        game_over: boolean;
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
        cost: number;
        unlock_wave: number;
    }[];
    tower_sample: Tower;
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
            return res.status(400).json({
                message: 'Invalid action format',
                errors: z.treeifyError(err),
            });
        } else if (err instanceof Error) {
            // handle other errors thrown in the game logic
            return res.status(400).json({ message: err.message });
        }
        // handle unexpected errors
        return res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(
        `Tower Defense API server listening on http://localhost:${port}`
    );
});

function getGameInfo(): GameInfo {
    let towers = [];
    for (const type of Object.values(TowerType)) {
        towers.push({
            type,
            cost: GAME_CONFIG.towers[type].cost,
            unlock_wave: GAME_CONFIG.towers[type].unlockWave,
        });
    }
    let enemyTypes = [];
    let slowerType: EnemyType = EnemyType.BASIC;
    for (const type of Object.values(EnemyType)) {
        enemyTypes.push(type);
        if (
            GAME_CONFIG.enemies[type].speed <
            GAME_CONFIG.enemies[slowerType].speed
        ) {
            slowerType = type;
        }
    }
    return {
        max_global_info: {
            game_time: 1300, // enough time to reach wave 50
            wave_number: 50, // not even possible with current config, the health of enemies will be too high (multiplied by more than 1400 at wave 50)
            money: 999,
            game_over: false,
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
        tower_sample: {
            type: TowerType.ARCHER,
            position: { x: 0, y: 0 },
            fireRate: GAME_CONFIG.towers[TowerType.ARCHER].attackSpeed,
        },
        waves: {
            wave_delay: GAME_CONFIG.waves.waveDelay,
            spawn_delay: GAME_CONFIG.waves.spawnDelay,
            max_enemies: Math.max(
                ...GAME_CONFIG.waves.list.map((w) => w.basic + w.fast + w.tank)
            ),
            enemy_types: enemyTypes,
            slower_enemy_sample: {
                type: slowerType,
                fullHealth: GAME_CONFIG.enemies[slowerType].health,
                currentHealth: GAME_CONFIG.enemies[slowerType].health,
                currentSpeed: GAME_CONFIG.enemies[slowerType].speed,
                position: { x: 0, y: 0 },
                direction: { dx: 0, dy: 0 },
                currentWaypointIndex: 1,
                pathProgress: 0,
            },
        },
    };
}
