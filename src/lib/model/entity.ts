import * as _ from 'lodash'

import { VBH, SimpleVBH, MoveAABB, EnabledAABB } from '../vbh/vbh'
import { BinaryTree } from '../vbh/binaryTree'

import { Body, SmallBody, RectArgs, LineArgs, GridArgs } from './body'
import { World } from './world'
import { Contact, _Contact } from './contact'
import { Rect, Line, Grid } from './body'

import { ParentType } from './enums'

type PureEntityArgs = {
    x: number
    y: number
    level?: number
    type?: string

    body?: (RectArgs | LineArgs | GridArgs)
    bodies?: (RectArgs | LineArgs | GridArgs) | (RectArgs | LineArgs | GridArgs)[]
} 

export type EntityArgs = PureEntityArgs
| (RectArgs & { level?: number, type: "rect" }) 
| (LineArgs & { level?: number, type: "line" }) 
| (GridArgs & { level?: number, type: "grid" })

export interface EntityListener {

    contactStart?(body: Body, otherBody: Body, side: string)
    contactEnd?(body: Body, otherBody: Body, side: string)

    overlapStart?(body: Body, otherBody: Body)
    overlapEnd?(body: Body, otherBody: Body)

    crushStart?()
    crushEnd?()
}

export class Entity implements MoveAABB {

    _listener: EntityListener

    _world: World

    _parent: Entity // a rect of higher level
    _parentType: number // 0: static, 1: follow
    _childs: Entity[]
    _topEntity: Entity

    _bodies: Body | VBH<Body>
    _allBodies: VBH<Body>
    _grids: Grid | Grid[]

    _level: number
    
    _x: number
    _y: number

    _vx: number
    _vy: number

    _lowers: _Contact[] = []

    _invalidOverlap: Body[][] = []
    _overlap: Body[][]

    _minX: number = Infinity
    _maxX: number = -Infinity
    _minY: number = Infinity
    _maxY: number = -Infinity

    moveMinX: number
    moveMaxX: number
    moveMinY: number
    moveMaxY: number

    // TMP
    name: string

    // SIMULATION
    _potContacts: SmallBody[][] = []
    _simvx: number
    _simvy: number

    // FOR VBH 
    get enabled(): boolean { return true }

    get world(): World { return this._world }
    set world(val: World) { console.error("[ERROR] can't set Entity.world") }

    get listener(): EntityListener { return this._listener }
    set listener(val: EntityListener) { this._listener = val }

    // HIERARCHY
    get parent(): Entity { return this._parent }
    set parent(val: Entity) { this._setParent(val, this._parentType) }

    get parentType(): string { return this._parentType == 0 ? "static" : "follow" }
    set parentType(val: string) {
        if(this._parent != null) this._setParent(this._parent, val == "static" ? 0 : 1)
        else this._parentType = val == "static" ? 0 : 1
    }
    get children(): Entity[] { return _.clone(this._childs) }
    set children(val: Entity[]) { console.error("[ERROR] can't set Entity.childs") }

    get body(): Body {
        if(this._bodies instanceof Body) return this._bodies
        else {
            if(this._grids && this._grids instanceof Grid) return this._grids
            else return this._bodies.all().find(b => b instanceof Grid)
        }
    }
    set body(val: Body) { console.error("[ERROR] can't set Entity.body") }
    get bodies(): Body[] {
        if(this._bodies) {
            if(this._bodies instanceof Body) {
                return [this._bodies]
            } else {
                if(this._grids) {
                    if(this._grids instanceof Grid) {
                        return this._bodies.all().filter(b => !b._grid).concat([this._grids])
                    } else {
                        return this._bodies.all().filter(b => !b._grid).concat(this._grids)
                    }
                } else {
                    return this._bodies.all().filter(b => !b._grid)
                }
            }
        } else {
            return []
        }
    }
    set bodies(val: Body[]) { console.error("[ERROR] can't set Entity.bodies") }

    get level(): number { return this._level }
    set level(val: number) { 
        if (!this._parent || this._parentType == 1) this._levelChangeContactFix(this._level, val)

        this._world._ents[this._level].splice(this._world._ents[this._level].indexOf(this), 1)
        this._level = val
        if(this._world._ents[val]) this._world._ents[val].push(this)
        else this._world._ents[val] = [this]
    }

