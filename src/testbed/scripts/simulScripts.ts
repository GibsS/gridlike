import * as _ from 'lodash'

import { Script, ScriptDescriptor } from '../script'
import { Testbed } from '../'
import { Entity, Grid, Body, LayerCollision } from '../../lib'

import { input, update } from '../controllers/fixSpeedController'
import { follow } from '../controllers/cameraController'

class Script1 extends Script {

    ground: Entity
    rect: Entity

    init() {
        this.rect = this.r(this.world.createRect({
            x: 0,
            y: 2,
            width: 1,
            height: 1,
            level: 1
        }))
        this.rect.name = "rect"

        this.ground = this.r(this.world.createRect({
            x: 0, y: 0,
            width: 4,
            height: 1,
            level: 0
        }))
        this.ground.name = "ground"

        input(this, this.rect, false)
    }

    update(time: number, delta: number) {
        update(this.rect, time, delta, 5)
    }
}

class Script2 extends Script {

    ground: Entity
    rect: Entity

    init() {
        this.rect = this.r(this.world.createRect({
            x: -1.001, y: -1,
            width: 1,
            height: 1,
            level: 1
        }))
        this.rect.name = "rect"

        this.ground = this.r(this.world.createRect({
            x: 0, y: 0,
            width: 1,
            height: 1,
            level: 0
        }))
        this.ground.name = "ground"
    }

    update(time: number, delta: number) {
        this.rect.vx = 2
        this.rect.vy = 2
    }
}

class Script3 extends Script {

    ground: Entity
    rect: Entity

    init() {
        this.rect = this.r(this.world.createRect({
            x: 0,
            y: 2,
            width: 1,
            height: 1,
            level: 1
        }))
        this.rect.name = "rect"

        this.ground = this.r(this.world.createRect({
            x: 0, y: 0,
            width: 4,
            height: 1,
            level: 0
        }))
        this.ground.name = "ground"

        input(this, this.rect, true)
    }

    update(time: number, delta: number) {
        this.ground.vy = 2 * Math.sin(time)
        update(this.rect, time, delta, 5)
    }
}


class Script4 extends Script {

    ground: Entity
    rect: Entity

    init() {
        this.rect = this.r(this.world.createRect({
            x: 0,
            y: 2,
            width: 1,
            height: 1,
            level: 1
        }))
        this.rect.name = "rect"

        this.ground = this.r(this.world.createLine({
            x: 3, y: -3,
            size: 2,
            isHorizontal: true,
            level: 0
        }))
        this.ground = this.r(this.world.createLine({
            x: -3, y: -3,
            size: 2,
            isHorizontal: false,
            level: 0
        }))
        this.ground = this.r(this.world.createLine({
            x: 3, y: 0,
            size: 2,
            isHorizontal: true,
            side: "up",
            level: 0
        }))
        this.ground = this.r(this.world.createLine({
            x: -3, y: 0,
            size: 2,
            isHorizontal: false,
            side: "left",
            level: 0
        }))
        this.ground = this.r(this.world.createLine({
            x: 3, y: 3,
            size: 2,
            isHorizontal: true,
            side: "down",
            level: 0
        }))
        this.ground = this.r(this.world.createLine({
            x: -3, y: 3,
            size: 2,
            isHorizontal: false,
            side: "right",
            level: 0
        }))
        this.ground.name = "ground"

        input(this, this.rect, false)
    }

    update(time: number, delta: number) {
        follow(this, this.rect, time, delta)
        update(this.rect, time, delta, 5)
    }
}

class Script5 extends Script {

    ground: Entity
    rect: Entity

    init() {
        this.world.setLayerRule("rect", "ground1", LayerCollision.ALWAYS)
        this.world.setLayerRule("rect", "ground2", LayerCollision.UNEQUAL_GROUP)
        this.world.setLayerRule("rect", "ground3", LayerCollision.EQUAL_GROUP)
        this.world.setLayerRule("rect", "ground4", LayerCollision.NEVER)
        this.rect = this.r(this.world.createRect({
            x: 0, y: 2,
            width: 1, height: 1,
            layer: "rect",
            layerGroup: 1,
            level: 1
        }))
        this.rect.name = "rect"

        this.r(this.world.createRect({
            x: -3, y: 0,
            width: 1, height: 1,
            layer: "ground1", layerGroup: 1,
            level: 0
        })).name = "always:1"
        this.r(this.world.createRect({
            x: 0, y: 0,
            width: 1, height: 1,
            layer: "ground2", layerGroup: 1,
            level: 0
        })).name = "unequal:1"
        this.r(this.world.createRect({
            x: 3, y: 0,
            width: 1, height: 1,
            layer: "ground3", layerGroup: 1,
            level: 0
        })).name = "equal:1"
        this.r(this.world.createRect({
            x: 6, y: 0,
            width: 1, height: 1,
            layer: "ground4", layerGroup: 1,
            level: 0
        })).name = "never:1"

        this.r(this.world.createRect({
            x: -3, y: -3,
            width: 1, height: 1,
            layer: "ground1", layerGroup: 2,
            level: 0
        })).name = "always:2"
        this.r(this.world.createRect({
            x: 0, y: -3,
            width: 1, height: 1,
            layer: "ground2", layerGroup: 2,
            level: 0
        })).name = "unequal:2"
        this.r(this.world.createRect({
            x: 3, y: -3,
            width: 1, height: 1,
            layer: "ground3", layerGroup: 2,
            level: 0
        })).name = "equal:2"
        this.r(this.world.createRect({
            x: 6, y: -3,
            width: 1, height: 1,
            layer: "ground4", layerGroup: 2,
            level: 0
        })).name = "never:2"

        input(this, this.rect, false)
    }

    update(time: number, delta: number) {
        follow(this, this.rect, time, delta)
        update(this.rect, time, delta, 5)
    }
}

export const SimulScript1 = { id: "SimulScript1", name: "Test 1: Free move rect on rect", description: "Move: ZQSD", script: () => new Script1() } as ScriptDescriptor
export const SimulScript2 = { id: "SimulScript2", name: "Test 2: Corner test", description: null, script: () => new Script2() } as ScriptDescriptor
export const SimulScript3 = { id: "SimulScript3", name: "Test 3: Free move rect on moving rect", description: "Move: ZQSD", script: () => new Script3() } as ScriptDescriptor
export const SimulScript4 = { id: "SimulScript4", name: "Test 4: Free move rect on line", description: "Move: ZQSD", script: () => new Script4() } as ScriptDescriptor
export const SimulScript5 = { id: "SimulScript5", name: "Test 5: Layers and Layer groups", description: "Move: ZQSD", script: () => new Script5() } as ScriptDescriptor