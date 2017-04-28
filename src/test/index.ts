import { component, system, entity, environment, Component, System } from '../lib/index'

class TestComponent extends Component {

    hadUpdate: boolean

    constructor() {
        super()
        this.hadUpdate = false
    }

    onCreate() {
        console.log("on create: " + this.name)

        setTimeout(() => {
            this.destroy()
        }, 1000)
    }
    onEnable() {
        console.log("on enable: " + this.name)
    }

    update() {
        if(!this.hadUpdate) {
            console.log("update! " + this.name)
            this.hadUpdate = true
        }
    }

    onDisable() {
        console.log("on disable: " + this.name)
    }
    onDestroy() {
        console.log("on destroy: " + this.name)
    }
}

class TestSystem extends System {

    onCreate() {
        console.log("on create system")

        setTimeout(() => {
            this.environment.createEntity('test-entity')
        }, 1000)
    }
    onEnable() {
        console.log("on enable system")
    }

    onEntityCreate() {
        console.log("entity create system")
    }
    onDestroyCreate() {
        console.log("entity destroyed system")
    }

    onDisable() {
        console.log("on disable system")
    }
    onDestroy() {
        console.log("on destroy system")
    }

}

component("test", TestComponent)
system("test-system", TestSystem)
entity("test-entity", [{ name: "test", args: null }])

environment({
    systems: [],
    entities: []
}, env => {
    env.createEntity("test-entity")
    env.createSystem("test-system")
})