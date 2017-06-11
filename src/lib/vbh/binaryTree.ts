import * as _ from 'lodash'

import { VBH, MoveVBH, AABB, EnabledAABB, MoveAABB, SimpleVBH, SimpleMoveVBH } from './vbh'
import { QueryResult } from '../model/query'

let tmpAABB: AABB = { minX: 0, minY: 0, maxX: 0, maxY: 0 }

export class BinaryTree<X extends EnabledAABB> implements VBH<X> {

    _otherVBH: VBH<X>

    _data: Node<X>

    constructor() {
        this._otherVBH = new SimpleVBH<X>()
    }
    all(): X[] { return this._otherVBH.all() }
    forAll(lambda: (b: X) => void) { this._otherVBH.forAll(lambda) }

    // MODIFICATION
    insert(e: X) {
        this._otherVBH.insert(e)
        this._insert(e)
    }
    bulkInsert(es: X[]) {
        es.forEach(e => this.insert(e))
    }
    remove(e: X) {
        this._otherVBH.remove(e)
        this._remove(e)
    }

    // QUERY
    queryRect(x: number, y: number, width: number, height: number): QueryResult<X> {
        return { bodies: this._queryRect(x, x + width, y, y + height) }
    }

    collideVBH(other: VBH<X>, x: number, y: number, dx: number, dy: number, otherx: number, othery: number, otherdx: number, otherdy: number): X[][] {
        if (other instanceof SimpleVBH) {
            return this._collideWithSimpleVBH(other, x, y, dx, dy, otherx, othery, otherdx, otherdy)
        } else {
            return this._collideWithBinaryTree(other as BinaryTree<X>, x, y, dx, dy, otherx, othery, otherdx, otherdy)
        }
    }
    collideAABB(o: X, x: number, y: number, dx: number, dy: number, otherx: number, othery: number, otherdx: number, otherdy: number): X[][] {
        let result = []

        otherx -= x
        othery -= y

        otherdx -= dx
        otherdy -= dy

        let maxxOffset = o.maxX + otherx + Math.max(0, otherdx) * 2,
            minxOffset = o.minX + otherx + Math.min(0, otherdx) * 2,
            maxyOffset = o.maxY + othery + Math.max(0, otherdy) * 2,
            minyOffset = o.minY + othery + Math.min(0, otherdy) * 2
        
        result.push.apply(result, this._queryRectCollisions(o, o.minX + minxOffset, o.maxX + maxxOffset, o.minY + minyOffset, o.maxY + maxyOffset))

        return result
    }

    _queryRect(minX: number, maxX: number, minY: number, maxY: number): X[] {
        let node = this._data

        if (node && node.maxX >= minX && node.maxY >= minY && node.minX <= maxX && node.minY <= maxY) {
            let search: Node<X>[] = [], result: X[] = []

            while (node) {
                if (node.element) {
                    result.push(node.element)
                } else {
                    if (node.left.minX <= maxX && node.left.maxX >= minX && node.left.minY <= maxY && node.left.maxY >= minY) {
                        search.push(node.left)
                    }

                    if (node.right.minX <= maxX && node.right.maxX >= minX && node.right.minY <= maxY && node.right.maxY >= minY) {
                        search.push(node.right)
                    }
                }
                node = search.pop()
            }

            return result
        } else {
            return []
        }
    }
    _queryRectCollisions(other: X, minX: number, maxX: number, minY: number, maxY: number): X[][] {
        let node = this._data

        if (node && node.maxX >= minX && node.maxY >= minY && node.minX <= maxX && node.minY <= maxY) {
            let search: Node<X>[] = [], result: X[][] = []

            while (node) {
                if (node.element) {
                    result.push([other, node.element])
                } else {
                    if (node.left.minX <= maxX && node.left.maxX >= minX && node.left.minY <= maxY && node.left.maxY >= minY) {
                        search.push(node.left)
                    }

                    if (node.right.minX <= maxX && node.right.maxX >= minX && node.right.minY <= maxY && node.right.maxY >= minY) {
                        search.push(node.right)
                    }
                }
                node = search.pop()
            }

            return result
        } else {
            return []
        }
    }

    _collideWithSimpleVBH(other: SimpleVBH<X>, x: number, y: number, dx: number, dy: number, otherx: number, othery: number, otherdx: number, otherdy: number): X[][] {
        let result = []

        otherx -= x
        othery -= y

        otherdx -= dx
        otherdy -= dy

        let maxxOffset = otherx + Math.max(0, otherdx) * 2,
            minxOffset = otherx + Math.min(0, otherdx) * 2,
            maxyOffset = othery + Math.max(0, otherdy) * 2,
            minyOffset = othery + Math.min(0, otherdy) * 2

        other.forAll(o => result.push.apply(result, this._queryRectCollisions(o, o.minX + minxOffset, o.maxX + maxxOffset, o.minY + minyOffset, o.maxY + maxyOffset)))

        return result
    }
    _collideWithBinaryTree(other: BinaryTree<X>, x: number, y: number, dx: number, dy: number, otherx: number, othery: number, otherdx: number, otherdy: number): X[][] {
        if (this._data && other._data) {
            let result = []

            otherx -= x
            othery -= y

            otherdx -= dx
            otherdy -= dy

            let maxxOffset = otherx + Math.max(0, otherdx) * 2,
                minxOffset = otherx + Math.min(0, otherdx) * 2,
                maxyOffset = othery + Math.max(0, otherdy) * 2,
                minyOffset = othery + Math.min(0, otherdy) * 2

            this._findMovePair(this._data, other._data, maxxOffset, maxyOffset, minxOffset, minyOffset, result)

            return result
        } else {
            return []
        }
    }

