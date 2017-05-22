import * as assert from 'assert'
import * as util from 'util'

import { World, Grid } from '../../lib'
import { SmallBody } from '../../lib/model/body'

export default function invariant(world: World) {
    for(let i in world._ents) {
        let ents = world._ents[i]

        for(let ent of ents) {
            // STRUCTURE (WORLD - ENTITY / ENTITY - ENTITY)
            if(ent._childs) {
                for(let child of ent._childs) {
                    assert.equal(child._parent, ent, "entity.childs._parent = entity")

                    assert(child._world == world && world._ents[child._level].indexOf(child) >= 0, "child of entity should be world")
                }
            }
            if(ent._parent) {
                assert.notEqual(ent._parent._childs.indexOf(ent), -1, "entity._parent.childs contain entity")
            }

            assert.equal(ent._level, i, "entity.level == position rank of ents in world")

            assert.equal(ent._world, world, "entity._world == world that contains it")

            // STRUCTURE (ENTITY / BODY)
            let topEntity = ent
            while(topEntity._parent && topEntity._parentType == 0) {
                topEntity = topEntity._parent
            }
            if(topEntity != ent && ent._allBodies) {
                assert(ent._allBodies.all().length == 0, "not top entity has no body in all body")
            }
            if(topEntity == ent) {
                let minx = topEntity.minx, maxx = topEntity.maxx, miny = topEntity.miny, maxy = topEntity.maxy
                let aminx = Infinity, aminy = Infinity, amaxx = -Infinity, amaxy = -Infinity, 
                    count = 0
                
                topEntity._forAllBodies(b => {
                    aminx = Math.min(aminx, b.minx)
                    aminy = Math.min(aminy, b.miny)
                    amaxx = Math.max(amaxx, b.maxx)
                    amaxy = Math.max(amaxy, b.maxy)
                    count ++
                })

                assert(
                    count == 0 || (minx == aminx && maxx == amaxx && miny == aminy && maxy == amaxy), 
                    "the bounds of an entity must contain exactly the bounds of its bodies"
                )
            }
            for(let body of ent.bodies) {
                assert.equal(ent, body._entity, "entity.bodies._entity == entity")
                assert.equal(topEntity, body._topEntity, "body._topEntity == entity._topEntity")

                if(topEntity._allBodies) {
                    assert.notEqual(topEntity._allBodies.all().indexOf(body), -1, "body in allbodies if it exists")
                    assert(body._topEntity == topEntity, "body._topEntity == topEntity")
                }

                // if(body._higherContacts) {
                //     for(let contact of body._higherContacts) {
                //         assert(!(contact.body instanceof Grid) && !(contact.otherBody instanceof Grid), "a body in contact can't be a Grid")
                //         let otherBody: SmallBody = (contact.otherBody as SmallBody),
                //             layer1 = body.layer,
                //             layer2 = otherBody.layer,
                //             layerGroup1 = otherBo.layerGroup,
                //             layerGroup2 = (contact.otherBody as SmallBody).layerGroup,
                //             rule = world.getLayerRule(layer1, layer2)

                //         switch(rule) {
                //             case "always": break
                //             case "equal": assert(layerGroup1 == layerGroup2
                //             , "two bodies that are in contact can't be filtered out by layering: " + rule + "[" + layer1 + ">" + layerGroup1 + ", " + layer2 + ">" + layerGroup2 + "]"); break
                //             case "unequal": assert(layerGroup1 != layerGroup2
                //             , "two bodies that are in contact can't be filtered out by layering: " + rule + "[" + layer1 + ">" + layerGroup1 + ", " + layer2 + ">" + layerGroup2 + "]"); break
                //             case "never": assert(false, "two bodies that are in contact  can't have a never rule linking them: " + rule +  "[" + layer1 + ">" + layerGroup1 + ", " + layer2 + ">" + layerGroup2 + "]"); break
                //         }
                //         assert((contact.body1 as any).isSensor == false && (contact.body2 as any).isSensor == false, "sensor can't collide")

                //         assert(contact.body1._topEntity == ent || contact.body2._topEntity == ent, "in a contact, one of the body must be owned by the contact owner")

                //         if(contact.body1 == body) {
                //             assert([
                //                 contact.body2._entity._upLower, contact.body2._entity._rightLower, contact.body2._entity._leftLower, contact.body2._entity._downLower
                //             ].indexOf(contact) >= 0, "in a higher contact, the other body must also own the contact")
                //         } else {
                //             assert([
                //                 contact.body1._entity._upLower, contact.body1._entity._rightLower, contact.body1._entity._leftLower, contact.body1._entity._downLower
                //             ].indexOf(contact) >= 0, "in a higher contact, the other body must also own the contact")
                //         }

                //         assert((contact.body1._topEntity == topEntity && contact.body2._topEntity.level >= contact.body1._topEntity.level)
                //             || (contact.body2._topEntity == topEntity && contact.body1._topEntity.level >= contact.body2._topEntity.level), 
                //         "in a lower contact, the other body is of a higher level")
                //     }
                // }

            }

            if(topEntity != ent) {
                assert(ent._allBodies == null || ent._allBodies.all().length == 0, "if ent is not top entity, should not contain bodies in allbodies")
            }

            // CONTACT
            // for(let lower of [ent._upLower, ent._downLower, ent._leftLower, ent._rightLower]) {
            //     if(lower) {
            //         assert(lower.body1._entity == ent || lower.body2._entity == ent, "in a contact, one of the body must be owned by the contact owner")
            //         if(lower.body1._entity == ent) {
            //             assert.notEqual(lower.body2._higherContacts.indexOf(lower), -1, "in a lower contact, the other body must also own the contact")
            //         } else {
            //             assert.notEqual(lower.body1._higherContacts.indexOf(lower), -1, "in a lower contact, the other body must also own the contact")
            //         }
            //     }
            // }

            // if(ent._upLower) {
            //     assert(!ent._upLower.isHorizontal, "up contact is not horizontal")
            //     assert(ent._upLower.body1.globaly < ent._upLower.body2.globaly + 0.1, "in up contact, body1 is beneath body2")
            // }
            // if(ent._downLower) {
            //     assert(!ent._downLower.isHorizontal, "down contact is not horizontal")
            //     assert(ent._downLower.body1.globaly < ent._downLower.body2.globaly + 0.1, "in down contact, body1 is beneath body2")
            // }

            // if(ent._leftLower) {
            //     assert(ent._leftLower.isHorizontal, "left contact is horizontal")
            //     assert(ent._leftLower.body1.globalx < ent._leftLower.body2.globalx + 0.1, "in left contact, body1 is left to body2")
            // }
            // if(ent._rightLower) {
            //     assert(ent._rightLower.isHorizontal, "right contact is horizontal")
            //     assert(ent._rightLower.body1.globalx < ent._rightLower.body2.globalx + 0.1, "in right contact, body1 is left to body2")
            // }
        }
    }
}