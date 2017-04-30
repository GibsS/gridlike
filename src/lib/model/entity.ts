import * as _ from 'lodash'

import { VBH, SimpleVBH } from '../vbh/vbh'

import { Body, RectArgs, LineArgs, GridArgs } from './body'
import { World } from './world'
import { Rect, Line, Grid } from './body'
import { Contact, RelativeContact } from './contact'

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

export interface EntityDelegate {

    contactStart(body: Body, otherBody: Body, side: string)
    contactEnd(body: Body, otherBody: Body, side: string)
}

export class Entity {

    _world: World

    _delegate: EntityDelegate

    _parent: Entity // a rect of higher level
    _parentType: number // 0: static, 1: follow
    _childs: Entity[]

    _bodies: Body | VBH<Body>
    _allBodies: VBH<Body>
    
    _x: number
    _y: number

    _vx: number
    _vy: number

    _leftLower: Contact
    _rightLower: Contact
    _upLower: Contact
    _downLower: Contact
    _higherContacts: Contact[]

    get world(): World { return this._world }
    set world(val: World) {
        console.log("[ERROR] can't set Entity.world")
    }

    get delegate(): EntityDelegate { return this._delegate }
    set delegate(val: EntityDelegate) { this._delegate = val }

    // HIERARCHY
    get parent(): Entity { return this._parent }
    set parent(val: Entity) {
        this._setParent(val, this._parentType)
    }
    get _topEntity(): Entity {
        let topParent: Entity = this
        while(topParent._parent && topParent._parentType == 0) {
            topParent = topParent._parent
        }
        return topParent
    }
    get parentType(): number { return this._parentType }
    set parentType(val: number) {
        if(this._parent != null) {
            this._setParent(this._parent, val)
        } else {
            this._parentType = val
        }
    }
    get childs(): Entity[] { return _.clone(this._childs) }
    set childs(val: Entity[]) { console.log("[ERROR] can't set Entity.childs") }

    get body(): Body { return (this._bodies as Body) }
    set body(val: Body) { console.log("[ERROR] can't set Entity.body") }
    get bodies(): Body[] {
        if(this._bodies instanceof Body) {
            return [this._bodies]
        } else {
            return (this._bodies as VBH<Body>).all()
        }
    }
    set bodies(val: Body[]) { console.log("[ERROR] can't set Entity.bodies") }

    _level: number
    get level(): number { return this._level }
    set level(val: number) { 
        if(val > this._level) {
            let len = this._higherContacts.length,
                remove = []
            
            for(let i = 0; i < len; i++) {
                let c = this._higherContacts[i]

                if(c.body1._entity == this) {
                    if(c.body2._entity.level <= val) {
                        if(c.isHorizontal) {
                            c.body2._entity._leftLower = null
                        } else {
                            c.body2._entity._downLower = null
                        }
                        remove.push(i)
                    }                    
                } else {
                    if(c.body1._entity.level <= val) {
                        if(c.isHorizontal) {
                            c.body1._entity._rightLower = null
                        } else {
                            c.body1._entity._upLower = null
                        }
                        remove.push(i)
                    }   
                }
            }

            _.pullAt(this._higherContacts, remove)
        } else if(val < this._level) {
            for(let t of ["up", "down", "left", "right"]) {
                let c = this["_" + t + "Lower"]
                if(c.body1._entity == this) {
                    let otherEnt = c.body2._entity
                    if(otherEnt.level >= val) {
                        let i = otherEnt._higherContacts.indexOf(c)
                        otherEnt._higherContacts.splice(i, 1)
                        this["_" + t + "Lower"] = null
                    }
                } else {
                    let otherEnt = c.body1._entity
                    if(otherEnt.level >= val) {
                        let i = otherEnt._higherContacts.indexOf(c)
                        otherEnt._higherContacts.splice(i, 1)
                        this["_" + t + "Lower"] = null
                    }
                }
            }
        }
    }

