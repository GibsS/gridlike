import * as assert from 'assert'

import { EPS } from '../lib/index'

export function nearEqual(a: number, b: number, msg?: string) {
    if(Math.abs(a - b) <= EPS) {
        assert.ok(true, msg)
    } else {
        assert.ok(false, (msg ? msg + ": " : "") + b + " expected, got " + a)
    }
}