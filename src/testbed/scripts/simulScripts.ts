import * as _ from 'lodash'

import { Script, ScriptDescriptor } from '../script'
import { Testbed } from '../'
import { Entity, Grid, Body, LayerCollisionRule, EntityListener } from '../../lib'

import * as fixSpeed from '../controllers/fixSpeedController'
import * as charController from '../controllers/characterController'
import * as forceController from '../controllers/forceAndDragController'
import { follow } from '../controllers/cameraController'

class Script1 extends Script {

    ground: Entity
    rect: Entity

    init() {
        this.rect = this.world.createRect({
            x: 0,
            y: 2,
            width: 1,
            height: 1,
            level: 1
        })
        this.rect.name = "rect"

        this.ground = this.world.createRect({
            x: 0, y: 0,
            width: 4,
            height: 1,
            level: 0
        })
        this.ground.name = "ground"

        this.ground.x = 2

        fixSpeed.input(this, this.rect, false)
    }

    update(time: number, delta: number) {
        fixSpeed.update(this.rect, time, delta, 5)
    }
}

class Script2 extends Script {

    ground: Entity
    rect: Entity

    init() {
        this.rect = this.world.createRect({
            x: -1.001, y: -1,
            width: 1,
            height: 1,
            level: 1
        })
        this.rect.name = "rect"

        this.ground = this.world.createRect({
            x: 0, y: 0,
            width: 1,
            height: 1,
            level: 0
        })
        this.ground.name = "ground"
    }

    update(time: number, delta: number) {
        this.rect.vx = 2
        this.rect.vy = 2
    }
}

class Script3 extends Script {

    ground: Entity
    rect: Entity

    init() {
        this.rect = this.world.createRect({
            x: 0,
            y: 2,
            width: 1,
            height: 1,
            level: 1
        })
        this.rect.name = "rect"

        this.ground = this.world.createRect({
            x: 0, y: 0,
            width: 4,
            height: 1,
            level: 0
        })
        this.ground.name = "ground"

        fixSpeed.input(this, this.rect, true)
    }

    update(time: number, delta: number) {
        this.ground.vy = 2 * Math.sin(time)
        fixSpeed.update(this.rect, time, delta, 5)
    }
}

class Script4 extends Script {

    ground: Entity
    rect: Entity

    init() {
        this.rect = this.world.createRect({
            x: 0,
            y: 2,
            width: 1,
            height: 1,
            level: 1
        })
        this.rect.name = "rect"

        this.ground = this.world.createLine({
            x: 3, y: -3,
            size: 2,
            isHorizontal: true,
            level: 0
        })
        this.ground = this.world.createLine({
            x: -3, y: -3,
            size: 2,
            isHorizontal: false,
            level: 0
        })
        this.ground = this.world.createLine({
            x: 3, y: 0,
            size: 2,
            isHorizontal: true,
            side: "up",
            level: 0
        })
        this.ground = this.world.createLine({
            x: -3, y: 0,
            size: 2,
            isHorizontal: false,
            side: "left",
            level: 0
        })
        this.ground = this.world.createLine({
            x: 3, y: 3,
            size: 2,
            isHorizontal: true,
            side: "down",
            level: 0
        })
        this.ground = this.world.createLine({
            x: -3, y: 3,
            size: 2,
            isHorizontal: false,
            side: "right",
            level: 0
        })
        this.ground.name = "ground"

        fixSpeed.input(this, this.rect, false)
    }

    update(time: number, delta: number) {
        follow(this, this.rect, time, delta)
        fixSpeed.update(this.rect, time, delta, 5)
        this.ground.vx = 2 * Math.sin(time)
    }
}

class Script5 extends Script {

    rect: Entity

