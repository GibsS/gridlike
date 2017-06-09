import * as quickselect from 'quickselect'
import * as _ from 'lodash'

import { VBH, MoveVBH, IMoveAABB, SimpleMoveVBH } from './vbh'
import { QueryResult, RaycastResult } from '../model/query'

/* TAKEN FROM THE "RBUSH" LIBRARY */

type AABB = { minX: number, maxX: number, minY: number, maxY: number }

interface Node<X> {
    children: (Node<X> | X)[]
    height: number
    leaf: boolean
    minX: number
    maxX: number
    minY: number
    maxY: number
}

function createNode<X>(children): Node<X> {
    return {
        children: children,
        height: 1,
        leaf: true,
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity
    };
}

export class RBush<X extends IMoveAABB> implements MoveVBH<X> {

    other: SimpleMoveVBH<X>
    data: Node<X>

    _maxEntries: number
    _minEntries: number

    compareMinX = compareNodeMinX
    compareMinY = compareNodeMinY

    constructor(maxEntries) {
        this.other = new SimpleMoveVBH<X>()
        // max entries in a node is 9 by default; min node fill is 40% for best performance
        this._maxEntries = Math.max(4, maxEntries || 9)
        this._minEntries = Math.max(2, Math.ceil(this._maxEntries * 0.4))

        this.data = createNode<X>([])
    }

    all(): X[] {
        return this.other.all()
    }
    forAll(lambda: (x: X) => void) {
        this.other.forAll(lambda)
    }
    queryRect(x: number, y: number, width: number, height: number): QueryResult<X> {
        return this._search({ minX: x - width/2, maxX: x + width/2, minY: y - height/2, maxY: y + height/2 })
    }
    _all (node: Node<X>, result: X[]) {
        var nodesToSearch = [];
        while (node) {
            if (node.leaf) result.push.apply(result, node.children);
            else nodesToSearch.push.apply(nodesToSearch, node.children);

            node = nodesToSearch.pop();
        }
        return result;
    }
    _search(bbox: AABB): QueryResult<X> {
        var node = this.data,
            result: X[] = []

        if (!intersects(bbox, node)) return { bodies: result }

        var nodesToSearch: Node<X>[] = [], i: number, len: number, child: Node<X> | X

        while (node) {
            for (i = 0, len = node.children.length; i < len; i++) {
                child = node.children[i] as X

                if (intersects(bbox, child)) {
                    if (node.leaf) result.push(child as X)
                    else if (contains(bbox, child)) this._all(child as any, result)
                    else nodesToSearch.push(child as any)
                }
            }
            node = nodesToSearch.pop()
        }

        return { bodies: result }
    }

    insert(item: X) {
        this.other.insert(item)
        this._insert(item, this.data.height - 1)
    }
    bulkInsert(items: X[]) {
        items.forEach(i => this.insert(i))
    }

