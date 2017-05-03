import * as assert from 'assert'
import * as _ from 'lodash'
import { nearEqual } from './helper'
import * as util from 'util'

import { World, Entity, Grid } from '../lib/index'

function assertTileEqual(tile, shape, data) {
    assert.equal(tile.shape, shape)
    assert.deepStrictEqual(tile.data, data)
}

export default function test() {
    describe('Grid', function() {

        describe('init', function() {
            var world: World,
                grid: Grid

            beforeEach(function() {
                world = new World()
            })

            describe('init by Array', function() {
                it('should create a grid where every tile match with the got counterpart', function() {
                    var tiles 
                    tiles = new Array(50)
                    for(let i = 0; i < 50; i++) {
                        tiles[i] = new Array(50)
                        for(let j = 0; j < 50; j++) {
                            tiles[i][j] = { shape: j, data: i }
                        }
                    }
                    grid = world.createGrid({
                        x: 0,
                        y: 0,
                        tiles: {
                            x: 0,
                            y: 0,
                            info: tiles
                        }
                    }).body as Grid

                    for(let i = 0; i < 50; i++) {
                        for(let j = 0; j < 50; j++) {
                            assertTileEqual(grid.getTile(i, j), j, i)
                        }
                    }
                })
            })

            describe('init by list', function() {
                it('should create a grid where every tile match with the got counterpart', function() {
                    var tiles = []
                    for(let i = 0; i < 50; i++) {
                        tiles.push({ x: i, y: 0, shape: i, data: { foo: "test" }})
                    }
                    grid = world.createGrid({
                        x: 0,
                        y: 0,
                        tiles
                    }).body as Grid

                    for(let i = 0; i < 50; i++) {
                        assertTileEqual(grid.getTile(i, 0), i, { foo: "test" })
                    }
                })
            })

            describe('init by dimension', function() {
                it('should create a grid where every tile match with the got counterpart /1', function() {
                    grid = world.createGrid({
                        x: 0,
                        y: 0,
                        width: 10,
                        height: 10
                    }).body as Grid

                    for(let i = 0; i < 10; i++) {
                        for(let j = 0; j < 10; j++) {
                            assertTileEqual(grid.getTile(i, j), 0, null)
                        }
                    }
                })
                
                it('should create a grid where every tile match with the got counterpart /2', function() {
                    grid = world.createGrid({
                        x: 0,
                        y: 0,
                        width: 700,
                        height: 700
                    }).body as Grid

                    for(let i = 0; i < 700; i++) {
                        for(let j = 0; j < 700; j++) {
                            assertTileEqual(grid.getTile(i, j), 0, null)
                        }
                    }
                })
            })
        })

        describe('set individual cell shape/data', function() {
            var world: World,
                grid: Grid

            beforeEach(function() {
                world = new World()
                
                grid = world.createGrid({
                    width: 5,
                    height: 5
                }).body as Grid
            })

            it('a tiles value should be equal to the value it is attributed /1', function() {
                grid.setTile(0, 0, 0, null)
                assertTileEqual(grid.getTile(0, 0), 0, null)
            })
            it('a tiles value should be equal to the value it is attributed /2', function() {
                grid.setTile(1, 1, 2, { foo: 'test' })
                assertTileEqual(grid.getTile(1, 1), 2,  { foo: 'test' })
            })
            it('a tiles value should be equal to the value it is attributed /3', function() {
                grid.setTile(-10, 1, 2, { foo: 'test' })
                assertTileEqual(grid.getTile(-10, 1), 2,  { foo: 'test' })
            })
            it('a tiles value should be equal to the value it is attributed /4', function() {
                grid.setTile(-100, 1, 2, { foo: 'test' })
                assertTileEqual(grid.getTile(-100, 1), 2,  { foo: 'test' })
            })
            it('a tiles value should be equal to the value it is attributed /5', function() {
                grid.setTile(-100, 100, 2, { foo: 'test' })
                assertTileEqual(grid.getTile(-100, 100), 2,  { foo: 'test' })
            })
            it('a tiles value should be equal to the value it is attributed /6', function() {
                grid.setTile(0, 0, 2, { foo: 'test' })
                grid.setTile(0, 1, 2, { foo: 'test' })
                assertTileEqual(grid.getTile(0, 0), 2,  { foo: 'test' })
                assertTileEqual(grid.getTile(0, 1), 2,  { foo: 'test' })
            })
            it('a tiles value should be equal to the value it is attributed /7', function() {
                grid.setTile(2, 3, 2, { foo: 'test' })
                grid.setTile(2, 2, 2, { foo: 'test' })
                assertTileEqual(grid.getTile(2, 3), 2,  { foo: 'test' })
                assertTileEqual(grid.getTile(2, 2), 2,  { foo: 'test' })
            })

            it('clear tile works /1', function() {
                grid.setTile(1, 1, 2, { foo: 'test' })
                grid.clearTile(1, 1)
                assertTileEqual(grid.getTile(1, 1), 0,  null)
            })

            it('clear tile works /1', function() {
                grid.setTile(1, 1, 2, { foo: 'test' })
                grid.setTile(1, 2, 2, { foo: 'test' })
                grid.clearTile(1, 2)
                assertTileEqual(grid.getTile(1, 2), 0,  null)
                assertTileEqual(grid.getTile(1, 1), 2,  { foo: 'test' })
            })
        })

        describe('set group cell shape/data', function() {
            var world: World,
                grid: Grid

            beforeEach(function() {
                world = new World()
                
                grid = world.createGrid({
                    width: 50,
                    height: 50
                }).body as Grid
            })

            describe('grid.forTiles', function() {
                it('should be provided the correct information', function() {
                    grid.setTile(3, 3, 2, { foo: "ok" })
                    grid.setTile(1, 2, 5, { test: "foo" })

                    grid.forTiles(1, 1, 10, 10, (x, y, shape, data) => {
                        if(x == 3 && y == 3) {
                            assert.equal(shape, 2, "discrepancy at: " + x + " " + y)
                            assert.deepEqual(data, { foo: "ok" }, "discrepancy at: " + x + " " + y)
                        } else if(x == 1 && y == 2) {
                            assert.equal(shape, 5, "discrepancy at: " + x + " " + y)
                            assert.deepEqual(data, { test: "foo" }, "discrepancy at: " + x + " " + y)
                        } else {
                            assert.equal(shape, 0, "discrepancy at: " + x + " " + y)
                            assert.equal(data, null, "discrepancy at: " + x + " " + y)
                        }

                        return null
                    })
                })

                it('should allow the modification of the tiles it goes through', function() {
                    grid.forTiles(-30, -30, 10, 10, (x, y, shape, data) => {
                        return { shape: x + y, data: { x, y } }
                    })

                    for(let i = -40; i < -15; i++) {
                        console.log(i, grid.getTile(-29, i))
                    }

                    for(let i = -30; i < -20; i++) {
                        for(let j = -30; j < -20; j++) {
                            console.log(i, j)
                            assertTileEqual(grid.getTile(i, j), i + j, { x: i, y: j })
                        }
                    }
                })
            })

            describe('grid.setTiles', function() {
                it('should allow to set data on an array', function() {
                    grid.setTiles({
                        x: 1, y: 1,
                        info: _.range(10).map(i => _.range(10).map(j => 3))
                    })

                    for(let i = -3; i < 13; i++) {
                        for(let j = -4; j < 14; j++) {
                            if(i >= 1 && j >= 1 && i < 11 && j < 11) {
                                assertTileEqual(grid.getTile(i, j), 3, null)
                            } else {
                                assertTileEqual(grid.getTile(i, j), 0, null)
                            }
                        }
                    }
                })
            })
        })
    })
}

//test()