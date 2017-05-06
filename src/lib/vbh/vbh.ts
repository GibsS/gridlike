import * as _ from 'lodash'

export interface VBH<X> {

    all(): X[]
    forAll(lambda: (b: X) => void)

    insert(element: X)
    bulkInsert(elements: X[])
    remove(element: X)
}

export class SimpleVBH<X> implements VBH<X> {

    elements: X[]

    constructor() {
        this.elements = []
    }

    all(): X[] {
        return _.clone(this.elements)
    }
    forAll(lambda: (x: X) => void) {
        this.elements.forEach(x => lambda(x))
    }

    insert(element: X) {
        this.elements.push(element)
    }
    bulkInsert(elements: X[]) {
        this.elements.push.apply(this.elements, elements)
    }
    remove(element: X) {
        let i = this.elements.indexOf(element)
        if(i >= 0) {
            this.elements.splice(i, 1)
        }
    }
}