    init() {
        this.world.setLayerRule("rect", "ground1", LayerCollisionRule.ALWAYS)
        this.world.setLayerRule("rect", "ground2", LayerCollisionRule.UNEQUAL_GROUP)
        this.world.setLayerRule("rect", "ground3", LayerCollisionRule.EQUAL_GROUP)
        this.world.setLayerRule("rect", "ground4", LayerCollisionRule.NEVER)
        this.rect = this.world.createRect({
            x: 0, y: 2,
            width: 1, height: 1,
            layer: "rect",
            layerGroup: 1,
            level: 1
        })
        this.rect.name = "rect"

        this.world.createRect({
            x: -3, y: 0,
            width: 1, height: 1,
            layer: "ground1", layerGroup: 1,
            level: 0
        }).name = "always:1"
        this.world.createRect({
            x: 0, y: 0,
            width: 1, height: 1,
            layer: "ground2", layerGroup: 1,
            level: 0
        }).name = "unequal:1"
        this.world.createRect({
            x: 3, y: 0,
            width: 1, height: 1,
            layer: "ground3", layerGroup: 1,
            level: 0
        }).name = "equal:1"
        this.world.createRect({
            x: 6, y: 0,
            width: 1, height: 1,
            layer: "ground4", layerGroup: 1,
            level: 0
        }).name = "never:1"

        this.world.createRect({
            x: -3, y: -3,
            width: 1, height: 1,
            layer: "ground1", layerGroup: 2,
            level: 0
        }).name = "always:2"
        this.world.createRect({
            x: 0, y: -3,
            width: 1, height: 1,
            layer: "ground2", layerGroup: 2,
            level: 0
        }).name = "unequal:2"
        this.world.createRect({
            x: 3, y: -3,
            width: 1, height: 1,
            layer: "ground3", layerGroup: 2,
            level: 0
        }).name = "equal:2"
        this.world.createRect({
            x: 6, y: -3,
            width: 1, height: 1,
            layer: "ground4", layerGroup: 2,
            level: 0
        }).name = "never:2"

        fixSpeed.input(this, this.rect, false)
    }

    update(time: number, delta: number) {
        follow(this, this.rect, time, delta)
        fixSpeed.update(this.rect, time, delta, 5)
    }
}

class Script6 extends Script implements EntityListener {

    ground1: Entity
    ground2: Entity
    ground3: Entity
    ground4: Entity
    ground5: Entity
    rect: Entity

    init() {
        this.rect = this.world.createRect({
            x: 0,
            y: 4,
            width: 1,
            height: 1,
            level: 1
        })
        this.rect.name = "rect"

        this.ground1 = this.world.createRect({
            x: 0, y: 0,
            width: 4,
            height: 1,
            level: 0
        })
        this.ground1.name = "ground1"
        this.ground2 = this.world.createRect({
            x: -2, y: 0,
            width: 1,
            height: 4,
            level: 0
        })
        this.ground2.name = "ground2"
        this.ground3 = this.world.createLine({
            x: 2, y: 0,
            size: 1,
            isHorizontal: true,
            level: 0
        })
        this.ground3.name = "ground3"
        this.ground4 = this.world.createLine({
            x: 0, y: 2,
            size: 1,
            isHorizontal: true,
            level: 0
        })
        this.ground4.name = "ground4"
        this.ground5 = this.world.createRect({
            x: -6.5, y: 0,
            width: 4,
            height: 10,
            level: 0
        })
        this.ground5.name = "ground4"

        fixSpeed.input(this, this.rect, false)

        this.rect.listener = this
    }

    crushStart() {
        console.log("crush start")
    }
    crushEnd() {
        console.log("crush end")
    }

    update(time: number, delta: number) {
        follow(this, this.rect, time, delta)
        fixSpeed.update(this.rect, time, delta, 5)
        this.ground3.vy = 3 * Math.sin(time)
        this.ground4.vx = 3 * Math.sin(time)
        this.ground5.vx = 1 * Math.sin(time)
    }
}

class Script7 extends Script {

    ground: Entity
    rect: Entity

