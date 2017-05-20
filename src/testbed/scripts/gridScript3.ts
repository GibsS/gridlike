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
            width: 50,
            height: 50
        }))
        this.grid = entity.body as Grid

        var t0, t1
        t0 = performance.now()
        
        var clearTotal = 0,
            total = 0,
            it = 100000

        t1 = performance.now()
        console.log("ref:", t1 - t0)

        for(let i = 0; i < it; i++) {
            t0 = performance.now()
            this.grid.clearTile(0, 0)
            t1 = performance.now()
            
            clearTotal += t1 - t0
            t0 = performance.now()
            this.grid.setTile(0, 0, 1, { foo: "test" })
            t1 = performance.now()
            
            total += t1 - t0
        }

        t0 = performance.now()
        t1 = performance.now()
        console.log("ref:", t1 - t0)

        console.log("clear total:", clearTotal, "avg:", clearTotal/it)
        console.log("set total:", total, "avg:", total/it)
        // for(let i = 0; i < 40; i++) {
        //     t0 = performance.now()

        //     this.grid.setTileShape(40-i, 0, 1)

        //     t1 = performance.now()
        //     console.log((t1 - t0) + " milliseconds.")
        // }
    }
    update(time: number, delta: number) {
        //console.log(this.line.globalx, this.line.globaly, this.rect.globalx, this.rect.globaly)
    }
}

export default { id: "GridScript3", name: "Grid script 3", script: () => new TestScript() } as ScriptDescriptor