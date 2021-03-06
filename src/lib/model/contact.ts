import { Body, SmallBody } from './body'

export class _Contact {

    body: SmallBody // higher entity
    otherBody: SmallBody
    side: number // 0: right, 1: left, 2: up, 3: down
}
export class Contact {

    body: Body // higher entity
    otherBody: Body
    side: string // right, left, up, down
}

export class Overlap {
    body1: Body
    body2: Body
}