    set __x(val: number) { 
        if (this._x != val) {
            this._x = val
            this._xChangeContactFix()
        }
    }
    set __y(val: number) { 
        if (this._y != val) {
            this._y = val
            this._yChangeContactFix()
        }
    }

    // POSITIONNING
    get x(): number { return this._x - (this._parent != null && this._parentType == 1 ? this._parent.globalx : 0) }
    get y(): number { return this._y - (this._parent != null && this._parentType == 1 ? this._parent.globaly : 0) }

    set x(val: number) { this.__x = val + (this._parent != null ? this._parent.globalx : 0) }
    set y(val: number) { this.__y = val + (this._parent != null ? this._parent.globaly : 0) }

    get globalx(): number { return this._x + (this._parent != null && this._parentType == 0 ? this._parent.globalx : 0) }
    get globaly(): number { return this._y + (this._parent != null && this._parentType == 0 ? this._parent.globaly : 0) }
    set globalx(val: number) { this.__x = val - (this._parent != null && this._parentType == 0 ? this._parent.globalx : 0) }
    set globaly(val: number) { this.__y = val - (this._parent != null && this._parentType == 0 ? this._parent.globaly : 0) }

    get globalvx(): number { return this._vx + (this._parent != null ? this._parent.globalvx : 0) }
    get globalvy(): number { return this._vy + (this._parent != null ? this._parent.globalvy : 0) }

    set globalvx(val: number) { this.vx = val - (this._parent != null ? this._parent.globalvx : 0) }
    set globalvy(val: number) { this.vy = val - (this._parent != null ? this._parent.globalvy : 0) }

    get vx(): number { return this._vx }
    get vy(): number { return this._vy }

    set vx(val: number) { this._vx = val }
    set vy(val: number) { this._vy = val }

    get contacts(): Contact[] {
        let res = [this.leftContact, this.downContact, this.rightContact, this.upContact].filter(c => c)
        this._forAllBodies(b => {
            if(b._higherContacts) { res.push.apply(res, b._higherContacts) }
        })
        for(let c of res) {
            c.body = c.body._grid || c.body
            c.otherBody = c.otherBody._grid || c.otherBody
        }
        return res
    }
    get leftContact(): Contact {
        let leftLower = this._lowers.find(c => c.side == 1)
        return leftLower && {
            body: leftLower.body._grid || leftLower.body,
            otherBody: leftLower.otherBody._grid || leftLower.otherBody,
            side: "left"
        }
    }
    get rightContact(): Contact {
        let rightLower = this._lowers.find(c => c.side == 0)
        return rightLower && {
            body: rightLower.body._grid || rightLower.body,
            otherBody: rightLower.otherBody._grid || rightLower.otherBody,
            side: "right"
        }
    }
    get upContact(): Contact {
        let upLower = this._lowers.find(c => c.side == 2)
        return upLower && {
            body: upLower.body._grid || upLower.body,
            otherBody: upLower.otherBody._grid || upLower.otherBody,
            side: "up"
        }
    }
    get downContact(): Contact {
        let downLower = this._lowers.find(c => c.side == 3)
        return downLower && {
            body: downLower.body._grid || downLower.body,
            otherBody: downLower.otherBody._grid || downLower.otherBody,
            side: "down"
        }
    }

    get hasLeftContact(): boolean { return this._lowers.find(c => c.side == 1) != null }
    get hasRightContact(): boolean { return this._lowers.find(c => c.side == 0) != null }
    get hasUpContact(): boolean { return this._lowers.find(c => c.side == 2) != null }
    get hasDownContact(): boolean { return this._lowers.find(c => c.side == 3) != null }

    get isCrushed(): boolean { return this._invalidOverlap.length > 0 }

    get minX(): number { return this._minX + this._x }
    get maxX(): number { return this._maxX + this._x }
    get minY(): number { return this._minY + this._y }
    get maxY(): number { return this._maxY + this._y }

