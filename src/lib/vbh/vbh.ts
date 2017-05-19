import * as _ from 'lodash'

import { RaycastResult, QueryResult } from '../model/query'

import { EPS } from '../model/world'

export interface IAABB {
    minx: number
    maxx: number
    miny: number
    maxy: number

    enabled: boolean
}

export interface IMoveAABB extends IAABB {
    vx: number // global
    vy: number
}

export interface VBH<X extends IAABB> {

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

export interface MoveVBH<X extends IMoveAABB> extends VBH<X> {

    update(delta: number): X[][]
    updateSingle(element: X, dx: number, dy: number): X[][]
}

export class SimpleVBH<X extends IAABB> implements VBH<X> {

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
            if(e.enabled && !(e.minx > x + width || e.maxx < x || e.miny > y + height || e.maxy < y)) {
                res.push(e)
            }
        }
        return { bodies: res }
    }
    collideVBH(other: VBH<X>, x: number, y: number, dx: number, dy: number, otherx: number, othery: number, otherdx: number, otherdy: number): X[][] {
        let res = []

        otherx -= x
        othery -= y

        otherdx -= dx
        otherdy -= dy

        let maxxOffset = otherx + Math.max(0, otherdx)*2,
            minxOffset = otherx + Math.min(0, otherdx)*2,
            maxyOffset = othery + Math.max(0, otherdy)*2,
            minyOffset = othery + Math.min(0, otherdy)*2

        for(let a of this.elements) {
            for(let b of (other as SimpleVBH<X>).elements) {
                if(a.enabled && b.enabled && 
                !(a.minx > b.maxx + maxxOffset || a.maxx < b.minx + minxOffset 
                || a.miny > b.maxy + maxyOffset || a.maxy < b.miny + minyOffset)) {
                    res.push([a, b])
                }
            }
        }
        
        return res
    }
    collideAABB(other: X, x: number, y: number, dx: number, dy: number, otherx: number, othery: number, otherdx: number, otherdy: number): X[][] {
        let res = []

        otherx -= x
        othery -= y

        otherdx -= dx
        otherdy -= dy

        let maxxOffset = otherx + Math.max(0, otherdx)*2,
            minxOffset = otherx + Math.min(0, otherdx)*2,
            maxyOffset = othery + Math.max(0, otherdy)*2,
            minyOffset = othery + Math.min(0, otherdy)*2

        for(let a of this.elements) {
            if(a.enabled && other.enabled && 
                !(a.minx > other.maxx + maxxOffset || a.maxx < other.minx + minxOffset 
                || a.miny > other.maxy + maxyOffset || a.maxy < other.miny + minyOffset)) {
                res.push([a, other])
            }
        }
        
        return res
    }
}

export class SimpleMoveVBH<X extends IMoveAABB> extends SimpleVBH<X> implements MoveVBH<X> {

    update(delta: number): X[][] {
        let res = []

        let len = this.elements.length
        for(let i = 0; i < len; i++) {
            let a = this.elements[i]

            let minx = a.minx + Math.min(0, a.vx * delta)*2,
                maxx = a.maxx + Math.max(0, a.vx * delta)*2,
                miny = a.miny + Math.min(0, a.vy * delta)*2,
                maxy = a.maxy + Math.max(0, a.vy * delta)*2

            for(let j = i + 1; j < len; j++) {
                let b = this.elements[j]

                if(a.enabled && b.enabled && 
                !(minx > b.maxx + Math.max(0, b.vx * delta)*2 || maxx < b.minx + Math.min(0, b.vx * delta)*2
                || miny > b.maxy + Math.max(0, b.vy * delta)*2 || maxy < b.miny + + Math.min(0, b.vy * delta)*2)) {
                    res.push([a, b])
                }
            }
        }
        
        return res
    }
    updateSingle(e: X, dx: number, dy: number): X[][] {
        let res = []

        let len = this.elements.length

        let minx = e.minx + Math.min(0, dx)*2,
            maxx = e.maxx + Math.max(0, dx)*2,
            miny = e.miny + Math.min(0, dy)*2,
            maxy = e.maxy + Math.max(0, dy)*2

        for(let j = 0; j < len; j++) {
            let b = this.elements[j]

            if(b != e && e.enabled && b.enabled && 
            !(minx > b.maxx || maxx < b.minx || miny > b.maxy || maxy < b.miny)) {
                res.push([e, b])
            }
        }
        
        return res
    }
}