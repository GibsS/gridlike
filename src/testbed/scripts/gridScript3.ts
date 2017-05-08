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
            width: 50,
            height: 50
        }))
        this.grid = entity.body as Grid

        var t0, t1
        for(let i = 0; i < 40; i++) {
            t0 = performance.now()

            this.grid.setTileShape(40-i, 0, 1)

            t1 = performance.now()
            console.log((t1 - t0) + " milliseconds.")
        }
    }
    update(time: number, delta: number) {
        //console.log(this.line.globalx, this.line.globaly, this.rect.globalx, this.rect.globaly)
    }
}

export default { name: "GridScript3", script: () => new TestScript() }