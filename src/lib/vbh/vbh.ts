import * as _ from 'lodash'

import { RaycastResult, QueryResult } from '../model/query'
import { BinaryTree } from './binaryTree'

import { EPS } from '../model/world'

export interface AABB { 
    minX: number
    maxX: number
    minY: number
    maxY: number 
}

export interface EnabledAABB {
    minX: number
    maxX: number
    minY: number
    maxY: number

    enabled: boolean
}

export interface MoveAABB extends EnabledAABB {
    moveMinX: number
    moveMaxX: number
    moveMinY: number
    moveMaxY: number
}

export interface VBH<X extends EnabledAABB> {

    // ACCESS
    all(): X[]
    forAll(lambda: (b: X) => void)

    // MODIFICATION
    insert(element: X)
    bulkInsert(elements: X[])
    remove(element: X)

    // QUERY
    queryRect(x: number, y: number, width: number, height: number): QueryResult<X>

    collideVBH(other: VBH<X>, x: number, y: number, dx: number, dy: number, otherx: number, othery: number, otherdx: number, otherdy: number): X[][]
    collideAABB(other: X, x: number, y: number, dx: number, dy: number, otherx: number, othery: number, otherdx: number, otherdy: number): X[][]
}

export interface MoveVBH<X extends MoveAABB> extends VBH<X> {

    update(): X[][]
    updateSingle(element: X): X[][]
}

export class SimpleVBH<X extends EnabledAABB> implements VBH<X> {

    elements: X[]

    constructor() {
        this.elements = []
    }

    all(): X[] {
        return _.clone(this.elements)
    }
    forAll(lambda: (x: X) => void) {
        this.elements.forEach(x => lambda(x))
    }

    insert(element: X) {
        this.elements.push(element)
    }
    bulkInsert(elements: X[]) {
        this.elements.push.apply(this.elements, elements)
    }
    remove(element: X) {
        let i = this.elements.indexOf(element)
        if(i >= 0) {
            this.elements.splice(i, 1)
        }
    }

    queryRect(x: number, y: number, width: number, height: number): QueryResult<X> {
        let res = []

        for(let e of this.elements) {
            if(e.enabled && !(e.minX > x + width || e.maxX < x || e.minY > y + height || e.maxY < y - height)) {
                res.push(e)
            }
        }
        return { bodies: res }
    }
    collideVBH(other: VBH<X>, x: number, y: number, dx: number, dy: number, otherx: number, othery: number, otherdx: number, otherdy: number): X[][] {
        if (other instanceof SimpleVBH) {
            return this._collideWithSimpleVBH(other, x, y, dx, dy, otherx, othery, otherdx, otherdy)
        } else {
            return (other as BinaryTree<X>)._collideWithSimpleVBH(this, otherx, othery, otherdx, otherdy, x, y, dx, dy)
        }
    }
    collideAABB(other: X, x: number, y: number, dx: number, dy: number, otherx: number, othery: number, otherdx: number, otherdy: number): X[][] {
        let res = []

        otherx -= x
        othery -= y

        otherdx -= dx
        otherdy -= dy

        let maxxOffset = other.maxX + otherx + Math.max(0, otherdx)*2,
            minxOffset = other.minX + otherx + Math.min(0, otherdx)*2,
            maxyOffset = other.maxY + othery + Math.max(0, otherdy)*2,
            minyOffset = other.minY + othery + Math.min(0, otherdy)*2

        for(let a of this.elements) {
            if(a.enabled && a.minX <= maxxOffset && a.maxX >= minxOffset && a.minY <= maxyOffset && a.maxY >= minyOffset) {
                res.push([a, other])
            }
        }

        return res
    }

    _collideWithSimpleVBH(other: SimpleVBH<X>, x: number, y: number, dx: number, dy: number, otherx: number, othery: number, otherdx: number, otherdy: number): X[][] {
        let res = []

        otherx -= x
        othery -= y

        otherdx -= dx
        otherdy -= dy

        let maxxOffset = otherx + Math.max(0, otherdx) * 2,
            minxOffset = otherx + Math.min(0, otherdx) * 2,
            maxyOffset = othery + Math.max(0, otherdy) * 2,
            minyOffset = othery + Math.min(0, otherdy) * 2

        for (let a of this.elements) {
            if (a.enabled) {
                for (let b of (other as SimpleVBH<X>).elements) {
                    if (b.enabled && a.minX <= b.maxX + maxxOffset && b.minX + minxOffset <= a.maxX && a.minY <= b.maxY + maxyOffset && b.minY + minyOffset <= a.maxY) {
                        res.push([a, b])
                    }
                }
            }
        }
        
        return res
    }
}

export class SimpleMoveVBH<X extends MoveAABB> extends SimpleVBH<X> implements MoveVBH<X> {

    update(): X[][] {
        let res = []

        let len = this.elements.length
        for(let i = 0; i < len; i++) {
            let a = this.elements[i]
            if (a.enabled) {
                for(let j = i + 1; j < len; j++) {
                    let b = this.elements[j]

                    if(b.enabled && a.moveMinX <= b.moveMaxX && a.moveMinY <= b.moveMaxY && a.moveMaxX >= b.moveMinX && a.moveMaxY >= b.moveMinY) {
                        res.push([a, b])
                    }
                }
            }
        }
        
        return res
    }
    updateSingle(e: X): X[][] {
        let res = []

        if (e.enabled) {
            for(let j = 0, len = this.elements.length; j < len; j++) {
                let b = this.elements[j]

                if (b != e && e.enabled && b.enabled && e.moveMinX <= b.maxX && b.minX <= e.moveMaxX && b.minY <= e.moveMaxY && e.moveMinY <= b.maxY) {
                    res.push([e, b])
                }
            }
        }
        
        return res
    }
}