    constructor(world: World, args: EntityArgs) {
        this._world = world

        this._topEntity = this

        this._x = args.x
        this._y = args.y

        this._vx = 0
        this._vy = 0

        this._level = args.level || 0

        switch(args.type) {
            case null: {
                let a = args as PureEntityArgs
                if(a.body) {
                    this._createBody(a.body)
                } else if(a.bodies) {
                    if((a.bodies as any).length != null) {
                        for(let b of (a.bodies as any[])) {
                            this._createBody(b)
                        }
                    } else {
                        this._createBody(a.bodies as any)
                    }
                }
                break
            }
            case "rect": {
                let a = args as RectArgs
                a.x = 0
                a.y = 0
                this.createRect(a)
                break
            }
            case "line": {
                let a = args as LineArgs
                a.x = 0
                a.y = 0
                this.createLine(a)
                break
            }
            case "grid": {
                let a = args as GridArgs
                a.x = 0
                a.y = 0
                this.createGrid(a)
                break
            }
        }
    }

    // HIERARCHY
    createRect(args: RectArgs): Rect {
        let body = new Rect(this, args)
        this._addBody(body)
        return body
    }
    createLine(args: LineArgs): Line {
        let body = new Line(this, args)
        this._addBody(body)
        return body
    }
    createGrid(args: GridArgs): Grid {
        let body = new Grid(this, args)
        if(!this._grids) {
            this._grids = body
        } else if(this._grids instanceof Grid) {
            this._grids = [body, this._grids]
        } else {
            this._grids.push(body)
        }
        return body
    }
    removeBody(body: Body) {
        if(this._bodies instanceof Body) {
            if(body == this._bodies) {
                this._bodies = null
            }
        } else {
            this._bodies.remove(body)
        }

        let topEntity = this._topEntity
        if(topEntity._allBodies) {
            topEntity._allBodies.remove(body)
        }
        if(topEntity._minX == body.minX) { topEntity._resetMinx() }
        if(topEntity._maxX == body.maxX) { topEntity._resetMaxx() }
        if(topEntity._minY == body.minY) { topEntity._resetMiny() }
        if(topEntity._maxY == body.maxY) { topEntity._resetMaxy() }

        // TO FIX
        // if(body._higherContacts) {
        //     let len = body._higherContacts.length
        //     for(let i = 0; i < len; i++) {
        //         let c: _Contact = body._higherContacts[i]
        //         if(c.side == 1) {
        //             c.otherBody._topEntity._removeRightLowerContact()
        //         } else if(c.side == 0) {
        //             c.otherBody._topEntity._removeLeftLowerContact()
        //         } else if(c.side == 2) {
        //             c.otherBody._topEntity._removeDownLowerContact()
        //         } else {
        //             c.otherBody._topEntity._removeUpLowerContact()
        //         }
        //     }
        // }

        // for(let t in ["_downLower", "_upLower", "_leftLower", "_rightLower"]) {
        //     let c: Contact = this[t]
        //     if(c) {
        //         if(c.body == body) {
        //             let i = c.otherBody._higherContacts.indexOf(c)
        //             c.otherBody._higherContacts.splice(i, 1)
        //             this[t] = null
        //         }
        //     }
        // }
    }
    _createBody(args: RectArgs | LineArgs | GridArgs) {
        if((args as any).width != null) {
            this._addBody(new Rect(this, args as RectArgs))
        } else if((args as any).size != null) {
            this._addBody(new Line(this, args as LineArgs))
        } else {
            if(!this._grids) {
                this._grids = new Grid(this, args as GridArgs)
            } else if(this._grids instanceof Grid) {
                this._grids = [this._grids, new Grid(this, args as GridArgs)]
            } else {
                this._grids.push(new Grid(this, args as GridArgs))
            }
        }
    }
    _addBody(body: Body) {
        if(this._bodies != null) {
            if(this._bodies instanceof Body) {
                let old = this._bodies
                this._bodies = new BinaryTree<Body>()
                this._bodies.insert(old)
            }
            this._bodies.insert(body)
        } else {
            this._bodies = body
        }

        let topEntity = this._topEntity
        if(topEntity._allBodies) {
            topEntity._allBodies.insert(body)
        }

        topEntity._minX = Math.min(topEntity._minX, body.minX)
        topEntity._maxX = Math.max(topEntity._maxX, body.maxX)
        topEntity._minY = Math.min(topEntity._minY, body.minY)
        topEntity._maxY = Math.max(topEntity._maxY, body.maxY)
    }
    _forAllBodies(lambda: (b: Body) => void) {
        if(this._allBodies) {
            this._allBodies.forAll(lambda)
        } else if(this._bodies) {
            if(this._bodies instanceof Body) {
                lambda(this._bodies)
            } else {
                this._bodies.forAll(lambda)
            }
        }
    }
    forBodies(lambda: (b: Body) => void) {
        if(this._bodies) {
            if(this._bodies instanceof Body) {
                lambda(this._bodies)
            } else {
                this._bodies.forAll(b => { if(!b._grid) { lambda(b) } })
            }
        }

        if(this._grids) {
            if(this._grids instanceof Grid) {
                lambda(this._grids)
            } else {
                this._grids.forEach(g => lambda(g))
            }
        }
    }
    _forBodies(lambda: (b: Body) => void) {
        if(this._bodies) {
            if(this._bodies instanceof Body) {
                lambda(this._bodies)
            } else {
                this._bodies.forAll(lambda)
            }
        }
    }

