import { World } from '../lib'
import { Testbed } from './'

export abstract class Script {

    _world: World
    get world(): World { return this._world }

    _testbed: Testbed
    get testbed(): Testbed { return this._testbed }

    abstract init()
    abstract update(time: number, delta: number)
}