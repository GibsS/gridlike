import { World, Grid } from '../lib'

console.time("init")
let world = new World()

let grid = world.createGrid({
    x: 0,
    y: 0,
    width: 1000,
    height: 1000
}).body as Grid
console.timeEnd("init")

console.time("for: 1000/1000")
grid.forTiles(-300, -300, 1000, 1000, (x, y, shape, data) => {
    return 3
})
console.timeEnd("for: 1000/1000")


console.time("for: 60/60")
grid.forTiles(-30, 30, 30, 30, (x, y, shape, data) => {
    return 3
})
console.timeEnd("for: 60/60")


console.time("gets: 1000/1000")
for(let i = -500; i < 500; i++) {
    for(let j = -500; j < 500; j++) {
        let res = grid.getTile(i, j)
    }
}
console.timeEnd("gets: 1000/1000")

let a = new Array(1000)
for(let i = 0; i < 1000; i++) {
    a[i] = new Array(1000)
}
console.time("gets array: 1000/1000")
for(let i = 0; i < 1000; i++) {
    for(let j = 0; j < 1000; j++) {
        let res = a[i][j]
    }
}
console.timeEnd("gets array: 1000/1000")