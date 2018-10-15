var Engine = Matter.Engine,
    Events = Matter.Events,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    Common = Matter.Common,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Bounds = Matter.Bounds,
    Vertices = Matter.Vertices,
    Bodies = Matter.Bodies,
    Body = Matter.Body;

// create engine
var engine, world;

var mouseBounds;

var mouseStartX;
var mouseStartY;

var drippers = [];
var droplets = [];
var bars = [];
var waves = [];

var reverb;

var collisionThreshold = 2;

var equalTemperament = true;
var drawWaves = true;

var zoneY = 50;

var maxFreq = 80000;
var modMultiplier = 10;
var modIndex = 11;
var widthRange = {min:50,max:1000};

var backgroundColour;

var mouseTarget;

var tempo = 15;

for (var i = 1; i <= 8; i ++){
    setInterval(metronome,(60000/tempo)/i,i);
}


function preload() {

}

function setup() {
    createCanvas(window.innerWidth,window.innerHeight);
    engine = Engine.create({enableSleeping: true});
    world = engine.world;
    reverb = new p5.Reverb();
    reverb.set(4,2);
    Engine.run(engine);
    
    backgroundColour = color(0,0,0);
    cursor(CROSS);
    mouseBounds = Bounds.create()
}

function draw() {
    background(backgroundColour);
    stroke(255);
    strokeWeight(1);
    line(0,zoneY,width,zoneY);
    
    checkMouseTarget();
    
    for(let w of waves){
        w.update();
    }
    for(let d of droplets){
        d.update();
    }
    for(let b of bars){
        b.update();
    }
    for(let d of drippers){
        d.update();
    }
}

class Dripper{
    constructor(x,rate){
        this.x = x;
        this.rate = rate;
        
        this.mouseOver = false;
        this.mouseDragging = false;
        this.readyToDelete = false;
        
        this.mouseTarget = null;
        this.transformMode = null;
        
        this.rotation = Math.PI/2;
    }
    
    update(){
        if(this.rotation > Math.PI*1.5) {this.rotation = Math.PI/2; this.rate--}
        else if(this.rotation<Math.PI/2) {this.rotation = Math.PI*1.5; this.rate++}
        this.rate = constrain(this.rate,0,8);
        fill(255);
        noStroke();
        textAlign(CENTER,CENTER);
        text(this.rate,this.x,zoneY-35);
        fill(backgroundColour);
        if(this.readyToDelete) stroke(255,127);
        else stroke(255);
        if(this.mouseTarget == "Move" || this.transformMode == "Move") strokeWeight(2);
        else strokeWeight(1);
        
        var phase = sin(this.rotation);
        var xPositions = [
            map(phase,-1,1,25,35),
            map(phase,-1,1,15,45),
            map(phase,-1,1,35,25),
            map(phase,-1,1,45,15)
        ];
        fill(backgroundColour);
        beginShape();
        vertex(this.x+5,zoneY+10);
        vertex(this.x+5,zoneY-10);
        vertex(this.x+25,zoneY-10);
        vertex(this.x+25,zoneY);
        vertex(this.x+35,zoneY);
        vertex(this.x+35,zoneY-20);
        vertex(this.x-5,zoneY-20);
        vertex(this.x-5,zoneY+10);
        endShape(CLOSE);
        beginShape();
        vertex(this.x+32,zoneY-20);
        vertex(this.x+32,zoneY-30);
        vertex(this.x+28,zoneY-30);
        vertex(this.x+28,zoneY-20);
        endShape(CLOSE);
        if(this.mouseTarget == "Turn" || this.transformMode == "Turn") strokeWeight(2);
        else if (this.mouseTarget == null && this.transformMode == null) strokeWeight(1);
        beginShape();
        vertex(this.x+xPositions[2],zoneY-33);
        vertex(this.x+xPositions[2],zoneY-37);
        vertex(this.x+xPositions[3],zoneY-37);
        vertex(this.x+xPositions[3],zoneY-33);
        endShape(CLOSE);
        if (this.mouseTarget == null && this.transformMode == null) strokeWeight(1);
        beginShape();
        vertex(this.x+35,zoneY-30);
        vertex(this.x+35,zoneY-40);
        vertex(this.x+25,zoneY-40);
        vertex(this.x+25,zoneY-30);
        endShape(CLOSE);
        if(this.mouseTarget == "Turn" || this.transformMode == "Turn") strokeWeight(2);
        else if (this.mouseTarget == null && this.transformMode == null) strokeWeight(1);
        beginShape();
        vertex(this.x+xPositions[1],zoneY-33);
        vertex(this.x+xPositions[1],zoneY-37);
        vertex(this.x+xPositions[0],zoneY-37);
        vertex(this.x+xPositions[0],zoneY-33);
        endShape(CLOSE);
        
        if(this.transformMode == "Move") {
            this.x += (mouseX - pmouseX);
            if(mouseX<=5 || mouseX >=width-5) this.readyToDelete = true;
            else this.readyToDelete = false;
        }
        if(this.transformMode == "Turn") {
            this.rotation -= (mouseX - pmouseX)/30;
        }
    }
    
