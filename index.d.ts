export declare interface RaycastResult {

    x: number
    y: number
    normal: string
    body: Body
}

export declare interface QueryResult {

    bodies: Body[]
}

export declare class Contact {
    body: Body // current considered entity
    otherBody: Body
    side: string // right, left, up, down
}

interface BodyArgs {
    x?: number
    y?: number

    enabled?: boolean
}
interface SmallBodyArgs extends BodyArgs {
    isSensor?: boolean
    layer?: string
    layerGroup?: number
}
interface RectArgs extends SmallBodyArgs {
    width: number
    height: number
}
interface LineArgs extends SmallBodyArgs {
    size: number
    isHorizontal: boolean
    side?: string // default: no
}
interface GridArgs extends BodyArgs {
    tiles: TileArgs
    width?: number
    height?: number
    tileSize?: number
}
type TileList = { x: number, y: number, shape: number, data?: any }[]
type TileGrid = { x: number, y: number, info: ({ shape: number, data?: any } | number)[][] }
type TileArgs = TileList | TileGrid

declare type EntityArgs = {
    x: number
    y: number
    level?: number
    type?: string

    body?: (RectArgs | LineArgs | GridArgs)
    bodies?: (RectArgs | LineArgs | GridArgs) | (RectArgs | LineArgs | GridArgs)[]
} 
| (RectArgs & { level?: number, type: "rect" }) 
| (LineArgs & { level?: number, type: "line" }) 
| (GridArgs & { level?: number, type: "grid" })


export declare interface EntityListener {

    crushStart?()
    crushEnd?()

    contactStart?(body: Body, otherBody: Body, side: string)
    contactEnd?(body: Body, otherBody: Body, side: string)

    overlapStart?(body: Body, otherBody: Body)
    overlapEnd?(body: Body, otherBody: Body)

    gridContactStart?(body: Body, grid: Grid, x: number, y: number, side: string)
    gridContactEnd?(body: Body, grid: Grid, x: number, y: number, side: string)

    gridOverlapStart?(body: Body, grid: Grid, x: number, y: number, side: string)
    gridOverlapEnd?(body: Body, grid: Grid, x: number, y: number, side: string)
}

export declare class Entity {

    world: World 

    listener: EntityListener

    // HIERARCHY
    parent: Entity // a rect of higher level
    parentType: string // 0: static, 1: follow
    readonly children: Entity[]
    
    body: Body
    readonly bodies: Body[]

    level: number

    // POSITIONNING
    globalx: number
    globaly: number

    x: number
    y: number

    globalvx: number
    globalvy: number

    vx: number
    vy: number

    readonly contacts: Contact[]
    readonly leftContact: Contact
    readonly rightContact: Contact
    readonly upContact: Contact
    readonly downContact: Contact

    readonly hasLeftContact: boolean
    readonly hasRightContact: boolean
    readonly hasUpContact: boolean
    readonly hasDownContact: boolean

    readonly isCrushed: boolean

    // HIERARCHY
    createRect(args: RectArgs): Rect
    createLine(args: LineArgs): Line
    createGrid(args: GridArgs): Grid
    removeBody(body: Body)
    forBodies(lambda: (b: Body) => void)

    addChild(ent: Entity, parentType?: string)
    removeChild(ent: Entity)
    setParent(parent: Entity, parentType?: string)

    createChild(args: EntityArgs, parentType?: string): Entity
    destroyChild(ent: Entity)
    destroy()

    move(dx: number, dy: number)
    moveToLocal(x: number, y: number)
    moveToGlobal(x: number, y: number)

    localToGlobal(x: number | { x: number, y: number }, y?: number): { x: number, y: number }
    globalToLocal(x: number | { x: number, y: number }, y?: number): { x: number, y: number }
}
export declare enum BodyType {
    RECT, LINE, GRID
}
export declare abstract class Body {

    type: number

    entity: Entity

    enabled: boolean

    x: number
    y: number

    globalx: number
    globaly: number

    readonly contacts: Contact[]
    readonly leftContact: Contact
    readonly rightContact: Contact
    readonly upContact: Contact
    readonly downContact: Contact

    localToGlobal(x: number | { x: number, y: number }, y?: number): { x: number, y: number }
    globalToLocal(x: number | { x: number, y: number }, y?: number): { x: number, y: number }  
}

export declare abstract class SmallBody extends Body {

    isSensor: boolean
    layer: number
    layerGroup: number
}

export declare class Rect extends SmallBody {

    width: number
    height: number
}

export declare class Line extends SmallBody {

    size: number
    readonly isHorizontal: boolean
    side: string
}

export declare interface GridListener {

    contactStart?(body: Body, x: number, y: number, side: string)
    contactEnd?(body: Body, x: number, y: number, side: string)

    overlapStart?(body: Body, x: number, y: number, side: string)
    overlapEnd?(body: Body, x: number, y: number, side: string)
}

export declare const BLOCK_TILE
export declare const EMPTY
export declare const LEFT_ONEWAY
export declare const RIGHT_ONEWAY
export declare const UP_ONEWAY
export declare const DOWN_ONEWAY

export declare class Grid extends Body {

    listener: GridListener

    readonly minx: number
    readonly maxx: number
    readonly miny: number
    readonly maxy: number
    readonly tileSize: number

    getTile(x: number, y: number): { shape: number, data: any }
    setTile(x: number, y: number, shape: number, data: any)
    clearTile(x: number, y: number)

    setTiles(arg: any[] | { x: number, y: number, info: { shape: number, data }[][]})
    clearTiles(args: { x: number, y: number }[] | { x: number, y: number, width: number, height: number })
    forTiles(x: number, y: number, width: number, height: number, lambda: (x: number, y: number, shape: number, data) => ({ shape: number, data? } | number))
    
    getTileShape(x: number, y: number): number
    setTileShape(x: number, y: number, shape: number)
    clearTileShape(x: number, y: number)

    setTilesShape(arg: any[] | { x: number, y: number, shapes: number[][]})
    clearTileShapes(args: { x: number, y: number }[] | { x: number, y: number, width: number, height: number })

    globalToTile(x: number, y: number): { x: number, y: number }
}

export declare class World {

    readonly time: number

    readonly layers: string[]

    constructor()

    // ##### LAYER
    addLayer(layer: string)
    setLayerRule(layer1: string, layer2: string, rule: string)
    getLayerRule(layer1: string, layer2: string): string

    // ##### ENTITIES
    createEntity(args: EntityArgs): Entity
    createRect(args: RectArgs): Entity
    createLine(args: LineArgs): Entity
    createGrid(args: GridArgs): Entity
    removeEntity(entity: Entity)

    // ##### QUERYING
    raycast(x: number, y: number, dx: number, dy: number): RaycastResult
    queryRect(x: number, y: number, width: number, height: number): QueryResult
    queryPoint(x: number, y: number): QueryResult

    simulate(delta: number)
}

export declare function createWorld()