    updateSingle(item: X): X[][] {
        let parent = (item as any).parentNode,
            result = [],
            moveAABB = { minX: item.moveMinX, maxX: item.moveMaxX, minY: item.moveMinY, maxY: item.moveMaxY }

        if (item.moveMinX < parent.minX || item.moveMaxX > parent.maxX || item.moveMinY < parent.minY || item.moveMaxY > parent.maxY) {
            this._remove(item)
            this._insert(item, this.data.height - 1, moveAABB)
        }
        
        this._search(moveAABB).bodies.forEach(e => {
            if (e != item) { result.push(e) }
        })

        return result
    }
    update(): X[][] {
        // let changes = 0
        // this.other.forAll(e => {
        //     let parent = (e as any).parentNode

        //     if (e.moveMinX < parent.minX || e.moveMaxX > parent.maxX || e.moveMinY < parent.minY || e.moveMaxY > parent.maxY) {
        //         changes ++
        //         this._remove(e)
        //         this._insert(e, this.data.height - 1, { minX: e.moveMinX, maxX: e.moveMaxX, minY: e.moveMinY, maxY: e.moveMaxY })
        //     }
        // })

        let t0 = performance.now()

        let result: X[][] = [],
            set = [],
            node = this.data

        let subtreeCollision = 0

        while (node) {
            if (node.leaf) {
                for (let i = 0, len = node.children.length; i < len; i++) {
                    let a = node.children[i] as X

                    if (a.enabled) {
                        for (let j = 0; j < i; j++) {
                            let b = node.children[j] as X

                            if (b.enabled && a.moveMinX <= b.moveMaxX && b.moveMinX <= a.moveMaxX && a.moveMinY <= b.moveMaxY && b.moveMinY <= a.moveMaxY) {
                                result.push([a, b])
                            }
                        }
                    }
                }
            } else {
                for (let i = 0, len = node.children.length; i < len; i++) {
                    let a = node.children[i] as Node<X>

                    for (let j = 0; j < len; j++) {
                        let b = node.children[j] as Node<X>

                        if (a.minX <= b.maxX && b.minX <= a.maxX && a.minY <= b.maxY && b.minY <= a.maxY) {
                            subtreeCollision++
                            let pairs = [],
                                pair = [a, b]

                            while (pair) {
                                let first = pair[0] as Node<X>, second = pair[1] as Node<X>
                                if (first.leaf) {
                                    if (second.leaf) {
                                        for (let i = 0, len1 = first.children.length; i < len1; i++) {
                                            let a = first.children[i] as X

                                            if (a.enabled) {
                                                for (let j = 0, len2 = second.children.length; j < len2; j++) {
                                                    let b = second.children[j] as X

                                                    if (b.enabled && a.moveMinX <= b.moveMaxX && b.moveMinX <= a.moveMaxX 
                                                                && a.moveMinY <= b.moveMaxY && b.moveMinY <= a.moveMaxY) {
                                                        result.push([a, b])
                                                    }
                                                }
                                            }
                                        }
                                    } else {
                                        for (let i = 0, len1 = second.children.length; i < len1; i++) {
                                            let b = second.children[i] as Node<X>

                                            if (first.minX <= b.maxX && b.minX <= first.maxX && first.minY <= b.maxY && b.minY <= first.maxY) {
                                                pairs.push([first, b])
                                            }
                                        }
                                    }
                                } else {
                                    if (second.leaf) {
                                        for (let i = 0, len1 = first.children.length; i < len1; i++) {
                                            let a = first.children[i] as Node<X>

                                            if (a.minX <= second.maxX && second.minX <= a.maxX && a.minY <= second.maxY && second.minY <= a.maxY) {
                                                pairs.push([a, second])
                                            }
                                        }
                                    } else {
                                        for (let i = 0, len1 = first.children.length; i < len1; i++) {
                                            let a = first.children[i] as Node<X>

                                            for (let j = 0, len2 = second.children.length; j < len2; j++) {
                                                let b = second.children[j] as Node<X>

                                                if (a.minX <= b.maxX && b.minX <= a.maxX && a.minY <= b.maxY && b.minY <= a.maxY) {
                                                    pairs.push([a, b])
                                                }
                                            }
                                        }
                                    }
                                }

                                pair = pairs.pop()
                            }
                        }
                    }
                }
                set.push.apply(set, node.children)
            }
            node = set.pop()
        }

        console.log("collisions:", subtreeCollision)

        return result
    }

    _update(node: Node<X>, result: X[][]) {
    }