    checkMouseTarget(){
        if(mouseX>this.x-5&&mouseX<this.x+45) 
        {
            if(mouseY<zoneY && mouseY> zoneY - 20) this.mouseTarget = "Move";
            else if(mouseY<zoneY - 20) this.mouseTarget = "Turn";
            else this.mouseTarget = null;
        }
        else this.mouseTarget = null;
    }
    
    checkIfClicked(){
        this.transformMode = this.mouseTarget;
        if(this.transformMode != null) return true;
    }
    
    mouseUp(){
        this.transformMode = null;
        if(this.readyToDelete) this.destroy();
    }
    
    destroy(){
        drippers.splice(drippers.indexOf(this),1);
    }
    
    drip(){
        droplets.push(new Droplet(this.x,zoneY,6));
    }
}

class Droplet{
    constructor(x,y,size){
        this.size = size;
        this.body = Bodies.circle(x,y,size/2,{restitution:1.0, friction:0.01, collisionFilter: {category: 0o1, mask: 0o2}});
        World.add(world,this.body);

    }
    
    update(){
        var pos = this.body.position;
        var angle = this.body.angle;
        //fill(255);
        //noStroke();
        strokeWeight(this.size);
        stroke(255);
        //ellipse(0,0,this.size,this.size);
        point(pos.x,pos.y);
        
        if(pos.y>height) this.destroy();
        if(this.body.isSleeping) this.destroy();
        
        
    }
    
    destroy(){
        World.remove(world,this.body);
        droplets.splice(droplets.indexOf(this),1);
    }
}

class Bar{
    constructor(x,y,w,h,a){
        this.w = w;
        this.h = h;
        this.a = a;
        this.struck = 0.0;
        this.freq = maxFreq/this.w;
        if(equalTemperament) {this.freq = freqToMidi(this.freq); this.freq = midiToFreq(this.freq)};
        this.modAmount = map(h,5,50,this.freq*modMultiplier,0);
        
        this.pitchEnv = new p5.Env();
        this.pitchEnv.setADSR(0.0,0.03,0.0,0.03);
        
        this.env = new p5.Env();
        this.env.setADSR(0.015,0.5,0.0,0.5);
        this.env.setRange(0.2,0.0);
        
        this.modEnv = new p5.Env();
        this.modEnv.setADSR(0.02,0.1,0.0,0.1);
        this.modEnv.setRange(1.0,0.0);
        
        this.mod = new p5.Oscillator();
        this.mod.amp(this.modAmount);
        this.mod.amp(this.modEnv);
        this.mod.freq(this.freq*modIndex);
        this.mod.disconnect();
        this.mod.start();
        
        this.osc = new p5.Oscillator();
        this.osc.amp(this.env);
        this.osc.freq(this.freq);
        this.osc.freq(this.mod);
        //this.osc.freq(this.pitchEnv.mult(200));
        this.osc.pan(map(x,0,width,-1,1));
        this.osc.connect(reverb);
        this.osc.start();
        
        this.body = Bodies.rectangle(x,y,w,h,{ isStatic: true, collisionFilter: {category: 0o2 }});
        Body.setAngle(this.body,a);
        World.add(world,this.body);
        
        this.vertices = this.body.vertices;
        this.edges = [
            {x0: this.vertices[0].x, y0:this.vertices[0].y, x1: this.vertices[1].x, y1:this.vertices[1].y, hovered: false},
            {x0: this.vertices[1].x, y0:this.vertices[1].y, x1: this.vertices[2].x, y1:this.vertices[2].y, hovered: false},
            {x0: this.vertices[2].x, y0:this.vertices[2].y, x1: this.vertices[3].x, y1:this.vertices[3].y, hovered: false},
            {x0: this.vertices[3].x, y0:this.vertices[3].y, x1: this.vertices[0].x, y1:this.vertices[0].y, hovered: false}];
        
        
        this.mouseOver = false;
        this.mouseSelected = false;
        this.transformMode = null;
        this.mouseTarget = null;
        this.readyToDelete = false;
        
        this.startVertices = this.vertices;
        this.newVertices = this.vertices;
    }
    
