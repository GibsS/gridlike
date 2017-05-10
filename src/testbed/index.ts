import * as _ from 'lodash'

import { Script } from './script'

import { World, Entity, Body, BodyType, Rect, Line, Grid } from '../lib'

export class Testbed {

    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D

    scripts: Map<string, (() => Script)>

    script: Script
    world: World

    lastUpdate: number

    xCam: number
    yCam: number
    zoom: number

    entities: Entity[]

    constructor() {
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement
        this.canvas.width = 1000
        this.canvas.height = 600
        this.ctx = this.canvas.getContext('2d')

        this.scripts = new Map<string, (() => Script)>()
    }

    addScript(script: string, factory: () => Script) {
        this.scripts.set(script, factory)
    }
    start(script: string) {
        if(script != null) {
            this.stop()
        }
        
        this.script = this.scripts.get(script)()
        this.world = new World()
        this.script._world = this.world
        this.script._testbed = this
        this.lastUpdate = new Date().getTime()

        this.xCam = 0
        this.yCam = 0
        this.zoom = 40

        this.script.init()
        this._update()
    }
    _update() {
        if(this.script != null) {
            requestAnimationFrame(() => {
                let time = new Date().getTime()
                this.world.simulate((time - this.lastUpdate)/1000)
                this.script.update(time, (time - this.lastUpdate)/1000)
                this.lastUpdate = time

                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

                let bx = -this.xCam * this.zoom + this.canvas.width/2
                let by = this.yCam * this.zoom + this.canvas.height/2
                for(let entity of this.entities) {
                    entity._forBodies(body => {
                        switch(body.type) {
                            case BodyType.RECT: {
                                this.ctx.fillRect(
                                    (body.globalx - (body as Rect).width/2) * this.zoom + bx,
                                    (-(body as Rect).height/2 - body.globaly) * this.zoom + by,
                                    (body as Rect).width * this.zoom,
                                    (body as Rect).height * this.zoom
                                )
                                break
                            }
                            case BodyType.LINE: {
                                if(body instanceof Line) {
                                    if(body.isHorizontal) {
                                        this.ctx.beginPath()
                                        this.ctx.moveTo((body.globalx - body.size/2) * this.zoom + bx,
                                                        -body.globaly * this.zoom + by)
                                        this.ctx.lineTo((body.globalx + body.size/2) * this.zoom + bx,
                                                        -body.globaly * this.zoom + by)
                                        this.ctx.stroke()

                                        if(body.side == "up") {
                                            this.ctx.beginPath()
                                            this.ctx.moveTo((body.globalx - body.size/2) * this.zoom + bx + 5,
                                                            -body.globaly * this.zoom + by + 5)
                                            this.ctx.lineTo((body.globalx + body.size/2) * this.zoom + bx - 5,
                                                            -body.globaly * this.zoom + by + 5)
                                            this.ctx.stroke()
                                        } else if(body.side == "down") {
                                            this.ctx.beginPath()
                                            this.ctx.moveTo((body.globalx - body.size/2) * this.zoom + bx + 5,
                                                            -body.globaly * this.zoom + by - 5)
                                            this.ctx.lineTo((body.globalx + body.size/2) * this.zoom + bx - 5,
                                                            -body.globaly * this.zoom + by - 5)
                                            this.ctx.stroke()
                                        }
                                    } else {
                                        this.ctx.beginPath()
                                        this.ctx.moveTo(body.globalx * this.zoom + bx,
                                                        (body.size/2 - body.globaly) * this.zoom + by)
                                        this.ctx.lineTo(body.globalx * this.zoom + bx,
                                                        (-body.size/2 - body.globaly ) * this.zoom + by)
                                        this.ctx.stroke()

                                        if(body.side == "left") {
                                            this.ctx.beginPath()
                                            this.ctx.moveTo(body.globalx * this.zoom + bx + 5,
                                                            (body.size/2 - body.globaly) * this.zoom + by - 5)
                                            this.ctx.lineTo(body.globalx * this.zoom + bx + 5,
                                                            (-body.size/2 - body.globaly ) * this.zoom + by + 5)
                                            this.ctx.stroke()
                                        } else if(body.side == "right") {
                                            this.ctx.beginPath()
                                            this.ctx.moveTo(body.globalx * this.zoom + bx - 5,
                                                            (body.size/2 - body.globaly) * this.zoom + by - 5)
                                            this.ctx.lineTo(body.globalx * this.zoom + bx - 5,
                                                            (-body.size/2 - body.globaly ) * this.zoom + by + 5)
                                            this.ctx.stroke()
                                        }
                                    }
                                }
                                break
                            }
                            case BodyType.GRID: {

                                break
                            }
                        }
                    })
                }

                this._update()
            })
        }
    }
    stop() {
        this.script = null
        this.world = null
        this.entities = []
    }

    registerEntity(entity: Entity): Entity {
        if(this.entities.indexOf(entity) < 0) {
            this.entities.push(entity)
        }
        return entity
    }
}

import TestScript from './scripts/script1'
import GridScript1 from './scripts/gridScript1'
import GridScript2 from './scripts/gridScript2'
import GridScript3 from './scripts/gridScript3'
import { GridScript4, GridScript5 } from './scripts/gridScripts'

let testbed = new Testbed()
testbed.addScript(TestScript.name, TestScript.script)
testbed.addScript(GridScript1.name, GridScript1.script)
testbed.addScript(GridScript2.name, GridScript2.script)
testbed.addScript(GridScript3.name, GridScript3.script)
testbed.addScript(GridScript4.name, GridScript4.script)
testbed.addScript(GridScript5.name, GridScript5.script)
testbed.start(GridScript5.name)