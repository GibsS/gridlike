import * as _ from 'lodash'
import * as mousetrap from 'mousetrap'

import { Script, ScriptDescriptor } from './script'

import { World, Entity, Body, BodyType, Rect, Line, Grid } from '../lib'

export class Testbed {

    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D

    scripts: Map<string, ScriptDescriptor>

    scriptDescriptor: ScriptDescriptor
    script: Script
    world: World

    lastUpdate: number

    xCam: number
    yCam: number
    zoom: number

    entities: Entity[]

    _play: boolean
    _request: number

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

    // OPTIONS
    _showEntityInfo: boolean
    _showBodyInfo: boolean

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

        this.scripts = new Map<string, ScriptDescriptor>()

        window.onresize = (e) => {
            this.canvas.width = this.canvas.offsetWidth
            this.canvas.height = this.canvas.offsetHeight
        }

        // KEY INPUT
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

        // BUTTONS 
        let playBtn = document.getElementById("play-btn"),
            stepBtn = document.getElementById("step-btn"),
            resetBtn = document.getElementById("reset-btn")

        playBtn.onclick = () => { 
            if(this._play) {
                this.pause()
                playBtn.innerText = "Play"
            } else {
                this.resume()
                playBtn.innerText = "Pause"
            }
        }
        stepBtn.onclick = () => {
            if(!this._play && this.script) {
                this.step(0.016, true)
            }
        }
        resetBtn.onclick = () => {
            if(this.scriptDescriptor != null) {
                this.start(this.scriptDescriptor.id)
            }
        }
    }

    addScript(script: ScriptDescriptor) {
        this.scripts.set(script.id, script)
    }
    start(script: string) {
        if(script != null) {
            this.stop()
        }
        
        this.scriptDescriptor = this.scripts.get(script)
        this.script = this.scriptDescriptor.script()
        this.world = new World()
        this.script._world = this.world
        this.script._testbed = this
        this.lastUpdate = new Date().getTime()

        this._play = true

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
    resume() {
        this._play = true
        this.lastUpdate = new Date().getTime()
        this._update()
    }
    pause() {
        this._play = false
        if(this._request != null) {
            cancelAnimationFrame(this._request)
        }
    }
    stop() {
        this.script = null
        this._play = false
        this.world = null
        this.entities = []
        if(this._request != null) {
            cancelAnimationFrame(this._request)
        }
    }
    _update() {
        if(this.script != null && this._play) {
            this._request = requestAnimationFrame(() => {
                let time = new Date().getTime()

                this.step((time - this.lastUpdate) / 1000, false)

                this.lastUpdate = time

                this._update()
            })
        }
    }
    step(delta: number, updateTimes: boolean) {
        let t0 = performance.now()
        this.world.simulate(delta)
        let t1 = performance.now()
        this.script.update(this.world.time, delta)
        let t2 = performance.now()

        this._draw()

        let t3 = performance.now()

        this._physicsTotal += t1 - t0
        this._logicTotal += t2 - t1
        this._displayTotal += t3 - t2

        this._step += 1
        this._frameStep += 1

        if(updateTimes) {
            this._avgPhysicTime = t1 - t0
            this._avgDisplayTime = t3 - t2
            this._avgLogicTime = t2 - t1
        } else if(this.world.time - this._lastUpdateTime > 1) {
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
    }
    _draw() {
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
        this.ctx.fillText("Step: " + this._step, 10, this.canvas.offsetHeight - 90)
        this.ctx.fillText("World time: " + this.world.time.toFixed(1), 10, this.canvas.offsetHeight - 110)
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