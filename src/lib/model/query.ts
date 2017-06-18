import { Body } from './body'

export interface RaycastResult<X> {

    x: number
    y: number
    normal: string
    body: X
    dist: number
}

export declare type QueryResult<X> = X[]