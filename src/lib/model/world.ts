import { Entity } from './entity'

import { RaycastResult, QueryResult } from './query'
import { LayerCollision } from './enums'

export class World {

    _time: number
    
    layerIds: any
    layerNames: string[]
    _layers: number[]

    _ents: Entity[][]

    constructor() {
        this._time = 0

        this.layerIds = {}
        this.layerNames = new Array(32)
        this._layers = new Array(64)

        this.layerIds["default"] = 0
        this.layerNames[0] = "default"
        this._layers[0] = 0xFFFFFFFF
        this._layers[32] = 0xFFFFFFFF

        for(let i = 1; i < 32; i++) {
            this._layers[i] = 0x3
            this._layers[i+32] = 0x0
        }
    }

    // ##### TIME
    get time(): number { return this._time }
    set time(val: number) { console.log("[ERROR] you can't change the time")}

        get layers(): string[] { return Object.keys(this.layerIds).filter(l => l) }

    // ##### LAYER
    addLayer(layer: string) {
        let i = 16
        while(i < 32 && this.layerNames[i]) {
            i++
        }
        if(i == 32) {
            console.log("[ERROR] Can't add layer: no more layers available")
        } else {
            this.layerNames[i] = layer
            this.layerIds[layer] = i
        }
    }
    setLayerRule(layer1: string, layer2: string, rule: string) {
        if(!this.layerIds[layer1]) {
            this.addLayer(layer1)
        }
        if(!this.layerIds[layer2]) {
            this.addLayer(layer2)
        }
        
        let id1 = this.layerIds[layer1],
            id2 = this.layerIds[layer2]
        
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
        let id1 = this.layerIds[layer1],
            id2 = this.layerIds[layer2]
        
        switch(this._getLayerRule(id1, id2)) {
            case 0x3: return LayerCollision.ALWAYS
            case 0x2: return LayerCollision.EQUAL_GROUP
            case 0x1: return LayerCollision.UNEQUAL_GROUP
            case 0: return LayerCollision.NEVER
        }
    }

    // ##### ENTITIES
    createEntity(args): Entity {
        return null
    }
    createRect(args): Entity {
        return null
    }
    createLine(args): Entity {
        return null
    }
    createGrid(args): Entity {
        return null
    }
    destroyEntity(entity: Entity) {

    }

    // ##### QUERYING
    raycast(x: number, y: number, dx: number, dy: number): RaycastResult {
        return null
    }
    queryRect(x: number, y, number, w: number, h: number): QueryResult {
        return null
    }
}