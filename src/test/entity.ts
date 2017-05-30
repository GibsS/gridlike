import * as assert from 'assert'
import * as _ from 'lodash'
import { nearEqual } from './helper'

import invariant from './invariant'

import { World, Entity } from '../lib/index'

export default function test() {
    describe('Entity', function() {
        var world: World

        beforeEach(function() {
            world = new World()
        })
        
        describe('Position', function() {
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
            it('Correct global to local conversion /1', function() {
                let entity = world.createRect({
                    x: 10, y: -3,
                    width: 10, height: 10
                })

                let p = entity.globalToLocal(0, 0)
                nearEqual(p.x, -10, "global to local.x value")
                nearEqual(p.y, 3, "global to local.y value")
            })
            it('Correct global to local conversion /2', function() {
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

        describe('Parenting', function() {
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
                // invariant(world)
            })
            it('Changing parent type from static to follow maintains invariants', function() {
                entity1.setParent(entity2)
                entity2.setParent(entity3, "follow")

                entity2.parentType = "static"
                assert.equal(entity2.parentType, "static")
                // invariant(world)
            })
        })
    })
}