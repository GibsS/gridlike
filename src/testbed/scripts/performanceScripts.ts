import * as _ from 'lodash'

import { Script, ScriptDescriptor } from '../script'
import { Testbed } from '../'
import { Entity, Grid, Body } from '../../lib'

class Script1 extends Script {

    width = 10
    height = 10
    rects: Entity[][]
    phase: number[][]

    init() {
        this.rects = []
        this.phase = []
        for(let i = 0; i < this.width; i++) {
            this.rects[i] = []
            this.phase[i] = []
            for(let j = 0; j < this.height; j++) {
                this.phase[i][j] = Math.random() * 3
                this.rects[i][j] = this.r(this.world.createRect({
                    x: i * 3,
                    y: j * 3,
                    width: 1,
                    height: 1,
                    level: Math.floor(Math.random() * 6)
                }))
            }
        }
    }

    update(time: number, delta: number) {
        for(let i = 0; i < this.width; i++) {
            for(let j = 0; j < this.height; j++) {
                this.rects[i][j].vy = 0.7 * Math.sin(this.phase[i][j] + time)
            }
        }
    }
}

export const PerformanceScript1 = { id: "PerformanceScript1", name: "Performance 1", description: null, script: () => new Script1() } as ScriptDescriptor
