import * as _ from 'lodash'

import { Script, ScriptDescriptor } from '../script'
import { Testbed } from '../'
import { Entity, Grid, Body } from '../../lib'

class Script1 extends Script {

    width = 20
    height = 20
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
                    x: i * 4,
                    y: j * 4,
                    width: 1,
                    height: 1,
                    level: i + j * this.width + 1
                }))
            }
        }
    }

    update(time: number, delta: number) {
        for(let i = 0; i < this.width; i++) {
            for(let j = 0; j < this.height; j++) {
                this.rects[i][j].vy = 1.5 * Math.sin(this.phase[i][j] + time)
            }
        }
    }
}

export const PerformanceScript1 = { id: "PerformanceScript1", category: "Performance", name: "Performance 1", description: null, script: () => new Script1() } as ScriptDescriptor
