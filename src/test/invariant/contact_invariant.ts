// import * as _ from 'lodash'
// import * as assert from 'assert'
// import * as util from 'util'

// import { World, Grid, Body, Entity } from '../../lib'
// import { SmallBody } from '../../lib/model/body'
// import { VBH } from '../../lib/vbh/vbh'

// export default function invariant(world: World) {
//     for(let level in world._ents) {
//         let ents = world._ents[level]
        
//         for(let e of ents) {
//             // only a top entity has contacts
//             assert(e == e._topEntity || (!e._leftLower && !e._rightLower && !e._upLower && !e._downLower), "only top entities have contacts")

//             // lower contact body is one of the considered entity's bodies
//             assert(!e._leftLower || (e._leftLower.body._topEntity == e && e._leftLower.otherBody._topEntity != e), 
//                    "A left contact is not misassociated")
//             assert(!e._rightLower || (e._rightLower.body._topEntity == e && e._rightLower.otherBody._topEntity != e), 
//                    "A right contact is not misassociated")
//             assert(!e._upLower || (e._upLower.body._topEntity == e && e._upLower.otherBody._topEntity != e), 
//                    "A up contact is not misassociated")
//             assert(!e._downLower || (e._downLower.body._topEntity == e && e._downLower.otherBody._topEntity != e), 
//                    "A down contact is not misassociated")

//             let allBody = (e: Entity) => {
//                 if(e._bodies) {
//                     if(e._bodies instanceof Body) {
//                         return [e._bodies]
//                     } else {
//                         return e._bodies.all()
//                     }
//                 } else {
//                     return []
//                 }
//             }
//             // higher contacts are all with body of the given entity's top entity and otherBody of an other
//             assert(_.every(allBody(e), b => _.every(b._higherContacts, c => c.body._topEntity == e._topEntity && c.otherBody._topEntity != e._topEntity)), 
//                    "higher contacts body is one of the considered entity's bodies")

//             // every lower contact has a higher counterpart
//             assert(!e._leftLower || _.some(e._leftLower.otherBody._higherContacts, c => c.body == e._leftLower.otherBody && c.otherBody == e._leftLower.body && e._leftLower.side == c.side), 
//                    "A lower left contact has a higher counterpart")
//             assert(!e._rightLower || _.some(e._rightLower.otherBody._higherContacts, c => c.body == e._rightLower.otherBody && c.otherBody == e._rightLower.body && e._rightLower.side == c.side), 
//                    "A lower right contact has a higher counterpart")
//             assert(!e._upLower || _.some(e._upLower.otherBody._higherContacts, c => c.body == e._upLower.otherBody && c.otherBody == e._upLower.body && e._upLower.side == c.side), 
//                    "A lower up contact has a higher counterpart")
//             assert(!e._downLower || _.some(e._downLower.otherBody._higherContacts, c => c.body == e._downLower.otherBody && c.otherBody == e._downLower.body && e._downLower.side == c.side), 
//                    "A lower down contact has a higher counterpart")
//         }
//     }
// }