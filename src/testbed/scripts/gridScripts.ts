import * as _ from 'lodash'

import { Script, ScriptDescriptor } from '../script'
import { Testbed } from '../'
import { Entity, Grid, Body } from '../../lib'

class Script4 extends Script {

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
        this.testbed.xCam += delta * 10
        //console.log(this.line.globalx, this.line.globaly, this.rect.globalx, this.rect.globaly)
    }
}

class Script5 extends Script {

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

        let contact = {
            body1: this.rect.body,
            body2: this.grid,
            isHorizontal: true
        }
        this.rect._leftLower = contact
        this.grid._higherContacts = [contact]

        // for(let i = -300; i <= 300; i++) {
        //     if(i % 10 == 0) {
        //         this.grid.setTileShape(i, 1, 1)
        //     }
        //     this.grid.setTileShape(i, 0, 1)
        // }
    }
    update(time: number, delta: number) {
        //this.rect.x += delta * 1
        // this.testbed.xCam += delta * 10
        //console.log(this.line.globalx, this.line.globaly, this.rect.globalx, this.rect.globaly)
    }
    click(x: number, y: number, body: Body) {
        console.log(x, y)
    }
}

export const GridScript4 = { id: "GridScript4", name: "Grid script 4", description: "Some description", script: () => new Script4() } as ScriptDescriptor
export const GridScript5 = { 
    id: "GridScript5",
    name: "Grid script 5", 
    description: "Some description\nA: Ok\nB: test\bntesttesttesttesttestesttestestestestestestestestestestestsetestestestse", 
    script: () => new Script5() 
} as ScriptDescriptor