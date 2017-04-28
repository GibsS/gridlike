import { Body } from './body'

export class Contact {

    body1: Body // top or right
    body2: Body
    isHorizontal: boolean
}

export class RelativeContact {

    body1: Body // current considered entity
    body2: Body
    side: string // right, left, up, down
}