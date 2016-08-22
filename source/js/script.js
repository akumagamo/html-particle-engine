"use strict";

window.onload = function(){

    const MAX_LIFE_SPAN = 3000;
    const GRAVITY = 0.1;
    const VERTICAL_DRAG = -0.75;
    const HORIZANTAL_DRAG = 0.75;
    const RENDER_FONT_COLOR = "rgba(255, 0, 0, 0.5)";
    const RADIANT = {
        ONE: 180 / Math.PI,
        DEGREES_0: 0,
        DEGREES_90: Math.PI / 2,
        DEGREES_180: Math.PI,
        DEGREES_270: Math.PI / 2 * 3,
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
        },
        drawTriangle: function(context, x, y, size, color){
            var height = Math.sqrt(Math.pow(size, 2) - Math.pow(size/2, 2));
            var halfSize = size / 2;
            
            context.fillStyle = color;
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x + halfSize, y + height);
            context.lineTo(x - halfSize, y + height);
            context.closePath();
            context.fill();
        },
        drawThirdOfACircle: function(context, x, y, radius, slicenumber, angleoffsetdegrees, color){
            var angleHelper = [0, RADIANT.DEGREES_360 / 3 , RADIANT.DEGREES_360 / 3 * 2];
            var angleHelper2 = [ RADIANT.DEGREES_360 / 3 , RADIANT.DEGREES_360 / 3 * 2, 0];
            var angleOffset = angleoffsetdegrees * RADIANT.ONE;
            var startAngle = angleOffset + angleHelper[slicenumber];
            var endAngle = angleOffset + angleHelper2[slicenumber];

            context.fillStyle = color;

            context.beginPath();
            context.arc(x, y, radius, startAngle, endAngle);
            context.lineTo(x, y);
            context.closePath();
            context.fill();
        },
        constants:{
            SLICE_ONE:0,
            SLICE_TWO:1,
            SLICE_THREE:2,
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
            console.info(options);
            if( options === undefined || 
                options.context === undefined || 
                options.top === undefined || 
                options.bottom === undefined ||
                options.left === undefined ||
                options.right === undefined){
                throw "Missing Options Error";
            }
            this.context = options.context;
            this.top = options.top;
            this.bottom = options.bottom;
            this.left = options.left;
            this.right = options.right;
        },
        clearScreen: function(){
            this.context.clearRect(this.left, this.top, this.right, this.bottom);
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
                ParticleEmitterRunner.render(this.context, {top:this.top, left:this.left, bottom:this.bottom, right: this.right}, objectToRender);
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
            var newParticle;

            if(!particleemitter.emitedParticles){
                particleemitter.emitedParticles = [];
            }

            var particle = ParticleEmitterRunner.createParticle(particleemitter);
            for (var idx = 0; idx < particleemitter.emitVectors.length; idx++) {
                var emitVector = particleemitter.emitVectors[idx];
                newParticle = Object.assign({}, particle);

                newParticle.getColor = particle.getColor;
                newParticle.vx = emitVector.x;
                newParticle.vy = emitVector.y;
                newParticle.index = idx;
                
                if(particleemitter.shouldRandomizeEmitVector){
                    this.randomizeEmitterEmitVector(newParticle);
                }
                particleemitter.emitedParticles.push(newParticle);
            }
            
        },
        calculateNextTick: function(particleemitter, borders){
            this.cleanupDestroyedParticles(particleemitter);
            for (var idx = 0; idx < particleemitter.emitedParticles.length; idx++) {
                var particle = particleemitter.emitedParticles[idx];

                if(ParticleEmitterRunner.isParticleAlive(particle)){
                    
                    particle.vy += GRAVITY;
                    particle.y += particle.vy * particle.speed;
                    particle.x += particle.vx * particle.speed;

                    if(borders.bottom!== undefined && borders.bottom < particle.y + particle.size){
                        particle.vy *= VERTICAL_DRAG;
                        particle.vx *= HORIZANTAL_DRAG;
                        particle.y = borders.bottom - particle.size;
                    }

                    if(borders.top!== undefined && borders.top > particle.y - particle.size){
                        particle.vy *= VERTICAL_DRAG;
                        particle.vx *= HORIZANTAL_DRAG;
                        particle.y = borders.top + particle.size;
                    }

                    if(borders.left!== undefined && borders.left > particle.x - particle.size){
                        particle.vx *= -HORIZANTAL_DRAG;
                        particle.x = borders.left + particle.size;
                    }

                    if(borders.right!== undefined && borders.right < particle.x + particle.size){;
                        particle.vx *= -HORIZANTAL_DRAG;
                        particle.x = borders.right - particle.size;
                    }

                } else {
                    particle.isDestroyed = true;
                }      
            }
        },
        randomizeEmitterEmitVector: function(particle){
            var rnd = (maxNumber)=> parseInt((Math.random()*100 * maxNumber)%maxNumber);
            var sign = rnd(2)===0 ? -1 : 1;
            var slope = rnd(8)+1;
            particle.vy = -slope;
            particle.vx = sign;
        },
        createParticle: function(particleemitter){
            return {
                x: particleemitter.emitPoint.x, 
                y: particleemitter.emitPoint.y,
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
                    RenderHelper.drawCircle(context, particle.x, particle.y, (particle.size / 2) * particle.color.a, particle.getColor());
                }
            } 
        }
    };

    var particleEngineTest = () =>{

        var baseParticleEmitter1 = {
            emitedParticles:[],
            emitPoint: {x: canvas.width / 2, y: canvas.height -60},
            emitVectors: [{x:vx, y:vy}, {x:-vx, y:vy}, {x:-vx-1, y:vy}],
            emitSpeed: speed,
            particleMaxLifeSpan: MAX_LIFE_SPAN,
            particleSize: size,
            particleColor: {r:0, g:0, b:0, a:1},
            shouldRandomizeEmitVector: true
        };

        var baseParticleEmitter2 = {
            emitedParticles:[],
            emitPoint: {x: canvas.width / 2, y: canvas.height / 2},
            emitVectors: [{x:-2, y:-2}, {x:1, y:-3}, {x:2, y:-2}],
            emitSpeed: speed * 1.5,
            particleMaxLifeSpan: MAX_LIFE_SPAN,
            particleSize: size ,
            particleColor: {r:255, g:0, b:0, a:1},
            shouldRandomizeEmitVector: true,
            renderer : (context, particle) =>{
              RenderHelper.drawThirdOfACircle(context, 
                    particle.x, 
                    particle.y, 
                    particle.size, 
                    particle.index, 
                    0, 
                    particle.getColor());
            }
        };

        Engine.init({
            context: context,
            left: 0,
            top: 0,
            right: canvas.width,
            bottom: canvas.height
        });

       // Engine.addObjectToRender(baseParticleEmitter1);
        Engine.addObjectToRender(baseParticleEmitter2);

        Engine.startRender();

        setInterval(()=> {
           // ParticleEmitterRunner.emit(baseParticleEmitter1);
            ParticleEmitterRunner.emit(baseParticleEmitter2);
        }, RENDER_TIMING*20);
    };

    particleEngineTest();

}