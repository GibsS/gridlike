import contactInvariant from './contactInvariant'
import hierarchyInvariant from './hierarchyInvariant'

import { World } from '../../lib'

export default function invariant(world: World) {
    contactInvariant(world)
    hierarchyInvariant(world)
}