import { Body } from './body'

export class Contact {

    body: Body // current considered entity
    otherBody: Body
    side: string // right, left, up, down
}

export class Overlap {
    body1: Body
    body2: Body
}