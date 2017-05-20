import { World, Entity, Body } from '../lib'
import { Testbed } from './'

export interface ScriptDescriptor {
    id: string
    name: string
    description: string
    script: () => Script
}

export abstract class Script {

    _world: World
    get world(): World { return this._world }

    _testbed: Testbed
    get testbed(): Testbed { return this._testbed }

    r(entity: Entity): Entity { return this._testbed.registerEntity(entity) }

    abstract init()
    abstract update(time: number, delta: number)
    click(x: number, y: number, body: Body) { }
}