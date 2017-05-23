import * as _ from 'lodash'
import * as assert from 'assert'
import * as util from 'util'

import { World, Grid, Body } from '../../lib'
import { SmallBody } from '../../lib/model/body'
import { VBH } from '../../lib/vbh/vbh'

export default function invariant(world: World) {
    for(let e of world._vbh.all()) {
        // Every element of world._vbh is also in the ents of the world
        assert(world._ents[e._level].indexOf(e) >= 0, "world._ents contains entities from vbh")
    }

    for(let level in world._ents) {
        let ents = world._ents[level]

        // Every level of the world has a list of entities, even if it is empty
        assert.notEqual(ents, null, "world._ents[level] != null")

        for(let e of ents) {
            let topEntity = e
            while(topEntity._parent && topEntity._parentType == 1) {
                topEntity = topEntity._parent
            }
            
            // ENTITY - WORLD RELATION
            // Every entity in the world has that world for .world value
            assert.equal(e._world, world, "entity.world == world")

            // If an entity is equal to his topEntity, he is part of the world's vbh
            assert(e != e._topEntity || world._vbh.all().indexOf(e) >= 0, "world._vbh contains entities from world._ents with no static parents")

            // ENTITY - ENTITY RELATION
            // If an entity has no parent or his parent is of follow type, he is equal to his topEntity
            assert((e._parent == null || e._parentType == 1) && e == e._topEntity || (e._parent && e._parentType == 0) && e != e._topEntity,
                   "entity == entity._topEntity <=> entity has a static parent")

            // Entity is included in parent's childs
            assert(!e._parent || (e._parent._childs.indexOf(e) >= 0), "e is in e._parent._childs")

            // Entity in e's child list has e for parent
            assert(!e._childs || _.every(e._childs, child => child._parent == e), "e1 in e2._childs => e1._parent = e2")

            // An entity topEntity is not null
            assert(e._topEntity != null, "e._topEntity != null")

            // Entity._topEntity is equal to the top of the parenting chain without a static parent
            assert(topEntity == e._topEntity, "entity._topEntity == that entities top entity")

            // ENTITY - BODY RELATION
            // No grid in _bodies
            assert(!e._bodies || (e._bodies instanceof Body && !(e._bodies instanceof Grid) 
                              || !(e._bodies instanceof Body) && _.every((e._bodies as VBH<Body>).all(), b => !(b instanceof Grid))),
                   "No grid in e._bodies")
                              
            // No grid in _allBodies
            assert(!e._allBodies || _.every((e._allBodies as VBH<Body>).all(), b => !(b instanceof Grid)),
                   "No grid in e._allBodies")

            // If an entity e is not a top entity, e._allBodies null or empty
            assert(e == e._topEntity || (e._allBodies == null || e._allBodies.all().length == 0), "e not top entity => e._allbodies empty")

            // If an entity is a top entity, his _allBodies property is not null
            assert(e != e._topEntity || e._allBodies != null, "a top entity's _allBodies property is not null")

            // If an entity e is a top entity, its allBody property contains every body of it's static childs
            assert(!e._bodies || e._bodies instanceof Body && e._topEntity._allBodies.all().indexOf(e._bodies) >= 0
                              || !(e._bodies instanceof Body) && _.difference(e._bodies.all(), e._topEntity._allBodies.all()).length === 0,
                  )

            // Bodies of an entity have said entity has its entity
            assert(!e._bodies || e._bodies instanceof Body && e._bodies._entity == e 
                              || !(e._bodies instanceof Body) && _.every(e._bodies.all(), b => b._entity == e),
                   "entity.body.entity == entity")
        }
    }
}