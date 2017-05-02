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
                var tiles 
                beforeEach(function() {
                    tiles = new Array(50)
                    for(let i = 0; i < 50; i++) {
                        tiles[i] = new Array(50)
                        for(let j = 0; j < 50; j++) {
                            tiles[i][j] = { shape: 0, data: null }
                        }
                    }
                })

                it('should create an array where every tile match with the got counterpart', function() {
                    
                })
            })
        })

        describe('set grid info', function() {
            var world: World,
                grid: Grid

            beforeEach(function() {
                world = new World()
                
                grid = world.createGrid({
                    tileSize: 1,
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
            })
        })
    })
}

//test()