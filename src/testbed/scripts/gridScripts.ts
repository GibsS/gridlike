import { Script } from '../script'
import { Testbed } from '../'
import { Entity, Grid } from '../../lib'

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

export const GridScript4 = { name: "Script4", script: () => new Script4() }