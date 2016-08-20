# Particle Emiting Engine for Canvas
## Versionnumber 0.2.1 (2016-08-20) Alpha
(***Documentation last update 2016-08-20 12:21***)  

Particle Emiting Engine with html5 canvas  
![Screenshot four particle-emitters](https://raw.githubusercontent.com/akumagamo/html-particle-engine/master/readme/screenshot_01.png "Screenshot after some seconds")  
  
[Small demo](https://rawgit.com/akumagamo/html-particle-engine/master/source/index.html)

## Features
* Emits particles
* particle renderer Customizable
* paritcle fades on lifespan ending
* calculate framerate
  * toggle framerate display
* "gravity" and "ambient Drag"
* paritcle bounce of "floor"

## WIP    

## Roadmap / Future Features
* bounce of walls
* emit adaptaions
  * multiple particles at the same time from same emitter
  * emit automatic particles in specified time interval
  * emit only specified amount of particels in specified time interval 

## Known Bugs

## Usage
     //Initialise Engine
     Engine.init({
            context: context,
            width: canvas.width,
            height:canvas.height
      });

      // Add ParticleEmiter 
      var particleEmitter = {
            emitedParticles:[],
            emitPoint: {x: 100, y: 100},
            emitVector: {x:1, y:1},
            emitSpeed: 1,
            particleMaxLifeSpan: 3000,
            particleSize: 10,
            particleColor: {r:0, g:0, b:0, a:1}
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