    // POSITIONNING
    get globalx(): number { return this._x + (this._parent != null && this._parent.globalx) }
    get globaly(): number { return this._y + (this._parent != null && this._parent.globaly) }

    set globalx(val: number) { this.x = val - (this._parent != null && this._parent.globalx) }
    set globaly(val: number) { this.y = val - (this._parent != null && this._parent.globaly) }

    get x(): number { return this._x }
    get y(): number { return this._y }
    set x(val: number) {
        this._x = val 
        // TODO update all contacts
    }
    set y(val: number) { 
        this._y = val
        // TODO update all contacts
    }

    get globalvx(): number { return this._vx + (this._parent != null  && this._parent.globalvx) }
    get globalvy(): number { return this._vy + (this._parent && this._parent.globalvy) }

    set globalvx(val: number) { this.vx = val - (this._parent != null  && this._parent.globalvx) }
    set globalvy(val: number) { this.vy = val - (this._parent != null  && this._parent.globalvy) }

    get vx(): number { return this._vx }
    get vy(): number { return this._vy }

    set vx(val: number) { this._vx = val }
    set vy(val: number) { this._vy = val }

    get contacts(): RelativeContact[] {
        return this._higherContacts.concat([this._upLower, this._downLower, this._leftLower, this._rightLower]).map(c => { 
            let entityHasBody1 = c.body1._entity == this
            return {
                body: entityHasBody1 ? c.body1 : c.body2,
                otherBody: entityHasBody1 ? c.body2 : c.body1,
                side: entityHasBody1 ? (c.isHorizontal ? "right" : "down") : (c.isHorizontal ? "up" : "left")
            }
        })
    }
    get leftContact(): RelativeContact {
        return this._leftLower && {
            body: this._leftLower.body2,
            otherBody: this._leftLower.body1,
            side: "left"
        }
    }
    get rightContact(): RelativeContact {
        return this._rightLower && {
            body: this._rightLower.body1,
            otherBody: this._rightLower.body2,
            side: "right"
        }
    }
    get upContact(): RelativeContact {
        return this._upLower && {
            body: this._upLower.body2,
            otherBody: this._upLower.body1,
            side: "up"
        }
    }
    get downContact(): RelativeContact {
        return this._downLower && {
            body: this._downLower.body1,
            otherBody: this._downLower.body2,
            side: "down"
        }
    }

