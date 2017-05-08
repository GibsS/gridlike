import { Script } from '../script'
import { Testbed } from '../'
import { Entity, Grid } from '../../lib'

class TestScript extends Script {

    rect: Entity
    line: Entity

    grid: Grid

    init() {
        let entity = this.r(this.world.createGrid({
            x: 5,
            y: 5,
            width: 50,
            height: 50
        }))
        this.grid = entity.body as Grid

        this.grid.setTile(0, 0, 1, null)
        this.grid.setTile(0, 1, 1, null)
        this.grid.setTile(1, 1, 1, null)
        this.grid.clearTile(0, 1)
        this.grid.setTile(1, 0, 1, null)

        for(let i = -10; i <= -1; i++) {
            for(let j = -10; j <= -1; j++) {
                this.grid.setTileShape(i, j, 1)
            }
        }
        
        for(let i = -9; i <= -2; i++) {
            for(let j = -9; j <= -2; j++) {
                this.grid.clearTileShape(i, j)
            }
        }
        
        this.grid.setTileShape(-3, 0, 1)
        this.grid.setTileShape(-3, 1, 1)
        this.grid.setTileShape(-2, 1, 1)
        this.grid.clearTileShape(-3, 1)
        this.grid.setTileShape(-2, 0, 1)
        
        this.grid.setTileShape(-6, -1, 1)
    }
    update(time: number, delta: number) {
        //console.log(this.line.globalx, this.line.globaly, this.rect.globalx, this.rect.globaly)
    }
}

export default { name: "GridScript1", script: () => new TestScript() }