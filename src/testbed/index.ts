import * as _ from 'lodash'

import { Script } from './script'
import TestScript from './scripts/script1'

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

    bodies: Body[]

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
                this.world.simulate(time - this.lastUpdate)
                this.script.update(time, time - this.lastUpdate)
                this.lastUpdate = time

                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

                let bx = -this.xCam * this.zoom + this.canvas.width/2
                let by = this.yCam * this.zoom + this.canvas.height/2
                for(let body of this.bodies) {
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
                            //console.log(body.globaly)
                            if(body instanceof Line) {
                                if(body.isHorizontal) {
                                    this.ctx.beginPath()
                                    this.ctx.moveTo((body.globalx - body.size/2) * this.zoom + bx,
                                                    -body.globaly * this.zoom + by)
                                    this.ctx.lineTo((body.globalx + body.size/2) * this.zoom + bx,
                                                    -body.globaly * this.zoom + by)
                                    this.ctx.stroke()
                                } else {
                                    this.ctx.beginPath()
                                    this.ctx.moveTo(body.globalx * this.zoom + bx,
                                                    (body.size/2 - body.globaly) * this.zoom + by)
                                    this.ctx.lineTo(body.globalx * this.zoom + bx,
                                                    (-body.size/2 - body.globaly ) * this.zoom + by)
                                    this.ctx.stroke()
                                }
                            }
                            break
                        }
                        case BodyType.GRID: {

                            break
                        }
                    }
                }

                this._update()
            })
        }
    }
    stop() {
        this.script = null
        this.world = null
        this.bodies = []
    }

    registerEntity(entity: Entity) {
        this.bodies = _.union(this.bodies, entity.bodies)
    }
}

let testbed = new Testbed()
testbed.addScript(TestScript.name, TestScript.script)
testbed.start(TestScript.name)
