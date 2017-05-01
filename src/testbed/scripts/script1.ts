import { Script } from '../script'
import { Testbed } from '../'
import { Entity } from '../../lib'

class TestScript extends Script {

    rect: Entity
    line: Entity

    init() {
        this.rect = this.world.createRect({
            x: -1,
            y: -1,
            width: 1,
            height: 1
        })
        this.testbed.registerEntity(this.rect)

        this.line = this.world.createLine({
            x: -1,
            y: 0,
            isHorizontal: true,
            size: 1
        })
        this.testbed.registerEntity(this.line)
    }
    update(time: number, delta: number) {
        //console.log(this.line.globalx, this.line.globaly, this.rect.globalx, this.rect.globaly)
    }
}

export default { name: "TestScript", script: () => new TestScript() }