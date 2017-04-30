import * as _ from 'lodash'

import { Entity } from './entity'
import { RelativeContact } from './contact'

export enum BodyType {
    RECT, LINE, GRID
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
export interface RectArgs extends SmallBodyArgs {
    width: number
    height: number
}
export interface LineArgs extends SmallBodyArgs {
    size: number
    isHorizontal: boolean
    side?: string
}
export interface GridArgs extends BodyArgs {
    tiles: TileArgs
}
export type TileArgs = any[] | { x: number, y: number, info: (number | any)[][] }

export abstract class Body {

    type: number

    _entity: Entity
    _topEntity: Entity

    _enabled: boolean

    _x: number
    _y: number

    get entity(): Entity { return this._entity }
    set entity(val: Entity) { console.log("[ERROR] can't set entity") }

    get enabled(): boolean { return this._enabled }
    set enabled(val: boolean) {
        if(val != this._enabled && !val) {
            for(let t of ["up", "down", "left", "right"]) {
                let c = this._topEntity["_" + t + "Lower"]
                if(c) {
                    if(c.body1 == this) {
                        let i = c.body2._topEntity._higherContacts.indexOf(c)
                        c.body2._topEntity._higherContacts.splice(i, 1)
                        this._topEntity["_" + t + "Lower"] = null
                    } else if(c.body2 == this) {
                        let i = c.body1._topEntity._higherContacts.indexOf(c)
                        c.body1._topEntity._higherContacts.splice(i, 1)
                        this._topEntity["_" + t + "Lower"] = null
                    }
                }
            }

            let len = this._topEntity._higherContacts.length,
                toremove = []
            for(let i = 0; i < len; i++) {
                let c = this._topEntity._higherContacts[i]

                if(c.body1 == this) {
                    if(c.isHorizontal) {
                        c.body2._topEntity._leftLower = null
                    } else {
                        c.body2._topEntity._upLower = null
                    }
                    toremove.push(i)
                } else if(c.body2 == this) {
                    if(c.isHorizontal) {
                        c.body1._topEntity._rightLower = null
                    } else {
                        c.body1._topEntity._downLower = null
                    }
                    toremove.push(i)
                }
            }
            _.pullAt(this._topEntity._higherContacts, toremove)
        }
        this._enabled = val
    }

    get x(): number { 
        let topParent = this._entity, x = this._x
        while(topParent != this._topEntity) { x -= topParent._x }
        return x 
    }
    get y(): number {  
        let topParent = this._entity, y = this._y
        while(topParent != this._topEntity) { y -= topParent._y }
        return y
    }

    get globalx(): number { return this._x + this._topEntity.globalx }
    get globaly(): number { return this._y + this._topEntity.globaly }

    set x(val: number) { 
        this._x = val
        this._updateContacts()
    }
    set y(val: number) {
        this._y = val
        this._updateContacts()
    }
    set globalx(val: number) {
        let topParent = this._entity, x = val
        while(topParent != this._topEntity) {
            x -= topParent._x
            topParent = topParent._parent
        }
        this.x = val - topParent.globalx
    }
    set globaly(val: number) {
        let topParent = this._entity, y = val
        while(topParent != this._topEntity) {
            y -= topParent._y
            topParent = topParent._parent
        }
        this.y = val - topParent.globaly
    }

    get contacts(): RelativeContact[] {
        return this._topEntity.contacts.filter(c => c.body == this)
    }
    get leftContact(): RelativeContact {
        let leftContact = this._topEntity.leftContact
        return leftContact && leftContact.body == this && leftContact
    }
    get rightContact(): RelativeContact {
        let rightContact = this._topEntity.rightContact
        return rightContact && rightContact.body == this && rightContact
    }
    get upContact(): RelativeContact {
        let upContact = this._topEntity.upContact
        return upContact && upContact.body == this && upContact
    }
    get downContact(): RelativeContact {
        let downContact = this._topEntity.downContact
        return downContact && downContact.body == this && downContact
    }

    constructor(entity: Entity, args: BodyArgs) {
        this._topEntity = entity
        this._x = args.x || 0
        this._y = args.y || 0
        this._enabled = args.enabled || true
    }

    localToGlobal(x: number | { x: number, y: number }, y?: number): { x: number, y: number } {
        if(typeof x !== "number") {
            y = x.y
            x = x.x
        }
        let topParent = this._entity
        while(topParent != this._topEntity) {
            x += topParent._x
            y += topParent._y
            topParent = topParent._parent
        }
        return {
            x: x + this._x + this._topEntity.globalx,
            y: y + this._y + this._topEntity.globaly
        }
    }
    globalToLocal(x: number | { x: number, y: number }, y?: number): { x: number, y: number } {
        if(typeof x !== "number") {
            y = x.y
            x = x.x
        }
        let topParent = this._entity
        while(topParent != this._topEntity) {
            x -= topParent._x
            y -= topParent._y
            topParent = topParent._parent
        }
        return {
            x: x - this._x - this._topEntity.globalx,
            y: y - this._y - this._topEntity.globaly
        }
    }

