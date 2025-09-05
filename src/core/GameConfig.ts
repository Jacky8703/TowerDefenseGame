export interface Action {
    type: "BUILD_TOWER" | "NONE"
    position?: Position // required if type is BUILD_TOWER
}

export interface Position {
    readonly x: number
    readonly y: number
}

export interface Wave {
    readonly enemyType: string
    readonly enemyCount: number
}

// export interface Manager {
//     update(): void;
// }

export const GAME_CONFIG = {
    map: {
        width: 900, 
        height: 600,
        cellSize: 50, // size of each grid cell in pixels, must be a point coordinate divisor
        pathAngles: [
            { x: 50, y: 0 },
            { x: 50, y: 300 },
            { x: 400, y: 300 },
            { x: 400, y: 450 },
            { x: 750, y: 450 },
            { x: 750, y: 550 }
        ]
    },
    enemies: {
        basic: {
            health: 100,
            speed: 10 // px per second ?
        }
    },
    waveInterval: 30, // time between waves in seconds
    waves: [
        { enemyType: "basic", enemyCount: 5 },
        { enemyType: "basic", enemyCount: 10 },
        { enemyType: "basic", enemyCount: 15 }
    ],
    towers: {
        basic: {
            range: 100,
            damage: 25,
            fireRate: 1, // shots per second
            multiTarget: false,
            buildCooldown: 15 // seconds before it can be constructed
        }
    },
    projectileSpeed: 15 // px per second
}