    constructor(world: World, args: EntityArgs) {
        this._world = world

        this._x = args.x
        this._y = args.y

        this._level = args.level

        switch(args.type){
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
        this._addBody(body)
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
        for(let t in ["down", "up", "left", "right"]) {
            let c = this["_" + t + "Lower"]
            if(c.body1 == body) {
                let i = c.body2._entity._higherContacts.indexOf(c)
                c.body2._entity._higherContacts.splice(i, 1)
                this["_" + t + "Lower"] = null
            } else if(c.body2 == body) {
                let i = c.body1._entity._higherContacts.indexOf(c)
                c.body1._entity._higherContacts.splice(i, 1)
                this["_" + t + "Lower"] = null
            }
        }
        let toremove = [],
            len = this._higherContacts.length
        for(let i = 0; i < len; i++) {
            let c = this._higherContacts[i]
            if(c.body1 == body) {
                if(c.isHorizontal) {
                    c.body2._entity._leftLower = null
                } else {
                    c.body2._entity._downLower = null
                }
                toremove.push(i)
            } else if(c.body2 == body) {
                if(c.isHorizontal) {
                    c.body1._entity._rightLower = null
                } else {
                    c.body1._entity._upLower = null
                }
                toremove.push(i)
            }
        }
        _.pullAt(this._higherContacts, toremove)
    }
    _createBody(args: RectArgs | LineArgs | GridArgs) {
        if((args as any).width != null) {
            this._addBody(new Rect(this, args as RectArgs))
        } else if((args as any).size != null) {
            this._addBody(new Line(this, args as LineArgs))
        } else {
            this._addBody(new Grid(this, args as GridArgs))
        }
    }
    _addBody(body: Body) {
        if(this._bodies != null) {
            if(this._bodies instanceof Body) {
                let old = this._bodies
                this._bodies = new SimpleVBH<Body>()
                this._bodies.insert(old)
            }
            this._bodies.insert(body)
        } else {
            this._bodies = body
        }
    }

    addChild(ent: Entity, parentType?: string) { // static | follow
        ent.setParent(this, parentType)
    }
    removeChild(ent: Entity) {
        ent._setParent(null, 0)
    }
    setParent(parent: Entity, parentType?: string) {
        this._setParent(parent, parentType && parentType == "static" ? 0 : 1)
    }

    _setParent(parent: Entity, parentType: number, keepPosition?: boolean) {
        if(keepPosition == null) {
            keepPosition = true
        }
        if(this._parent != parent) {
            if(this._parent) {
                if(keepPosition) {
                    this._x += this._parent.globalx
                    this._y += this._parent.globaly
                }

                this._vx += this._parent.globalvx
                this._vy += this._parent.globalvy

                if(this._parentType == 0) {
                    let topEntity = this._parent,
                        x = this._x,
                        y = this._y
                    while(topEntity._parent != null && topEntity._parentType == 0) {
                        x += topEntity._x
                        y += topEntity._y
                        topEntity = topEntity._parent
                    }

                    for(let b of this.bodies) {
                        b._x -= x
                        b._y -= y
                        b._topEntity = this
                    }
                }

                this._parent = null
            }

            if(parent) {
                if(keepPosition) {
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
                        b._topEntity = topEntity
                    }
                }

                this._parent = parent
                this._parentType = parentType
            }
        } else if(parent && parentType != this._parentType) {
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
                    b._topEntity = topEntity
                }
            } else {
                let topEntity = parent,
                    x = this._x,
                    y = this._y

                while(topEntity._parent != null && topEntity._parentType == 0) {
                    x += topEntity._x
                    y += topEntity._y
                    topEntity = topEntity._parent
                }

                for(let b of this.bodies) {
                    b._x -= x
                    b._y -= y
                    b._topEntity = this
                }
            }
        }
    }

    createChild(args: EntityArgs, parentType?: string): Entity {
        let ent = new Entity(this._world, args)
        ent._setParent(this, parentType && parentType == "static" ? 0 : 1, false)
        return ent
    }
    destroyChild(ent: Entity) {
        ent._setParent(null, 0)
        let i = this._world._ents[ent.level].indexOf(ent)
        if(i >= 0) {
            this._world._ents[ent.level].splice(i, 1)
        }
        ent._delegate = null
    }
    destroy() {
        this._setParent(null, 0)
        let i = this._world._ents[this.level].indexOf(this)
        if(i >= 0) {
            this._world._ents[this.level].splice(i, 1)
        }
        this._delegate = null
    }

    move(dx: number, dy: number) {
        this._world._move(this, dx, dy)
    }
    moveToGlobal(x: number, y: number) {
        this.move(x - this.globalx, y - this.globaly)
    }
    moveToLocal(x: number, y: number) {
        this.move(x - this._x, y - this._y)
    }

    localToGlobal(x: number | { x: number, y: number }, y?: number): { x: number, y: number } {
        if(typeof x !== "number") {
            y = x.y
            x = x.x
        }

        return {
            x: x + this._x + (this._parent != null && this._parent.globalx),
            y: y + this._y + (this._parent != null && this._parent.globaly)
        }
    }
    globalToLocal(x: number | { x: number, y: number }, y?: number): { x: number, y: number } {
        if(typeof x !== "number") {
            y = x.y
            x = x.x
        }
        
        return {
            x: x - this._x - (this._parent != null && this._parent.globalx),
            y: y - this._y - (this._parent != null && this._parent.globaly)
        }
    }
}