    _updateContacts() {
        for(let t of ["up", "down", "left", "right"]) {
            let c = this._topEntity["_" + t + "Lower"]
            if(c) {
                if(c.body1 == this) {
                    if(this._updateContact(c, true)) {
                        let i = c.body2._topEntity._higherContacts.indexOf(c)
                        c.body2._topEntity._higherContacts.splice(i, 1)
                        this._topEntity["_" + t + "Lower"] = null
                    }
                } else if(c.body2 == this) {
                    if(this._updateContact(c, false)) {
                        let i = c.body1._topEntity._higherContacts.indexOf(c)
                        c.body1._topEntity._higherContacts.splice(i, 1)
                        this._topEntity["_" + t + "Lower"] = null
                    }
                }
            }
        }

        let len = this._topEntity._higherContacts.length,
            toremove = []
        for(let i = 0; i < len; i++) {
            let c = this._topEntity._higherContacts[i]

            if(c.body1 == this) {
                if(this._updateContact(c, true)) {
                    if(c.isHorizontal) {
                        c.body2._topEntity._leftLower = null
                        toremove.push(i)
                    } else {
                        c.body2._topEntity._upLower = null
                        toremove.push(i)
                    }
                }
            } else if(c.body2 == this) {
                if(this._updateContact(c, false)) {
                    if(c.isHorizontal) {
                        c.body1._topEntity._rightLower = null
                        toremove.push(i)
                    } else {
                        c.body1._topEntity._downLower = null
                        toremove.push(i)
                    }
                }
            }
        }
    }
    _updateContact(c, leftToRight: boolean): boolean {

        return true
    }
}

export abstract class SmallBody extends Body {

    _isSensor: boolean
    _layer: number
    _layerGroup: number

    get isSensor(): boolean { return this._isSensor }
    get layer(): string {
        return this._topEntity._world._layerNames[this._layer]
    }
    get layerGroup(): number {
        return this._layerGroup
    }

    set isSensor(val: boolean) {
        this._isSensor = val
        this._updateContacts()
    }
    set layer(val: string) {
        this._layer = this._entity._world._getLayer(val)
        this._updateContacts()
    }
    set layerGroup(val: number) {
        this._layerGroup = val
        this._updateContacts()
    }

    constructor(entity: Entity, args: SmallBodyArgs) {
        super(entity, args)

        this._isSensor = args.isSensor || false
        this._layer = args.layer ? this._entity._world._getLayer(args.layer) : 0
        this._layerGroup = args.layerGroup || 0
    }
}

export class Rect extends SmallBody {

    type = BodyType.RECT

    _width: number
    _height: number

    get width(): number { return this._width }
    get height(): number { return this._height }

    set width(val: number) { 
        this._width = val
        this._updateContacts()
    }
    set height(val: number) { 
        this._height = val
        this._updateContacts()
    }

    constructor(entity: Entity, args: RectArgs) {
        super(entity, args)

        this._width = args.width
        this._height = args.height
    }
}

export class Line extends SmallBody {

    type = BodyType.LINE

    _size: number

    _isHorizontal: boolean

    _oneway: number // 0: no, 1: down/right, 2: up/left

    get size(): number { return this._size }
    set size(val: number) {
        this._size = val
        this._updateContacts()
    }

    get isHorizontal(): boolean { return this._isHorizontal }
    get isVertical(): boolean { return !this._isHorizontal }
    set isHorizontal(val: boolean) { console.log("[ERROR] Can't set Line.isHorizontal")}
    set isVertical(val: boolean) { console.log("[ERROR] Can't set Line.isVertical")}

    get side(): string { 
        return this._oneway == 0 ? "all" : 
            (this._isHorizontal ? (this._oneway == 1 ? "down" : "up") : (this._oneway == 1 ? "right" : "left")) 
    }
    set side(val: string) { 
        if(this.isHorizontal) {
            if(val == "all") {
                this._oneway = 0
            } else if(val == "down") {
                this._oneway = 1
            } else if(val == "up") {
                this._oneway = 2
            }
        } else {
            if(val == "all") {
                this._oneway = 0
            } else if(val == "right") {
                this._oneway = 1
            } else if(val == "left") {
                this._oneway = 2
            }
        }
    }

    constructor(entity: Entity, args: LineArgs) {
        super(entity, args)

        this._size = args.size
        this._isHorizontal = args.isHorizontal
        if(args.side) {
            this.side = args.side
        } else {
            this._oneway = 0
        }
    }
}

export class Grid extends Body {

    type = BodyType.GRID

    _minx: number
    _maxx: number
    _miny: number
    _maxy: number
    _tileSize: number

    // TODO
    _largeGrids: SubGrid 
               | { x: number, y: number, sub: SubGrid }[] 
               | { x: number, y: number, subs: SubGrid[][] }

    get minx(): number { return this._minx }
    get maxx(): number { return this._maxx }
    get miny(): number { return this._miny }
    get maxy(): number { return this._maxy }
    get tileSize(): number { return this._tileSize }

    set minx(val: number) { console.log("[ERROR] can't set Grid.minx") }
    set maxx(val: number) { console.log("[ERROR] can't set Grid.maxx") }
    set miny(val: number) { console.log("[ERROR] can't set Grid.miny") }
    set maxy(val: number) { console.log("[ERROR] can't set Grid.maxy") }
    set tileSize(val: number) { console.log("[ERROR] can't set Grid.tileSize") }

    constructor(entity: Entity, args: GridArgs) {
        super(entity, args)

    }

    getTile(x: number, y: number): any {

    }
    setTile(x: number, y: number, val: any) {

    }
    clearTile(x: number, y: number) {

    }

    setTiles(args: TileArgs) {

    }
    clearTiles(args: { x: number, y: number, width: number, height: number } | { x: number, y: number }[]) {

    }
}

export interface SubGrid {

    info: any[][]
    rows: any[][] // row -> list of horizontal lines
    columns: any[][] // line -> list of vertical lines
}