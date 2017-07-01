/* RaycastResult
 * The result of a raycast query
 */
export declare interface RaycastResult {
    // point of impact in global space
    x: number
    y: number

    // right, left, up or down
    normal: string
    body: Body
}

export declare type QueryResult<X> = X[]

/* Contact
 * Represents a contact between two bodies
 */
export declare class Contact {
    // body that belongs to the entity the contact was taken from
    body: Body
    // other body in the contact (does not belong to the previous entity)
    otherBody: Body

    // right, left, up or down
    side: string 
}

/* BodyArgs
 * Interface required for the argument of all bodies
 */
interface BodyArgs {
    // position in relative space of the containing entity
    // default: 0
    x?: number
    // default: 0
    y?: number

    enabled?: boolean
}

/* RectArgs
 * Interface for the argument to provide to the Rect constructor
 */
interface RectArgs extends BodyArgs {
    // default: false
    isSensor?: boolean
    // default: "default"
    layer?: string
    // default: 0
    layerGroup?: number

    width: number
    height: number
}
/* LineArgs
 * Interface for the argument to provide to the Line constructor
 */
interface LineArgs extends BodyArgs {
    // default: false
    isSensor?: boolean
    // default: "default"
    layer?: string
    // default: 0
    layerGroup?: number

    size: number
    isHorizontal: boolean
    
    // right, left, up or down
    // default: "all"
    side?: string 
}
/* GridArgs
 * Interface for the argument to provide to the Grid constructor
 */
interface GridArgs extends BodyArgs {
    // default: "default"
    layer?: string
    // default: 0
    layerGroup?: number

    tiles: TileArgs
    // if set, provides an indication on the size of the grid: it might span from x - width/2 to x + width/2, y - height/2 to y + height/2
    // this is not required as the grid can grow indefinitely
    width?: number
    height?: number
    tileSize?: number
}
// Tiles provided as a list
type TileList = { x: number, y: number, shape: number, data?: any }[]
// Tiles provided as a two dimentional array
type TileGrid = { x: number, y: number, info: ({ shape: number, data?: any } | number)[][] }
type TileArgs = TileList | TileGrid

/* EntityArgs
 * Interface for the argument to provide to the Entity constructor
 */
declare type EntityArgs = {
    // position in world space
    x: number
    y: number
    // default: 0
    level?: number
    type?: string

    body?: (RectArgs | LineArgs | GridArgs)
    bodies?: (RectArgs | LineArgs | GridArgs) | (RectArgs | LineArgs | GridArgs)[]
} 
| (RectArgs & { level?: number, type: "rect" }) 
| (LineArgs & { level?: number, type: "line" }) 
| (GridArgs & { level?: number, type: "grid" })

/* EntityListener
 * Contract for a class that listens to an entities events
 */
export declare interface EntityListener {
    // called when an entity is put in an invalid "crushed state": can happen
    // when an entity is caught between two other entities of a lower level
    crushStart?()
    crushEnd?()

    // called when an entity is put in contact with an other: the two entities are
    // moving toward one another and they are near each other
    contactStart?(body: Body, otherBody: Body, side: string)
    contactEnd?(body: Body, otherBody: Body, side: string)

    // called when: 
    // 1. a body overlaps another and one or both are sensors
    // 2. a body overlaps another and their respective top-entities are of the same level
    overlapStart?(body: Body, otherBody: Body)
    overlapEnd?(body: Body, otherBody: Body)
}

/* Entity
 * The main physical entity of the engine: A world contains a list of entities which itself is defined by its position 
 * and the bodies it owns.
 * 
 * They are not to be created from a constructor: use the World.createEntity or one of the World.createXXX functions to create
 * an entity.
 */
export declare class Entity {

    // the attached listener, can remain null
    listener: EntityListener

    // true if the entity has been destroyed
    readonly destroyed: boolean

    // HIERARCHY
    // the containing world
    world: World 
    /* the parent of the considered entity. Their are two types of
     * parenting: 
     * static (0): the entity is attached to its parent and has no independant movement
     * follow (1): the entity inherits its parents speed and add its own. Perfect for moving platforms
     * 
     * the parent must be of a higher level (grid.js will not check)
     * 
     * null if has no parent
     */
    parent: Entity
    // static (0) or follow (1)
    parentType: string
    readonly children: Entity[]
    
