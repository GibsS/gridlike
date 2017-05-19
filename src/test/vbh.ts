import * as assert from 'assert'
import * as _ from 'lodash'

import { nearEqual } from './helper'

import { VBH, MoveVBH, IAABB, IMoveAABB, SimpleVBH, SimpleMoveVBH } from '../lib/vbh/vbh'

function hasPair(list: any[], e1, e2) {
    assert(_.some(list, e => (e[0] == e1 && e[1] == e2) || (e[0] == e2 && e[1] == e1)))
}

function testVBH(VBHType: () => VBH<IAABB>, otherVBHs: (() => VBH<IAABB>)[]) {
    var vbh: VBH<IAABB>,
        aabb1: IAABB = { minx: 0, miny: 1, maxx: 2, maxy: 3, enabled: true },
        aabb2: IAABB = { minx: 2, miny: -1, maxx: 3, maxy: 0, enabled: true },
        aabb3: IAABB = { minx: 3.1, miny: -1, maxx: 4.1, maxy: 0, enabled: true },
        aabb4: IAABB = { minx: -1, miny: 1, maxx: -0.1, maxy: 2, enabled: true }

    beforeEach(function() {
        vbh = VBHType()
    })

    describe("VBH.all", function() {
        it('should return a list of all the elements added to the vbh /1', function() {
            vbh.insert(aabb1)
            vbh.insert(aabb2)
            vbh.insert(aabb3)
            vbh.insert(aabb4)

            assert(_.isEqual(vbh.all().sort(), [aabb1, aabb2, aabb3, aabb4].sort()))
        })
        it('should return a list of all the elements added to the vbh /2', function() {
            vbh.bulkInsert([aabb1, aabb2, aabb3, aabb4])

            assert(_.isEqual(vbh.all().sort(), [aabb1, aabb2, aabb3, aabb4].sort()))
        })
    })

    describe("VBH.insert", function() {
        it('should add the given element to the vbh', function() {
            vbh.insert(aabb1)

            assert(vbh.all().indexOf(aabb1) >= 0)
        })
    })
    describe("VBH.remove", function() {
        it('should remove the given element of the vbh', function() {
            vbh.insert(aabb1)
            vbh.insert(aabb2)

            vbh.remove(aabb1)

            assert(vbh.all().indexOf(aabb1) < 0)
        })
    })

    describe("Querying", function() {

        beforeEach(function() {
            vbh.bulkInsert([aabb1, aabb2, aabb3, aabb4])
        })

        describe("VBH.queryRect", function() {
            it('should return null if nothing overlaps with the rectangle', function() {
                let res = vbh.queryRect(-10, 0, 4, 4)

                assert.deepEqual(res.bodies, [])
            })
            it('should return all the elements overlaps with the rectangle /1', function() {
                let res = vbh.queryRect(1.5, -0.5, 3, 3)

                assert(_.isEqual(res.bodies.sort(), [aabb1, aabb2, aabb3].sort()))
            })
            it('should return all the elements overlaps with the rectangle /2', function() {
                let res = vbh.queryRect(2.5, -0.5, 0, 0)

                assert(res.bodies.length == 1 && res.bodies[0] == aabb2)
            })
        })
    })

    for(let other of otherVBHs) {
        vbh = VBHType()
        let otherVBH = other()
        describe("VBH collisions between " + vbh.constructor.name + " and " + otherVBH.constructor.name, function() {
            let aabb5: IAABB = { minx: 3, maxx: 4, miny: 4, maxy: 5, enabled: true },
                aabb6: IAABB = { minx: 5, maxx: 6, miny: -1, maxy: 0, enabled: true }

            beforeEach(function() {
                otherVBH = other()
                otherVBH.bulkInsert([aabb5, aabb6])

                vbh = VBHType()
                vbh.bulkInsert([aabb1, aabb2, aabb3, aabb4])
            })

            describe("VBH.collideVBH", function() {
                it('should return the list of pairs of colliding elements /1', function() {
                    vbh.remove(aabb1)
                    vbh.remove(aabb2)
                    vbh.remove(aabb4)

                    otherVBH.remove(aabb5)

                    let res = vbh.collideVBH(otherVBH, 0, 0, 0.5, 0, 0, 0.2, -1, -0.5)

                    hasPair(res, aabb3, aabb6)
                })
                it('should return the list of pairs of colliding elements /2', function() {
                    let res = vbh.collideVBH(otherVBH, 0, 0, 0.5, 0, 0, 0.2, -1, -0.5)

                    hasPair(res, aabb3, aabb6)
                })
                it('should return the list of pairs of colliding elements /3', function() {
                    let res = vbh.collideVBH(otherVBH, 0, 3, 0, 0, 0, 0, 0, -6)

                    hasPair(res, aabb3, aabb5)
                })
                it('should return nothing if nothing collides', function() {
                    let res = vbh.collideVBH(otherVBH, 0, -2, 0, 0, 0, 1, 1, 0)

                    assert(res.length == 0)
                })
            })
        })
    }

    describe("VBH.collideAAABB", function() {

        beforeEach(function() {
            vbh.bulkInsert([aabb1, aabb2, aabb3, aabb4])
        })

        let aabb6: IAABB = { minx: 6, maxx: 7, miny: -1, maxy: 0, enabled: true }

        it('should return the list of pairs of colliding elements /1', function() {
            let res = vbh.collideAABB(aabb6, 0, 0, 0, 0, 0, 0, -4, 0)

            assert(res.length == 2)
        })
        it('should return the list of pairs of colliding elements /2', function() {
            let res = vbh.collideAABB(aabb6, 0.5, 0, 0, 0, 0, 0.3, -6, -0.3)

            assert(res.length == 2)
        })
        it('should return nothing if nothing collides', function() {
            let res = vbh.collideAABB(aabb6, 0, -2, 0, 0, 0, 1, 1, 0)

            assert(res.length == 0)
        })
    })
}

