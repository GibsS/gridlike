import * as _ from 'lodash'

import { Script, ScriptDescriptor } from '../script'
import { Testbed } from '../'
import { Entity, Grid, Body } from '../../lib'

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
        // this.ground = this.r(this.world.createRect({
        //     x: 3, y: 0,
        //     width: 1,
        //     height: 6,
        //     level: 0
        // }))
        this.ground.name = "ground"

        this.keyDown('q', () => { this.moveLeft = !this.moveLeft; this.moveRight = !this.moveLeft })
        // this.keyUp('q', () => { this.moveLeft = false })
        this.keyDown('d', () => { this.moveRight = !this.moveRight; this.moveLeft = !this.moveRight })
        // this.keyUp('d', () => { this.moveRight = false })

        this.keyDown('z', () => { this.moveUp = !this.moveUp; this.moveDown = !this.moveUp })
        // this.keyUp('z', () => { this.moveUp = false })
        this.keyDown('s', () => { this.moveDown = !this.moveDown; this.moveUp = !this.moveDown })
        // this.keyUp('s', () => { this.moveDown = false })
    }

    update(time: number, delta: number) {
        console.log(this.rect._downLower)
        this.ground.vy = 0.2
        if(this.moveLeft && !this.moveRight) {
            this.rect.vx = -1
        } else if(this.moveRight && !this.moveLeft) {
            this.rect.vx = 1
        } else {
            this.rect.vx = 0
        }

        if(this.moveDown && !this.moveUp) {
            this.rect.vy = -1
        } else if(this.moveUp && !this.moveDown) {
            this.rect.vy = 1
        } else {
            this.rect.vy = 0
        }
    }
}

export const SimulScript1 = { id: "SimulScript1", name: "Simulation script 1", description: "Move: ZQSD", script: () => new Script1() } as ScriptDescriptor