    // if the entity only has one body, returns it. If not, will return one of them.
    readonly body: Body
    // every bodies of the entity
    readonly bodies: Body[]

    // levels of entities are used to evaluate if an entity can affect the trajectory of another entity:
    // let A and B be entities
    // if A.level > B.level, B will push A but A won't push B
    // if A.level == b.level, A and B cannot collide with one another
    level: number

    // POSITIONNING
    // position in world space
    globalx: number
    globaly: number

    // if the entity has a parent, expresses the position within the space of the parent
    // if the entity has no parent, is the position within world space
    x: number
    y: number

    // speed in world space
    globalvx: number
    globalvy: number

    // if the entity has a parent that is follows, the speed in the parent's space
    // if the entity has no parent, the speed in world space
    vx: number
    vy: number

    // every contact with entities with a strictly lesser level
    readonly contacts: Contact[]
    // one of the left/right/up/down contact or null if there is no contact
    readonly leftContact: Contact
    readonly rightContact: Contact
    readonly upContact: Contact
    readonly downContact: Contact

    // true if their is at least one contact
    readonly hasLeftContact: boolean
    readonly hasRightContact: boolean
    readonly hasUpContact: boolean
    readonly hasDownContact: boolean

    // true if one of the entity's body overlaps an entity it shouldn't
    readonly isCrushed: boolean

    // HIERARCHY
    // adds a Rect to the entity
    createRect(args: RectArgs): Rect
    // adds a Line to the entity
    createLine(args: LineArgs): Line
    // adds a grid to the entity
    createGrid(args: GridArgs): Grid
    // removes a body (the body is destroyed, all reference to it should be removed)
    removeBody(body: Body)
    // iterates through every bodies of the entity
    forBodies(lambda: (b: Body) => void)

    // sets "ent"'s parent to this, removes any previous parenting relation
    addChild(ent: Entity, parentType?: string)
    // removes the parent link between this and ent
    removeChild(ent: Entity)
    // same as addChild, only the other way around
    setParent(parent: Entity, parentType?: string)

    // creates an entity and sets it as a parent
    createChild(args: EntityArgs, parentType?: string): Entity
    // removes child and destroys it (all reference to it should be removed)
    destroyChild(ent: Entity)
    // remove entity from the world (all reference to it should be removed)
    destroy()

    // CONTACTS
    cancelLeftOnewayContact(): boolean
    cancelRightOnewayContact(): boolean
    cancelUpOnewayContact(): boolean
    cancelDownOnewayContact(): boolean

    // simulates the movement of a single entity: does the same as World.simulate but only moves this one
    // entity
    move(dx: number, dy: number)
    // same as move only attemps to move this to x, y in parent local space if this has a parent, world space if this has no parent
    moveToLocal(x: number, y: number)
    // same as move only attemps to move this to x, y in world space
    moveToGlobal(x: number, y: number)

    // calculate referential changes
    localToGlobal(x: number | { x: number, y: number }, y?: number): { x: number, y: number }
    globalToLocal(x: number | { x: number, y: number }, y?: number): { x: number, y: number }
}
export declare enum BodyType { RECT = 0, LINE = 1, GRID = 2 }
/* Body
 * The physical part of an entity, it is the actual object that collides with other Bodies
 * There are currently three types of entities:
 * - Rect: Rectangles
 * - Line
 * - Grid: A grid of blocks
 */
export declare abstract class Body {

    type: BodyType

    // containing entity
    entity: Entity

    // if false, does not collide or overlap with anything
    enabled: boolean

    // position in the containing entity space
    x: number
    y: number

    // position in world space
    globalx: number
    globaly: number

    // contacts of the body
    readonly contacts: Contact[]
    readonly leftContact: Contact
    readonly rightContact: Contact
    readonly upContact: Contact
    readonly downContact: Contact

    // calculate referential changes
    localToGlobal(x: number | { x: number, y: number }, y?: number): { x: number, y: number }
    globalToLocal(x: number | { x: number, y: number }, y?: number): { x: number, y: number }  

    // definitely destroy a body
    destroy()
}