    init() {
        this.rect = this.world.createRect({
            x: 0,
            y: 2,
            width: 1,
            height: 1,
            level: 1
        })
        this.rect.name = "rect"

        this.ground = this.world.createRect({
            x: -1, y: -1,
            width: 4,
            height: 1,
            level: 0
        })
        this.ground.createRect({
            x: -2, y: 0,
            width: 1,
            height: 4
        })
        let line = this.ground.createLine({
            x: 2, y: 5,
            size: 1,
            isHorizontal: true
        })
        line.y += 2

        fixSpeed.input(this, this.rect, false)
    }

    update(time: number, delta: number) {
        fixSpeed.update(this.rect, time, delta, 5)

        if(time % 10 < 5) {
            this.ground.vx = 0
        } else {
            this.ground.vx = 2 * Math.sin(time/3)
        }
    }
}

class Script8 extends Script {

    ground: Entity
    big: Entity

    init() {
        this.big = this.world.createRect({
            x: 0,
            y: 2,
            width: 1,
            height: 1,
            level: 1
        })
        this.big.createLine({
            x: 0, y: 3,
            isHorizontal: true,
            size: 1
        })
        this.big.createRect({
            x: 2, y: 0,
            width: 2,
            height: 1
        })

        this.ground = this.world.createRect({
            x: -1, y: -1,
            width: 4,
            height: 1,
            level: 0
        })
        this.ground.createRect({
            x: -2, y: 0,
            width: 1,
            height: 4
        })
        this.ground.createLine({
            x: 2, y: 5,
            size: 1,
            isHorizontal: true
        })

        fixSpeed.input(this, this.big, false)
    }

    update(time: number, delta: number) {
        fixSpeed.update(this.big, time, delta, 5)

        if(time % 10 < 5) {
            this.ground.vx = 0
        } else {
            this.ground.vx = 2 * Math.sin(time/3)
        }
    }
}

class Script9 extends Script {

    ground: Entity
    rect: Entity

    init() {
        this.rect = this.world.createRect({
            x: 0,
            y: 2,
            width: 1,
            height: 1,
            level: 1
        })

        this.ground = this.world.createGrid({
            x: 0, y: -3,
            level: 0,
            width: 20,
            height: 20
        })
        let grid = this.ground.body as Grid
        grid.setBlockShape(0, 0, 1)
        grid.setBlockShape(1, 0, 1)
        grid.setBlockShape(-1, 0, 1)
        grid.setBlockShape(-2, 0, 1)
        grid.setBlockShape(-2, 1, 1)

        grid.setBlockShape(-4, 2, 1)
        grid.setBlockShape(-4, 3, 1)

        fixSpeed.input(this, this.rect, false)
    }

    update(time: number, delta: number) {
        fixSpeed.update(this.rect, time, delta, 5)
    }
}

class Script10 extends Script {

    ground: Entity
    grid: Entity

    init() {
        this.grid = this.world.createGrid({
            x: 0, y: 2,
            level: 1
        })
        let grid = this.grid.body as Grid
        grid.setBlockShape(0, 0, 1)
        grid.setBlockShape(2, 2, 1)

        this.ground = this.world.createGrid({
            x: 0, y: -3,
            level: 0
        })
        grid = this.ground.body as Grid
        grid.setBlockShape(0, 0, 1)
        grid.setBlockShape(1, 0, 1)
        grid.setBlockShape(-1, 0, 1)
        grid.setBlockShape(-2, 0, 1)
        grid.setBlockShape(-2, 1, 1)

        grid.setBlockShape(-4, 2, 1)
        grid.setBlockShape(-4, 3, 1)

        fixSpeed.input(this, this.grid, false)
    }

    update(time: number, delta: number) {
        fixSpeed.update(this.grid, time, delta, 5)
    }
}

class Script11 extends Script {

    rect: Entity
    movingGrid: Entity
    