    collideVBH(other: VBH<X>, x: number, y: number, dx: number, dy: number, otherx: number, othery: number, otherdx: number, otherdy: number): X[][] {
        let res: X[][] = []
        
        let pairs = [], pair = [this.data, (other as RBush<X>).data], result = []

        otherdx -= dx
        otherdy -= dy

        otherx -= x
        othery -= y

        let minxOffset = otherx + Math.min(0, otherdx) * 2,
            maxxOffset = otherx + Math.max(0, otherdx) * 2,
            minyOffset = othery + Math.min(0, otherdy) * 2,
            maxyOffset = othery + Math.max(0, otherdy) * 2

        while (pair) {
            if ((pair[0] as Node<X>).leaf) {
                if ((pair[1] as Node<X>).leaf) {
                    for (let i = 0, len1 = pair[0].children.length; i < len1; i++) {
                        let a = pair[0].children[i] as X

                        if (a.enabled) {
                            for (let j = 0, len2 = pair[1].children.length; j < len2; j++) {
                                let b = pair[1].children[j] as X

                                if (b.enabled && a.minX <= b.maxX + maxxOffset && b.minX + minxOffset <= a.maxX 
                                    && a.minY <= b.maxY + maxyOffset && b.minY + minyOffset <= a.maxY) {
                                    result.push([a, b])
                                }
                            }
                        }
                    }
                } else {
                    let a = pair[0] as Node<X>

                    for (let i = 0, len1 = pair[1].children.length; i < len1; i++) {
                        let b = pair[1].children[i] as Node<X>

                        if (a.minX <= b.maxX + maxxOffset && b.minX + minxOffset <= a.maxX 
                            && a.minY <= b.maxY + maxyOffset && b.minY + minyOffset <= a.maxY) {
                            pairs.push([a, b])
                        }
                    }
                }
            } else {
                if ((pair[1] as Node<X>).leaf) {
                    let b = pair[1] as Node<X>

                    for (let i = 0, len1 = pair[0].children.length; i < len1; i++) {
                        let a = pair[0].children[i] as Node<X>

                        if (a.minX <= b.maxX + maxxOffset && b.minX + minxOffset <= a.maxX 
                            && a.minY <= b.maxY + maxyOffset && b.minY + minyOffset <= a.maxY) {
                            pairs.push([a, b])
                        }
                    }
                } else {
                    for (let i = 0, len1 = pair[0].children.length; i < len1; i++) {
                        let a = pair[0].children[i] as Node<X>

                        for (let j = 0, len2 = pair[1].children.length; j < len2; j++) {
                            let b = pair[1].children[j] as Node<X>

                            if (a.minX <= b.maxX + maxxOffset && b.minX + minxOffset <= a.maxX 
                                && a.minY <= b.maxY + maxyOffset && b.minY + minyOffset <= a.maxY) {
                                pairs.push([a, b])
                            }
                        }
                    }
                }
            }
            pair = pairs.pop()
        }
        return result
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

        let node = this.data,
            search = []

        while(node) {
            if (node.leaf) {
                for(let i = 0, len = node.children.length; i < len; i++) {
                    let e = node.children[i]

                    if (e != other && e.minX <= maxxOffset && minxOffset <= e.maxX && e.minY <= maxyOffset && minyOffset <= e.maxY) {
                        res.push([other, e])
                    }
                }
            } else {
                if (node.minX <= maxxOffset && minxOffset <= node.maxX && node.minY <= maxyOffset && minyOffset <= node.maxY) {
                    search.push.apply(search, node.children)
                }
            }

            node = search.pop()
        }
        return res
    }
    remove(item) {
        this.other.remove(item)
        this._remove(item)
    }

    _remove(item) {
        var node = this.data,
            path = [],
            indexes = [],
            i, parent, index, goingUp

        // depth-first iterative tree traversal
        while (node || path.length) {
            if (!node) { // go up
                node = path.pop()
                parent = path[path.length - 1]
                i = indexes.pop()
                goingUp = true
            }

            if (node.leaf) { // check current node
                index = node.children.indexOf(item)

                if (index !== -1) {
                    // item found, remove the item and condense tree upwards
                    node.children.splice(index, 1)
                    path.push(node)
                    this._condense(path)
                    return
                }
            }

            if (!goingUp && !node.leaf && contains(node, item)) { // go down
                path.push(node)
                indexes.push(i)
                i = 0
                parent = node
                node = node.children[0] as Node<X>
            } else if (parent) { // go right
                i++;
                node = parent.children[i]
                goingUp = false
            } else node = null // nothing found
        }
    }

    _build(items, left, right, height) {
        var N = right - left + 1,
            M = this._maxEntries,
            node

        if (N <= M) {
            // reached leaf level; return leaf
            node = createNode(items.slice(left, right + 1))
            calcBBox(node)
            return node
        }

        if (!height) {
            // target height of the bulk-loaded tree
            height = Math.ceil(Math.log(N) / Math.log(M));

            // target number of root entries to maximize storage utilization
            M = Math.ceil(N / Math.pow(M, height - 1));
        }

        node = createNode([]);
        node.leaf = false;
        node.height = height;

        // split the items into M mostly square tiles
        var N2 = Math.ceil(N / M),
            N1 = N2 * Math.ceil(Math.sqrt(M)),
            i, j, right2, right3;

        multiSelect(items, left, right, N1, this.compareMinX)

        for (i = left; i <= right; i += N1) {
            right2 = Math.min(i + N1 - 1, right);

            multiSelect(items, i, right2, N2, this.compareMinY)

            for (j = i; j <= right2; j += N2) {
                right3 = Math.min(j + N2 - 1, right2)

                // pack each entry recursively
                node.children.push(this._build(items, j, right3, height - 1))
            }
        }

        calcBBox(node)
    }

