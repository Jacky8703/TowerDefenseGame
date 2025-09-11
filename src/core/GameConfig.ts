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
    readonly dx: number; // "<-" -1, 0, 1 "->"
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
    map: {
        width: 900,
        height: 600,
        cellSize: 50, // size of each grid cell in pixels, must be a point coordinate divisor -> add a check for this
        waypointTopLeftCorners: [
            // must be aligned horizontally or vertically -> add a check for this
            { x: 50, y: 0 },
            { x: 50, y: 300 },
            { x: 400, y: 300 },
            { x: 400, y: 450 },
            { x: 750, y: 450 },
            { x: 750, y: 550 },
        ],
    },
    enemies: {
        [EnemyType.BASIC]: {
            health: 50,
            speed: 50, // px per second
            color: 'darkgray',
        },
        [EnemyType.FAST]: {
            health: 30,
            speed: 100,
            color: 'greenyellow',
        },
        [EnemyType.TANK]: {
            health: 100,
            speed: 30,
            color: 'black',
        },
    },
    waves: {
        waveDelay: 2, // time between waves in seconds
        spawnDelay: 1, // time between spawns in seconds
        list: [
            //{ enemyType: EnemyType.BASIC, enemyCount: 3 },
            //{ enemyType: EnemyType.FAST, enemyCount: 5 },
            //{ enemyType: EnemyType.TANK, enemyCount: 7 },
        ],
    },
    towers: {
        [TowerType.ARCHER]: {
            range: 100, // in pixels
            damage: 10,
            attackSpeed: 1, // time between attacks in seconds
            buildCooldown: 15, // seconds before it can be constructed
            color: 'lightgreen',
            // multiTarget: false,
        },
        [TowerType.CANNON]: {
            range: 75,
            damage: 30,
            attackSpeed: 2,
            buildCooldown: 20,
            color: 'white',
            // multiTarget: true,
        },
        [TowerType.SNIPER]: {
            range: 150,
            damage: 50,
            attackSpeed: 3,
            buildCooldown: 30,
            color: 'indianred',
        },
    },
    // projectileSpeed: 15, // px per second
} as const;
