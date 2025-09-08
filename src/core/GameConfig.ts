export interface Action {
    type: 'BUILD_TOWER' | 'NONE';
    position?: Position; // required if type is BUILD_TOWER
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
    health: number;
    speed: number; // pixels per second
    position: Position;
    currentWaypointIndex: number; // current index of the waypoint to reach
    pathProgress: number; // progress along the path, from 0 to 1
}

export interface Wave {
    enemyType: string;
    enemyCount: number;
}

export interface Tower {
    range: number;
    damage: number;
    fireRate: number; // shots per second
    multiTarget: boolean;
    position: Position;
    buildCooldown: number; // seconds before it can be constructed
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
        basic: {
            health: 100,
            speed: 10, // px per second ?
        },
    },
    waveInterval: 30, // time between waves in seconds
    waves: [
        { enemyType: 'basic', enemyCount: 5 },
        { enemyType: 'basic', enemyCount: 10 },
        { enemyType: 'basic', enemyCount: 15 },
    ],
    towers: {
        basic: {
            range: 100,
            damage: 25,
            fireRate: 1, // shots per second
            multiTarget: false,
            buildCooldown: 15, // seconds before it can be constructed
        },
    },
    projectileSpeed: 15, // px per second
};
