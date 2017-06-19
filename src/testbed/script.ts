import { World, Entity, Body } from '../lib'
import { Testbed } from './'

export interface ScriptDescriptor {
    id: string
    name: string
    category: string
    description: string
    script: () => Script
}

export abstract class Script {

    _world: World
    get world(): World { return this._world }

    _testbed: Testbed
    get testbed(): Testbed { return this._testbed }

    abstract init()
    abstract update(time: number, delta: number)

    log(log: string) { this._testbed.log(log) }

    click(x: number, y: number, body: Body) { }
    keyDown(keys: string, callback: () => void) {
        this._testbed.bindKeys(keys, callback)
    }
    keyUp(keys: string, callback: () => void) {
        this._testbed.bindKeysUp(keys, callback)
    }
}