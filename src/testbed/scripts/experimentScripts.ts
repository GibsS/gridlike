import * as _ from 'lodash'

import { Script, ScriptDescriptor } from '../script'
import { Testbed } from '../'
import { Entity, Grid, Body, LayerCollisionRule, EntityListener, BLOCK_TILE, UP_ONEWAY, DOWN_ONEWAY, LEFT_ONEWAY, RIGHT_ONEWAY } from '../../lib'

import * as fixSpeed from '../controllers/fixSpeedController'
import * as charController from '../controllers/characterController'
import * as forceController from '../controllers/forceAndDragController'
import { follow } from '../controllers/cameraController'

class Script1 extends Script {

    rect: Entity
    ground: Entity

    level: number = 2

    currentGrid: Grid

    blockType = 1

    init() {
        this.rect = this.world.createRect({
            x: 0,
            y: 0,
            width: 1,
            height: 1,
            level: 1000
        })

        this.ground = this.world.createGrid({
            x: 0, y: 0,
            level: 0,
            width: 100, height: 100
        })
        let grid = this.ground.body as Grid

        grid.setBlockShape(-2, -2, 1)
        grid.setBlockShape(-1, -2, 1)
        grid.setBlockShape(0, -2, 1)
        grid.setBlockShape(1, -2, 1)
        grid.setBlockShape(2, -2, 1)

        grid = this.world.createGrid({
            x: -6, y: 0,
            level: 1,
            width: 80, height: 80
        }).body as Grid

        grid.setBlockShape(-2, 0, 1)
        grid.setBlockShape(-1, 0, 1)
        grid.setBlockShape(0, 0, 1)
        grid.setBlockShape(1, 0, 1)
        grid.setBlockShape(2, 0, 1)

        charController.input(this, this.rect)
        this.keyDown('a', () => {
            grid = this.world.createGrid({
                x: this.rect.globalx, y: this.rect.globaly + 5,
                level: this.level,
                width: 80, height: 80
            }).body as Grid
            
            this.level++

            grid.setBlockShape(-2, 0, 1)
            grid.setBlockShape(-1, 0, 1)
            grid.setBlockShape(0, 0, 1)
            grid.setBlockShape(1, 0, 1)
            grid.setBlockShape(2, 0, 1)
        })

        forceController.input(this, grid.entity, false, 'f', 'h', 't', 'g')

        this.keyDown('w', () => { this.blockType = 1; this.log("place blocks"); })
        this.keyDown('x', () => { this.blockType = UP_ONEWAY; this.log("place up facing lines"); })
        this.keyDown('c', () => { this.blockType = DOWN_ONEWAY; this.log("place down facing lines"); })
        this.keyDown('v', () => { this.blockType = LEFT_ONEWAY; this.log("place left facing lines"); })
        this.keyDown('b', () => { this.blockType = RIGHT_ONEWAY; this.log("place right facing lines"); })
    }

    update(time: number, delta: number) {
        charController.update(this.rect, time, delta, 5)
        follow(this, this.rect, time, delta)

        if(this.currentGrid) {
            forceController.input(this, this.currentGrid.entity, false, 'f', 'h', 't', 'g')
            forceController.update(this.currentGrid.entity, time, delta, 5)
        }

        if(this.rect.parent) {
            this.currentGrid = this.rect.parent.body as Grid
        }
    }
    click(x: number, y: number, body: Body) {
        if(this.currentGrid) {
            let point = this.currentGrid.globalToBlock(x, y)
            let shape = this.currentGrid.getBlockShape(point.x, point.y)
            if(shape) {
                this.currentGrid.setBlockShape(point.x, point.y, 0)
            } else {
                this.currentGrid.setBlockShape(point.x, point.y, this.blockType)
            }
        }
    }
}

class Script2 extends Script {

    ground: Entity
    rect: Entity

    movingPlatforms: Entity[]
    phase: number[]
    speed: number[]
    period: number[]
    orientation: boolean[]

