// import * as assert from 'assert'
// import * as _ from 'lodash'
// import { nearEqual } from './helper'

// import invariant  from './invariant'

// import { World, Entity, Body } from '../lib/index'

// export default function test() {
//     describe('Contacts', function() {
//         var world: World,
//             ent1: Entity, body1: Body,
//             ent2: Entity, body2: Body,
//             ent3: Entity, body3: Body,
//             ent4: Entity, body4: Body,
//             contact1, contact2, contact3, contact4

//         beforeEach(function() {
//             world = new World()

//             world.setLayerRule("l1", "l2", "never")
//             world.setLayerRule("l1", "l3", "equal_group")

//             ent1 = world.createRect({
//                 x: 0, y: 0,
//                 level: 1,
//                 layer: "l3", layerGroup: 1,
//                 width: 1, height: 1
//             })
//             body1 = ent1.body
//             ent2 = world.createLine({
//                 x: 0, y: 1,
//                 level: 0,
//                 layer: "l1", layerGroup: 1,
//                 size: 1, isHorizontal: true
//             })
//             body2 = ent2.body
//             ent3 = world.createRect({
//                 x: 1,
//                 y: 1,
//                 level: 1,
//                 width: 1,
//                 height: 1
//             })
//             body3 = ent3.body
//             ent4 = world.createRect({
//                 x: 1,
//                 y: 0,
//                 level: 0,
//                 width: 1,
//                 height: 1
//             })
//             body4 = ent4.body

//             contact1 = { body1, body2, isHorizontal: false }
//             contact2 = { body1: body2, body2: body3, isHorizontal: true }
//             contact3 = { body1: body4, body2: body3, isHorizontal: false }
//             contact4 = { body1: body1, body2: body4, isHorizontal: true }
            
//             ent1._upLower = contact1
//             ent1._rightLower = contact4

//             body2._higherContacts = [contact1, contact2]
            
//             ent3._leftLower = contact2
//             ent3._downLower = contact3

//             body4._higherContacts = [contact3, contact4]
//         })

//         describe('Contact clearing', function() {
//             it('Test setup should verify invariant', function() {
//                 invariant(world)
//             })
            
//             it('Setting a body to sensor removes all contacts', function() {
//                 (body1 as any).isSensor = false
//                 invariant(world);

//                 (body2 as any).isSensor = false
//                 invariant(world)
//             })

//             it('Changing the layer of a body will disable the newly filtered out contacts', function() {
//                 (body2 as any).layer = "l2"
//                 invariant(world)
//             })
//             it('Changing the layerGroup of a body will disable the newly filtered out contacts', function() {
//                 (body2 as any).layerGroup = 3
//                 invariant(world)
//             })

//             it('Moving along the x axis clears left and right contacts', function() {
//                 body1.x -= 1
//                 invariant(world)
//                 assert(body1.leftContact == null && body1.rightContact == null)
//             })

//             it('Moving along the y axis clears down and up contacts', function() {
//                 body1.y -= 1
//                 invariant(world)
//                 assert(body1.upContact == null && body1.downContact == null)
//             })

//             it('[INTERNAL] Body._clearContacts remove all contacts', function() {
//                 (body1 as any)._clearContacts();
//                 (body2 as any)._clearContacts()
//                 invariant(world)
//                 assert(!body1._entity._upLower, "body lower is null after clear contacts")
//                 assert(!body1._entity._downLower, "body lower is null after clear contacts")
//                 assert(!body1._entity._rightLower, "body lower is null after clear contacts")
//                 assert(!body1._entity._leftLower, "body lower is null after clear contacts")
//                 assert(!body1._higherContacts || body1._higherContacts.length == 0, "body higher list is empty")

//                 assert(!body2._entity._upLower, "body lower is null after clear contacts")
//                 assert(!body2._entity._downLower, "body lower is null after clear contacts")
//                 assert(!body2._entity._rightLower, "body lower is null after clear contacts")
//                 assert(!body2._entity._leftLower, "body lower is null after clear contacts")
//                 assert(!body2._higherContacts || body2._higherContacts.length == 0, "body higher list is empty")
//             })
//         })

//         describe('Get contacts', function() {
//             it('Body.leftContact and Entity.leftContact returns left lower contact', function() {
//                 assert(ent3.leftContact != null && ent3.leftContact.side == "left")
//                 assert(body3.leftContact != null && body3.leftContact.side == "left" && body3.leftContact.body == body3)
//             })
//             it('Body.rightContact and Entity.rightContact returns right lower contact', function() {
//                 assert(ent1.rightContact != null && ent1.rightContact.side == "right")
//                 assert(body1.rightContact != null && body1.rightContact.side == "right" && body1.rightContact.body == body1)
//             })
//             it('Body.upContact contact and Entity.upContact returns up lower contact', function() {
//                 assert(ent1.upContact != null && ent1.upContact.side == "up")
//                 assert(body1.upContact != null && body1.upContact.side == "up" && body1.upContact.body == body1)
//             })
//             it('Body.downContact contact and Entity.downContact returns down lower contact', function() {
//                 assert(ent3.downContact != null && ent3.downContact.side == "down")
//                 assert(body3.downContact != null && body3.downContact.side == "down" && body3.downContact.body == body3)
//             })

//             it('Entity.contacts contains exactly the higher contacts', function(){
//                 assert(ent1.contacts.length == 2, "ent1's contact are all present")
//                 assert(ent2.contacts.length == 2, "ent2's contact are all present")
//                 assert(ent3.contacts.length == 2, "ent3's contact are all present")
//                 assert(ent4.contacts.length == 2, "ent4's contact are all present")
//             })
//         })

//         describe('Contacts and level', function() {
//             it('Changing the level of an entity will adapt the contact correctly /1', function() {
//                 ent1.level = 3
//                 invariant(world)
//                 assert(ent1.contacts.length == 2)
//             })
//             it('Changing the level of an entity will adapt the contact correctly /2', function() {
//                 ent2.level = 0
//                 invariant(world)
//                 assert(ent2.contacts.length == 2)
//             })
//         })
//     })
// }