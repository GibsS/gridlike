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

    body1: Body // top or right
    body2: Body
    isHorizontal: boolean
}

export declare class RelativeContact {

    body1: Body // current considered entity
    body2: Body
    side: string // right, left, up, down
}

export declare interface EntityDelegate {

    contactStart()
    contactEnd()
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

    readonly contacts: RelativeContact[]
    readonly leftContact: RelativeContact
    readonly rightContact: RelativeContact
    readonly upContact: RelativeContact
    readonly downContact: RelativeContact

    // HIERARCHY
    createRect(args): Rect
    createLine(args): Line
    createGrid(args): Grid
    removeBody(body: Body)

    addChild(ent: Entity, parentType: number)
    removeChild(ent: Entity)
    setParent(parent: Entity, parentType: number)

    move(dx: number, dy: number)
    moveTo(x: number, y: number)
}

export declare abstract class Body {

    type: number

    entity: Entity

    enabled: boolean

    x: number
    y: number

    globalx: number
    globaly: number

    readonly contacts: RelativeContact[]
    readonly leftContact: RelativeContact
    readonly rightContact: RelativeContact
    readonly upContact: RelativeContact
    readonly downContact: RelativeContact
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

    setTiles(arg)
    clearTiles(args)
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
    createEntity(args): Entity
    createRect(args): Entity
    createLine(args): Entity
    createGrid(args): Entity
    destroyEntity(entity: Entity)

    // ##### QUERYING
    raycast(x: number, y: number, dx: number, dy: number): RaycastResult
    queryRect(x: number, y, number, w: number, h: number): QueryResult
}

export declare class Engine extends World {

    simulate(delta: number)
}