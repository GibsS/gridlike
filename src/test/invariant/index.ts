// import contactInvariant from './contact_invariant'
import hierarchyInvariant from './hierarchy_invariant'

import { World } from '../../lib'

export default function invariant(world: World) {
    // contactInvariant(world)
    hierarchyInvariant(world)
}