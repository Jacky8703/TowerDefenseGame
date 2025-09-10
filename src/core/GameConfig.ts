export enum EnemyType {
    BASIC = 'basic',
    // ADVANCED = 'advanced',
}

export enum TowerType {
    BASIC = 'basic',
    // SNIPER = 'sniper',
}

export interface Action {
    type: 'BUILD_TOWER' | 'NONE';
    position?: Position; // required if type is BUILD_TOWER
    towerType?: TowerType; // required if type is BUILD_TOWER
}

export interface Position {
    x: number;
    y: number;
}

export interface Direction {
    readonly dx: number; // "<-" -1, 0, 1 "->"
    readonly dy: number; // "^" -1, 0, 1 "v"
}

export interface Enemy {
    type: EnemyType;
    health: number;
    position: Position;
    currentWaypointIndex: number; // current index of the waypoint to reach
    pathProgress: number; // progress along the path, from 0 to 1
}

export interface Wave {
    enemyType: EnemyType;
    enemyCount: number;
}

export interface Tower {
    type: TowerType;
    position: Position;
    fireRate: number;
}

export interface Projectile {
    position: Position;
    target: Enemy;
    speed: number; // pixels per second
    damage: number;
}

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
        },
    },
    waves: {
        waveDelay: 2, // time between waves in seconds
        spawnDelay: 1, // time between spawns in seconds
        list: [
            { enemyType: EnemyType.BASIC, enemyCount: 3 },
            //{ enemyType: EnemyType.BASIC, enemyCount: 5 },
            //{ enemyType: EnemyType.BASIC, enemyCount: 7 },
        ],
    },
    towers: {
        [TowerType.BASIC]: {
            range: 75, // in pixels
            damage: 10,
            attackSpeed: 1, // time between attacks in seconds
            buildCooldown: 15, // seconds before it can be constructed
            // multiTarget: false,
        },
    },
    projectileSpeed: 15, // px per second
} as const;