    addChild(ent: Entity, parentType?: string) { // static | follow
        ent.setParent(this, parentType)
    }
    removeChild(ent: Entity) {
        ent._setParent(null, 0)
    }
    setParent(parent: Entity, parentType?: string) {
        this._setParent(parent, parentType && parentType == "follow" ? 1 : 0)
    }

    _setParent(parent: Entity, parentType: number, keepPosition?: boolean) {
        // TODO: update bounds
        if(keepPosition == null) {
            keepPosition = true
        }
        if(this._parent != parent) {
            // IF HAS A PARENT, REMOVE IT
            if(this._parent) {
                // #################################
                // REMOVE PARENT - START
                // #################################
                // REPOSITION
                if(keepPosition && this._parentType == 0) {
                    this._x += this._parent.globalx
                    this._y += this._parent.globaly
                }

                // ADAPT SPEED
                this._vx += this._parent.globalvx
                this._vy += this._parent.globalvy

                if(this._parentType == 0) {
                    // CALCULATE TOP ENTITY + ENTITY POSITION WITHIN THE TOP ENTITY
                    let topEntity = this._parent,
                        x = this._x,
                        y = this._y
                    while(topEntity._parent != null && topEntity._parentType == 0) {
                        x += topEntity._x
                        y += topEntity._y
                        topEntity = topEntity._parent
                    }

                    // IF HAS STATIC CHILD, NEEDS A VBH
                    if(this._childs && this.children.filter(c => c._parentType == 0).length && !this._allBodies) {
                        this._allBodies = new BinaryTree<Body>()
                        this._allBodies.bulkInsert(this.bodies)
                    }

                    // MOVE CHILDS
                    let childs = []
                    let child = this

                    let resetminx = false, resetmaxx = false, resetmaxy = false, resetminy = false
                    this._minX = Infinity
                    this._maxX = -Infinity
                    this._minY = Infinity
                    this._maxY = -Infinity

                    while(child) {
                        child._topEntity = this
                        // MODIFY BODY FIELDS
                        child.bodies.forEach(b => {
                            topEntity._allBodies.remove(b)
                            if(this._allBodies) {
                                this._allBodies.insert(b)
                            }
                            resetminx = resetminx || topEntity._minX == b.minX
                            resetmaxx = resetmaxx || topEntity._maxX == b.maxX
                            resetminy = resetminy || topEntity._minY == b.maxY
                            resetmaxy = resetmaxy || topEntity._maxY == b.maxY

                            b._x -= x
                            b._y -= y
                            this._minX = Math.min(this._minX, b.minX)
                            this._maxX = Math.max(this._maxX, b.maxX)
                            this._minY = Math.min(this._minY, b.minY)
                            this._maxY = Math.max(this._maxY, b.maxY)
                        })

                        // CHANGE OWNERSHIP OF CONTACTS
                        let remove: number[]
                        for(let i = 0, len = topEntity._lowers.length; i < len; i++) {
                            let lower = topEntity._lowers[i]
                            if (lower.body._entity == child) {
                                if (!remove) remove = [i]
                                else remove.push(i)
                                child._lowers.push(lower)
                            }
                        }
                        if (remove) _.pullAt(topEntity._lowers, remove)

                        // CONTINUE TO THE NEXT
                        if(child._childs) {
                            childs.push.apply(childs, child.children.filter(c => c._parentType == 0))
                        }
                        child = childs.pop()
                    }
                    if(resetminx) { topEntity._resetMinx() }
                    if(resetmaxx) { topEntity._resetMaxx() }
                    if(resetminy) { topEntity._resetMiny() }
                    if(resetmaxy) { topEntity._resetMaxy() }

                    this._world._addTopEntity(this)
                }

                this._parent._childs.splice(this._parent._childs.indexOf(this), 1)
                this._parent = null

                // #################################
                // REMOVE PARENT - END
                // #################################
            }

            if(parent) {
                // #################################
                // SET PARENT - START
                // #################################
                if(keepPosition && parentType == 0) {
                    this._x -= parent.globalx
                    this._y -= parent.globaly
                }

                this._vx -= parent.globalvx
                this._vy -= parent.globalvy

                if(parentType == 0) {
                    let topEntity = parent,
                        x = this._x,
                        y = this._y
                    while(topEntity._parent != null && topEntity._parentType == 0) {
                        x += topEntity._x
                        y += topEntity._y
                        topEntity = topEntity._parent
                    }

                    for(let b of this.bodies) {
                        b._x += x
                        b._y += y
                    }

                    // IF HAS STATIC CHILD, NEEDS A VBH
                    if(!topEntity._allBodies) {
                        topEntity._allBodies = new BinaryTree<Body>()
                        topEntity._allBodies.bulkInsert(topEntity.bodies)
                    }

                    // MOVE CHILDS
                    for(let b of this._allBodies ? this._allBodies.all() : this.bodies) {
                        if(this._allBodies) {
                            this._allBodies.remove(b)
                        }
                        topEntity._allBodies.insert(b)
                        b._x += x
                        b._y += y
                        b._entity._topEntity = topEntity
                    }

                    // CHANGE OWNERSHIP OF CONTACTS
                    topEntity._lowers.push.apply(this._lowers)
                    this._lowers = []
                    
                    this._world._removeTopEntity(this)
                }

                this._parent = parent
                if(!parent._childs) {
                    parent._childs = [this]
                } else {
                    parent._childs.push(this)
                }
                this._parentType = parentType

                // #################################
                // SET PARENT - END
                // #################################
            }
        } else if(parent && parentType != this._parentType) {
            if(parentType == 0) {
                let topEntity = parent,
                    x = this._x,
                    y = this._y

                if (keepPosition) {
                    this._x -= parent.globalx
                    this._y -= parent.globaly
                }

                while(topEntity._parent != null && topEntity._parentType == 0) {
                    x += topEntity._x
                    y += topEntity._y
                    topEntity = topEntity._parent
                }

                if(!topEntity._allBodies) {
                    topEntity._allBodies = new BinaryTree<Body>()
                    topEntity._allBodies.bulkInsert(topEntity.bodies)
                }

                // MOVE CHILDS
                for(let b of this._allBodies ? this._allBodies.all() : this.bodies) {
                    if(this._allBodies) {
                        this._allBodies.remove(b)
                    }
                    topEntity._allBodies.insert(b)
                    b._x += x
                    b._y += y
                    b._entity._topEntity = topEntity
                }

                // CHANGE OWNERSHIP OF CONTACTS
                topEntity._lowers.push.apply(this._lowers)
                this._lowers = []

                this._world._removeTopEntity(this)
            } else {
                let topEntity = parent,
                    x = this._x,
                    y = this._y

                if (keepPosition) {
                    this._x += parent.globalx
                    this._y += parent.globaly
                }    

                while(topEntity._parent != null && topEntity._parentType == 0) {
                    x += topEntity._x
                    y += topEntity._y
                    topEntity = topEntity._parent
                }

                // IF HAS STATIC CHILD, NEEDS A VBH
                if(this._childs && this.children.filter(c => c._parentType == 0).length && !this._allBodies) {
                    this._allBodies = new BinaryTree<Body>()
                    this._allBodies.bulkInsert(this.bodies)
                }

                // MOVE CHILDS
                let childs = []
                let child = this

                while(child) {
                    child.bodies.forEach(b => {
                        topEntity._allBodies.remove(b)
                        if(this._allBodies) {
                            this._allBodies.insert(b)
                        }
                        b._x -= x
                        b._y -= y
                        b._entity._topEntity = this
                    })

                    // CHANGE OWNERSHIP OF CONTACTS
                    let remove: number[]
                    for(let i = 0, len = topEntity._lowers.length; i < len; i++) {
                        let lower = topEntity._lowers[i]
                        if (lower.body._entity == child) {
                            if (!remove) remove = [i]
                            else remove.push(i)
                            child._lowers.push(lower)
                        }
                    }
                    if (remove) _.pullAt(topEntity._lowers, remove)

                    if(child._childs) {
                        childs.push.apply(childs, child.children.filter(c => c._parentType == 0))
                    }
                    child = childs.pop()
                }

                this._world._addTopEntity(this)
            }
            this._parentType = parentType
        }
    }

