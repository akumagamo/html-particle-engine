# Particle Emiting Engine for Canvas
## Versionnumber 0.4.0 (2016-08-21) Beta
(***Documentation last update 2016-08-21 11:45***)

Particle Emiting Engine with html5 canvas  
![Screenshot four particle-emitters](https://raw.githubusercontent.com/akumagamo/html-particle-engine/master/readme/screenshot_01.png "Screenshot after some seconds")  
  
[Small demo](https://rawgit.com/akumagamo/html-particle-engine/master/source/index.html)

## Features
* Emits particles
* particle renderer Customizable
* paritcle fades on lifespan ending
* emit multiple particles at the same time
* emitter can emit randomized particles 
* calculate framerate
  * toggle framerate display
* "gravity" and "ambient Drag"
* paritcle bounce of walls top, right, bottom, left

## WIP    

## Roadmap / Future Features
* emit adaptaions
  * emit automatic particles in specified time interval
  * emit only specified amount of particels in specified time interval 
* particle render image (png)
* particle render rotation

## Known Bugs
## Usage
     //Initialise Engine
     Engine.init({
            context: context,
            left: 0,
            top: 0,
            right: canvas.width,
            bottom:canvas.height
      });

      // Add ParticleEmiter 
      var particleEmitter = {
            emitedParticles: [],
            emitPoint: {x: 50, y: 100},
            emitVectors: [{x:1, y:1}, {x:-1, y:1}, {x:-1, y:1}],
            emitSpeed: 1,
            particleMaxLifeSpan: 1000,
            particleSize: size,
            particleColor: {r:0, g:0, b:0, a:1},
            shouldRandomizeEmitVector: true
        };
      Engine.addObjectToRender(particleEmitter);

      // Emit Particle
      ParticleEmitterRunner.emit(particleEmitter);

## SourceControl Link & Information
https://github.com/akumagamo/html-particle-engine.git

## Documentation

### File / Folder Structure

     +-+- html-particle-engine
       +-+- documents
       | +- jsdoc  (output directory for jsdoc script)
       +-+- logs (logfile default folder)
       +-+- readme
       | +- screenshot_01.png
       +-+- source
       | +- css
       | +-+- style.css
       | +- js
       | +-+- script.js
       | +- index.html
       +- readme.md (this document)
       +- LICENSE

### Options for the Engine init
* context:                    canvas context
* left:                       Border left
* top:                        Border top
* right:                      Border right
* bottom:                     Border bottom

### Options for the ParticleEmitter

* emitedParticles:            Array for storing emited particles
* emitPoint:                  Point from where the particles will be emitted
* emitVectors:                Array with the Vectors for emiting, will be ignored if **shouldRandomizeEmitVector** is set to **true**
* emitSpeed:                  Speed of emitted particle
* particleMaxLifeSpan:        Lifespan of created particles in **ms**
* particleSize:               Particle Size
* particleColor:              RGBA color Object
* shouldRandomizeEmitVector:  property if the EmitVector should be randomizied at every emit
