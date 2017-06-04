import * as _ from 'lodash'

import { Script, ScriptDescriptor } from '../script'
import { Testbed } from '../'
import { Entity, Grid, Body, LEFT_ONEWAY, RIGHT_ONEWAY, UP_ONEWAY, DOWN_ONEWAY } from '../../lib'

class Script1 extends Script {

    rect: Entity
    line: Entity

    grid: Grid

    init() {
        let entity = this.r(this.world.createGrid({
            x: 0,
            y: 0,
            width: 200,
            height: 50
        }))
        this.grid = entity.body as Grid

        this.grid.setTile(0, 0, 1, null)
        this.grid.setTile(0, 1, 1, null)
        this.grid.setTile(1, 1, 1, null)

        for(let i = -10; i <= -1; i++) {
            for(let j = -10; j <= -1; j++) {
                this.grid.setTileShape(j, i, 1)
            }
        }
        
        for(let i = -9; i <= -2; i++) {
            for(let j = -9; j <= -2; j++) {
                this.grid.clearTileShape(i, j)
            }
        }
        this.testbed.xCam = 0
        this.testbed.yCam = 0
    }
    update(time: number, delta: number) {
        
    }
}

class Script2 extends Script {

    rect: Entity
    line: Entity

    grid: Grid

    init() {
        let entity = this.r(this.world.createGrid({
            x: 0,
            y: 0,
            width: 10,
            height: 10
        }))
        this.grid = entity.body as Grid

        this.grid.setTileShape(0, 0, 1)
        this.grid.setTileShape(1, 0, 1)
        this.grid.setTileShape(2, 0, 1)
        this.grid.setTileShape(3, 0, 1)
        this.grid.setTileShape(4, 0, 1)

        this.grid.setTileShape(1, 1, 1)
        
        this.grid.setTileShape(-2, 0, 1)
        this.grid.setTileShape(-2, 1, 1)
        this.grid.setTileShape(-2, 2, 1)
        this.grid.setTileShape(-2, 3, 1)
        this.grid.setTileShape(-2, 4, 1)

        this.grid.setTileShape(-1, 1, 1)
    }
    update(time: number, delta: number) {
        //console.log(this.line.globalx, this.line.globaly, this.rect.globalx, this.rect.globaly)
    }
}

class Script3 extends Script {

    rect: Entity
    line: Entity

    grid: Grid

    init() {
        let entity = this.r(this.world.createGrid({
            x: 5,
            y: 5,
            width: 20,
            height: 50
        }))
        entity.name = "grid"
        this.grid = entity.body as Grid
        
        for(let i = -300; i <= 300; i++) {
            if(i % 10 == 0) {
                this.grid.setTileShape(i, 1, 1)
            }
            this.grid.setTileShape(i, 0, 1)
        }
    }
    update(time: number, delta: number) {
        
    }
}

class Script4 extends Script {

    rect: Entity
    line: Entity

    grid: Grid

    init() {
        let entity = this.r(this.world.createGrid({
            x: 0,
            y: 0,
            tiles: {
                x: -5,
                y: -5,
                info: _.range(0, 10).map(i => _.range(0, 10).map(j => 1))
            }
        }))
        entity.name = "grid"
        this.grid = entity.body as Grid

        this.grid.clearTiles({ x: -2, y: -2, width: 4, height: 4 })

        this.grid.clearTiles([{ x: -4, y: -3}, { x: 3, y: 3}])
        this.grid.setTileShape(2, 3, 1)

        this.grid.setTileShape(0, 3, 4)

        this.grid.setTileShape(0, 7, 3)
        this.grid.setTileShape(-1, 7, 2)

        this.rect = this.r(this.world.createRect({
            x: 4,
            y: 3,
            width: 1,
            height: 1
        }))
    }
    update(time: number, delta: number) {
        
    }
    click(x: number, y: number, body: Body) {
        
    }
}

class Script5 extends Script {
    grid: Grid

    init() {
        let entity = this.r(this.world.createGrid({
            x: 0,
            y: 0,
            width: 10,
            height: 10
        }))
        this.grid = entity.body as Grid

        for(let i = 0; i < 6; i++) {
            for(let j = 0; j < 6; j++) {
                this.grid.setTile(j, i, 1, null)
            }
        }
        this.grid.setTileShape(-2, 0, UP_ONEWAY)
        this.grid.setTileShape(-2, 1, LEFT_ONEWAY)
        this.grid.setTileShape(-2, 2, RIGHT_ONEWAY)
        this.grid.setTileShape(-2, 3, DOWN_ONEWAY)
        this.grid.setTileShape(-1, 3, DOWN_ONEWAY)
        this.grid.setTileShape(-3, 3, DOWN_ONEWAY)
        this.grid.setTileShape(-2, 3, RIGHT_ONEWAY)
    }
    update(time: number, delta: number) {
        
    }
}

export const GridScript1 = { id: "GridScript1", category: "Grid generation", name: "Grid script 1", description: null, script: () => new Script1() } as ScriptDescriptor
export const GridScript2 = { id: "GridScript2", category: "Grid generation", name: "Grid script 2", description: null, script: () => new Script2() } as ScriptDescriptor
export const GridScript3 = { id: "GridScript3", category: "Grid generation", name: "Grid script 3", description: null, script: () => new Script3() } as ScriptDescriptor
export const GridScript4 = { id: "GridScript4", category: "Grid generation", name: "Grid script 4", description: null, script: () => new Script4() } as ScriptDescriptor
export const GridScript5 = { id: "GridScript5", category: "Grid generation", name: "Grid script 5", description: null, script: () => new Script5() } as ScriptDescriptor