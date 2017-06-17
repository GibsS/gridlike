import * as assert from 'assert'
import * as _ from 'lodash'
import { nearEqual } from './helper'

import invariant from './invariant'

import { World, Entity } from '../lib/index'

export default function test() {
    describe('Entity', function() {
        var world: World,
            entity: Entity

        beforeEach(function() {
            world = new World()
            entity = world.createEntity({ x: 0, y: 0 })
        })

        // BODIES
        describe.skip('.body', function() {
            describe('when there is no body added', function() {
                it('should return null', function() {

                })
            })

            describe('when only one body is added', function() {
                it('should return that body', function() {

                })
            })

            describe('when there is more than one body', function() {
                it('should return one of the bodies', function() {

                })
            })
        })

        describe.skip('.bodies', function() {
            describe('when there is no body added', function() {
                it('should return null', function() {

                })
            })

            describe('when only one body is added', function() {
                it('should return that body', function() {

                })
            })

            describe('when there is more than one body', function() {
                it('should return one of the bodies', function() {
                    
                })
            })
        })

        describe('.createRect', function() {
            it('creates a correctly shaped rect', function() {
                let rect = entity.createRect({ width: 2, height: 3 })
                assert.equal(rect.x, 0)
                assert.equal(rect.y, 0)
                assert.equal(rect.width, 2)
                assert.equal(rect.height, 3)
                invariant(world)
            })
            it('positions it correctly', function() {
                let rect = entity.createRect({ x: 1, y: 3, width: 4, height: 5 })
                assert.equal(rect.x, 1)
                assert.equal(rect.y, 3)
                assert.equal(rect.width, 4)
                assert.equal(rect.height, 5)
                invariant(world)
            })

            it('changes the body list', function() {
                let rect = entity.createRect({ width: 1, height: 2 })
                assert.deepEqual(entity.bodies, [rect])
                invariant(world)
            })
        })


        describe('.createLine', function() {
            it('creates a correctly shaped line', function() {
                let line = entity.createLine({ size: 2, isHorizontal: true })
                assert.equal(line.x, 0)
                assert.equal(line.y, 0)
                assert.equal(line.size, 2)
                assert.equal(line.isHorizontal, true)
                assert.equal(line.side, "all")
                invariant(world)
            })
            it('positions it correctly', function() {
                let line = entity.createLine({ x: 1, y: 3, size: 4, isHorizontal: false, side: "left" })
                assert.equal(line.x, 1)
                assert.equal(line.y, 3)
                assert.equal(line.size, 4)
                assert.equal(line.isHorizontal, false)
                assert.equal(line.side, "left")
                invariant(world)
            })

            it('changes the body list', function() {
                let line = entity.createLine({ size: 1, isHorizontal: false })
                assert.deepEqual(entity.bodies, [line])
                invariant(world)
            })
        })

        describe.skip('.removeBody', function() {
            describe('when there is no bodies', function() {

            })
            describe('when there is one body', function() {

            })
            describe('when there is several bodies', function() {
                describe('when the entity is a static child', function() {

                })

                describe('when the entity is not a static child', function() {

                })
            })
        })

        describe.skip('.createGrid', function() {
            it('creates a correctly shaped grid if grid defined with dimension', function() {

            })
            it('creates a correctly shaped grid if grid defined with array', function() {

            })
            it('creates a correctly shaped grid if grid defined with list', function() {

            })
        })

        describe.skip('.forBodies', function() {
            describe('when there is no bodies', function() {
                it('it does nothing', function() {

                })
            })
            describe('when there is a body', function() {
                it('it calls the function for every body', function() {

                })
            })
            describe('when their is multiple bodies', function() {
                it('it calls the function for every body', function() {
                    
                })
            })
            describe('when the entity is a static child', function() {
                it('it calls the function for every body', function() {
                    
                })
            })
        })
        
        // POSITIONNING
        describe('.globalx .globaly .x .y', function() {
            it('Correct global position for nested entity', function() {
                let entity = world.createRect({
                    x: 10, y: -3,
                    width: 10, height: 10
                })
                let entity2 = entity.createChild({
                    type: "rect",
                    x: 1, y: 1,
                    width: 10, height: 10
                })
                
                nearEqual(entity2.globalx, 11)
                nearEqual(entity2.globaly, -2)
            })
        })
        describe.skip('.localToGlobal', function() {
            it('calculates local to global conversion /1', function() {

            })
            it('calculates local to global conversion /2', function() {

            })
        })
        describe('.globalToLocal', function() {
            it('calculates global to local conversion /1', function() {
                let entity = world.createRect({
                    x: 10, y: -3,
                    width: 10, height: 10
                })

                let p = entity.globalToLocal(0, 0)
                nearEqual(p.x, -10, "global to local.x value")
                nearEqual(p.y, 3, "global to local.y value")
            })
            it('calculates global to local conversion /2', function() {
                let entity = world.createRect({
                    x: 10, y: -3,
                    width: 10, height: 10
                })
                let entity2 = entity.createChild({
                    type: "rect",
                    x: 1, y: 1,
                    width: 10, height: 10
                })
                
                let p = entity2.globalToLocal(0, 0)
                nearEqual(p.x, -11, "global to local.x value")
                nearEqual(p.y, 2, "global to local.y value")
            })
        })

        // PARENTING
        describe.skip('.parent .parentType .children', function() {
            describe('when a child is added statically', function() {
                it('should set .parent to the parent, .parentType to "static" and .children to a one element list', function() {

                })
            })

            describe('when a child is added non statically', function() {
                it('should set .parent to the parent, .parentType to "follow" and .children to a one element list', function() {

                })
            })

            describe('when a child is removed', function() {
                it('should set .parent to null and .children to a zero element list', function() {

                })
            })
        })
        describe.skip('.createChild', function() {
            it('should set .parent of the child to the correct value', function() {

            })
            it('should set the child to .children', function() {
                
            })
        })
        describe('.parent setParent addChild removeChild', function() {
            let entity1: Entity, entity2: Entity, entity3: Entity
            beforeEach(function() {
                entity1 = world.createRect({
                    x: 0, y: 0,
                    width: 10,
                    height: 10
                })

                entity2 = world.createRect({
                    x: 0, y: 0,
                    width: 10,
                    height: 10
                })
                entity3 = world.createRect({
                    x: 0, y: 0,
                    width: 10,
                    height: 10
                })
            })

            it('Adding parent keeps invariant and sets Entity.parent to the correct value', function() {
                entity1.setParent(entity2)
                entity2.setParent(entity3)

                assert(entity1.parent == entity2, 'entity1 has entity2 as a parent')
                assert(entity2.parent == entity3, 'entity2 has entity3 as a parent')
                invariant(world)
            })
            it('Removing an entity with parent and childs maintains invariants', function() {
                entity1.setParent(entity2)
                entity2.setParent(entity3)

                entity2.destroy()

                assert(entity1.parent == null, 'entity1 has no parent')
                assert(entity3.children.length == 0, 'entity3 has no child')
                invariant(world)
            })
            it('Removing an entity with parent and childs maintains invariants', function() {
                entity1.parent = entity2
                entity2.parent = entity3

                entity2.parent = null

                entity2.parent = entity3

                assert(entity1.parent == entity2)
                assert(entity2.parent == entity3)
                invariant(world)
            })
            it('Changing parent type from follow to static maintains invariants', function() {
                entity1.setParent(entity2)
                entity2.setParent(entity3)

                entity2.parentType = "follow"
                assert.equal(entity2.parentType, "follow")
                invariant(world)
            })
            it('Changing parent type from static to follow maintains invariants', function() {
                entity1.setParent(entity2)
                entity2.setParent(entity3, "follow")

                entity2.parentType = "static"
                assert.equal(entity2.parentType, "static")
                invariant(world)
            })
        })
    })
}