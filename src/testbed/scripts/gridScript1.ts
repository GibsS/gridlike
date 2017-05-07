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
            width: 10,
            height: 10
        }))
        this.grid = entity.body as Grid

        console.time("grid1")
        this.grid.setTile(0, 0, 1, null)
        this.grid.setTile(0, 1, 1, null)
        this.grid.setTile(1, 1, 1, null)
        this.grid.clearTile(0, 1)
        this.grid.setTile(1, 0, 1, null)
        console.timeEnd("grid1")

        console.time("grid2")
        for(let i = -10; i <= -1; i++) {
            for(let j = -10; j <= -1; j++) {
                this.grid.setTileShape(i, j, 1)
            }
        }
        console.timeEnd("grid2")

        console.time("grid3")
        for(let i = -9; i <= -2; i++) {
            for(let j = -9; j <= -2; j++) {
                this.grid.clearTileShape(i, j)
            }
        }
        console.timeEnd("grid3")
        
        console.time("grid4")
        this.grid.setTileShape(-3, 0, 1)
        this.grid.setTileShape(-3, 1, 1)
        this.grid.setTileShape(-2, 1, 1)
        this.grid.clearTileShape(-3, 1)
        this.grid.setTileShape(-2, 0, 1)
        console.timeEnd("grid4")

        console.time("grid5")
        this.grid.setTileShape(-6, -1, 1)
        console.timeEnd("grid5")
    }
    update(time: number, delta: number) {
        //console.log(this.line.globalx, this.line.globaly, this.rect.globalx, this.rect.globaly)
    }
}

export default { name: "GridScript1", script: () => new TestScript() }