    init() {
        this.rect = this.world.createRect({
            x: 0,
            y: 0,
            width: 1,
            height: 1,
            level: 1000
        })

        this.ground = this.world.createEntity({
            x: 0, y: -10,
            level: 0
        })
        for(let i = 0; i < 4000; i++) {
            let res = Math.random() * 24
            if (res < 15) {
                this.ground.createLine({
                    x: (Math.random() * 2 - 1) * 4000,
                    y: (Math.random() / 2 - 1) * 8,
                    size: Math.random() * 5 + 1,
                    isHorizontal: true,
                    side: "up"
                })
            } else if(res < 19) {
                this.ground.createRect({
                    x: (Math.random() * 2 - 1) * 4000,
                    y: (Math.random() / 2 - 1) * 8,
                    width: Math.random() * 5 + 1,
                    height: Math.random() * 5 + 1,
                    isSensor: res < 17
                })
            } else {
                this.ground.createLine({
                    x: (Math.random() * 2 - 1) * 4000,
                    y: (Math.random() / 2 - 1) * 8,
                    size: Math.random() * 3 + 1,
                    isHorizontal: false,
                    side: res < 19 ? "left" : "right"
                })
            }
        }

        this.movingPlatforms = []
        this.phase = []
        this.speed = []
        this.period = []
        this.orientation = []
        for(let i = 0; i < 40; i++) {
            this.movingPlatforms.push(this.world.createEntity({
                x: Math.random() * 500 - 250,
                y: Math.random() * 10 - 10,
                level: i
            }))

            this.phase.push(Math.random() * 2)
            this.speed.push(Math.random() * 10 + 1)
            this.period.push(Math.random() * 3);
            this.orientation.push(Math.random() > 0.7);

            this.movingPlatforms[i].createRect({
                x: 0, y: 0,
                width: Math.random() * 4 + 1,
                height: 0.5
            })
        }

        charController.input(this, this.rect)
    }

    update(time: number, delta: number) {
        charController.update(this.rect, time, delta, 5)
        follow(this, this.rect, time, delta)

        for(let i = 0, len = this.movingPlatforms.length; i < len; i++) {
            this.movingPlatforms[i].vx = this.orientation[i] ? 0 : Math.sin(this.phase[i] + time / this.period[i]) * this.speed[i]
            this.movingPlatforms[i].vy = this.orientation[i] ? Math.sin(this.phase[i] + time / this.period[i]) * this.speed[i] : 0
        }
    }
}

class Script3 extends Script {

    ground: Entity
    rect: Entity
    arrows: Entity[]

    init() {
        this.arrows = []

        //this.world.setLayerRule("character", "ground", "always")
        this.world.setLayerRule("character", "arrow", "never")
        // this.world.setLayerRule("arrow", "ground", "always")

        this.rect = this.world.createRect({
            x: 0, y: 0,
            width: 1,
            height: 1.5,
            level: 1,
            layer: "character"
        })

        this.ground = this.world.createEntity({
            x: 0, y: 0, level: 0
        })

        for(let i = 0; i < 4000; i++) {
            this.ground.createRect({
                x: Math.random() * 1000 - 500, y: Math.random() * 10 - 10,
                width: 1, height: 1,
                layer: "ground"
            })
        }

        charController.input(this, this.rect)
    }
    update(time: number, delta: number) {
        charController.update(this.rect, time, delta, 5)

        for(let arrow of this.arrows) {
            arrow.vy -= 10 * delta
        }
    }
    click(x: number, y: number, body: Body) {
        let arrow = this.world.createRect({
            x: this.rect.x, y: this.rect.y, 
            width: 0.2, height: 0.2,
            level: 1,
            layer: "arrow"
        })
        let dx = (x - this.rect.x), dy = (y - this.rect.y), n = Math.sqrt(dx * dx + dy * dy)
        arrow.vx = 10 * dx / n
        arrow.vy = 10 * dy / n
        arrow.listener = this
        this.arrows.push(arrow)
    }
    contactStart(body: Body, otherBody: Body, side: string) {
        this.arrows.splice(this.arrows.indexOf(body.entity), 1)
        otherBody.entity.removeBody(otherBody)
        body.entity.destroy()
    }
}

export const ExperimentScript1 = {
    id: "Experiment1", 
    category: "Experiment", 
    name: "Experiment 1: Grids and more grids", 
    description: "Move character: ZQSD\nMove grids: TFGH\nCreate grid: A\nChoose to place block: W\nChoose to place oneway lines: XCVB", 
    script: () => new Script1() 
} as ScriptDescriptor
export const ExperimentScript2 = {
    id: "Experiment2", 
    category: "Experiment", 
    name: "Experiment 2: Large world with one character", 
    description: "Move character ZQSD\nblue bodies are sensors,\nclick on show contacts to see\nthe overlap with sensors", 
    script: () => new Script2() 
} as ScriptDescriptor
export const ExperimentScript3 = {
    id: "Experiment3",
    category: "Experiment",
    name: "Experiment 3: The square with a hypothetical bow", 
    description: "Move character: ZQSD\nShoot arrow: click",
    script: () => new Script3()
}