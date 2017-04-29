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
    oneway?: boolean // default: no
}
interface GridArgs extends BodyArgs {
    tiles: TileArgs
}
type TileArgs = any[] | { x: number, y: number, info: (number | any)[][] }

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


export declare interface EntityDelegate {

    contactStart(body: Body, otherBody: Body, side: string)
    contactEnd(body: Body, otherBody: Body, side: string)
}

export declare class Entity {

    world: World 

    delegate: EntityDelegate

    // HIERARCHY
    parent: Entity // a rect of higher level
    parentType: number // 0: static, 1: follow
    readonly childs: Entity[]
    
    body: Body
    readonly bodies: Body[]

    level: number

    // POSITIONNING
    globalx: number
    globaly: number

    x: number
    y: number

    vx: number
    vy: number

    readonly contacts: Contact[]
    readonly leftContact: Contact
    readonly rightContact: Contact
    readonly upContact: Contact
    readonly downContact: Contact

    // HIERARCHY
    createRect(args: RectArgs): Rect
    createLine(args: LineArgs): Line
    createGrid(args: GridArgs): Grid
    removeBody(body: Body)

    addChild(ent: Entity, parentType?: string)
    removeChild(ent: Entity)
    setParent(parent: Entity, parentType?: string)
    createEntity(args: EntityArgs)

    destroyChild(ent: Entity)
    destroy()

    move(dx: number, dy: number)
    moveTo(x: number, y: number)
}

declare abstract class Body {

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
}

declare abstract class SmallBody extends Body {

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
    oneway: boolean
}

export declare class Grid extends Body {

    readonly minx: number
    readonly maxx: number
    readonly miny: number
    readonly maxy: number
    readonly tileSize: number

    getTile(x: number, y: number): any
    setTile(x: number, y: number, val: any)
    clearTile(x: number, y: number)

    setTiles(arg: any[] | { x: number, y: number, info: any[][]})
    clearTiles(args: { x: number, y: number }[] | { x: number, y: number, width: number, height: number })
}

declare class World {

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
    destroyEntity(entity: Entity)

    // ##### QUERYING
    raycast(x: number, y: number, dx: number, dy: number): RaycastResult
    queryRect(x: number, y, number, w: number, h: number): QueryResult
}

export declare class Engine extends World {

    simulate(delta: number)
}