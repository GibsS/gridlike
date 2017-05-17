import * as _ from 'lodash'

import { Entity, EntityArgs } from './entity'
import { Body, RectArgs, LineArgs, GridArgs } from './body'

import { RaycastResult, QueryResult } from './query'
import { VBH, SimpleVBH } from '../vbh/vbh'
import { LayerCollision } from './enums'

export const EPS = 0.001

export class World {

    _time: number
    
    _layerIds: any
    _layerNames: string[]
    _layers: number[]

    _ents: Entity[][]

    _vbh: VBH<Entity>

    constructor() {
        this._time = 0

        this._layerIds = {}
        this._layerNames = new Array(32)
        this._layers = new Array(64)

        this._layerIds["default"] = 0
        this._layerNames[0] = "default"
        this._layers[0] = 0xFFFFFFFF
        this._layers[32] = 0xFFFFFFFF

        for(let i = 1; i < 32; i++) {
            this._layers[i] = 0x3
            this._layers[i+32] = 0x0
        }

        this._ents = []

        this._vbh = new SimpleVBH<Entity>()
    }

    // ##### TIME
    get time(): number { return this._time }
    set time(val: number) { console.log("[ERROR] you can't change the time")}

    get layers(): string[] { return Object.keys(this._layerIds).filter(l => l) }

    // ##### LAYER
    _getLayer(layer: string): number {
        let id = this._layerIds[layer]

        if(id != null) {
            return id
        } else {
            this.addLayer(layer)
            let id = this._layerIds[layer]
            if(id != null) {
                return id
            } else {
                return 0
            }
        }
    }
    addLayer(layer: string) {
        let i = 16
        while(i < 32 && this._layerNames[i]) {
            i++
        }
        if(i == 32) {
            console.log("[ERROR] Can't add layer: no more layers available")
        } else {
            this._layerNames[i] = layer
            this._layerIds[layer] = i
        }
    }
    setLayerRule(layer1: string, layer2: string, rule: string) {
        // TODO CLEAR ALL CONTACTS THAT DON'T FIT THE NEW RULE
        if(!this._layerIds[layer1]) {
            this.addLayer(layer1)
        }
        if(!this._layerIds[layer2]) {
            this.addLayer(layer2)
        }
        
        let id1 = this._layerIds[layer1],
            id2 = this._layerIds[layer2]
        
        if(id2 >= 16) {
            let add, clear = ~(3 << (2 * id2 - 16))
            switch(rule) {
                case LayerCollision.ALWAYS: add = 3 << (2 * id2 - 16); break
                case LayerCollision.EQUAL_GROUP: add = 2 << (2 * id2 - 16); break
                case LayerCollision.UNEQUAL_GROUP: add = 1 << (2 * id2 - 16); break
                case LayerCollision.NEVER: add = 0; break
            }
            this._layers[id1+32] = ((this._layers[id1+32] & clear) | add)
        } else {
            let add, clear = ~(3 << 2 * id2)
            switch(rule) {
                case LayerCollision.ALWAYS: add = 3 << (2 * id2); break
                case LayerCollision.EQUAL_GROUP: add = 2 << (2 * id2); break
                case LayerCollision.UNEQUAL_GROUP: add = 1 << (2 * id2); break
                case LayerCollision.NEVER: add = 0; break
            }
            this._layers[id1] = ((this._layers[id1] & clear) | add)
        }
        if(id1 != id2) {
            if(id1 >= 16) {
                let add, clear = ~(3 << (2 * id1 - 16))
                switch(rule) {
                    case LayerCollision.ALWAYS: add = 3 << (2 * id1 - 16); break
                    case LayerCollision.EQUAL_GROUP: add = 2 << (2 * id1 - 16); break
                    case LayerCollision.UNEQUAL_GROUP: add = 1 << (2 * id1 - 16); break
                    case LayerCollision.NEVER: add = 0; break
                }
                this._layers[id2+32] = ((this._layers[id2+32] & clear) | add)
            } else {
                let add, clear = ~(3 << 2 * id1)
                switch(rule) {
                    case LayerCollision.ALWAYS: add = 3 << (2 * id1); break
                    case LayerCollision.EQUAL_GROUP: add = 2 << (2 * id1); break
                    case LayerCollision.UNEQUAL_GROUP: add = 1 << (2 * id1); break
                    case LayerCollision.NEVER: add = 0; break
                }
                this._layers[id2] = ((this._layers[id2] & clear) | add)
            }
        }
    }
    _getLayerRule(id1: number, id2: number): number {
        if(id2 < 16) {
            let b = 2 * id2, a = 3 << b
            return (this._layers[id1] & a) >> b
        } else {
            let b = (2 * id2 - 16), a = 3 << b
            return (this._layers[id1 + 32] & a) >> b
        }
    }
    getLayerRule(layer1: string, layer2: string): string {
        let id1 = this._layerIds[layer1],
            id2 = this._layerIds[layer2]
        
        switch(this._getLayerRule(id1, id2)) {
            case 0x3: return LayerCollision.ALWAYS
            case 0x2: return LayerCollision.EQUAL_GROUP
            case 0x1: return LayerCollision.UNEQUAL_GROUP
            case 0: return LayerCollision.NEVER
        }
    }

    // ##### ENTITIES
    createEntity(args: EntityArgs): Entity {
        let entity = new Entity(this, args)
        this._addEntity(entity)
        return entity
    }
    createRect(args: RectArgs & { level?: number }): Entity {
        (args as any).type = "rect"
        let entity = new Entity(this, args as any)
        this._addEntity(entity)
        return entity
    }
    createLine(args: LineArgs & { level?: number }): Entity {
        (args as any).type = "line"
        let entity = new Entity(this, args as any)
        this._addEntity(entity)
        return entity
    }
    createGrid(args: GridArgs & { level?: number }): Entity {
        (args as any).type = "grid"
        let entity = new Entity(this, args as any)
        this._addEntity(entity)
        return entity
    }
    _addEntity(entity: Entity) {
        if(this._ents[entity._level]) {
            this._ents[entity._level].push(entity)
        } else {
            this._ents[entity._level] = [entity]
        }
        this._addTopEntity(entity)
    }
    _addTopEntity(entity: Entity) {
        this._vbh.insert(entity)
    }
    _removeTopEntity(entity: Entity) {
        this._vbh.remove(entity)
    }
    destroyEntity(entity: Entity) {
        if(entity == entity._topEntity) {
            this._removeTopEntity(entity)
        }
        entity._setParent(null, 0)
        for(let c of _.clone(entity._childs)) {
            c._setParent(null, 0)
        }
        let i = this._ents[entity.level].indexOf(entity)
        if(i >= 0) {
            this._ents[entity.level].splice(i, 1)
        }
        entity._listener = null
    }

    // ##### QUERYING
    raycast(x: number, y: number, dx: number, dy: number): RaycastResult {
        return null
    }
    queryRect(x: number, y, number, w: number, h: number): QueryResult {
        return null
    }

    // ##### SIMULATION
    simulate(delta: number) {
        this._time += delta

        // I. CALCULATE MOVEMENT OF ALL ENTITIES 

        // II. GET ALL POTENTIAL COLLISION, FILTERED OUT

        // III. SOLVE MOVEMENT OF ALL ENTITIES: DEFINE NEW X, Y, VX, VY AND CONTACTS
    }
    _move(entity: Entity, dx: number, dy: number) {

    }

    // SIMULATION PROCEDURES
    broadphase(): Body[][] {
        return null
    }
}