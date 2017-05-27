import { Script } from '../script'

export function follow(script: Script, entity, time: number, delta: number) {
    script.testbed.xCam = entity.globalx
    script.testbed.yCam = entity.globaly
}