    _chooseSubtree(bbox: AABB, node, level, path) {
        var i, len, child, targetNode, area, enlargement, minArea, minEnlargement;

        while (true) {
            path.push(node);

            if (node.leaf || path.length - 1 === level) break;

            minArea = minEnlargement = Infinity;

            for (i = 0, len = node.children.length; i < len; i++) {
                child = node.children[i];
                area = bboxArea(child);
                enlargement = enlargedArea(bbox, child) - area;

                // choose entry with the least area enlargement
                if (enlargement < minEnlargement) {
                    minEnlargement = enlargement;
                    minArea = area < minArea ? area : minArea;
                    targetNode = child;

                } else if (enlargement === minEnlargement) {
                    // otherwise choose one with the smallest area
                    if (area < minArea) {
                        minArea = area;
                        targetNode = child;
                    }
                }
            }

            node = targetNode || node.children[0];
        }

        return node;
    }

    _insert(item: X, level: number, aabb?: AABB) {
        console.log("insertion:", item.minX, item.maxX, item.minY, item.maxY)
        var insertPath = [];

        // find the best node for accommodating the item, saving all nodes along the path too
        var node = this._chooseSubtree(aabb || item, this.data, level, insertPath);

        // put the item into the node
        node.children.push(item);
        (item as any).parentNode = node;

        extendEps(node, aabb || item, 0);

        // split on node overflow; propagate upwards if necessary
        while (level >= 0) {
            if (insertPath[level].children.length > this._maxEntries) {
                this._split(insertPath, level);
                level--;
            } else break;
        }

        // adjust bboxes along the insertion path
        this._adjustParentBBoxes(aabb || item, insertPath, level);
    }

    // split overflowed node into two
    _split(insertPath, level) {

        var node = insertPath[level],
            M = node.children.length,
            m = this._minEntries;

        this._chooseSplitAxis(node, m, M);

        var splitIndex = this._chooseSplitIndex(node, m, M);

        var newNode = createNode(node.children.splice(splitIndex, node.children.length - splitIndex));
        newNode.height = node.height;
        newNode.leaf = node.leaf;

        calcBBox(node)
        calcBBox(newNode)

        if (level) insertPath[level - 1].children.push(newNode);
        else this._splitRoot(node, newNode);
    }

    _splitRoot(node, newNode) {
        // split root node
        this.data = createNode<X>([node, newNode]);
        this.data.height = node.height + 1;
        this.data.leaf = false;
        calcBBox(this.data);
    }

    _chooseSplitIndex(node, m, M) {
        var i, bbox1, bbox2, overlap, area, minOverlap, minArea, index

        minOverlap = minArea = Infinity

        for (i = m; i <= M - m; i++) {
            bbox1 = distBBox(node, 0, i)
            bbox2 = distBBox(node, i, M)

            overlap = intersectionArea(bbox1, bbox2)
            area = bboxArea(bbox1) + bboxArea(bbox2)

            // choose distribution with minimum overlap
            if (overlap < minOverlap) {
                minOverlap = overlap
                index = i

                minArea = area < minArea ? area : minArea

            } else if (overlap === minOverlap) {
                // otherwise choose distribution with minimum area
                if (area < minArea) {
                    minArea = area
                    index = i
                }
            }
        }

        return index;
    }

    // sorts node children by the best axis for split
    _chooseSplitAxis(node, m, M) {
        var compareMinX = node.leaf ? this.compareMinX : compareNodeMinX,
            compareMinY = node.leaf ? this.compareMinY : compareNodeMinY,
            xMargin = this._allDistMargin(node, m, M, compareMinX),
            yMargin = this._allDistMargin(node, m, M, compareMinY)

        // if total distributions margin value is minimal for x, sort by minX,
        // otherwise it's already sorted by minY
        if (xMargin < yMargin) node.children.sort(compareMinX);
    }

