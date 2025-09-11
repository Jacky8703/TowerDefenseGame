export enum EnemyType {
    BASIC = 'basic',
    FAST = 'fast',
    TANK = 'tank',
}

export enum TowerType {
    ARCHER = 'archer',
    SNIPER = 'sniper',
    CANNON = 'cannon',
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
    health: number;
    position: Position;
    currentWaypointIndex: number; // current index of the waypoint to reach
    pathProgress: number; // progress along the path, from 0 to 1
}

export interface Wave {
    readonly enemyType: EnemyType;
    readonly enemyCount: number;
}

export interface Tower {
    readonly type: TowerType;
    readonly position: Position;
    fireRate: number;
}

// export interface Projectile {
//     position: Position;
//     target: Enemy;
//     speed: number; // pixels per second
//     damage: number;
// }

export const GAME_CONFIG = {
    initialMoney: 30,
    map: {
        width: 900,
        height: 600,
        cellSize: 50, // size of each grid cell in pixels, must be a point coordinate divisor -> add a check for this
        waypointTopLeftCorners: [
            // must be aligned horizontally or vertically -> add a check for this
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
            health: 50,
            speed: 50, // px per second
            reward: 10, // money given to player when killed
            color: 'darkgray',
        },
        [EnemyType.FAST]: {
            health: 30,
            speed: 100,
            reward: 15,
            color: 'greenyellow',
        },
        [EnemyType.TANK]: {
            health: 100,
            speed: 30,
            reward: 25,
            color: 'black',
        },
    },
    waves: {
        waveDelay: 10, // time between waves in seconds
        spawnDelay: 1, // time between spawns in seconds
        list: [
            // first 10 waves
            { basic: 2, fast: 0, tank: 0 },
            { basic: 5, fast: 0, tank: 0 },
            { basic: 5, fast: 2, tank: 0 },
            { basic: 6, fast: 4, tank: 2 },
            { basic: 4, fast: 4, tank: 4 },
            { basic: 6, fast: 8, tank: 0 },
            { basic: 2, fast: 8, tank: 6 },
            { basic: 0, fast: 10, tank: 8 },
            { basic: 10, fast: 0, tank: 8 },
            { basic: 8, fast: 8, tank: 8 }, // the last wave will be the base for generating further waves
        ],
        growthFactor: 1.2, // each new wave will have enemyCount * growthFactor enemies
    },
    towers: {
        [TowerType.ARCHER]: {
            range: 125, // in pixels
            damage: 10,
            attackSpeed: 1, // time between attacks in seconds
            cost: 15, // cost in game currency
            unlockWave: 0, // unlocked from the start
            color: 'lightgreen',
            // multiTarget: false,
        },
        [TowerType.CANNON]: {
            range: 75,
            damage: 30,
            attackSpeed: 2,
            cost: 25,
            unlockWave: 4, // unlocked at wave 4
            color: 'white',
            // multiTarget: true,
        },
        [TowerType.SNIPER]: {
            range: 175,
            damage: 50,
            attackSpeed: 3,
            cost: 50,
            unlockWave: 1, // unlocked at wave 7
            color: 'indianred',
        },
    },
    // projectileSpeed: 15, // px per second
} as const;
