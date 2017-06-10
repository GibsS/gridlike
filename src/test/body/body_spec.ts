import * as assert from 'assert'
import * as _ from 'lodash'
import { nearEqual } from './../helper'
import * as util from 'util'

import invariant from './../invariant'

import { World, Entity, Rect, Line, BodyType } from './../../lib/index'

export default function test() {
    describe('SmallBody', function() {
        let world: World,
            entity: Entity,
            rect1

        before(function() {
            world = new World()
            entity = world.createEntity({ x: 0, y: 0 })
            rect1 = entity.createRect({ x: 0, y: 0, width: 1, height: 1 })
        })

        describe('new SmallBody', function() {
            it('can set sensor to false', function() {
                let rect = entity.createRect({ x: 0, y: 0, width: 1, height: 1, isSensor: false })
                assert.equal(rect.isSensor, false)
            })
            it('can set sensor to true', function() {
                let rect = entity.createRect({ x: 0, y: 0, width: 1, height: 1, isSensor: true })
                assert.equal(rect.isSensor, true)
            })
            it('defaults sensor to false', function() {
                let rect = entity.createRect({ x: 0, y: 0, width: 1, height: 1 })
                assert.equal(rect.isSensor, false)
            })
            it('defaults position to [0, 0]', function() {
                let rect = entity.createRect({ width: 1, height: 1, isSensor: false })
                assert.equal(rect.x, 0)
                assert.equal(rect.y, 0)
            })
            it('can set position ', function() {
                let rect = entity.createRect({ x: 3, y: -2, width: 1, height: 1 })
                assert.equal(rect.x, 3)
                assert.equal(rect.y, -2)
            })
            it('can set layer', function() {
                let rect = entity.createRect({ x: 0, y: 0, width: 1, height: 1, layer: "layer1" })
                assert.equal(rect.layerGroup, 0)
                assert.equal(rect.layer, "layer1")
            })
            it('can set layer group', function() {
                let rect = entity.createRect({ x: 0, y: 0, width: 1, height: 1, layerGroup: 1 })
                assert.equal(rect.layerGroup, 1)
                assert.equal(rect.layer, "default")
            })
            it('defaults layer and layer group to "default" and 0', function() {
                let rect = entity.createRect({ x: 0, y: 0, width: 1, height: 1 })
                assert.equal(rect.layerGroup, 0)
                assert.equal(rect.layer, "default")
            })
            it('can set enabled to true', function() {
                let rect = entity.createRect({ x: 0, y: 0, width: 1, height: 1, enabled: true })
                assert.equal(rect.enabled, true)
            })
            it('can set enabled to false', function() {
                let rect = entity.createRect({ x: 0, y: 0, width: 1, height: 1, enabled: false })
                assert.equal(rect.enabled, false)
            })
            it('defaults enabled to true', function() {
                let rect = entity.createRect({ x: 0, y: 0, width: 1, height: 1 })
                assert.equal(rect.enabled, true)
            })
        })

        describe('.isSensor', function() {
            it('sets the sensor to the correct value', function() {
                rect1.isSensor = false
                assert.equal(rect1.isSensor, false)
                rect1.isSensor = true
                assert.equal(rect1.isSensor, true)
            })
        })
        describe('.layer', function() {
            it('sets the layer to the correct value', function() {
                rect1.layer = "layer2"
                assert.equal(rect1.layer, "layer2")
                rect1.layer = null
                assert.equal(rect1.layer, "default")
            })
        })
        describe('.layerGroup', function() {
            it('sets the layerGroup to the correct value', function() {
                rect1.layerGroup = 3
                assert.equal(rect1.layerGroup, 3)
                rect1.layerGroup = null
                assert.equal(rect1.layerGroup, 0)
            })
        })
    })

    describe('Rect', function() {
        let world: World,
            entity: Entity,
            rect: Rect

        before(function() {
            world = new World()
            entity = world.createEntity({ x: 0, y: 0 })
        })

        describe('new Rect', function() {
            it('sets body type', function() {
                rect = entity.createRect({ x: 1, y: 1, width: 2, height: 3 })
                assert.equal(rect.type, BodyType.RECT)
            })
            it('can set size', function() {
                rect = entity.createRect({ x: 1, y: 1, width: 2, height: 3 })
                assert.equal(rect.width, 2)
                assert.equal(rect.height, 3)
            })
        })

        describe('.width', function() {
            it('sets the width', function() {
                rect = entity.createRect({ x: 1, y: 1, width: 2, height: 3 })
                rect.width = 5
                assert.equal(rect.width, 5)
            })
        })
        describe('.height', function() {
            it('sets the height', function() {
                rect = entity.createRect({ x: 1, y: 1, width: 2, height: 3 })
                rect.height = 6
                assert.equal(rect.height, 6)
            })
        })
    })

    describe('Line', function() {
        let world: World,
            entity: Entity,
            line: Line

        before(function() {
            world = new World()
            entity = world.createEntity({ x: 0, y: 0 })
        })

        describe('new Line', function() {
            it('sets body type', function() {
                line = entity.createLine({ x: 0, y: 0, size: 1, isHorizontal: false })
                assert.equal(line.type, BodyType.LINE)
            })
            it('can set isHorizontal to false', function() {
                line = entity.createLine({ x: 0, y: 0, size: 1, isHorizontal: false })
                assert.equal(line.isHorizontal, false)
            })
            it('can set isHorizontal to true', function() {
                line = entity.createLine({ x: 0, y: 0, size: 1, isHorizontal: true })
                assert.equal(line.isHorizontal, true)
            })
            it('can set size', function() {
                line = entity.createLine({ x: 0, y: 0, size: 2.4, isHorizontal: true })
                assert.equal(line.size, 2.4)
            })
            it('defaults side to all', function() {
                line = entity.createLine({ x: 0, y: 0, size: 2.4, isHorizontal: true })
                assert.equal(line.side, "all")
            })
            it('can set side to all', function() {
                line = entity.createLine({ x: 0, y: 0, size: 2.4, isHorizontal: false, side: "all" })
                assert.equal(line.side, "all")
            })
            it('can set side to left', function() {
                line = entity.createLine({ x: 0, y: 0, size: 2.4, isHorizontal: false, side: "left" })
                assert.equal(line.side, "left")
            })
            it('can set side to right', function() {
                line = entity.createLine({ x: 0, y: 0, size: 2.4, isHorizontal: false, side: "right" })
                assert.equal(line.side, "right")
            })
            it('can set side to up', function() {
                line = entity.createLine({ x: 0, y: 0, size: 2.4, isHorizontal: true, side: "up" })
                assert.equal(line.side, "up")
            })
            it('can set side to down', function() {
                line = entity.createLine({ x: 0, y: 0, size: 2.4, isHorizontal: true, side: "down" })
                assert.equal(line.side, "down")
            })
        })

        describe('.isHorizontal', function() {
            it('can\'t set a new value', function() {
                line = entity.createLine({ x: 0, y: 0, size: 2.4, isHorizontal: true })
                // line.isHorizontal = false
                assert.equal(line.isHorizontal, true)
            })
        })
        describe('.size', function() {
            it('can set a new value', function() {
                line = entity.createLine({ x: 0, y: 0, size: 2.4, isHorizontal: true })
                line.size = 5.6
                assert.equal(line.size, 5.6)
            })
        })
        describe('.side', function() {
            it('can set a horizontal line to up', function() {
                line = entity.createLine({ x: 0, y: 0, size: 2.4, isHorizontal: true })
                line.side = "up"
                assert.equal(line.side, "up")
            })
            it('can set a horizontal line to down', function() {
                line = entity.createLine({ x: 0, y: 0, size: 2.4, isHorizontal: true })
                line.side = "down"
                assert.equal(line.side, "down")
            })
            it('can set a horizontal line to all with null', function() {
                line = entity.createLine({ x: 0, y: 0, size: 2.4, isHorizontal: true })
                line.side = null
                assert.equal(line.side, "all")
            })
            it('can set a vertical line to left', function() {
                line = entity.createLine({ x: 0, y: 0, size: 2.4, isHorizontal: false })
                line.side = "left"
                assert.equal(line.side, "left")
            })
            it('can set a vertical line to right', function() {
                line = entity.createLine({ x: 0, y: 0, size: 2.4, isHorizontal: false })
                line.side = "right"
                assert.equal(line.side, "right")
            })
        })
    })
}