    init() {
        this.rect = this.world.createRect({
            x: 0, y: 0,
            width: 1, height: 1,
            level: 2
        })

        this.movingGrid = this.world.createGrid({
            x: -4, y: 0,
            level: 1,
            width: 20,
            height: 20
        })
        let grid = this.movingGrid.body as Grid
        grid.setBlockShape(0, 0, 1)
        grid.setBlockShape(0, -1, 1)
        grid.setBlockShape(0, -2, 1)
        grid.setBlockShape(1, 0, 1)

        grid = this.world.createGrid({
            x: 0, y: -3,
            level: 0,
            width: 20,
            height: 20
        }).body as Grid
        grid.setBlockShape(0, 0, 1)
        grid.setBlockShape(0, -1, 1)
        grid.setBlockShape(0, -2, 1)
        grid.setBlockShape(1, 0, 1)

        grid.forBlocks(-10, -10, 5, 5, (x, y, shape, data) => 1)

        charController.input(this, this.rect)
        forceController.input(this, this.movingGrid, false, 'f', 'h', 't', 'g')
    }

    update(time: number, delta: number) {
        charController.update(this.rect, time, delta, 5)
        forceController.update(this.movingGrid, time, delta, 2)
        follow(this, this.rect, time, delta)
    }
}

class Script12 extends Script {

    rect: Entity
    
    init() {
        this.rect = this.world.createRect({
            x: 0, y: 2,
            width: 1, height: 1,
            level: 2
        })

        this.world.createRect({
            x: 0, y: 0,
            level: 0,
            width: 2, height: 1
        })
        this.world.createRect({
            x: -2, y: 0,
            level: 0,
            width: 2, height: 1
        })
        this.world.createRect({
            x: 2, y: 0,
            level: 0,
            width: 2, height: 1
        })
        this.world.createLine({
            x: 4, y: 0.5,
            level: 0,
            size: 2,
            isHorizontal: true
        })
        this.world.createLine({
            x: -4, y: 0.5,
            level: 0,
            size: 2,
            isHorizontal: true,
            side: "up"
        })

        charController.input(this, this.rect)
    }

    update(time: number, delta: number) {
        charController.update(this.rect, time, delta, 2)
        follow(this, this.rect, time, delta)
    }
}

class Script13 extends Script implements EntityListener {

    rect: Entity
    
    init() {
        this.rect = this.world.createRect({
            x: 0, y: 1,
            width: 1, height: 1,
            level: 2
        })
        this.rect.name = "rect"

        this.world.createRect({
            x: 0, y: 0,
            level: 0,
            width: 2, height: 1
        }).name = "ground1"
        this.world.createRect({
            x: -2, y: 2,
            level: 0,
            isSensor: true,
            width: 2, height: 1
        }).name = "sensor-ground2"
        this.world.createRect({
            x: 2, y: 3,
            level: 0,
            isSensor: true,
            width: 2, height: 1
        }).name = "sensor-ground3"
        this.world.createLine({
            x: 4, y: 0.5,
            level: 0,
            size: 2,
            isHorizontal: true
        }).name = "ground4"
        this.world.createLine({
            x: -4, y: 0.5,
            level: 0,
            size: 2,
            isHorizontal: true,
            side: "up"
        }).name = "ground5"

        charController.input(this, this.rect)
        this.rect.listener = this
    }

    overlapStart(body: Body, otherBody: Body) {
        console.log("overlap start:", body._entity.name, otherBody._entity.name)
    }
    overlapEnd(body: Body, otherBody: Body) {
        console.log("overlap end:", body._entity.name, otherBody._entity.name)
    }

    contactStart(body: Body, otherBody: Body, side: string) {
        console.log("contact start:", body._entity.name)
    }
    contactEnd(body: Body, otherBody: Body, side: string) {
        console.log("contact end:", body._entity.name)
    }