    update(){
        var centre = Vertices.centre(this.body.vertices);
        var mouseDistance = dist(centre.x,centre.y,mouseX,mouseY);
        var pos = this.body.position;
        var angle = this.body.angle;
        var colour = lerpColor(backgroundColour,color(255),this.struck);
        this.vertices = this.body.vertices;


        this.edges = [
            {x0: this.vertices[0].x, y0:this.vertices[0].y, x1: this.vertices[1].x, y1:this.vertices[1].y},
            {x0: this.vertices[1].x, y0:this.vertices[1].y, x1: this.vertices[2].x, y1:this.vertices[2].y},
            {x0: this.vertices[2].x, y0:this.vertices[2].y, x1: this.vertices[3].x, y1:this.vertices[3].y},
            {x0: this.vertices[3].x, y0:this.vertices[3].y, x1: this.vertices[0].x, y1:this.vertices[0].y}];
        
        if(this.readyToDelete) stroke(255,127);
        else stroke(255);
        strokeWeight(1);
        
        strokeWeight(2);
        if(this.mouseTarget == "ScaleHeight" || this.transformMode == "ScaleHeight")
        { 
            this.drawArrow("Top");
            this.drawArrow("Bottom");  
            strokeWeight(1);
        }
        else if(this.mouseTarget == "ScaleWidth" || this.transformMode == "ScaleWidth")
        {
            this.drawArrow("Left");
            this.drawArrow("Right");
            strokeWeight(1);
        }
        else if (this.mouseTarget == "Move" || this.transformMode == "Move") strokeWeight(2);
        else if(this.mouseTarget == "Turn" || this.transformMode == "Turn"){
            strokeWeight(2);
            stroke(255);
            noFill();
            ellipse(centre.x,centre.y,100,100);
            strokeWeight(1);
        }
        else strokeWeight(1);
        
        fill(colour);
        beginShape();
        vertex(this.vertices[0].x,this.vertices[0].y);
        vertex(this.vertices[1].x,this.vertices[1].y);
        vertex(this.vertices[2].x,this.vertices[2].y);
        vertex(this.vertices[3].x,this.vertices[3].y);
        endShape(CLOSE);
        
        if(this.struck > 0.0) {
            this.struck -= 0.05;
        }
        
        for(let d of droplets){
            var collision = Matter.SAT.collides(this.body, d.body);

            if (collision.collided) {
                this.strike(collision.bodyB.speed,collision.bodyB.position.x,collision.bodyB.position.y);
            }
        }

        if(this.transformMode != null) this.updateTransform(this.transformMode);
    }
    
