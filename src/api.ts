import express from 'express';
import { z } from 'zod';
import { GameMap } from './core/GameMap.js';
import { EnemyManager } from './managers/EnemyManager.js';
import { WaveManager } from './managers/WaveManager.js';
import { TowerManager } from './managers/TowerManager.js';
import { GameEngine } from './core/GameEngine.js';
import { TowerType } from './core/GameConfig.js';

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
const engine = new GameEngine(map, waveManager, enemyManager, towerManager);

app.get('/', (req, res) => {
    res.send('Tower Defense Game API');
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
