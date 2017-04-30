import * as _ from 'lodash'

export interface VBH<X> {

    all(): X[]

    insert(element: X)
    remove(element: X)
}

export class SimpleVBH<X> implements VBH<X> {

    elements: X[]

    all(): X[] {
        return _.clone(this.elements)
    }

    insert(element: X) {
        this.elements.push(element)
    }
    remove(element: X) {
        let i = this.elements.indexOf(element)
        if(i >= 0) {
            this.elements.splice(i, 1)
        }
    }
}