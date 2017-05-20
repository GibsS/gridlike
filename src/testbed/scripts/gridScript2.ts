import { Script, ScriptDescriptor } from '../script'
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
        this.grid.setTileShape(0, 0, 1)
        this.grid.setTileShape(1, 0, 1)
        this.grid.setTileShape(2, 0, 1)
        this.grid.setTileShape(3, 0, 1)
        this.grid.setTileShape(4, 0, 1)

        this.grid.setTileShape(1, 1, 1)
        console.timeEnd("grid1")

        console.time("grid2")
        this.grid.setTileShape(-2, 0, 1)
        this.grid.setTileShape(-2, 1, 1)
        this.grid.setTileShape(-2, 2, 1)
        this.grid.setTileShape(-2, 3, 1)
        this.grid.setTileShape(-2, 4, 1)

        this.grid.setTileShape(-1, 1, 1)
        console.timeEnd("grid2")
    }
    update(time: number, delta: number) {
        //console.log(this.line.globalx, this.line.globaly, this.rect.globalx, this.rect.globaly)
    }
}

export default { id: "GridScript2", name: "Grid script 2", script: () => new TestScript() } as ScriptDescriptor