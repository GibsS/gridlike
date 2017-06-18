export { World, createWorld } from './model/world'
export { Entity, EntityListener } from './model/entity'
export { Contact } from './model/contact'
export { Rect, Line, Grid, Body, EMPTY, BLOCK_TILE, DOWN_ONEWAY, UP_ONEWAY, LEFT_ONEWAY, RIGHT_ONEWAY } from './model/body'
export { RaycastResult, QueryResult } from './model/query'
export { LayerCollisionRule, Direction, ParentType, BodyType } from './model/enums'

import { createWorld } from './model/world'
import { LayerCollisionRule, Direction, ParentType, BodyType } from './model/enums'

if (typeof window !== "undefined") {
    (window as any).createWorld = createWorld;
    (window as any).LayerCollisionRule = LayerCollisionRule;
    (window as any).Direction = Direction;
    (window as any).ParentType = ParentType;
    (window as any).BodyType = BodyType;
}