    createChild(args: EntityArgs, parentType?: string): Entity {
        let ent = new Entity(this._world, args)
        this._world._addEntity(ent)
        ent._setParent(this, parentType && parentType == "follow" ? 1 : 0, false)
        return ent
    }
    destroyChild(ent: Entity) {
        this._world.removeEntity(ent)
    }
    destroy() {
        this._world.removeEntity(this)
    }

    move(dx: number, dy: number) {
        this._world._move(this, dx, dy)
    }
    moveToGlobal(x: number, y: number) {
        this.move(
            x - this._x - (this._parent && this._parentType == 0 ? this._parent.globalx : 0), 
            y - this._y - (this._parent && this._parentType == 0 ? this._parent.globaly : 0)
        )
    }
    moveToLocal(x: number, y: number) {
        this.move(
            x - this.x + (this._parent && this._parentType == 1 ? this._parent.globalx : 0), 
            y - this.y + (this._parent && this._parentType == 1 ? this._parent.globaly : 0)
        )
    }

    localToGlobal(x: number | { x: number, y: number }, y?: number): { x: number, y: number } {
        if(typeof x !== "number") {
            y = x.y
            x = x.x
        }

        return { x: x + this._x, y: y + this._y }
    }
    globalToLocal(x: number | { x: number, y: number }, y?: number): { x: number, y: number } {
        if(typeof x !== "number") {
            y = x.y
            x = x.x
        }
        
        if (this._parent && this._parentType == 0) {
            return { x: x - this._x - this._parent.globalx, y: y - this._y - this._parent.globaly }
        } else {
            return { x: x - this._x, y: y - this._y }
        }
    }

