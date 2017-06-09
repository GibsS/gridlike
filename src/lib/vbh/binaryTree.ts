import * as _ from 'lodash'

import { VBH, MoveVBH, IMoveAABB, SimpleMoveVBH } from './vbh'
import { QueryResult } from '../model/query'

type AABB = { minX: number, maxX: number, minY: number, maxY: number }

let tmpAABB = { minX: 0, minY: 0, maxX: 0, maxY: 0 }

export class BinaryTree<X extends IMoveAABB> implements MoveVBH<X> {

    _otherVBH: MoveVBH<X>

    _data: Node<X>

    constructor() {
        this._otherVBH = new SimpleMoveVBH<X>()
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
        let node = this._data

        if (node && node.maxX >= x && node.maxY >= y && node.minX <= x + width && node.minY <= y + height) {
            let search: Node<X>[] = [], result: X[] = []

            while (node) {
                if (node.element) {
                    result.push(node.element)
                } else {
                    if (node.left.minX <= x + width && node.left.maxX >= x && node.left.minY <= y + height && node.left.maxY >= y) {
                        search.push(node.left)
                    }

                    if (node.right.minX <= x + width && node.right.maxX >= x && node.right.minY <= y + height && node.right.maxY >= y) {
                        search.push(node.right)
                    }
                }
                node = search.pop()
            }

            return { bodies: result }
        } else {
            return { bodies: [] }
        }
    }

    collideVBH(other: VBH<X>, x: number, y: number, dx: number, dy: number, otherx: number, othery: number, otherdx: number, otherdy: number): X[][] {
        console.log("[collideVBH] not implemented")
        return null
    }
    collideAABB(other: X, x: number, y: number, dx: number, dy: number, otherx: number, othery: number, otherdx: number, otherdy: number): X[][] {
        console.log("[collideAABB] not implemented")
        return null
    }

    update(): X[][] {
        this._otherVBH.forAll(e => this._move(e, e.moveMinX, e.moveMaxX, e.moveMinY, e.moveMaxY))

        let set: Node<X>[] = [],
            node = this._data,
            res: X[][] = []

        if (!node.element) {
            while (node) {
                let pairs: Node<X>[][] = [],
                    pair = [node.left, node.right]

                while(pair) {
                    let f = pair[0], s = pair[1]

                    if (f.minX <= s.maxX && f.maxX >= s.minX && f.minY <= s.maxY && f.maxY >= s.minY) {
                        if (f.element) {
                            if (s.element) {
                                res.push([s.element, f.element])
                            } else {
                                pairs.push([s.left, f], [s.right, f])
                            }
                        } else {
                            if (s.element) {
                                pairs.push([f.left, s], [f.right, s])
                            } else {
                                pairs.push([f.left, s.left], [f.left, s.right], [f.right, s.left], [f.right, s.right])
                            }
                        }
                    }

                    pair = pairs.pop()
                }
                if (!node.left.element) set.push(node.left)
                if (!node.right.element) set.push(node.right)
                node = set.pop()
            }
        }

        return res
    }
    updateSingle(element: X): X[][] {
        console.log("[updateSingle] not implemented")
        return null
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

        if (!node) {
            this._data = createLeafNode<X>(null, e)
        } else {
            this._insertInNode(node, e, aabb)
        }
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
            let ifrightintersect = intersectionArea(node.left, calcBoundAABB(node.right, aabb)),
                ifleftintersect = intersectionArea(node.right, calcBoundAABB(node.left, aabb))
            
            if (ifrightintersect > ifleftintersect) {
                node = node.left
            } else {
                node = node.right
            }
        }

        node.right = createLeafNode<X>(node, node.element)
        node.left = createLeafNode<X>(node, e)
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

                node.parent.minX = Infinity
                node.parent.minY = Infinity
                node.parent.maxX = -Infinity
                node.parent.maxY = -Infinity
                extend(node.parent, node.parent.left)
                extend(node.parent, node.parent.right)
            } else {
                this._remove(e)
                
                tmpAABB.minX = minX
                tmpAABB.maxX = maxX
                tmpAABB.minY = minY
                tmpAABB.maxY = maxY
                
                this._insert(e, tmpAABB)
                // node = node.parent
                // while (node && !(node.minX <= minX && node.maxX >= maxX && node.minY <= minY && node.maxY >= maxY)) {
                //     node = node.parent
                // }

                // if(node) {
                //     this._insertInNode(node, e, tmpAABB)
                // } else {
                //     this._insert(e, tmpAABB)
                // }
            }
        }
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
function createNode<X extends IMoveAABB>(parent: Node<X>, left: Node<X>, right: Node<X>): Node<X> {
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
function createLeafNode<X extends IMoveAABB>(parent: Node<X>, e: X): Node<X> {
    let node = {
        parent,
        left: null,
        right: null,
        element: e,

        height: 0,
        minX: e.minX,
        maxX: e.maxX,
        minY: e.minY,
        maxY: e.maxY
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