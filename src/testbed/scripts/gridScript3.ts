import { Script } from '../script'
import { Testbed } from '../'
import { Entity, Grid } from '../../lib'

class TestScript extends Script {

    rect: Entity
    line: Entity

    grid: Grid

    init() {
        let entity = this.r(this.world.createGrid({
            x: 0,
            y: 0,
            width: 300,
            height: 300
        }))
        this.grid = entity.body as Grid

        console.time("grid1")
        this.grid.setTileShape(0, 0, 1)
        console.timeEnd("grid1")
        console.time("grid1")
        this.grid.setTileShape(0, 0, 1)
        console.timeEnd("grid1")
        console.time("grid1")
        this.grid.setTileShape(0, 0, 1)
        console.timeEnd("grid1")
        console.time("grid1")
        this.grid.setTileShape(0, 0, 1)
        console.timeEnd("grid1")
        console.time("grid1")
        this.grid.setTileShape(0, 0, 1)
        console.timeEnd("grid1")
    }
    update(time: number, delta: number) {
        //console.log(this.line.globalx, this.line.globaly, this.rect.globalx, this.rect.globaly)
    }
}

export default { name: "GridScript3", script: () => new TestScript() }