    update(time: number, delta: number) {
        charController.update(this.rect, time, delta, 2)
        follow(this, this.rect, time, delta)
    }
}

class Script14 extends Script {

    ground: Entity
    rect: Entity

    init() {
        this.rect = this.world.createRect({
            x: 100000000,
            y: 100000002,
            width: 1,
            height: 1,
            level: 1
        })

        this.ground = this.world.createEntity({
            x: 100000000, y: 100000000,
            level: 0
        })
        this.ground.createRect({
            x: -0.5, y: 0,
            width: 1, height: 2
        })
        this.ground.createRect({
            x: 0.5, y: 0,
            width: 1, height: 2
        })
        this.ground.createRect({
            x: 0, y: -0.5,
            width: 2, height: 1
        })
        this.ground.createRect({
            x: 0, y: 0.5,
            width: 2, height: 1
        })

        fixSpeed.input(this, this.rect, false)
    }

    update(time: number, delta: number) {
        fixSpeed.update(this.rect, time, delta, 5)
        follow(this, this.rect, time, delta)
    }
}


export const SimulScript1 = { id: "SimulScript1", category: "Specification", name: "Test 1: Free rect movement against single rect", description: "Move: ZQSD", script: () => new Script1() } as ScriptDescriptor
export const SimulScript2 = { id: "SimulScript2", category: "Specification", name: "Test 2: Corner test", description: null, script: () => new Script2() } as ScriptDescriptor
export const SimulScript3 = { id: "SimulScript3", category: "Specification", name: "Test 3: Free rect movement against single moving rect", description: "Move: ZQSD", script: () => new Script3() } as ScriptDescriptor
export const SimulScript4 = { id: "SimulScript4", category: "Specification", name: "Test 4: Free rect movement against lines", description: "Move: ZQSD", script: () => new Script4() } as ScriptDescriptor
export const SimulScript5 = { id: "SimulScript5", category: "Specification", name: "Test 5: Layers and layer groups", description: "Move: ZQSD", script: () => new Script5() } as ScriptDescriptor
export const SimulScript6 = { id: "SimulScript6", category: "Specification", name: "Test 6: Free rect movement against several rects", description: "Move: ZQSD", script: () => new Script6() } as ScriptDescriptor
export const SimulScript7 = { id: "SimulScript7", category: "Specification", name: "Test 7: Free rect movement against multi-body entity", description: "Move: ZQSD", script: () => new Script7() } as ScriptDescriptor
export const SimulScript8 = { id: "SimulScript8", category: "Specification", name: "Test 8: Multi-body entity against multi-body entity", description: "Move: ZQSD", script: () => new Script8() } as ScriptDescriptor
export const SimulScript9 = { id: "SimulScript9", category: "Specification", name: "Test 9: Free rect movement against grid", description: "Move: ZQSD", script: () => new Script9() } as ScriptDescriptor
export const SimulScript10 = { id: "SimulScript10", category: "Specification", name: "Test 10: Grid against grid", description: "Move: ZQSD", script: () => new Script10() } as ScriptDescriptor
export const SimulScript11 = { id: "SimulScript11", category: "Specification", name: "Test 11: Grids and a character", description: "Move chararacter: ZQSD\nMove moving grid: TFGH", script: () => new Script11() } as ScriptDescriptor
export const SimulScript12 = { id: "SimulScript12", category: "Specification", name: "Test 12: Aligned entities", description: "Move chararacter: ZQSD", script: () => new Script12() } as ScriptDescriptor
export const SimulScript13 = { id: "SimulScript13", category: "Specification", name: "Test 13: Sensors", description: "Move chararacter: ZQSD", script: () => new Script13() } as ScriptDescriptor
export const SimulScript14 = { id: "SimulScript14", category: "Specification", name: "Test 14: Hidden corner avoidance", description: "Move character ZQSD", script: () => new Script14() } as ScriptDescriptor
