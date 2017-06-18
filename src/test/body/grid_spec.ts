import * as assert from 'assert'
import * as _ from 'lodash'
import { nearEqual } from './../helper'
import * as util from 'util'

import invariant from './../invariant'

import { World, Entity, Grid } from './../../lib/index'

function assertTileEqual(tile, shape, data) {
    assert.equal(tile.shape, shape)
    if(typeof tile.data == "undefined") {
        assert.equal(tile.data, undefined)
    } else {
        assert.deepStrictEqual(tile.data, data)
    }
}

export default function test() {
    describe('Grid', function() {

        describe('new Grid', function() {
            var world: World,
                grid: Grid

            beforeEach(function() {
                world = new World()
            })

            describe('with array', function() {
                it('should create a grid where every tile match with the got counterpart', function() {
                    var tiles 
                    tiles = new Array(50)
                    for(let i = 0; i < 50; i++) {
                        tiles[i] = new Array(50)
                        for(let j = 0; j < 50; j++) {
                            tiles[i][j] = { shape: j + 3, data: i + 3 }
                        }
                    }
                    grid = world.createGrid({
                        tiles: {
                            x: 3,
                            y: 3,
                            info: tiles
                        }
                    }).body as Grid

                    for(let i = 3; i < 53; i++) {
                        for(let j = 3; j < 53; j++) {
                            assertTileEqual(grid.getBlock(i, j), j, i)
                        }
                    }
                    invariant(world)
                })
            })

            describe('with list', function() {
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
                        assertTileEqual(grid.getBlock(i, 0), i, { foo: "test" })
                    }
                    invariant(world)
                })
            })

            describe('with dimensions', function() {
                it('should create a grid where every tile match with the got counterpart /1', function() {
                    grid = world.createGrid({
                        x: 0,
                        y: 0,
                        width: 10,
                        height: 10
                    }).body as Grid

                    for(let i = 0; i < 10; i++) {
                        for(let j = 0; j < 10; j++) {
                            assertTileEqual(grid.getBlock(i, j), 0, null)
                        }
                    }
                    invariant(world)
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
                            assertTileEqual(grid.getBlock(i, j), 0, null)
                        }
                    }
                    invariant(world)
                })
            })
        })

        describe('.setTile', function() {
            var world: World,
                grid: Grid

            beforeEach(function() {
                world = new World()
                
                grid = world.createGrid({
                    width: 5,
                    height: 5
                }).body as Grid
            })

            it('when p=[0, 0], shape=0, data=null', function() {
                grid.setBlock(0, 0, 0, null)
                assertTileEqual(grid.getBlock(0, 0), 0, null)
                invariant(world)
            })
            it('when p=[1, 1], shape=1, data={ foo: "test" }', function() {
                grid.setBlock(1, 1, 2, { foo: 'test' })
                assertTileEqual(grid.getBlock(1, 1), 2, { foo: 'test' })
                invariant(world)
            })
            it('when p=[-10, 1], shape=2, data=null', function() {
                grid.setBlock(-10, 1, 2, null)
                assertTileEqual(grid.getBlock(-10, 1), 2, null)
                invariant(world)
            })
            it('when p=[-10, 1], shape=2, data=null, previously data={ foo: "test" }', function() {
                grid.setBlock(-10, 1, 2, { foo: 'test' })
                grid.setBlock(-10, 1, 2, null)
                assertTileEqual(grid.getBlock(-10, 1), 2, null)
                invariant(world)
            })
            it('when p=[-100, 1] shape=2, data={ foo: "test" }', function() {
                grid.setBlock(-100, 1, 2, { foo: 'test' })
                assertTileEqual(grid.getBlock(-100, 1), 2, { foo: 'test' })
                invariant(world)
            })
            it('when p=[-100, 100] shape=2, data={ foo: "test" }', function() {
                grid.setBlock(-100, 100, 2, { foo: 'test' })
                assertTileEqual(grid.getBlock(-100, 100), 2, { foo: 'test' })
                invariant(world)
            })
            it('when p=[0, 0] and [0, 1] shape=2, data={ foo: "test" }', function() {
                grid.setBlock(0, 0, 2, { foo: 'test' })
                grid.setBlock(0, 1, 2, { foo: 'test' })
                assertTileEqual(grid.getBlock(0, 0), 2, { foo: 'test' })
                assertTileEqual(grid.getBlock(0, 1), 2, { foo: 'test' })
                invariant(world)
            })
            it('when p=[0, 0] and [0, 1] shape=2, data={ foo: "test" }', function() {
                grid.setBlock(2, 3, 2, { foo: 'test' })
                grid.setBlock(2, 2, 2, { foo: 'test' })
                assertTileEqual(grid.getBlock(2, 3), 2, { foo: 'test' })
                assertTileEqual(grid.getBlock(2, 2), 2, { foo: 'test' })
                invariant(world)
            })
        })
        describe('.setTileShape', function() {
            var world: World,
                grid: Grid

            beforeEach(function() {
                world = new World()
                
                grid = world.createGrid({
                    width: 5,
                    height: 5
                }).body as Grid
            })

            it('when p=[0, 0], shape=1', function() {
                grid.setBlockShape(0, 0, 1)
                assertTileEqual(grid.getBlock(0, 0), 1, null)
            })
            it('when p=[-100, 10], shape=1, previously shape = 2, data={ foo: "foo" }', function() {
                grid.setBlock(-100, 10, 2, { foo: "test" })
                grid.setBlockShape(-100, 10, 1)
                assertTileEqual(grid.getBlock(-100, 10), 1, { foo: "test" })
            })
        })
        describe('.clearTile', function() {
            var world: World,
                grid: Grid

            beforeEach(function() {
                world = new World()
                
                grid = world.createGrid({
                    width: 5,
                    height: 5
                }).body as Grid
            })

            it('when p=[1, 1] and previous shape=2, data={ foo: "test" }', function() {
                grid.setBlock(1, 1, 2, { foo: 'test' })
                grid.clearBlock(1, 1)
                assertTileEqual(grid.getBlock(1, 1), 0,  null)
                invariant(world)
            })

            it('when p=[1, 2] and two previous sets', function() {
                grid.setBlock(1, 1, 2, { foo: 'test' })
                grid.setBlock(1, 2, 2, { foo: 'test' })
                grid.clearBlock(1, 2)
                assertTileEqual(grid.getBlock(1, 2), 0,  null)
                assertTileEqual(grid.getBlock(1, 1), 2,  { foo: 'test' })
                invariant(world)
            })
        })

        describe.skip('.clearTileShape', function() {
            it('when p=[1, 1], nothing done yet', function() {

            })
            it('when p=[10, -10], shape=1, data=null', function() {

            })
            it('when p=[-1000, 1], shape=2, data={ test: "foo" }', function() {

            })
        })

        describe.skip('.globalToTile', function() {
            
            it('returns the index position associated to the tile that contains the provided point', function() {

            })
        })

        describe('.setTiles', function() {
            var world: World,
                grid: Grid

            beforeEach(function() {
                world = new World()
                
                grid = world.createGrid({
                    width: 100,
                    height: 100
                }).body as Grid
            })

            it('should allow to set data on an array', function() {
                grid.setBlocks({
                    x: 1, y: 1,
                    info: _.range(10).map(i => _.range(10).map(j => 3))
                })

                for(let i = -3; i < 13; i++) {
                    for(let j = -4; j < 14; j++) {
                        if(i >= 1 && j >= 1 && i < 11 && j < 11) {
                            assertTileEqual(grid.getBlock(i, j), 3, null)
                        } else {
                            assertTileEqual(grid.getBlock(i, j), 0, null)
                        }
                    }
                }
                invariant(world)
            })
        })

        describe('.clearTiles', function() {
            var world: World,
                grid: Grid

            beforeEach(function() {
                world = new World()
                
                grid = world.createGrid({
                    width: 100,
                    height: 100
                }).body as Grid
            })

            it('should set shape to 0 and data to null', function() {
                grid.setBlocks({
                    x: 2, y: 2, 
                    info: _.range(10).map(i => _.range(10).map(j => { return { shape: 3, data: { foo: "test" } }}))
                })
                grid.clearBlocks({
                    x: 3, y: 3, width: 8, height: 8
                })
                assertTileEqual(grid.getBlock(2, 2), 3, { foo: "test" })
                assertTileEqual(grid.getBlock(4, 4), 0, null)
                assertTileEqual(grid.getBlock(11, 11), 3, { foo: "test" })
                assertTileEqual(grid.getBlock(11, 2), 3, { foo: "test" })
                
                invariant(world)
            })
        })

        describe.skip('.setTileShapes', function() {

        })

        describe.skip('.clearTileShapes', function() {

        })
        describe('.forTiles', function() {
            var world: World,
                grid: Grid

            beforeEach(function() {
                world = new World()
                
                grid = world.createGrid({
                    width: 100,
                    height: 100
                }).body as Grid
            })

            it('should be provided the correct information', function() {
                grid.setBlock(3, 3, 2, { foo: "ok" })
                grid.setBlock(1, 2, 5, { test: "foo" })

                grid.forBlocks(1, 1, 10, 10, (x, y, shape, data) => {
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
                invariant(world)
            })

            it('should allow the modification of the tiles it goes through', function() {
                grid.forBlocks(-30, -30, 10, 10, (x, y, shape, data) => {
                    return { shape: x + y, data: { x, y } }
                })

                for(let i = -30; i < -20; i++) {
                    for(let j = -30; j < -20; j++) {
                        assertTileEqual(grid.getBlock(i, j), i + j, { x: i, y: j })
                    }
                }
                invariant(world)
            })
        })
    })
}