import * as assert from 'assert'

export function nearEqual(a: number, b: number, msg?: string) {
    if(Math.abs(a - b) <= 0.001) {
        assert.ok(true, msg)
    } else {
        assert.ok(false, (msg ? msg + ": " : "") + b + " expected, got " + a)
    }
}