    _findMovePair(f: Node<X>, s: Node<X>, maxxOffset: number, maxyOffset: number, minxOffset: number, minyOffset: number, result: X[][]) {
        if (f.minX <= s.maxX + maxxOffset && f.maxX >= s.minX + minxOffset && f.minY <= s.maxY + maxyOffset && f.maxY >= s.minY + minyOffset) {
            if (f.element) {
                if (s.element) {
                    result.push([s.element, f.element])
                } else {
                    this._findMovePair(f, s.left, maxxOffset, maxyOffset, minxOffset, minyOffset, result)
                    this._findMovePair(f, s.right, maxxOffset, maxyOffset, minxOffset, minyOffset, result)
                }
            } else {
                if (s.element) {
                    this._findMovePair(f.left, s, maxxOffset, maxyOffset, minxOffset, minyOffset, result)
                    this._findMovePair(f.right, s, maxxOffset, maxyOffset, minxOffset, minyOffset, result)
                } else {
                    this._findMovePair(f.left, s.left, maxxOffset, maxyOffset, minxOffset, minyOffset, result)
                    this._findMovePair(f.left, s.right, maxxOffset, maxyOffset, minxOffset, minyOffset, result)
                    this._findMovePair(f.right, s.left, maxxOffset, maxyOffset, minxOffset, minyOffset, result)
                    this._findMovePair(f.right, s.right, maxxOffset, maxyOffset, minxOffset, minyOffset, result)
                }
            }
        }
    }

    _allInNode(node: Node<X>): X[] {
        let search: Node<X>[] = [], res: X[] = []

        while(node) {
            if (node.element) {
                res.push(node.element)
            } else {
                search.push(node.left, node.right)
            }
            node = search.pop()
        }

        return res
    }

    _insert(e: X, aabb?: AABB) {
        let node = this._data as Node<X>

        if (node) this._insertInNode(node, e, aabb)
        else this._data = createLeafNode<X>(null, e, e)
    }
    _insertInNode(node: Node<X>, e: X, aabb?: AABB) {
        if (!aabb) { 
            aabb = tmpAABB 
            tmpAABB.minX = e.minX
            tmpAABB.maxX = e.maxX
            tmpAABB.minY = e.minY
            tmpAABB.maxY = e.maxY
        }
        while(!node.element) {
            if (intersectionArea(node.left, calcBoundAABB(node.right, aabb)) > intersectionArea(node.right, calcBoundAABB(node.left, aabb))) {
                node = node.left
            } else {
                node = node.right
            }
        }

        node.right = createLeafNode<X>(node, node.element, node)
        node.left = createLeafNode<X>(node, e, aabb)
        node.element = null
        
        while(node) {
            node.height++
            extend(node, aabb)
            aabb.minX -= 0.1
            aabb.minY -= 0.1
            aabb.maxX += 0.1
            aabb.maxY += 0.1
            node = node.parent
        }
    }
    _remove(e: X) {
        let leaf = (e as any).parentNode as Node<X>

        if (!leaf.parent) {
            this._data = null
        } else {
            let parent = leaf.parent,
                parentParent = parent.parent

            if (parentParent) {
                if (leaf == parent.left) {
                    let parentParent = parent.parent

                    if (parentParent.left == parent) {
                        parentParent.left = parent.right
                    } else {
                        parentParent.right = parent.right
                    }
                    parent.right.parent = parentParent
                } else {
                    let parentParent = parent.parent

                    if (parentParent.left == parent) {
                        parentParent.left = parent.left
                    } else {
                        parentParent.right = parent.left
                    }
                    parent.left.parent = parentParent
                }
            } else {
                if (leaf == parent.left) {
                    this._data = parent.right
                } else {
                    this._data = parent.left
                }
                this._data.parent = null
            }
        }
    }
    _move(e: X, minX: number, maxX: number, minY: number, maxY: number) {
        let node = (e as any).parentNode

        if (node.parent) {
            if (node.parent.minX <= minX && node.parent.maxX >= maxX && node.parent.minY <= minY && node.parent.maxY >= maxY) {
                node.minX = minX
                node.maxX = maxX
                node.minY = minY
                node.maxY = maxY

                node.parent.minX = node.parent.left.minX
                node.parent.minY = node.parent.left.minY
                node.parent.maxX = node.parent.left.maxX
                node.parent.maxY = node.parent.left.maxY
                extend(node.parent, node.parent.right)
            } else {
                tmpAABB.minX = minX
                tmpAABB.maxX = maxX
                tmpAABB.minY = minY
                tmpAABB.maxY = maxY

                this._remove(e)
                this._insert(e, tmpAABB)
            }
        }
    }
}
let updateCount: number = 0
let moveTime: number
let searchTime: number

