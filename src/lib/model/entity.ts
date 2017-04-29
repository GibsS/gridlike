import * as _ from 'lodash'

import { VBH } from '../vbh/vbh'

import { Body, RectArgs, LineArgs, GridArgs } from './body'
import { World } from './world'
import { Rect, Line, Grid } from './body'
import { Contact, RelativeContact } from './contact'

import { ParentType } from './enums'

export type EntityArgs = {
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

export interface EntityDelegate {

    contactStart(body: Body, otherBody: Body, side: string)
    contactEnd(body: Body, otherBody: Body, side: string)
}

export class Entity {

    _world: World
    get world(): World { return this._world }
    set world(val: World) {
        console.log("[ERROR] can't set world")
    }

    _delegate: EntityDelegate
    get delegate(): EntityDelegate { return this._delegate }
    set delegate(val: EntityDelegate) { this._delegate = val }

    // HIERARCHY
    _parent: Entity // a rect of higher level
    _parentType: number // 0: static, 1: follow
    _childs: Entity[]
    get parent(): Entity { return this._parent }
    set parent(val: Entity) {
        // TODO: set parent
    }
    get parentType(): number { return this._parentType }
    set parentType(val: number) {
        // TODO set parentType
    }
    get childs(): Entity[] { return _.clone(this._childs) }
    set childs(val: Entity[]) {
        console.log("[ERROR] can't set childs")
    }

    _bodies: Body | VBH<Body>
    _allBodies: VBH<Body>
    get body(): Body { 
        // TODO get body
        return null
    }
    set body(val: Body) {
        console.log("[ERROR] can't set body")
    }
    get bodies(): Body[] {
        // TODO get bodies
        return null
    }
    set bodies(val: Body[]) {
        console.log("[ERROR] can't set bodies")
    }

    _level: number
    get level(): number { return this._level }
    set level(val: number) { 
        // TODO set level
    }

    // POSITIONNING
    _localx: number
    _localy: number
    get globalx(): number { return this._localx }
    get globaly(): number { return this._localy }

    set globalx(val: number) { this._localx = val }
    set globaly(val: number) { this._localy = val }

    get x(): number { 
        // TODO get x
        return 0
    }
    get y(): number { 
        // TODO get y
        return 0
    }    
    set x(val: number) { 
        // TODO set x
    }
    set y(val: number) { 
        // TODO set y
    }

    _localvx: number
    _localvy: number
    get globalvx(): number { return this._localx }
    get globalvy(): number { return this._localy }

    set globalvx(val: number) { this._localx = val }
    set globalvy(val: number) { this._localy = val }

    get vx(): number { 
        // TODO get x
        return 0
    }
    get vy(): number { 
        // TODO get y
        return 0
    }    
    set vx(val: number) { 
        // TODO set x
    }
    set vy(val: number) { 
        // TODO set y
    }

    _lowerContacts: Contact[]
    _higherContacts: Contact[]
    get contacts(): RelativeContact[] {
        return this._lowerContacts.concat(this._higherContacts).map(c => { 
            let entityHasBody1 = c.body1._entity == this
            return {
                body: entityHasBody1 ? c.body1 : c.body2,
                otherBody: entityHasBody1 ? c.body2 : c.body1,
                side: entityHasBody1 ? (c.isHorizontal ? "right" : "down") : (c.isHorizontal ? "up" : "left")
            }
        })
    }
    get leftContact(): RelativeContact {
        return null
    }
    get rightContact(): RelativeContact {
        return null
    }
    get upContact(): RelativeContact {
        return null
    }
    get downContact(): RelativeContact {
        return null
    }

    constructor(world: World) {

    }

    // HIERARCHY
    createRect(args: RectArgs): Rect {
        return null
    }
    createLine(args: LineArgs): Line {
        return null
    }
    createGrid(args: GridArgs): Grid {
        return null
    }
    removeBody(body: Body) {

    }

    addChild(ent: Entity, parentType?: string) { // static | follow

    }
    removeChild(ent: Entity) {

    }
    setParent(parent: Entity, parentType?: string) {

    }

    createEntity(args: EntityArgs) {

    }
    destroyChild(ent: Entity) {

    }
    destroy() {

    }

    move(dx: number, dy: number) {

    }
    moveTo(x: number, y: number) {

    }
}