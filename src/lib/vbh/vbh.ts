import * as _ from 'lodash'

import { RaycastResult, QueryResult } from '../model/query'

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
    raycast(x: number, y: number, dx, number, dy: number): RaycastResult
    queryRect(x: number, y: number, width: number, height: number): QueryResult

    collideVBH(other: VBH<X>, x: number, y: number, dx: number, dy: number, otherx: number, othery: number, otherdx: number, otherdy: number): X[][]
    collideAABB(other: X, x: number, y: number, dx: number, dy: number, otherx: number, othery: number, otherdx: number, otherdy: number): X[][]
}

export interface MoveVBH<X extends IMoveAABB> {

    update(delta: number): X[][]
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

    update(): X[][] {
        return null
    }

    raycast(x: number, y: number, dx, number, dy: number): RaycastResult {
        // TODO
        return null
    }
    queryRect(x: number, y: number, width: number, height: number): QueryResult {
        // TODO
        return null
    }
    collideVBH(other: VBH<X>, x: number, y: number, dx: number, dy: number, otherx: number, othery: number, otherdx: number, otherdy: number): X[][] {
        return null
    }
    collideAABB(other: X, x: number, y: number, dx: number, dy: number, otherx: number, othery: number, otherdx: number, otherdy: number): X[][] {
        return null
    }
}

export class SimpleMoveVBH<X extends IMoveAABB> implements MoveVBH<X> {

    update(delta: number): X[][] {
        return null
    }
}