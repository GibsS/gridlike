import * as assert from 'assert'
import * as _ from 'lodash'

import { World, Entity, LayerCollision } from '../lib/'

export default function test() {
    describe('Layers', function() {
        var world: World

        beforeEach(function() {
            world = new World()
        })

        it('two layers set to always collide will return always collide', function() {
            world.setLayerRule("layer1", "layer2", LayerCollision.ALWAYS)

            assert.equal(LayerCollision.ALWAYS, world.getLayerRule("layer1", "layer2"))
        })
        it('two layers set to never collide will return never collide', function() {
            world.setLayerRule("layer1", "layer2", LayerCollision.NEVER)

            assert.equal(LayerCollision.NEVER, world.getLayerRule("layer1", "layer2"))
        })
        it('two layers set to equal group collide will return equal group collide', function() {
            world.setLayerRule("layer1", "layer2", LayerCollision.EQUAL_GROUP)

            assert.equal(LayerCollision.EQUAL_GROUP, world.getLayerRule("layer1", "layer2"))
        })
        it('two layers set to unequal group collide will return unequal group collide', function() {
            world.setLayerRule("layer1", "layer2", LayerCollision.UNEQUAL_GROUP)

            assert.equal(LayerCollision.UNEQUAL_GROUP, world.getLayerRule("layer1", "layer2"))
        })
        it('change layer collision works', function() {
            world.setLayerRule("layer1", "layer2", LayerCollision.UNEQUAL_GROUP)
            world.setLayerRule("layer1", "layer2", LayerCollision.EQUAL_GROUP)

            assert.equal(LayerCollision.EQUAL_GROUP, world.getLayerRule("layer1", "layer2"))
        })
        it('world.layers returns the list of layers', function() {
            world.addLayer("a_layer")
            world.setLayerRule("layer3", "layer4", LayerCollision.NEVER)

            assert.ok(_.isEqual(world.layers.sort(), ["a_layer", "layer3", "layer4", "default"].sort()))
        })
    })
}