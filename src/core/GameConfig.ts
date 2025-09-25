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

export interface CustomMap {
    name: string;
    waypoints: Position[];
}

export const GAME_CONFIG = {
    startingMoney: 40,
    startingLives: 3,
    map: {
        width: 900,
        height: 600,
        cellSize: 50, // size of each grid cell in pixels, must be a point coordinate divisor
        cellColor: 'forestgreen',
        pathColor: 'saddlebrown',
        default: {
            name: 'default',
            waypoints: [
                // must be aligned horizontally or vertically
                { x: 75, y: 25 },
                { x: 75, y: 325 },
                { x: 225, y: 325 },
                { x: 225, y: 475 },
                { x: 375, y: 475 },
                { x: 375, y: 125 },
                { x: 825, y: 125 },
                { x: 825, y: 275 },
                { x: 525, y: 275 },
                { x: 525, y: 525 },
                { x: 725, y: 525 },
                { x: 725, y: 575 },
            ],
        },
    },
    enemies: {
        [EnemyType.BASIC]: {
            health: 40,
            speed: 50, // px per second
            reward: 2, // money for killing
            color: 'darkgray',
        },
        [EnemyType.FAST]: {
            health: 30,
            speed: 70,
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
        waveDelay: 10, // time between waves in seconds
        spawnDelay: 1.2, // time between spawns in seconds
        list: [
            // first 10 waves
            { basic: 2, fast: 0, tank: 0 },
            { basic: 4, fast: 0, tank: 0 },
            { basic: 4, fast: 2, tank: 0 },
            { basic: 8, fast: 0, tank: 0 },
            { basic: 4, fast: 4, tank: 1 },
            { basic: 4, fast: 5, tank: 2 },
            { basic: 4, fast: 4, tank: 4 },
            { basic: 0, fast: 5, tank: 5 },
            { basic: 0, fast: 9, tank: 5 },
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
    LOCAL_STORAGE_KEY: 'tower-defense-maps',
} as const;
