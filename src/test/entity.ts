import * as assert from 'assert'
import * as _ from 'lodash'
import { nearEqual } from './helper'

import { World, Entity } from '../lib/index'

export default function test() {
    describe('Entity', function() {
        var world: World

        beforeEach(function() {
            world = new World()
        })

        describe('world', function() {
            it('entity.world = world who created it', function() {
                let entity = world.createEntity({
                    x: 0,
                    y: 0
                })

                assert.equal(entity.world, world, "entity.world should be equal to the world that created it")
            })
        })

        describe('position', function() {
            it('global points to the correct position for nested entity', function() {
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
            it('global to local conversion /1', function() {
                let entity = world.createRect({
                    x: 10, y: -3,
                    width: 10, height: 10
                })

                let p = entity.globalToLocal(0, 0)
                nearEqual(p.x, -10, "global to local.x value")
                nearEqual(p.y, 3, "global to local.y value")
            })
            it('global to local conversion /2', function() {
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
    })
}