    _resetMinx() {
        this._minX = Infinity
        this._forAllBodies(b => { this._minX = Math.min(this._minX, b.minX) })
    }
    _resetMiny() {
        this._minY = Infinity
        this._forAllBodies(b => { this._minY = Math.min(this._minY, b.minY) })
    }
    _resetMaxx() {
        this._maxX = -Infinity
        this._forAllBodies(b => { this._maxX = Math.max(this._maxX, b.maxX) })
    }
    _resetMaxy() {
        this._maxY = -Infinity
        this._forAllBodies(b => { this._maxY = Math.max(this._maxY, b.maxY) })
    }

    _levelChangeContactFix(oldLevel: number, newLevel: number) {
        if (newLevel > oldLevel) {
            this._forAllBodies(b => {
                if(b._higherContacts) {
                    let remove = []

                    for(let i = 0, len = b._higherContacts.length; i < len; i++) {
                        let c = b._higherContacts[i]

                        if(c.otherBody._topEntity._level <= newLevel) {
                            let ind = c.otherBody._topEntity._lowers.indexOf(c)
                            c.otherBody._topEntity._lowers.splice(ind, 1)
                            remove.push(i)
                        }
                    }

                    _.pullAt(b._higherContacts, remove)
                }
            })
        } else if(newLevel < oldLevel) {
            let remove: number[]
            for(let i = 0, len = this._lowers.length; i < len; i++) {
                let lower = this._lowers[i]
                if (lower.otherBody._topEntity.level >= newLevel) {
                    if (remove) remove.push(i)
                    else remove = [i]
                }
            }
            if (remove) this._removeLowers(remove)
        }
    }
    _xChangeContactFix() {
        if (this == this._topEntity) {
            let remove: number[]
            for(let i = 0, len = this._lowers.length; i < len; i++) {
                let lower = this._lowers[i]
                if (lower.side == 0 || lower.side == 1) {
                    if (remove) remove.push(i)
                    else remove = [i]
                    let ind = lower.otherBody._higherContacts.indexOf(lower)
                    lower.otherBody._higherContacts.splice(ind)
                } else {
                    if (Math.abs(this._x + lower.body._x - lower.otherBody._topEntity._x - lower.otherBody._x) * 2 > lower.body._width + lower.otherBody._width) {
                        if (remove) remove.push(i)
                        else remove = [i]
                        let ind = lower.otherBody._higherContacts.indexOf(lower)
                        lower.otherBody._higherContacts.splice(ind)
                    }
                }
            }
            if (remove) this._removeLowers(remove)
        }

        this._forAllBodies(b => {
            if (b._higherContacts) {
                let remove: number[]
                for(let i = 0, len = b._higherContacts.length; i < len; i++) {
                    let higher = this._lowers[i]
                    if (higher.side == 0 || higher.side == 1) {
                        if (remove) remove.push(i)
                        else remove = [i]
                        if (higher.body._entity._listener && higher.body._entity._listener.contactEnd) {
                            higher.body._entity._listener.contactEnd(
                                higher.body, 
                                higher.otherBody, 
                                higher.side == 0 ? "right" : (higher.side == 1 ? "left" : (higher.side == 2 ? "up" : "down"))
                            )
                        }
                    } else {
                        if (Math.abs(this._x + higher.body._x - higher.otherBody._topEntity._x - higher.otherBody._x) * 2 > higher.body._width + higher.otherBody._width) {
                            if (remove) remove.push(i)
                            else remove = [i]
                            if (higher.body._entity._listener && higher.body._entity._listener.contactEnd) {
                                higher.body._entity._listener.contactEnd(
                                    higher.body, 
                                    higher.otherBody, 
                                    higher.side == 0 ? "right" : (higher.side == 1 ? "left" : (higher.side == 2 ? "up" : "down"))
                                )
                            }
                        }
                    }
                }
                if (remove) _.pullAt(b._higherContacts, remove)
            }
        })
    }
    _yChangeContactFix() {
        if (this == this._topEntity) {
            let remove: number[]
            for(let i = 0, len = this._lowers.length; i < len; i++) {
                let lower = this._lowers[i]
                if (lower.side > 1) {
                    if (remove) remove.push(i)
                    else remove = [i]
                    let ind = lower.otherBody._higherContacts.indexOf(lower)
                    lower.otherBody._higherContacts.splice(ind)
                } else {
                    if (Math.abs(this._y + lower.body._y - lower.otherBody._topEntity._y - lower.otherBody._y) * 2 > lower.body._height + lower.otherBody._height) {
                        if (remove) remove.push(i)
                        else remove = [i]
                        let ind = lower.otherBody._higherContacts.indexOf(lower)
                        lower.otherBody._higherContacts.splice(ind)
                    }
                }
            }
            if (remove) this._removeLowers(remove)
        }

        this._forAllBodies(b => {
            if (b._higherContacts) {
                let remove: number[]
                for(let i = 0, len = b._higherContacts.length; i < len; i++) {
                    let higher = this._lowers[i]
                    if (higher.side > 1) {
                        if (remove) remove.push(i)
                        else remove = [i]
                        if (higher.body._entity._listener && higher.body._entity._listener.contactEnd) {
                            higher.body._entity._listener.contactEnd(
                                higher.body, 
                                higher.otherBody, 
                                higher.side == 0 ? "right" : (higher.side == 1 ? "left" : (higher.side == 2 ? "up" : "down"))
                            )
                        }
                    } else {
                        if (Math.abs(this._y + higher.body._y - higher.otherBody._topEntity._y - higher.otherBody._y) * 2 > higher.body._height + higher.otherBody._height) {
                            if (remove) remove.push(i)
                            else remove = [i]
                            if (higher.body._entity._listener && higher.body._entity._listener.contactEnd) {
                                higher.body._entity._listener.contactEnd(
                                    higher.body, 
                                    higher.otherBody, 
                                    higher.side == 0 ? "right" : (higher.side == 1 ? "left" : (higher.side == 2 ? "up" : "down"))
                                )
                            }
                        }
                    }
                }
                if (remove) _.pullAt(b._higherContacts, remove)
            }
        })
    }

    _removeLowers(indexes: number[]) {
        let contacts = _.pullAt(this._lowers, indexes)
        if (this._listener && this._listener.contactEnd) {
            for (let c of contacts) {
                this._listener.contactEnd(
                    c.body, 
                    c.otherBody, 
                    c.side == 0 ? "right" : (c.side == 1 ? "left" : c.side == 2 ? "up" : "down")
                )
            }
        }
    }
}