export class MoveBinaryTree<X extends MoveAABB> extends BinaryTree<X> implements MoveVBH<X> {

    update(): X[][] {
        updateCount++
        if (updateCount % 240 == 0) { console.log("moveTime:", moveTime, "searchTime:", searchTime) }
        let t0 = typeof window !== "undefined" && performance.now()
        this._otherVBH.forAll(e => this._move(e, e.moveMinX, e.moveMaxX, e.moveMinY, e.moveMaxY))
        let t1 = typeof window !== "undefined" && performance.now()

        let set: Node<X>[] = [],
            node = this._data,
            res: X[][] = []

        if (!node.element) {
            while (node) {
                this._findPairs(node.left, node.right, res)
                if (!node.left.element) set.push(node.left)
                if (!node.right.element) set.push(node.right)
                node = set.pop()
            }
        }

        moveTime = t1 - t0
        searchTime = typeof window !== "undefined" && performance.now() - t1

        return res
    }
    _findPairs(f: Node<X>, s: Node<X>, result: X[][]) {
        if (f.minX <= s.maxX && f.maxX >= s.minX && f.minY <= s.maxY && f.maxY >= s.minY) {
            if (f.element) {
                if (s.element) {
                    result.push([s.element, f.element])
                } else {
                    this._findPairs(s.left, f, result)
                    this._findPairs(s.right, f, result)
                }
            } else {
                if (s.element) {
                    this._findPairs(f.left, s, result)
                    this._findPairs(f.right, s, result)
                } else {
                    this._findPairs(f.left, s.left, result)
                    this._findPairs(f.left, s.right, result)
                    this._findPairs(f.right, s.left, result)
                    this._findPairs(f.right, s.right, result)
                }
            }
        }
    }
    updateSingle(e: X): X[][] {
        this._move(e, e.moveMinX, e.moveMaxX, e.moveMinY, e.moveMaxY)

        let search: Node<X>[] = [], result: X[][] = [], node = this._data

        while (node) {
            if (node.element && node.element != e) {
                result.push([e, node.element])
            } else {
                if (node.left.minX <= e.moveMaxX && node.left.maxX >= e.moveMinX && node.left.minY <= e.moveMaxY && node.left.maxY >= e.moveMinY) {
                    search.push(node.left)
                }

                if (node.right.minX <= e.moveMaxX && node.right.maxX >= e.moveMinX && node.right.minY <= e.moveMaxY && node.right.maxY >= e.moveMinY) {
                    search.push(node.right)
                }
            }
            node = search.pop()
        }

        return result
    }
}

interface Node<X> {
    parent: Node<X>
    left: Node<X>
    right: Node<X>
    element: X

    height: number
    
    minX: number
    maxX: number
    minY: number
    maxY: number
}
function createNode<X extends EnabledAABB>(parent: Node<X>, left: Node<X>, right: Node<X>): Node<X> {
    return {
        parent,
        left, right, element: null,

        height: Math.max(left.height, right.height) + 1,

        minX: Math.min(left.minX, right.minX),
        maxX: Math.max(left.maxX, right.maxX),
        minY: Math.min(left.minY, right.minY),
        maxY: Math.max(left.maxY, right.maxY)
    }
}
function createLeafNode<X extends EnabledAABB>(parent: Node<X>, e: X, aabb: AABB): Node<X> {
    let node = {
        parent,
        left: null,
        right: null,
        element: e,

        height: 0,
        minX: aabb.minX,
        maxX: aabb.maxX,
        minY: aabb.minY,
        maxY: aabb.maxY
    }

    ;(e as any).parentNode = node

    return node
}

function intersectionArea(a: AABB, b: AABB) {
    var minX = Math.max(a.minX, b.minX),
        minY = Math.max(a.minY, b.minY),
        maxX = Math.min(a.maxX, b.maxX),
        maxY = Math.min(a.maxY, b.maxY);

    return Math.max(0, maxX - minX) * Math.max(0, maxY - minY)
}
function extend(a: AABB, b: AABB) {
    a.minX = Math.min(a.minX, b.minX)
    a.minY = Math.min(a.minY, b.minY)
    a.maxX = Math.max(a.maxX, b.maxX)
    a.maxY = Math.max(a.maxY, b.maxY)
}
function calcBoundAABB(a: AABB, b: AABB): AABB {
    let d = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }

    extend(d, a)
    extend(d, b)

    return d
}
function contains(container: AABB, containee: AABB): boolean {
    return container.minX <= containee.minX && container.maxX >= containee.maxX && container.minY <= containee.minY && container.maxY >= containee.maxY
}