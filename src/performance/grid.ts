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

console.time("for: 600/600")
grid.forTiles(-300, -300, 600, 600, (x, y, shape, data) => {
    return null
})
console.timeEnd("for: 600/600")


console.time("gets: 600/600")
for(let i = -300; i < 300; i++) {
    for(let j = -300; j < 300; j++) {
        let res = grid.getTile(i, j)
    }
}
console.timeEnd("gets: 600/600")

let a = new Array(600)
for(let i = 0; i < 600; i++) {
    a[i] = new Array(600)
}
console.time("gets array: 600/600")
for(let i = 0; i < 600; i++) {
    for(let j = 0; j < 600; j++) {
        let res = a[i][j]
    }
}
console.timeEnd("gets array: 600/600")