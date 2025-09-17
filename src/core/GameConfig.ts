export enum EnemyType {
    // the order here matters for wave generation
    TANK = 'tank',
    BASIC = 'basic',
    FAST = 'fast',
}

export enum TowerType {
    ARCHER = 'archer',
    CANNON = 'cannon',
    SNIPER = 'sniper',
}

export type Action =
    | { type: 'BUILD_TOWER'; towerType: TowerType; position: Position }
    | { type: 'NONE' };

export interface Position {
    x: number;
    y: number;
}

export interface Direction {
    readonly dx: number; // "<" -1, 0, 1 ">"
    readonly dy: number; // "^" -1, 0, 1 "v"
}

export interface Enemy {
    readonly type: EnemyType;
    fullHealth: number;
    currentHealth: number;
    currentSpeed: number;
    position: Position;
    direction: Direction;
    currentWaypointIndex: number; // current index of the waypoint to reach
    pathProgress: number; // progress along the path, from 0 to 1
}

export interface Tower {
    readonly type: TowerType;
    readonly position: Position;
    attackCooldown: number;
}

export const GAME_CONFIG = {
    initialMoney: 40,
    map: {
        width: 900,
        height: 600,
        cellSize: 50, // size of each grid cell in pixels, must be a point coordinate divisor
        waypointTopLeftCorners: [
            // must be aligned horizontally or vertically
            { x: 50, y: 0 },
            { x: 50, y: 300 },
            { x: 200, y: 300 },
            { x: 200, y: 450 },
            { x: 350, y: 450 },
            { x: 350, y: 100 },
            { x: 800, y: 100 },
            { x: 800, y: 250 },
            { x: 500, y: 250 },
            { x: 500, y: 500 },
            { x: 700, y: 500 },
            { x: 700, y: 550 },
        ],
    },
    enemies: {
        [EnemyType.BASIC]: {
            health: 40,
            speed: 60, // px per second
            reward: 2, // money for killing
            color: 'darkgray',
        },
        [EnemyType.FAST]: {
            health: 30,
            speed: 90,
            reward: 2,
            color: 'greenyellow',
        },
        [EnemyType.TANK]: {
            health: 150,
            speed: 40,
            reward: 2,
            color: 'black',
        },
    },
    waves: {
        waveDelay: 12, // time between waves in seconds
        spawnDelay: 1, // time between spawns in seconds
        list: [
            // first 10 waves
            { basic: 2, fast: 0, tank: 0 },
            { basic: 5, fast: 0, tank: 0 },
            { basic: 5, fast: 2, tank: 0 },
            { basic: 5, fast: 3, tank: 1 },
            { basic: 2, fast: 4, tank: 2 },
            { basic: 2, fast: 6, tank: 3 },
            { basic: 2, fast: 8, tank: 3 },
            { basic: 0, fast: 6, tank: 6 },
            { basic: 0, fast: 7, tank: 7 },
            { basic: 0, fast: 6, tank: 9 }, // the last wave will be repeated with increasing difficulty
        ],
        healthGrowthFactor: 1.2, // enemy health multiplier every wave after the predefined ones, quite high, probably should be lower
        speedGrowthFactor: 1.1, // enemy speed multiplier every wave after the predefined ones
        speedLimit: 250,
    },
    towers: {
        [TowerType.ARCHER]: {
            range: 125, // in pixels
            damage: 10,
            attackCooldown: 1, // time between attacks in seconds
            cost: 20, // cost in game currency
            unlockWave: 0, // unlocked from the start
            color: 'lightgreen',
        },
        [TowerType.CANNON]: {
            range: 75,
            damage: 75,
            attackCooldown: 2,
            cost: 35,
            unlockWave: 4,
            color: 'white',
        },
        [TowerType.SNIPER]: {
            range: 175,
            damage: 75,
            attackCooldown: 3,
            cost: 50,
            unlockWave: 7,
            color: 'indianred',
        },
    },
    FIXED_DELTA_TIME: 0.1, // one step counts as 0.1 seconds
} as const;
