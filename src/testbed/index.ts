import * as _ from 'lodash'
import * as mousetrap from 'mousetrap'

import { Script, ScriptDescriptor } from './script'

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

    _step: number
    _frameStep: number
    _lastUpdateTime: number

    _displayTotal: number
    _logicTotal: number
    _physicsTotal: number

    // STATS
    _avgDisplayTime: number
    _avgLogicTime: number
    _avgPhysicTime: number
    _fps: number

    constructor() {
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement
        this.ctx = this.canvas.getContext('2d')

        let dpr = window.devicePixelRatio || 1,
            bsr = (this.ctx as any).webkitBackingStorePixelRatio ||
                  (this.ctx as any).mozBackingStorePixelRatio ||
                  (this.ctx as any).msBackingStorePixelRatio ||
                  (this.ctx as any).oBackingStorePixelRatio ||
                  (this.ctx as any).backingStorePixelRatio || 1,
            ratio = dpr/bsr
        
        this.canvas.width = this.canvas.offsetWidth
        this.canvas.height = this.canvas.offsetHeight

        this.scripts = new Map<string, (() => Script)>()

        window.onresize = (e) => {
            this.canvas.width = this.canvas.offsetWidth
            this.canvas.height = this.canvas.offsetHeight
        }

        mousetrap.bind('j', () => {
            this.xCam -= 0.1
        })
        mousetrap.bind('l', () => {
            this.xCam += 0.1
        })
        mousetrap.bind('k', () => {
            this.yCam -= 0.1
        })
        mousetrap.bind('i', () => {
            this.yCam += 0.1
        })
        mousetrap.bind('u', () => {
            this.zoom += 2
        })
        mousetrap.bind('o', () => {
            this.zoom = Math.max(0, this.zoom - 2)
        })
    }

    addScript(script: ScriptDescriptor) {
        console.log(script)
        this.scripts.set(script.id, script.script)
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

        this._step = 0
        this._frameStep = 0
        this._lastUpdateTime = 0

        this._displayTotal = 0
        this._logicTotal = 0
        this._physicsTotal = 0

        // STATS
        this._avgDisplayTime = 0
        this._avgLogicTime = 0
        this._avgPhysicTime = 0
        this._fps = 0

        this.script.init()
        this._update()
    }
    _update() {
        if(this.script != null) {
            requestAnimationFrame(() => {
                let t0 = performance.now()
                
                let time = new Date().getTime()
                this.world.simulate((time - this.lastUpdate)/1000)
                this.script.update(time, (time - this.lastUpdate)/1000)
                this.lastUpdate = time

                let t1 = performance.now()

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
                        }
                    })
                }
                this.ctx.font="Arial 15px";
                this.ctx.fillText("Physic (time/step): " + this._avgPhysicTime.toFixed(3), 10, this.canvas.offsetHeight - 10)
                this.ctx.fillText("Display (time/step): " + this._avgDisplayTime.toFixed(3), 10, this.canvas.offsetHeight - 30)
                this.ctx.fillText("Logic (time/step): " + this._avgLogicTime.toFixed(3), 10, this.canvas.offsetHeight - 50)
                this.ctx.fillText("FPS: " + this._fps, 10, this.canvas.offsetHeight - 70)

                let t2 = performance.now()

                this._update()

                let t3 = performance.now()

                this._physicsTotal += t1 - t0
                this._displayTotal += t2 - t1
                this._logicTotal += t3 - t2

                this._step += 1
                this._frameStep += 1

                if(this.world.time - this._lastUpdateTime > 1) {
                    this._avgPhysicTime = (this._physicsTotal/this._frameStep)
                    this._avgDisplayTime = (this._displayTotal/this._frameStep)
                    this._avgLogicTime = (this._logicTotal/this._frameStep)

                    this._physicsTotal = 0
                    this._displayTotal = 0
                    this._logicTotal = 0
                    
                    this._fps = this._frameStep
                    this._frameStep = 0
                    this._lastUpdateTime = this.world.time
                }
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

window.onload = () => {
    let testbed = new Testbed()

    testbed.addScript(TestScript)
    testbed.addScript(GridScript1)
    testbed.addScript(GridScript2)
    testbed.addScript(GridScript3)
    testbed.addScript(GridScript4)
    testbed.addScript(GridScript5)

    testbed.start(GridScript5.id)
}