    checkMouseTarget(){
        var centre = Vertices.centre(this.body.vertices);
        var mouseDistance = dist(centre.x,centre.y,mouseX,mouseY);
        if(this.transformMode == null){
            if (isMouseOnLine(this.edges[0],4) || isMouseOnLine(this.edges[2],4)) {this.mouseTarget = "ScaleHeight"; return true;}
            else if (isMouseOnLine(this.edges[1],4) || isMouseOnLine(this.edges[3],4)) {this.mouseTarget = "ScaleWidth"; return true;}
            else if (Vertices.contains(this.body.vertices,{x:mouseX,y:mouseY})) {this.mouseTarget = "Move"; return true;}
            else if(mouseDistance<75){
                strokeWeight(1);
                stroke(255);
                noFill();
                ellipse(centre.x,centre.y,100,100);
                if(mouseDistance<55 && mouseDistance>45) {this.mouseTarget = "Turn"; return true;}
                else {this.mouseTarget = null; return true;}
            }
            else if(this.transformMode != null) {this.mouseTarget = transformMode; return true;}
            else {this.mouseTarget = null; return false;}
        }
        else return false;
    }
    drawArrow(side){
        switch(side){
            case "Top":
                line(this.edges[0].x0,this.edges[0].y0,this.edges[0].x1,this.edges[0].y1);
                var midpoint = {x:(this.edges[0].x0+this.edges[0].x1)/2,y:(this.edges[0].y0+this.edges[0].y1)/2};
                var target = {x:midpoint.x+(50*cos(this.body.angle-(Math.PI/2))),y:midpoint.y+(50*sin(this.body.angle-(Math.PI/2)))};
                line(midpoint.x,midpoint.y,target.x,target.y);
                line(target.x,target.y,target.x+(10*cos(this.body.angle+(Math.PI/4))),target.y+(10*sin(this.body.angle+(Math.PI/4))));
                line(target.x,target.y,target.x+(10*cos(this.body.angle+(Math.PI/4)*3)),target.y+(10*sin(this.body.angle+(Math.PI/4)*3)));
                break;
            case "Right":
                line(this.edges[1].x0,this.edges[1].y0,this.edges[1].x1,this.edges[1].y1);
                var midpoint = {x:(this.edges[1].x0+this.edges[1].x1)/2,y:(this.edges[1].y0+this.edges[1].y1)/2};
                var target = {x:midpoint.x+(50*cos(this.body.angle)),y:midpoint.y+(50*sin(this.body.angle))};
                line(midpoint.x,midpoint.y,target.x,target.y);
                line(target.x,target.y,target.x+(10*cos(this.body.angle+(Math.PI/4)*5)),target.y+(10*sin(this.body.angle+(Math.PI/4)*5)));
                line(target.x,target.y,target.x+(10*cos(this.body.angle+(Math.PI/4)*3)),target.y+(10*sin(this.body.angle+(Math.PI/4)*3)));
                break;
            case "Bottom":
                line(this.edges[2].x0,this.edges[2].y0,this.edges[2].x1,this.edges[2].y1);
                var midpoint = {x:(this.edges[2].x0+this.edges[2].x1)/2,y:(this.edges[2].y0+this.edges[2].y1)/2};
                var target = {x:midpoint.x+(50*cos(this.body.angle+(Math.PI/2))),y:midpoint.y+(50*sin(this.body.angle+(Math.PI/2)))};
                line(midpoint.x,midpoint.y,target.x,target.y);
                line(target.x,target.y,target.x+(10*cos(this.body.angle-(Math.PI/4))),target.y+(10*sin(this.body.angle-(Math.PI/4))));
                line(target.x,target.y,target.x+(10*cos(this.body.angle-(Math.PI/4)*3)),target.y+(10*sin(this.body.angle-(Math.PI/4)*3))); 
                break;
            case "Left":
                line(this.edges[3].x0,this.edges[3].y0,this.edges[3].x1,this.edges[3].y1);
                var midpoint = {x:(this.edges[3].x0+this.edges[3].x1)/2,y:(this.edges[3].y0+this.edges[3].y1)/2};
                var target = {x:midpoint.x+(50*cos(this.body.angle+(Math.PI))),y:midpoint.y+(50*sin(this.body.angle+(Math.PI)))};
                line(midpoint.x,midpoint.y,target.x,target.y);
                line(target.x,target.y,target.x+(10*cos(this.body.angle-(Math.PI/4)*7)),target.y+(10*sin(this.body.angle-(Math.PI/4)*7)));
                line(target.x,target.y,target.x+(10*cos(this.body.angle-(Math.PI/4))),target.y+(10*sin(this.body.angle-(Math.PI/4))));
                break;
        }
    }
    
