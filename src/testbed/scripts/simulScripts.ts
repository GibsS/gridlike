import * as _ from 'lodash'

import { Script, ScriptDescriptor } from '../script'
import { Testbed } from '../'
import { Entity, Grid, Body } from '../../lib'

import { input, update } from '../controllers/fixSpeedController'

class Script1 extends Script {

    ground: Entity
    rect: Entity

    moveLeft: boolean
    moveRight: boolean
    moveUp: boolean
    moveDown: boolean

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

    moveLeft: boolean
    moveRight: boolean
    moveUp: boolean
    moveDown: boolean

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

export const SimulScript1 = { id: "SimulScript1", name: "Simulation script 1", description: "Move: ZQSD", script: () => new Script1() } as ScriptDescriptor
export const SimulScript2 = { id: "SimulScript2", name: "Simulation script 2", description: null, script: () => new Script2() } as ScriptDescriptor
export const SimulScript3 = { id: "SimulScript3", name: "Simulation script 3", description: "Move: ZQSD", script: () => new Script3() } as ScriptDescriptor