function testMoveVBH(vbhType: () => MoveVBH<IMoveAABB>) {

    var vbh: MoveVBH<IMoveAABB>,
    aabb1: IMoveAABB = { minx: 0, miny: 1, maxx: 2, maxy: 3, enabled: true, vx: 0, vy: 0 },
    aabb2: IMoveAABB = { minx: 3, miny: -1, maxx: 4, maxy: 0, enabled: true, vx: 0, vy: 0 },
    aabb3: IMoveAABB = { minx: 4.1, miny: -1, maxx: 5.1, maxy: 0, enabled: true, vx: 0, vy: 0 },
    aabb4: IMoveAABB = { minx: -1, miny: 1, maxx: -0.1, maxy: 2, enabled: true, vx: 0, vy: 0 }

    beforeEach(function() {
        vbh = vbhType()
        vbh.bulkInsert([aabb1, aabb2, aabb3, aabb4])
    })

    describe("MoveVBH.update", function() {
        it('should return every new collision /1', function() {
            let res = vbh.update(4)
        })
        it('should return every new collision /2', function() {
            aabb4.vx = 1
            aabb4.vy = 1
            aabb1.vx = -10

            aabb2.vx = 4
            let res = vbh.update(1)

            hasPair(res, aabb4, aabb1)
            hasPair(res, aabb2, aabb3)
        })
        it('should return every new collision /3', function() {
            aabb2.vx = -1
            aabb2.vy = 2
            
            let res = vbh.update(1)

            hasPair(res, aabb1, aabb2)
        })
    })

    describe("MoveVBH.updateSingle", function() {
        it('should return every new collision /1', function() {
            let res = vbh.updateSingle(aabb1, -1, 1)

            hasPair(res, aabb1, aabb4)
        })
        it('should return every new collision /2', function() {
            let res = vbh.updateSingle(aabb3, -10, 1)

            hasPair(res, aabb3, aabb1)
            hasPair(res, aabb3, aabb2)
            hasPair(res, aabb3, aabb4)
        })
        it('should return every new collision /3', function() {
            let res = vbh.updateSingle(aabb4, 1, 0)

            hasPair(res, aabb1, aabb4)
        })
    })
}

export default function test() {
    testVBH(() => new SimpleVBH<IAABB>(), [() => new SimpleVBH<IAABB>()])
    testMoveVBH(() => new SimpleMoveVBH<IMoveAABB>())
}