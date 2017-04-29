import { Body } from './body'

export class Contact {

    body1: Body // top or right
    body2: Body
    isHorizontal: boolean
}

export class RelativeContact {

    body: Body // current considered entity
    otherBody: Body
    side: string // right, left, up, down
}