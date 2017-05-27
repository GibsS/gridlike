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
        this.ground.vx = 2 * Math.sin(time)
    }
}

class Script5 extends Script {

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

class Script6 extends Script {

    ground1: Entity
    ground2: Entity
    ground3: Entity
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

        this.ground1 = this.r(this.world.createRect({
            x: 0, y: 0,
            width: 4,
            height: 1,
            level: 0
        }))
        this.ground1.name = "ground1"
        this.ground2 = this.r(this.world.createRect({
            x: -2, y: 0,
            width: 1,
            height: 4,
            level: 0
        }))
        this.ground2.name = "ground2"
        this.ground3 = this.r(this.world.createLine({
            x: 2, y: 0,
            size: 1,
            isHorizontal: true,
            level: 0
        }))
        this.ground3.name = "ground3"

        input(this, this.rect, false)
    }

    update(time: number, delta: number) {
        follow(this, this.rect, time, delta)
        update(this.rect, time, delta, 5)
        this.ground3.vy = 3 * Math.sin(time)
    }
}

class Script7 extends Script {

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
            x: -1, y: -1,
            width: 4,
            height: 1,
            level: 0
        }))
        this.ground.createRect({
            x: -2, y: 0,
            width: 1,
            height: 4
        })
        this.ground.createLine({
            x: 2, y: 5,
            size: 1,
            isHorizontal: true
        })

        input(this, this.rect, false)
    }

    update(time: number, delta: number) {
        update(this.rect, time, delta, 5)

        if(time % 10 < 5) {
            this.ground.vx = 0
        } else {
            this.ground.vx = 2 * Math.sin(time/3)
        }
    }
}

export const SimulScript1 = { id: "SimulScript1", name: "Test 1: Free rect movement against single rect", description: "Move: ZQSD", script: () => new Script1() } as ScriptDescriptor
export const SimulScript2 = { id: "SimulScript2", name: "Test 2: Corner test", description: null, script: () => new Script2() } as ScriptDescriptor
export const SimulScript3 = { id: "SimulScript3", name: "Test 3: Free rect movement against single moving rect", description: "Move: ZQSD", script: () => new Script3() } as ScriptDescriptor
export const SimulScript4 = { id: "SimulScript4", name: "Test 4: Free rect movement against lines", description: "Move: ZQSD", script: () => new Script4() } as ScriptDescriptor
export const SimulScript5 = { id: "SimulScript5", name: "Test 5: Layers and layer groups", description: "Move: ZQSD", script: () => new Script5() } as ScriptDescriptor
export const SimulScript6 = { id: "SimulScript6", name: "Test 6: Free rect movement against several rects", description: "Move: ZQSD", script: () => new Script6() } as ScriptDescriptor
export const SimulScript7 = { id: "SimulScript7", name: "Test 7: Free rect movement against multi-body entity", description: "Move: ZQSD", script: () => new Script7() } as ScriptDescriptor