import * as assert from 'assert'
import * as _ from 'lodash'
import { nearEqual } from './helper'

import { World, Entity } from '../lib/index'

export default function test() {
    describe('World', function() {
        var world: World

        beforeEach(function() {
            world = new World()
        })

        describe('time', function() {
            it('should progress correctly', function() {
                world.simulate(1.0)
                nearEqual(world.time, 1.0)
            })
        })
    })
}