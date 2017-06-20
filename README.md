# gridlike : A physics engine tailor-made for making 2D platformers

It is often difficult to handle the movement of your 2D platformer character using generic physics libraries. 
gridlike is built from the ground up with the intention of being used to build platformers, making the process
of creating the logic for a character controller extremely straight forward (literally a dozen or so lines, barely more
if you want to get fancy, see below). 

It also comes with features that allow you to create modifiable grids like those of terraria or King arthur's gold.

Checkout some of the neat stuff you can do with it here: https://gibss.github.io/test/gridlike/

# Install

```sh
npm install --save grid-like
```

# Simple usage

Falling square:

```js
var gridlike = require('grid-like')

// world: the top level instance of the library, create entities and manage layers through it
var world = gridlike.createWorld()

// world contains a few function that allow you to create different entities with shapes attached to them
var entity = world.createRect({
  x: 0, y: 0,
  width: 1, height: 1,
  level: 1 // level 1 means it can get affected by entities with a level inferior to 1 strictly
})

var ground = world.createRect({
  x: 0, y: -2, width: 10, height: 1, level: 0
})

for(var i = 0; i < 100; i++) {
  entity.vy = -10
  world.simulate(0.016)
  console.log("entity pos:", entity.x, entity.y)
}
```

A (very) simple character controller:

```js
// character creation
var character = world.createRect({
  x: 0, y: 0,
  width: 1, height: 1,
  level: 1
})

// character logic (to run in your main loop)
if (character.hasDownContact) {
  // character is on the ground

  // jumping
  if(jump) {
      entity.vy = 8
  }
  // there are two types of "parenting": 
  // - static: the entity becomes a part of its parent
  // entity and has no independant movement 
  // - follow: the entity moves within the
  // referential of the followed parent entity. Perfect for moving platform, ships..

  // we use follow here so that the character can stay still on moving platforms
  character.setParent(entity.downContact.otherBody.entity, "follow")

  // walking
  if(moveLeft) {
      character.vx = -speed
  } else if(character.moveRight) {
      character.vx = speed
  } else {
      character.vx = 0
  }
} else {
  // character is in mid-air
  character.setParent(null)

  // mid-air movement
  if(moveLeft) {
      entity.vx = Math.max(-speed * 1.5, entity.vx - speed * delta * 2)
  } else if(entity.moveRight) {
      entity.vx = Math.min(speed * 1.5, entity.vx + speed * delta * 2)
  }
}

// gravity
character.vy -= 10 * delta
```

# Key features

## World creation

gridlike allows you to create the game world you want. The world is made up of entities which themselves contain a list of bodies. You can move entities around
with their speed vector.

*Creating a world*
```js
var world = gridlike.createWorld()
```

*Creating entities*
```js
// plain entity
var entity = world.createEntity({
  x: 0, y: 0,
  level: 1
})

// entity with a rect attached to it
var entity = world.createRect({
  x: 0, y: 0,
  width: 1, height: 3
})

// entity with a line attached to it
var entity = world.createLine({
  x: 2, y: 0,
  size: 4,
  isHorizontal: true
})
```

*Creating bodies*
```js
var body = entity.createRect({
  x: 1, y: 0, // within the local space of the entity centered around the position of the entity
  width: 1, height: 2
})
```

## Levels

A very important point to understand is the concept of levels: unlike most physics, there is a hierarchy of entities defined by 
their levels. If entity A is of a greater or equal level to an entity B, A will not be able to affect the trajectory of B. However if
B will affect the trajectory of A if their levels are different.

This allows you to define different categories of entities: A ground that is immobile, ships that can only be "redirected" by the ground 
and a character that is moved by both.

```js
A.level // = 1

B.level // = 0
```

## Simulation step

```js
world.simulate(seconds)
```

## Layering

Layers defined in the world allow you to filter collisions between any two bodies.

*Setting layer rules*
```js
world.setLayerRule("layer1", "layer2", "always") // to always collide (the default), layers are created if inexistant
world.setLayerRule("layer1", "layer2", "never")
world.setLayerRule("layer1", "layer2", "equal_group") // to collide if the .layerGroup of the two bodies is equal
world.setLayerRule("layer1", "layer2", "unequal_group") // to collide if the .layerGroup of the two bodies is different
```

*Settings layer and layer group on bodies*
```js
body.layer = "layer1"
body.layerGroup = 2

// or

var body = entity.createRect({
  x: 1, y: -2, 
  width: 1, height: 2
  layer: "layer1",
  layerGroup: 2
})
```

## Sensors

Sensors do not collide with other bodies, they just overlap and call the attached listener's event.

*Defining a listener*
```js
var listener = {
  overlapStart: function(body, otherBody, side) {
    console.log("overlap start!", otherBody.isSensor ? "with a sensor!" : "")
  },
  contactStart: function(body, otherbody, side) {
    console.log("new contact coming from side:", side)
  }
}

var entity.listener = listener
```

*Defining a body as a sensor*
```js
var body = entity.createRect({
  x: 0, y: 0,
  width: 1, height: 1,
  isSensor: true
})
```

## And more!

Check out the .d.ts definition file at the root of this repository for more information.

# Test + Testbed

Tests are included with the library alongside a testbed: a simple web page that has a few very simple use scenarios.

You can also find the testbed at https://gibss.github.io/test/gridlike/.

*Setup*
```sh
git clone https://github.com/GibsS/gridlike.git
cd gridlike
npm install
```

*Run the tests:*
```sh
npm test
```

*Run the testbed:*
```sh
npm run build-testbed
firefox dist/testbed/index.html # Or whatever browser you choose (but not safari, oh god (jk, safari works as well))
```

# Upcoming features

I am currently working on adding the following features:

- Slopes
- Enabling rotation on some entities 
- Co-existence of physics currently define in this library and "traditional" physics (Box2D, physics.js...)
- Movement locked to "rails": definition of node maps and fixed trajectories along those nodes
- Networking: more specifically the possibility to sync different worlds through the transmission of serialized messages
- Connexity detection on grids: evaluate dynamically whether a grid's blocks are all part of a single mass or not.
- Slopes in grids
- Serialization (maybe)

# State of the library

The library is still at a very early stage of development:
- Though the core features are implemented and usable to make a simple platformer, some of the more elaborate features remain to be implemented (The future of this library is bright though, trust me ;))
- Test coverage is minimal
- The only documentation is the index.d.ts
- Quite a few bugs remain
- ..

These issues will be adressed as soon as possible and the missing features will be added. In the meantime, the library is perfectly fine to reproduce
the physics of games such as super meat boy (without slopes), terraria (with ships if you so wish), super crate box, Super Mario Bros. (the first one ^^)..

# Contact

If you have any question, issues or bugs to report, don't hesitate to contact me at emerick.gibson@hotmail.fr or add an issue on this git repo.