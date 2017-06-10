import * as assert from 'assert'
import * as _ from 'lodash'
import { nearEqual } from './helper'

import { World, Entity, LayerCollision } from '../lib/index'

export default function test() {
    describe('World', function() {
        var world: World

        beforeEach(function() {
            world = new World()
        })

        // CONSTRUCTOR
        describe.skip('constructor', function() {
            it('creates a world with no entities', function() {

            })

            it('creates a world with only one layer: default', function() {

            })

            it('has its time set to 0', function() {

            })
        })

        // ENTITIES
        describe.skip('.createEntity', function() {
            it('creates an empty entity', function() {

            })

            it('adds the entity to its list of top entities', function() {

            })
        })

        describe.skip('.createRect', function() {
            it('creates a well form entity with a Rect', function() {

            })
            it('adds the entity to its list of top entities', function() {

            })
        })
        describe.skip('.createLine', function() {
            it('creates a well form entity with a Line', function() {

            })
            it('adds the entity to its list of top entities', function() {

            })
        })
        describe.skip('.createGrid', function() {
            it('creates a well form entity with a Grid', function() {

            })
            it('adds the entity to its list of top entities', function() {

            })
        })

        describe.skip('.removeEntity', function() {
            it('removes the entity from the world', function() {

            })
        })

        // QUERYING
        describe.skip('.raycast', function() {
            describe('when nothing is in the path', function() {

            })
            describe('when two object are in the path, one close than the other', function() {
                
            })
        })
        describe.skip('.queryRect', function() {
            describe('when nothing is in the path', function() {

            })
            describe('when one object is in the path', function() {
                
            })
            describe('when two objects is in the path', function() {
                
            })
        })
        describe.skip('.queryPoint', function() {
            describe('when nothing is in the path', function() {

            })
            describe('when one object is in the path', function() {
                
            })
            describe('when two objects is in the path', function() {
                
            })
        })

        // TIME
        describe('.simulate', function() {
            it('updates time correctly', function() {
                world.simulate(1.0)
                nearEqual(world.time, 1.0)
            })
        })
        
        // LAYERS
        describe('.setLayerRule', function() {
            for(let rule of [LayerCollision.ALWAYS, LayerCollision.EQUAL_GROUP, LayerCollision.NEVER, LayerCollision.UNEQUAL_GROUP]) {
                context('when you set the rule of two new layers to ' + rule, function() {
                    beforeEach(function() {
                        world.setLayerRule("layer1", "layer2", rule)
                    })

                    it('should have the world return ALWAYS when fetching their rule', function() {
                        assert.equal(rule, world.getLayerRule("layer1", "layer2"))
                    })
                })
            }

            context('when you reset the rule of two layers', function () {
                beforeEach(function() {
                    world.setLayerRule("layer1", "layer2", LayerCollision.UNEQUAL_GROUP)
                    world.setLayerRule("layer1", "layer2", LayerCollision.EQUAL_GROUP)
                })

                it('should have the world return the newly set rule', function() {
                    assert.equal(LayerCollision.EQUAL_GROUP, world.getLayerRule("layer1", "layer2"))
                })
            })
        })
        
        describe('.getLayerRule', function() {            
            beforeEach(function() {
                world.setLayerRule("layer1", "layer2", LayerCollision.ALWAYS)
                world.setLayerRule("layer2", "layer3", LayerCollision.UNEQUAL_GROUP)
                world.setLayerRule("layer3", "layer1", LayerCollision.NEVER)

                world.setLayerRule("layer4", "layer5", LayerCollision.UNEQUAL_GROUP)
                world.setLayerRule("layer2", "layer3", LayerCollision.EQUAL_GROUP)

                world.setLayerRule("layer6", "layer6", LayerCollision.NEVER)

                world.addLayer("layer7")
            })
            
            it('should return the correct rule for every layers', function() {
                assert.equal(world.getLayerRule("layer1", "layer2"), LayerCollision.ALWAYS)
                assert.equal(world.getLayerRule("layer2", "layer3"), LayerCollision.EQUAL_GROUP)
                assert.equal(world.getLayerRule("layer3", "layer1"), LayerCollision.NEVER)
                assert.equal(world.getLayerRule("layer4", "layer5"), LayerCollision.UNEQUAL_GROUP)
                assert.equal(world.getLayerRule("layer6", "layer6"), LayerCollision.NEVER)
            })

            it('should return ALWAYS for every pair of layer when one of them is not set to anything', function() {
                assert.equal(world.getLayerRule("layer1", "layer7"), LayerCollision.ALWAYS)
                assert.equal(world.getLayerRule("layer2", "layer7"), LayerCollision.ALWAYS)
                assert.equal(world.getLayerRule("layer3", "layer7"), LayerCollision.ALWAYS)
                assert.equal(world.getLayerRule("layer4", "layer7"), LayerCollision.ALWAYS)
                assert.equal(world.getLayerRule("layer5", "layer7"), LayerCollision.ALWAYS)
                assert.equal(world.getLayerRule("layer6", "layer7"), LayerCollision.ALWAYS)
            })

            it('should return ALWAYS when one of the layer is "default"', function() {
                assert.equal(world.getLayerRule("layer1", "default"), LayerCollision.ALWAYS)
                assert.equal(world.getLayerRule("layer2", "default"), LayerCollision.ALWAYS)
                assert.equal(world.getLayerRule("layer3", "default"), LayerCollision.ALWAYS)
                assert.equal(world.getLayerRule("layer4", "default"), LayerCollision.ALWAYS)
                assert.equal(world.getLayerRule("layer5", "default"), LayerCollision.ALWAYS)
                assert.equal(world.getLayerRule("layer6", "default"), LayerCollision.ALWAYS)
            })
        })
        
        describe('.layers', function() {
            it('should return the list of all layers', function() {
                world.addLayer("a_layer")
                world.setLayerRule("layer3", "layer4", LayerCollision.NEVER)

                assert(_.isEqual(world.layers.sort(), ["a_layer", "layer3", "layer4", "default"].sort()))
            })
        })
    })
}