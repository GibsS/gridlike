import { Body } from './body'

export interface RaycastResult<X> {

    x: number
    y: number
    normal: string
    body: X
    dist: number
}

export interface QueryResult<X> {

    bodies: X[]
}