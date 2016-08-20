
"use strict";

window.onload = function(){
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

    const MAX_LIFE_SPAN = 3000;
    const GRAVITY = 0.1;
    const VERTICAL_DRAG = -0.75;
    const HORIZANTAL_DRAG = 0.75;
    const EMIT_INTERVAL = 0;
    const RADIANT = {
        DEGREES_0: 0,
        DEGREES_360: 2 * Math.PI,
    }

    var RenderHelper = {
        drawCircle: function(context, x, y, radius, color){
            context.fillStyle = color;
            context.beginPath();
            context.arc(x, y, radius, RADIANT.DEGREES_0, RADIANT.DEGREES_360)
            context.closePath();
            context.fill();
        }
    }

    var ParticleFactory = {
        emitedParticles:[],
        emitPoint: {x, y},
        emitVector: {x:vx, y:vy},
        emitSpeed: speed,
        emitInterval: EMIT_INTERVAL,
        particleMaxLifeSpan: MAX_LIFE_SPAN,
        particleSize: size,
        emit: function(){
            this.emitedParticles.push(this.createParticle());
        },
        isParticleAlive: function(particle){
            return (new Date()).getTime() - particle.createTime <= particle.maxLifeSpan;
        },
        clearDestroyedParticles: function(){
            this.emitedParticles = this.emitedParticles.filter(p=>!p.isDestroyed);
        },
        render: function(context, borders){
            for (var idx = 0; idx < this.emitedParticles.length; idx++) {
                var particle = this.emitedParticles[idx];

                if(this.isParticleAlive(particle)){
                    
                    particle.vy += GRAVITY;

                    if(particle.y + particle.size > borders.height){
                        particle.vy *= VERTICAL_DRAG;
                        particle.vx *= HORIZANTAL_DRAG;
                        particle.y = borders.height - particle.size;
                    }else{
                        particle.y += particle.vy * particle.speed;
                    }
                    particle.x += particle.vx * particle.speed;

                    RenderHelper.drawCircle(context, particle.x, particle.y, particle.size, particle.getColor());
                } else {
                    particle.isDestroyed = true;
                }      
                
            }
            console.info(this.emitedParticles.length);
        },
        createParticle: function(){
            return {
                x: this.emitPoint.x, 
                y: this.emitPoint.y,
                vx: this.emitVector.x,
                vy: this.emitVector.y,
                maxLifeSpan: this.particleMaxLifeSpan,
                size: this.particleSize,
                speed: this.emitSpeed,
                createTime: (new Date()).getTime(),
                getColor: function (){
                    return "rgba(0, 0, 0, "+ (1 - ((new Date()).getTime() - this.createTime) / MAX_LIFE_SPAN) +")"
                }
            };
        }
    };

    const RENDER_TIMING = 30;

    var Engine = {
        isRendering: false,
        objectsToRender:[],
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
                objectToRender.render(this.context, {height:this.height});
            }
        },
        render: function (){
            this.clearScreen();
            this.renderObjectsOnScreen();
            if(this.isRendering){
                var engine = this;
                setTimeout(function(){engine.render()}, RENDER_TIMING);
            }
        }
    };

    Engine.init({
        context:context,
        width: canvas.width,
        height:canvas.height
    });
    Engine.addObjectToRender(ParticleFactory);
    Engine.startRender();

var rnd = (maxNumber)=> parseInt((Math.random()*100 * maxNumber)%maxNumber);

     setInterval(()=> {
        var sign = rnd(2)===0 ? -1 : 1;
        var slope = rnd(8)+1;
        ParticleFactory.emitVector.y = -slope;
        ParticleFactory.emitVector.x = sign;
        ParticleFactory.emit()
    }, 100);

}