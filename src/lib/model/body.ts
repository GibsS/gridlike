import * as _ from 'lodash'

import { Entity } from './entity'
import { RelativeContact, Contact, Overlap } from './contact'

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
    tiles?: TileArgs
    width?: number
    height?: number
    tileSize?: number
}
export type TileArgs = { x: number, y: number, shape: number, data?: any }[]
                     | { x: number, y: number, info: { shape: number, data?: any }[][] }

export abstract class Body {

    type: number

    _entity: Entity
    _topEntity: Entity

    _enabled: boolean

    _x: number
    _y: number

    _higherContacts: Contact[]
    _overlap: Overlap[]

    get entity(): Entity { return this._entity }
    set entity(val: Entity) { console.log("[ERROR] can't set entity") }

    get enabled(): boolean { return this._enabled }
    set enabled(val: boolean) {
        if(val != this._enabled && !val) {
            for(let t of ["_upLower", "_downLower", "_leftLower", "_rightLower"]) {
                let c: Contact = this._topEntity[t]
                if(c) {
                    if(c.body1 == this) {
                        let i = c.body2._higherContacts.indexOf(c)
                        c.body2._higherContacts.splice(i, 1)
                        this._topEntity[t] = null
                    } else if(c.body2 == this) {
                        let i = c.body1._higherContacts.indexOf(c)
                        c.body1._higherContacts.splice(i, 1)
                        this._topEntity[t] = null
                    }
                }
            }

            let len = this._higherContacts.length,
                toremove = []
            for(let i = 0; i < len; i++) {
                let c = this._higherContacts[i]

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
            _.pullAt(this._higherContacts, toremove)
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
        let x = this.x, topEntity = this._entity
        while(topEntity != this._topEntity) { x += topEntity._x }
        this._topx = val
    }
    set y(val: number) {
        let y = this.y, topEntity = this._entity
        while(topEntity != this._topEntity) { y += topEntity._y }
        this._topy = val
    }
    set _topx(val: number) {
        this._x = val
        this._clearContacts()
    }
    set _topy(val: number) {
        this._y = val
        this._clearContacts()
    }
    set globalx(val: number) {
        this._topx = val - this._topEntity.globalx
    }
    set globaly(val: number) {
        this._topy = val - this._topEntity.globaly
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

    _clearContacts() {
        for(let t of ["_upLower", "_downLower", "_leftLower", "_rightLower"]) {
            let c: Contact = this._topEntity[t]
            if(c) {
                if(c.body1 == this) {
                    let i = c.body2._higherContacts.indexOf(c)
                    c.body2._higherContacts.splice(i, 1)
                    this._topEntity[t] = null
                } else if(c.body2 == this) {
                    let i = c.body1._higherContacts.indexOf(c)
                    c.body1._higherContacts.splice(i, 1)
                    this._topEntity[t] = null
                }
            }
        }

        let len = this._higherContacts.length,
            toremove = []
        for(let i = 0; i < len; i++) {
            let c = this._higherContacts[i]

            if(c.body1 == this) {
                if(c.isHorizontal) {
                    c.body2._topEntity._leftLower = null
                    toremove.push(i)
                } else {
                    c.body2._topEntity._upLower = null
                    toremove.push(i)
                }
            } else {
                if(c.isHorizontal) {
                    c.body1._topEntity._rightLower = null
                    toremove.push(i)
                } else {
                    c.body1._topEntity._downLower = null
                    toremove.push(i)
                }
            }
        }
        _.pullAt(this._higherContacts, toremove)
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
        this._clearContacts()
    }
    set layer(val: string) {
        this._layer = this._entity._world._getLayer(val)
        this._clearContacts()
    }
    set layerGroup(val: number) {
        this._layerGroup = val
        this._clearContacts()
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
        this._clearContacts()
    }
    set height(val: number) { 
        this._height = val
        this._clearContacts()
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
        this._clearContacts()
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

const subGridThreshold = 7
const subGridSize = 12

export class Grid extends Body {

    type = BodyType.GRID

    _tileSize: number
    _gridSize: number

    _xdownLeft: number
    _ydownLeft: number
    _subGrids: SubGrid | SubGrid[][]

    _width: number
    _height: number
    
    get tileSize(): number { return this._tileSize }
    set tileSize(val: number) { console.log("[ERROR] can't set Grid.tileSize") }

    constructor(entity: Entity, args: GridArgs) {
        super(entity, args)

        this._tileSize = args.tileSize || 1
        this._gridSize = subGridSize

        // GET MIN AND MAX
        let minx, maxx, miny, maxy
        if(args.tiles != null) {
            if((args.tiles as any[]).length) {
                minx = args.tiles[0].x
                miny = args.tiles[0].y
                maxx = args.tiles[0].x
                maxy = args.tiles[0].y

                for(let tile of args.tiles as any[]) {
                    minx = Math.min(minx, tile.x)
                    miny = Math.min(miny, tile.y)
                    maxx = Math.max(maxx, tile.x)
                    maxy = Math.max(maxy, tile.y)
                }
            } else {
                let t = args.tiles as { x: number, y: number, info: { shape: number, data: any }[][] } 
                minx = t.x
                miny = t.y
                maxx = t.info.length - t.x
                maxy = t.info[0].length - t.y
            }
        } else {
            minx = -Math.floor(args.width/2)
            maxx = minx + args.width
            miny = -Math.floor(args.height/2)
            maxy = miny + args.height
        }

        // INIT EMPTY GRID
        if(maxx - minx > subGridThreshold || maxy - miny > subGridThreshold) {
            minx -= 10
            miny -= 10
            maxx += 10
            maxy += 10

            let w = Math.floor((maxx - minx) / this._gridSize), h = Math.floor((maxy - miny) / this._gridSize)

            this._subGrids = new Array(w)
            for(let i = 0; i < h; i++) {
                this._subGrids[i] = new Array(h)
            }

            this._xdownLeft = minx
            this._ydownLeft = miny
            this._width = w
            this._height = h
        } else {
            this._subGrids = new SubGrid(this._gridSize)
            this._xdownLeft = Math.floor((maxx - subGridThreshold)/2)
            this._ydownLeft = Math.floor((maxy - subGridThreshold)/2)
            this._width = 1
            this._height = 1
        }

        if(args.tiles != null) {
            if((args.tiles as any[]).length) {
                let len = (args.tiles as any[]).length
                for(let t of args.tiles as any[]) {
                    this._setTile(t.x, t.y, t.shape, t.data)
                }
            } else {
                this._setTiles((args.tiles as any).x, (args.tiles as any).y, (args.tiles as any).info)
            }
        }
    }

    getTile(x: number, y: number): { shape: number, data: any } {
        x -= this._xdownLeft
        y -= this._ydownLeft
        let subgrid: SubGrid

        if(this._subGrids instanceof SubGrid) {
            if(x >= 0 && y >= 0 && x < this._gridSize && y < this._gridSize) {
                subgrid = this._subGrids
            } else {
                return { shape: 0, data: null }
            }
        } else {
            let gridx = Math.floor(x / this._gridSize), gridy = Math.floor(y / this._gridSize)
            if(gridx >= 0 && gridy >= 0 && gridx < this._subGrids.length && gridy < this._subGrids[0].length) {
                subgrid = this._subGrids[gridx][gridy]
                x -= gridx * this._gridSize
                y -= gridy * this._gridSize
            } else {
                return { shape: 0, data: null }
            }
        }

        let list = subgrid.info[x]

        if(list != null) {
            let currentInfoInd = 0,
                topHeight = 0

            while(y >= topHeight) {
                topHeight += list[currentInfoInd].length
                currentInfoInd++
            }

            return list[currentInfoInd-1]
        } else {
            return { shape: 0, data: null }
        }
    }
    setTile(x: number, y: number, shape: number, data) {
        this._expandGrid(x - this._xdownLeft, y - this._ydownLeft, x - this._xdownLeft, y - this._ydownLeft)

        x -= this._xdownLeft
        y -= this._ydownLeft

        this._setTile(x, y, shape, data)
    }

    clearTile(x: number, y: number) {
        x -= this._xdownLeft
        y -= this._ydownLeft
        if(x >= 0 && y >= 0 && x < this._gridSize * this._width && y < this._gridSize * this._height) {
            this._setTile(x, y, 0, null)
        }
    }

    setTiles(args: TileArgs) {
        let minx, maxx, miny, maxy,
            list = (args as any).length != null
        if(list) {
            let t = args as { x: number, y: number, shape: number, data }[]
            minx = t[0].x
            miny = t[0].y
            maxx = t[0].x
            maxy = t[0].y

            for(let tile of t as any[]) {
                minx = Math.min(minx, tile.x)
                miny = Math.min(miny, tile.y)
                maxx = Math.max(maxx, tile.x)
                maxy = Math.max(maxy, tile.y)
            }
        } else {
            let t = args as { x: number, y: number, info: any[][] }
            minx = 0
            maxx = t.info.length
            miny = 0
            maxy = t.info[0].length
        }

        minx -= this._xdownLeft
        maxx -= this._xdownLeft
        miny -= this._ydownLeft
        maxy -= this._ydownLeft

        this._expandGrid(minx, maxx, miny, maxy)

        if(list) {
            for(let t of args as any[]) {
                this._setTile(t.x, t.y, t.shape, t.data)
            }
        } else {
            this._setTiles(minx, miny, (args as any).info)
        }
    }
    clearTiles(args: { x: number, y: number, width: number, height: number } | { x: number, y: number }[]) {
        if((args as any).length != null) {

        } else {
            
        }
    }
    forTiles(x: number, y: number, width: number, height: number, lambda: (x: number, y: number, shape: number, data) => { shape: number, data }) {

    }


    getTileShape(x: number, y: number): number {
        return this.getTile(x, y).shape
    }
    setTileShape(x: number, y: number, shape: number) {
        this._setTile(x, y, shape)
    }
    clearTileShape(x: number, y: number) {
        this._setTile(x, y, 0)
    }

    setTilesShape(arg: any[] | { x: number, y: number, shapes: number[][]}) {
        
    }
    clearTileShapes(args: { x: number, y: number }[] | { x: number, y: number, width: number, height: number }) {
        
    }
    forTileShapes(x: number, y: number, width: number, height: number, lambda: (x: number, y: number, shape: number) => number) {

    }

    _setTile(x: number, y: number, shape: number, data?) {
        let subgrid: SubGrid

        if(this._subGrids instanceof SubGrid) {
            subgrid = this._subGrids
        } else {
            let gridx = Math.floor(x / this._gridSize), gridy = Math.floor(y / this._gridSize)
            subgrid = this._subGrids[gridx][gridy]
            if(!subgrid != null) {
                subgrid = new SubGrid(this._gridSize)
                this._subGrids[gridx][gridy] = subgrid
            }
            x -= gridx * this._gridSize
            y -= gridy * this._gridSize
        }

        let list = subgrid.info[x]

        if(list != null) {
            let currentInfoInd = 0,
                topHeight = 0
                
            while(y >= topHeight) {
                topHeight += list[currentInfoInd].length
                currentInfoInd++
            }

            currentInfoInd--

            let current = list[currentInfoInd],
                lowHeight = topHeight - current.length

            data = _.cloneDeep(typeof data == "undefined" ? current.data : data)
            if(current.shape != shape || !_.isEqual(current.data, data)) {
                if(y == lowHeight) {
                    if(y > 0 && list[currentInfoInd - 1].shape == shape && _.isEqual(list[currentInfoInd - 1].data, data)) {
                        list[currentInfoInd - 1].length += 1
                        list[currentInfoInd].length -= 1
                    } else {
                        let newInfo = { length: 1, shape, data }
                        list.splice(currentInfoInd, 0, newInfo)
                    }
                } else if(y == topHeight - 1) {
                    if(y < this._gridSize - 1 && list[currentInfoInd + 1].shape == shape && _.isEqual(list[currentInfoInd + 1].data, data)) {
                        list[currentInfoInd + 1].length += 1
                        list[currentInfoInd].length -= 1
                    } else {
                        let newInfo = { length: 1, shape, data }
                        list.splice(currentInfoInd + 1, 0, newInfo)
                    }
                } else {
                    let newInfo = { length: 1, shape, data },
                        nextInfo = { length: current.length - 1 - y + lowHeight, shape: current.shape, data: _.cloneDeep(current.data) }

                    list.splice(currentInfoInd + 1, 0, newInfo, nextInfo)

                    current.length = y - lowHeight
                }
            }
        } else {
            if(y == 0) {
                subgrid.info[x] = [
                    { length: 1, shape, data }, 
                    { length: this._gridSize - 1, shape: 0, data: null}
                ]
            } else if(y == this._gridSize - 1) {
                subgrid.info[x] = [
                    { length: this._gridSize - 1, shape: 0, data: null},
                    { length: 1, shape, data }
                ]
            } else {
                subgrid.info[x] = [
                    { length: y, shape: 0, data: null }, 
                    { length: 1, shape, data }, 
                    { length: this._gridSize - 1 - y, shape: 0, data: null}
                ]
            }
        }
    }
    _setTiles(x: number, y: number, info: { shape: number, data}[][]) {

    }

    _expandGrid(minx: number, miny: number, maxx: number, maxy: number) {
        if(minx < 0 || miny < 0 || maxx >= this._gridSize * this._width || maxy >= this._gridSize * this._height) {
            let left = Math.max(Math.ceil(-minx / this._gridSize), 0),
                right = Math.max(Math.floor(maxx / this._gridSize) - this._width + 1, 0),
                up = Math.max(Math.floor(maxy / this._gridSize) - this._height + 1, 0),
                down = Math.max(Math.ceil(-miny / this._gridSize), 0)

            let grid, newWidth, newHeight

            if(left > 0 || right > 0 || up > 0 || down > 0) {
                if(this._subGrids instanceof SubGrid) { 
                    newWidth = left + 1 + right
                    newHeight = down + 1 + up
                    grid = new Array(newWidth)
                    for(let i = 0; i < newWidth; i++) {
                        grid[i] = new Array(newHeight)
                    }
                    grid[left][down] = this._subGrids
                } else {
                    newWidth = left + this._width + right
                    newHeight = down + this._height + up
                    grid = new Array(newWidth)
                    for(let i = 0; i < newWidth; i++) {
                        grid[i] = new Array(newHeight)
                    }
                    for(let i = 0; i < this._width; i++) {
                        for(let j = 0; j < this._height; j++) {
                            grid[i + left][j + down] = this._subGrids[i][j]
                        }
                    }
                }

                this._subGrids = grid
                this._width = newWidth
                this._height = newHeight
                this._xdownLeft -= left * this._gridSize
                this._ydownLeft -= down * this._gridSize
            }
        }
    }
}

export class SubGrid {

    info: { length: number, shape: number, data: any }[][] // stored in columns
    rows: any[][] // row -> list of horizontal lines
    columns: any[][] // line -> list of vertical lines

    constructor(size: number) {
        this.info = new Array(size)
        this.rows = new Array(size + 1)
        this.columns = new Array(size + 1)
    }
}