    updateTransform(mode){
        var mouseMoveX = (mouseX - pmouseX);
        var mouseMoveY = (mouseY - pmouseY);
        var centre = Vertices.centre(this.body.vertices);
        switch(mode) {
        case "Move":
            Body.setPosition(this.body,{x:this.body.position.x+mouseMoveX,y:this.body.position.y+mouseMoveY});
            if(mouseX<=5 || mouseX>=width-5 || mouseY<=zoneY || mouseY>=height-5) this.readyToDelete = true;
            else this.readyToDelete = false;
            break;
        case "ScaleHeight":
            var nearestPoint = nearestPointOnLine({
                x0:(this.edges[3].x0+this.edges[3].x1)/2,
                y0:(this.edges[3].y0+this.edges[3].y1)/2,
                x1:(this.edges[1].x0+this.edges[1].x1)/2,
                y1:(this.edges[1].y0+this.edges[1].y1)/2});
            this.h = dist(nearestPoint.x,nearestPoint.y,mouseX,mouseY)*2;
            //this.h -= mouseMoveY;
            this.h = constrain(this.h,10,50);
            var newX1 = this.body.vertices[2].x+(this.h*cos(this.body.angle-(Math.PI/2)));
            var newY1 = this.body.vertices[2].y+(this.h*sin(this.body.angle-(Math.PI/2)));
            var newX2 = this.body.vertices[3].x+(this.h*cos(this.body.angle-(Math.PI/2)));
            var newY2 = this.body.vertices[3].y+(this.h*sin(this.body.angle-(Math.PI/2)));

            Body.setVertices(this.body,
            [{x:centre.x+newX2,y:centre.y+newY2},
             {x:centre.x+newX1,y:centre.y+newY1},
             {x:centre.x+this.body.vertices[2].x,y:centre.y+this.body.vertices[2].y},
             {x:centre.x+this.body.vertices[3].x,y:centre.y+this.body.vertices[3].y}
            ]);
            break;
        case "ScaleWidth":
            var nearestPoint = nearestPointOnLine({
                x0:(this.edges[0].x0+this.edges[0].x1)/2,
                y0:(this.edges[0].y0+this.edges[0].y1)/2,
                x1:(this.edges[2].x0+this.edges[2].x1)/2,
                y1:(this.edges[2].y0+this.edges[2].y1)/2});
            this.w = dist(nearestPoint.x,nearestPoint.y,mouseX,mouseY)*2;
            this.w = constrain(this.w,widthRange.min,widthRange.max);
            var newX1 = this.body.vertices[3].x+(this.w*cos(this.body.angle));
            var newY1 = this.body.vertices[3].y+(this.w*sin(this.body.angle));
            var newX2 = this.body.vertices[0].x+(this.w*cos(this.body.angle));
            var newY2 = this.body.vertices[0].y+(this.w*sin(this.body.angle));
            
            Body.setVertices(this.body,
            [{x:centre.x+this.body.vertices[0].x,y:centre.y+this.body.vertices[0].y},
             {x:centre.x+newX2,y:centre.y+newY2},
             {x:centre.x+newX1,y:centre.y+newY1},
             {x:centre.x+this.body.vertices[3].x,y:centre.y+this.body.vertices[3].y}
            ]);
            break;
        case "Turn":
            Body.rotate(this.body,(mouseMoveX+mouseMoveY)/100);
            break;
        default:
            break;
        } 
        
        var pos = Vertices.centre(this.body.vertices);
        this.osc.pan(map(pos.x,0,width,-1,1),0.1);
        this.freq = maxFreq/this.w;
        if(equalTemperament) {this.freq = freqToMidi(this.freq); this.freq = midiToFreq(this.freq)};
        this.modAmount = map(this.h,5,50,this.freq*modMultiplier,0);
        this.mod.amp(this.modAmount,0.1);
        this.osc.freq(this.freq,0.2);
        this.mod.freq(this.freq*modIndex,0.2);
        //this.osc.freq(this.pitchEnv.mult(200));
    }
    
    checkIfClicked(){
        this.transformMode = this.mouseTarget;
        if(this.transformMode != null) return true;
    }
    
    mouseUp(){
        this.transformMode = null;
        if(this.readyToDelete) this.destroy();
    }
    