export declare abstract class SmallBody extends Body {

    // a sensor can't "collide" with other entity but can overlap. Use EntityListener
    // to listen to overlap with sensors
    isSensor: boolean
    // an id that help specify the rules of collision with other entities, check the layer section in World for more info
    // setting to null will set the layer to "default"
    layer: string
    // adds information as to whether an entity can collide with another, check the layer section in World for more info
    layerGroup: number
}

export declare class Rect extends SmallBody {

    /* dimensions of the Rect: 
     * the left of the rectangle is at x - width/2
     * the right at x + width/2
     * the bottom at y - height/2
     * the top at y + height/2
     */
    width: number
    height: number
}

export declare class Line extends SmallBody {

    /* dimension of the Line
     * if isHorizontal is true: goes from [x - size/2; y] to [x + size/2; y]
     * if not: goes from [x; y - size/2] to [x; y + size/2]
     */
    size: number
    // true if the line is horizontal, vertical if not
    readonly isHorizontal: boolean
    /* specifies if the entity points up, down, left or right or is full
     * left: oneway vertical line which only collides with bodies coming from the left
     * right: oneway vertical line which only collides with bodies coming from the right
     * up: oneway horizontal line which only collides with bodies coming from the top
     * down: oneway horizontal line which only collides with bodies coming from the bottom
     * all: collides in every direction, use isHorizontal to specify the direction
     */
    side: string
}

// The IDs of every blocks in a grid
export declare const EMPTY = 0
export declare const BLOCK_TILE = 1
export declare const DOWN_ONEWAY = 2
export declare const LEFT_ONEWAY = 3
export declare const UP_ONEWAY = 4
export declare const RIGHT_ONEWAY = 5

export declare class Grid extends Body {

    // the edges of non empty tiles
    readonly minx: number
    readonly maxx: number
    readonly miny: number
    readonly maxy: number
    readonly tileSize: number

    // The functions are fairly self explanatory. The positions provided in argument represent integer
    // positions with local space of the grid body. For example: the block at [0; 0] corners are at [0; 0], [O; 1], [1, 0] and [1; 1]

    getBlock(x: number, y: number): { shape: number, data: any }
    setBlock(x: number, y: number, shape: number, data: any)
    clearBlock(x: number, y: number)

    setBlocks(arg: any[] | { x: number, y: number, info: { shape: number, data }[][]})
    clearBlocks(args: { x: number, y: number }[] | { x: number, y: number, width: number, height: number })
    forBlocks(x: number, y: number, width: number, height: number, lambda: (x: number, y: number, shape: number, data) => ({ shape: number, data? } | number))
    
    getBlockShape(x: number, y: number): number
    setBlockShape(x: number, y: number, shape: number)
    clearBlockShape(x: number, y: number)

    setBlockShapes(arg: any[] | { x: number, y: number, shapes: number[][]})
    clearBlockShapes(args: { x: number, y: number }[] | { x: number, y: number, width: number, height: number })

    globalToBlock(x: number, y: number): { x: number, y: number }
}

/* World
 * The top object of the engine: contains every Entities
 */
export declare class World {

    readonly time: number

    readonly layers: string[]

    constructor()

    // LAYER
    // adds a layer, there can be no more than 32 layers
    addLayer(layer: string)
    /* sets the rule, the rules are:
     * "always": always collide
     * "never": never collide
     * "equal_group": collide if the layer group is equal
     * "unequal_group": collide if the layer group is different  
     */
    setLayerRule(layer1: string, layer2: string, rule: string)
    getLayerRule(layer1: string, layer2: string): string

    // ENTITIES
    createEntity(args: EntityArgs): Entity
    createRect(args: RectArgs): Entity
    createLine(args: LineArgs): Entity
    createGrid(args: GridArgs): Entity
    removeEntity(entity: Entity)

    // QUERYING
    raycast(x: number, y: number, dx: number, dy: number): RaycastResult
    // finds every body in [x - width/2; x + width/2] * [y - height/2; y + height/2]
    queryRect(x: number, y: number, width: number, height: number): QueryResult<Body>
    queryPoint(x: number, y: number): QueryResult<Body>

    simulate(delta: number)
}

export declare function createWorld(): World