import { Body } from './body'

export interface RaycastResult {

    x: number
    y: number
    normal: string
    body: Body
}

export interface QueryResult {

    bodies: Body[]
}