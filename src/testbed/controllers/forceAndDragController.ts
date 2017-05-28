import { Entity } from '../../lib'
import { Script } from '../script'

export function input(script: Script, entity: any, toggleMove: boolean, leftKey?: string, rightKey?: string, upKey?: string, downKey?: string) {
    script.keyDown(leftKey || 'q', () => { entity.moveLeft = true; entity.moveRight = false })
    if(!toggleMove) {
        script.keyUp(leftKey || 'q', () => { entity.moveLeft = false })
    }
    script.keyDown(rightKey || 'd', () => { entity.moveRight = true; entity.moveLeft = false })
    if(!toggleMove) {
        script.keyUp(rightKey || 'd', () => { entity.moveRight = false })
    }

    script.keyDown(upKey || 'z', () => { entity.moveUp = true; entity.moveDown = false })
    if(!toggleMove) {
        script.keyUp(upKey || 'z', () => { entity.moveUp = false })
    }
    script.keyDown(downKey || 's', () => { entity.moveDown = true; entity.moveUp = false })
    if(!toggleMove) {
        script.keyUp(downKey || 's', () => { entity.moveDown = false })
    }
}
export function update(entity, time: number, delta: number, speed: number) {
    if(entity.moveLeft && !entity.moveRight) {
        entity.vx -= speed*delta
    } else if(entity.moveRight && !entity.moveLeft) {
        entity.vx += speed*delta
    }

    if(entity.moveDown && !entity.moveUp) {
        entity.vy -= speed*delta
    } else if(entity.moveUp && !entity.moveDown) {
        entity.vy += speed*delta
    }
}