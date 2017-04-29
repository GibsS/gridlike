import { Entity } from './entity'
import { RelativeContact } from './contact'

interface BodyArgs {
    x?: number
    y?: number
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
    oneway?: boolean // default: no
}
export interface GridArgs extends BodyArgs {
    tiles: TileArgs
}
export type TileArgs = any[] | { x: number, y: number, info: (number | any)[][] }

export abstract class Body {

    type: number

    _entity: Entity
    get entity(): Entity {
        return this._entity
    }
    set entity(val: Entity) {
        console.log("[ERROR] can't set entity")
    }

    _enabled: boolean
    get enabled(): boolean { return this._enabled }
    set enabled(val: boolean) {
        // TODO
    }

    _x: number
    _y: number
    get x(): number {
        return this._x
    }
    get y(): number {
        return 0
    }

    get globalx(): number {
        return 0
    }
    get globaly(): number {
        return 0
    }

    get contacts(): RelativeContact[] {
        return null
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

    localToGlobal(x: number | { x: number, y: number }, y?: number) {

    }
    globalToLocal(x: number | { x: number, y: number }, y?: number) {

    }
}

export abstract class SmallBody extends Body {

    _isSensor: boolean
    _layer: number
    _layerGroup: number
    get isSensor(): boolean { return false }
    get layer(): string {
        return null
    }
    get layerGroup(): number {
        return this._layerGroup
    }

    set isSensor(val: boolean) {

    }
    set layer(val: string) {

    }
    set layerGroup(val: number) {
        
    }
}

export class Rect extends SmallBody {


    _width: number
    _height: number
    get width(): number { return this._width }
    get height(): number { return this._height }

    set width(val: number) { }
    set height(val: number) { }
}

export class Line extends SmallBody {

    _size: number
    get size(): number { return this._size }
    set size(val: number) {

    }

    _isHorizontal: boolean
    get isHorizontal(): boolean { return this._isHorizontal }
    get isVertical(): boolean { return !this._isHorizontal }
    set isHorizontal(val: boolean) { console.log("[ERROR] Can't set Line.isHorizontal")}
    set isVertical(val: boolean) { console.log("[ERROR] Can't set Line.isVertical")}

    _oneway: boolean
    get oneway(): boolean { return this._oneway }
    set oneway(val: boolean) { }
}

export class Grid extends Body {

    _minx: number
    _maxx: number
    _miny: number
    _maxy: number
    _tileSize: number

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

    _tiles: any[][]

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