    // total margin of all possible split distributions where each node is at least m full
    _allDistMargin(node, m, M, compare) {

        node.children.sort(compare);

        var leftBBox = distBBox(node, 0, m),
            rightBBox = distBBox(node, M - m, M),
            margin = bboxMargin(leftBBox) + bboxMargin(rightBBox),
            i, child;

        for (i = m; i < M - m; i++) {
            child = node.children[i];
            extend(leftBBox, child);
            margin += bboxMargin(leftBBox);
        }

        for (i = M - m - 1; i >= m; i--) {
            child = node.children[i];
            extend(rightBBox, child);
            margin += bboxMargin(rightBBox);
        }

        return margin;
    }

    _adjustParentBBoxes(bbox, path, level) {
        // adjust bboxes along the given tree path
        for (var i = level; i >= 0; i--) {
            extend(path[i], bbox)
        }
    }

    _condense(path) {
        // go through the path, removing empty nodes and updating bboxes
        for (var i = path.length - 1, siblings; i >= 0; i--) {
            if (path[i].children.length === 0) {
                if (i > 0) {
                    siblings = path[i - 1].children
                    siblings.splice(siblings.indexOf(path[i]), 1)

                } else {
                    this.data = createNode<X>([])
                }
            } else calcBBox(path[i])
        }
    }
}

// calculate node's bbox from bboxes of its children
function calcBBox(node) {
    distBBox(node, 0, node.children.length, node)
}

// min bounding rectangle of node children from k to p-1
function distBBox(node, k, p, destNode?) {
    if (!destNode) destNode = createNode(null)
    destNode.minX = Infinity
    destNode.minY = Infinity
    destNode.maxX = -Infinity
    destNode.maxY = -Infinity

    for (var i = k, child; i < p; i++) {
        child = node.children[i]
        extend(destNode, child)
    }

    return destNode
}

function extend(a: AABB, b: AABB) {
    a.minX = Math.min(a.minX, b.minX)
    a.minY = Math.min(a.minY, b.minY)
    a.maxX = Math.max(a.maxX, b.maxX)
    a.maxY = Math.max(a.maxY, b.maxY)
    return a
}
function extendEps(a: AABB, b: AABB, eps) {
    a.minX = Math.min(a.minX, b.minX)
    a.minY = Math.min(a.minY, b.minY)
    a.maxX = Math.max(a.maxX, b.maxX)
    a.maxY = Math.max(a.maxY, b.maxY)

    var e = (a.maxX - a.minX) * eps

    a.minX -= e
    a.minY -= e
    a.maxX += e
    a.maxY += e

    return a
}

function compareNodeMinX(a: AABB, b: AABB) { return a.minX - b.minX }
function compareNodeMinY(a: AABB, b: AABB) { return a.minY - b.minY }

function bboxArea(a: AABB) { return (a.maxX - a.minX) * (a.maxY - a.minY) }
function bboxMargin(a: AABB) { return (a.maxX - a.minX) + (a.maxY - a.minY) }

function enlargedArea(a: AABB, b: AABB) {
    return (Math.max(b.maxX, a.maxX) - Math.min(b.minX, a.minX)) *
        (Math.max(b.maxY, a.maxY) - Math.min(b.minY, a.minY))
}

function intersectionArea(a: AABB, b: AABB) {
    var minX = Math.max(a.minX, b.minX),
        minY = Math.max(a.minY, b.minY),
        maxX = Math.min(a.maxX, b.maxX),
        maxY = Math.min(a.maxY, b.maxY);

    return Math.max(0, maxX - minX) * Math.max(0, maxY - minY)
}

function contains(a: AABB, b: AABB) {
    return a.minX <= b.minX && a.minY <= b.minY && b.maxX <= a.maxX && b.maxY <= a.maxY
}

function intersects(a: AABB, b: AABB) {
    return b.minX <= a.maxX && b.minY <= a.maxY && b.maxX >= a.minX && b.maxY >= a.minY
}

// sort an array so that items come in groups of n unsorted items, with groups sorted between each other;
// combines selection algorithm with binary divide & conquer approach
function multiSelect(arr, left, right, n, compare) {
    var stack = [left, right],
        mid;

    while (stack.length) {
        right = stack.pop()
        left = stack.pop()

        if (right - left <= n) continue

        mid = left + Math.ceil((right - left) / n / 2) * n
        quickselect(arr, mid, left, right, compare)

        stack.push(left, mid, mid, right)
    }
}