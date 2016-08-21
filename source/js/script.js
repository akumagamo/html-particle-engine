"use strict";

window.onload = function(){

    const MAX_LIFE_SPAN = 1000;
    const GRAVITY = 0.1;
    const VERTICAL_DRAG = -0.75;
    const HORIZANTAL_DRAG = 0.75;
    const RENDER_FONT_COLOR = "rgba(255, 0, 0, 0.5)";
    const RADIANT = {
        DEGREES_0: 0,
        DEGREES_360: 2 * Math.PI,
    }
    const RENDER_TIMING = 30;

    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");

    canvas.width= 200;
    canvas.height= 200;

    var x = canvas.width/2;
    var y = canvas.height-10;
    var vx = 1;
    var vy = -2;
    var speed  = 1;
    var size = 5;

    var RenderHelper = {
        drawCircle: function(context, x, y, radius, color){
            context.fillStyle = color;
            context.beginPath();
            context.arc(x, y, radius, RADIANT.DEGREES_0, RADIANT.DEGREES_360)
            context.closePath();
            context.fill();
        }
    }

    var Engine = {
        isRendering: false,
        showFramerate: true,
        objectsToRender:[],
        firstRenderCall: (new Date()).getTime(),
        framesCount: 0,
        addObjectToRender: function(objecttorender){
           this.objectsToRender.push(objecttorender);
        },
        init: function(options){
            if(!options || ! options.context || ! options.width || ! options.height){
                throw "Missing Options Error";
            }
            this.context = options.context;
            this.width = options.width;
            this.height = options.height;
        },
        clearScreen: function(){
            this.context.clearRect(0, 0, this.width, this.height);
        },
        startRender: function(){
            this.isRendering = true;
            this.render();
        },
        stopRender: function(){
            this.isRendering = false;
        },
        renderObjectsOnScreen: function(){
            for(var idx=0; idx<this.objectsToRender.length; idx++){
                var objectToRender = this.objectsToRender[idx];                
                ParticleEmitterRunner.render(this.context, {height:this.height}, objectToRender);
            }
            this.increaseFrameRateCount();
        },
        increaseFrameRateCount: function(){
            this.framesCount++;              
        },
        getCurrentFps: function(){
            return (this.framesCount / ((new Date()).getTime() - this.firstRenderCall) * 1000).toFixed(2);
        },
        renderFps: function(){
            this.context.fillStyle = RENDER_FONT_COLOR;
            this.context.fillText( `${this.getCurrentFps()} fps`, 10, 10);
        },
        render: function (){
            this.clearScreen();
            this.renderObjectsOnScreen();
            if(this.showFramerate){
                this.renderFps();
            }
            if(this.isRendering){
                var engine = this;
                setTimeout(function(){engine.render()}, RENDER_TIMING);
            }
        }
    };
    
    var ParticleEmitterRunner = {
        cleanupDestroyedParticles: function(particleemitter){
            particleemitter.emitedParticles = particleemitter.emitedParticles.filter(p => !p.isDestroyed);
        },
        emit: function(particleemitter){
            if(!particleemitter.emitedParticles){
                particleemitter.emitedParticles = [];
            }
            if(Array.isArray(particleemitter.emitVector)){
                var particle = ParticleEmitterRunner.createParticle(particleemitter);
                for (var idx = 0; idx < particleemitter.emitVector.length; idx++) {
                    var emitVector = particleemitter.emitVector[idx];
                    var newParticle = Object.assign({}, particle);

                    console.info(newParticle);
                    console.info(emitVector);
                   
                    newParticle.getColor = particle.getColor;
                    newParticle.vx = emitVector.x;
                    newParticle.vy = emitVector.y;
                   
                    particleemitter.emitedParticles.push(newParticle);
                }
            } else {
                particleemitter.emitedParticles.push(ParticleEmitterRunner.createParticle(particleemitter));
            }
            
        },
        calculateNextTick: function(particleemitter, borders){
            this.cleanupDestroyedParticles(particleemitter);
            for (var idx = 0; idx < particleemitter.emitedParticles.length; idx++) {
                var particle = particleemitter.emitedParticles[idx];

                if(ParticleEmitterRunner.isParticleAlive(particle)){
                    
                    particle.vy += GRAVITY;

                    if(particle.y + particle.size > borders.height){
                        particle.vy *= VERTICAL_DRAG;
                        particle.vx *= HORIZANTAL_DRAG;
                        particle.y = borders.height - particle.size;
                    }else{
                        particle.y += particle.vy * particle.speed;
                    }
                    particle.x += particle.vx * particle.speed;
                   
                } else {
                    particle.isDestroyed = true;
                }      
            }
        },
        createParticle: function(particleemitter){
            return {
                x: particleemitter.emitPoint.x, 
                y: particleemitter.emitPoint.y,
                vx: particleemitter.emitVector.x,
                vy: particleemitter.emitVector.y,
                maxLifeSpan: particleemitter.particleMaxLifeSpan,
                size: particleemitter.particleSize,
                speed: particleemitter.emitSpeed,
                createTime: (new Date()).getTime(),
                color: {
                    r: particleemitter.particleColor.r, 
                    g: particleemitter.particleColor.g, 
                    b: particleemitter.particleColor.b, 
                    a: particleemitter.particleColor.a},
                getColor: function () {
                    this.color.a = (1 - ((new Date()).getTime() - this.createTime) / this.maxLifeSpan);
                    return `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.color.a})`;
                }
            };
        },
        isParticleAlive: function(particle){
            return  (new Date()).getTime() - particle.createTime <= particle.maxLifeSpan;
        },
        render: function(context, borders, particleemitter){
            this.calculateNextTick(particleemitter, borders);
            for (var idx = 0; idx < particleemitter.emitedParticles.length; idx++) {
                var particle = particleemitter.emitedParticles[idx];
                if(particleemitter.renderer){
                    particleemitter.renderer(context, particle);
                }else{
                    RenderHelper.drawCircle(context, particle.x, particle.y, particle.size / 2, particle.getColor());
                }
            } 
        }
    };

    var baseParticleEmitter = {
        emitedParticles:[],
        emitPoint: {x:0 , y:0 },
        emitVector: {x:0, y: 0},
        emitSpeed: 1,
        particleMaxLifeSpan: MAX_LIFE_SPAN,
        particleSize: size,
        particleColor: {r:0, g:0, b:0, a:1},
        renderer: function (context, particle){
            context.fillStyle = particle.getColor();
            context.fillRect(particle.x, particle.y, this.particleSize, this.particleSize);
        }
    };

    var particleEngineTest = () =>{

        var baseParticleEmitter1 = {
            emitedParticles:[],
            emitPoint: {x: canvas.width / 2, y: canvas.height -10},
            emitVector: [{x:vx, y:vy}, {x:-vx, y:vy}, {x:-vx-1, y:vy}, {x:vx-1, y:vy}, {x:vx+1, y:vy}],
            emitSpeed: speed,
            particleMaxLifeSpan: MAX_LIFE_SPAN,
            particleSize: size,
            particleColor: {r:0, g:0, b:0, a:1}
        };

        var baseParticleEmitter2 = {
            emitedParticles:[],
            emitPoint: {x: canvas.width - 10, y: canvas.height/2},
            emitVector: {x:vx, y:vy},
            emitSpeed: speed,
            particleMaxLifeSpan: MAX_LIFE_SPAN,
            particleSize: size,
            particleColor: {r:255, g:0, b:0, a:1}
        };

        var baseParticleEmitter3 = {
            emitedParticles:[],
            emitPoint: {x: 10, y: canvas.height/2},
            emitVector: {x:vx, y:vy},
            emitSpeed: speed,
            particleMaxLifeSpan: MAX_LIFE_SPAN,
            particleSize: size,
            particleColor: {r:0, g:255, b:0, a:1}
        };

        var baseParticleEmitter4 = {
            emitedParticles:[],
            emitPoint: {x: canvas.width / 2, y:  10},
            emitVector: {x:vx, y:vy},
            emitSpeed: speed,
            particleMaxLifeSpan: MAX_LIFE_SPAN,
            particleSize: size,
            particleColor: {r:0, g:0, b:255, a:1}
        };

        Engine.init({
            context: context,
            width: canvas.width,
            height:canvas.height
        });

        Engine.addObjectToRender(baseParticleEmitter1);
        Engine.addObjectToRender(baseParticleEmitter2);
       /* Engine.addObjectToRender(baseParticleEmitter3);
        Engine.addObjectToRender(baseParticleEmitter4);*/
        Engine.startRender();

        var rnd = (maxNumber)=> parseInt((Math.random()*100 * maxNumber)%maxNumber);
        var randomizeEmitterEmitVector = (emitter) =>{
            var sign = rnd(2)===0 ? -1 : 1;
            var slope = rnd(8)+1;
            emitter.emitVector.y = -slope;
            emitter.emitVector.x = sign;
        };
        setInterval(()=> {
            // randomizeEmitterEmitVector(baseParticleEmitter1);
            randomizeEmitterEmitVector(baseParticleEmitter2);
             /*randomizeEmitterEmitVector(baseParticleEmitter3);
            randomizeEmitterEmitVector(baseParticleEmitter4);*/
                    
            ParticleEmitterRunner.emit(baseParticleEmitter1);
            ParticleEmitterRunner.emit(baseParticleEmitter2);
            /*ParticleEmitterRunner.emit(baseParticleEmitter3);
            ParticleEmitterRunner.emit(baseParticleEmitter4);*/
        }, 500);
    };

    particleEngineTest();
}