    strike(magnitude,x,y){
        if(magnitude>collisionThreshold){
            this.env.setRange(map(magnitude,0,20,0.0,0.3),0.0);
            this.modEnv.setRange(map(magnitude,0,20,0.0,1.0),0.0);
            this.env.play();
            this.modEnv.play();
            this.pitchEnv.play();
            this.struck = map(magnitude,0,20,0.0,1.0);
            if(drawWaves)waves.push(new wave(x,y,magnitude));
        }
    }
    
    destroy(){
        World.remove(world,this.body);
        this.osc.stop();
        this.mod.stop();
        bars.splice(bars.indexOf(this),1);
    }
}

class wave{
    constructor(x,y,magnitude){
        this.x = x;
        this.y = y;
        this.size = 0;
        this.alpha = map(magnitude,0,20,0,200);
    }
    
    update(){
        if(this.alpha > 0) this.alpha -= 2;
        else this.destroy();
        this.size += 10;
        stroke(255,this.alpha);
        noFill();
        ellipse(this.x,this.y,this.size,this.size);
    }
    
    destroy(){
        waves.splice(waves.indexOf(this),1);
    }
}

function mousePressed() {
    mouseStartX = mouseX;
    mouseStartY = mouseY
    
    for(let b of bars){
        if(b.checkIfClicked()) return;
    }
    for(let d of drippers){
        if(d.checkIfClicked()) return;
    }
    
    if(mouseY < zoneY) drippers.push(new Dripper(mouseX,round(random(1,8))));
    else bars.push(new Bar(mouseX,mouseY,random(50,200),random(10,50),random(Math.PI/-4,Math.PI/4)));
}

function mouseReleased() {
    for(let b of bars){
        b.mouseUp();
    }
    for(let d of drippers){
        d.mouseUp();
    }
}

function checkMouseTarget(){
    var selectedBar;
    for(i = bars.length-1; i >= 0; i --){
        bars[i].mouseTarget = null;
    }
    for(i = bars.length-1; i >= 0; i --){
        if(bars[i].checkMouseTarget()) {selectedBar = i; break;}
    }
    for(i = drippers.length-1; i >= 0; i --){
        if(drippers[i].checkMouseTarget()) {break;}
    }
    return;
}

function keyPressed() {
  if(keyCode == 66){
      //bars.push(new Bar(mouseX,mouseY,random(widthRange.min,widthRange.max/2),random(20,40),random(-0.5,0.5)));
      bars.push(new Bar(mouseX,mouseY,random(50,200),random(10,50),random(Math.PI/-4,Math.PI/4)));
  }
    if(keyCode == 68){
      drippers.push(new Dripper(mouseX,round(map(mouseY,0,height,1,8))));
  }
}

function keyReleased(){
 
}

function isMouseOnLine(line,tolerance) {
    //
    lerp=function(a,b,x){ return(a+x*(b-a)); };
    var dx=line.x1-line.x0;
    var dy=line.y1-line.y0;
    var t=((mouseX-line.x0)*dx+(mouseY-line.y0)*dy)/(dx*dx+dy*dy);
    t = constrain(t,0,1);
    var lineX=lerp(line.x0, line.x1, t);
    var lineY=lerp(line.y0, line.y1, t);
    var dx=mouseX-lineX;
    var dy=mouseY-lineY;
    var distance=Math.abs(Math.sqrt(dx*dx+dy*dy));
    if(distance<tolerance){
        return true;
    }else{
        return false;
    }
};

function nearestPointOnLine(line) {
    //
    lerp=function(a,b,x){ return(a+x*(b-a)); };
    var dx=line.x1-line.x0;
    var dy=line.y1-line.y0;
    var t=((mouseX-line.x0)*dx+(mouseY-line.y0)*dy)/(dx*dx+dy*dy);
    t = constrain(t,0,1);
    var lineX=lerp(line.x0, line.x1, t);
    var lineY=lerp(line.y0, line.y1, t);
    return {x:lineX,y:lineY};
};

function metronome(step){
    for(let d of drippers){
        if (d.rate == step) d.drip();
    }
}

function printTotalObjects(){
    print("Bars: " + bars.length);
    print("Droplets: " + droplets.length);
    print("Drippers: " + drippers.length);
    print("Waves: " + waves.length);
    print("Total: " + (bars.length + droplets.length + drippers.length + waves.length));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
