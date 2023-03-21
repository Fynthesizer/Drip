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

var reverb, delay;

var collisionThreshold = 2;

var tuneNotes = true;
var keySig = [0, 2, 4, 5, 7, 9, 10];
var drawWaves = true;

var zoneY = 50;

var maxFreq = 100000;
var modMultiplier = 3;
var modIndex = 20;
var widthRange = {
  min: 50,
  max: 1000,
};

var backgroundColour;

var tempo = 15;

var isMobile = false;

for (var i = 1; i <= 8; i++) {
  setInterval(metronome, 60000 / tempo / i, i);
}

function preload() {
  soundFormats("wav");
}

function setup() {
  engine = Engine.create({
    enableSleeping: true,
  });
  world = engine.world;
  reverb = new p5.Reverb();
  reverb.set(6, 2);

  delay = new p5.Delay();
  delay.delayTime(0.5);
  delay.feedback(0.5);
  Engine.run(engine);

  backgroundColour = color(19, 21, 23);
  smooth();
  cursor(CROSS);
  mouseBounds = Bounds.create();

  if (
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
      navigator.userAgent
    ) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
      navigator.userAgent.substr(0, 4)
    )
  ) {
    isMobile = true;
  }

  createCanvas(window.innerWidth, window.innerHeight);

  drippers.push(
    new Dripper(random(width * 0.33, width * 0.66), round(random(2, 4)))
  );
}

function draw() {
  background(backgroundColour);
  stroke(255);
  strokeWeight(1);
  line(0, zoneY, width, zoneY);

  if (!isMobile || (isMobile && touches.length > 0)) checkMouseTarget();

  for (let w of waves) {
    w.update();
  }
  for (let d of droplets) {
    d.update();
  }
  for (let b of bars) {
    b.update();
  }
  for (let d of drippers) {
    d.update();
  }
}

class Dripper {
  constructor(x, rate) {
    this.x = x;
    this.rate = rate;

    this.mouseOver = false;
    this.readyToDelete = false;

    this.mouseTarget = null;
    this.transformMode = null;

    this.rotation = Math.PI / 2;

    this.dripSound = loadSound("drip");
    this.dripSound.connect(reverb);
    this.dripSound.amp(0.5);
    this.dripSound.pan(map(this.x, 0, width, -1, 1));
  }

  update() {
    if (this.rotation > Math.PI * 1.5) {
      this.rotation = Math.PI / 2;
      this.rate--;
    } else if (this.rotation < Math.PI / 2) {
      this.rotation = Math.PI * 1.5;
      this.rate++;
    }
    this.rate = constrain(this.rate, 0, 8);
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    text(this.rate, this.x, zoneY - 35);
    fill(backgroundColour);
    if (this.readyToDelete) stroke(255, 127);
    else stroke(255);
    if (this.mouseTarget == "Move" || this.transformMode == "Move")
      strokeWeight(2);
    else strokeWeight(1);

    var phase = sin(this.rotation);
    var xPositions = [
      map(phase, -1, 1, 25, 35),
      map(phase, -1, 1, 15, 45),
      map(phase, -1, 1, 35, 25),
      map(phase, -1, 1, 45, 15),
    ];
    fill(backgroundColour);
    beginShape();
    vertex(this.x + 5, zoneY + 10);
    vertex(this.x + 5, zoneY - 10);
    vertex(this.x + 25, zoneY - 10);
    vertex(this.x + 25, zoneY);
    vertex(this.x + 35, zoneY);
    vertex(this.x + 35, zoneY - 20);
    vertex(this.x - 5, zoneY - 20);
    vertex(this.x - 5, zoneY + 10);
    endShape(CLOSE);

    beginShape();
    vertex(this.x + 32, zoneY - 20);
    vertex(this.x + 32, zoneY - 30);
    vertex(this.x + 28, zoneY - 30);
    vertex(this.x + 28, zoneY - 20);
    endShape(CLOSE);

    if (this.mouseTarget == "Turn" || this.transformMode == "Turn")
      strokeWeight(2);
    else if (this.mouseTarget == null && this.transformMode == null)
      strokeWeight(1);

    beginShape();
    vertex(this.x + xPositions[2], zoneY - 33);
    vertex(this.x + xPositions[2], zoneY - 37);
    vertex(this.x + xPositions[3], zoneY - 37);
    vertex(this.x + xPositions[3], zoneY - 33);
    endShape(CLOSE);

    if (this.mouseTarget == null && this.transformMode == null) strokeWeight(1);

    beginShape();
    vertex(this.x + 35, zoneY - 30);
    vertex(this.x + 35, zoneY - 40);
    vertex(this.x + 25, zoneY - 40);
    vertex(this.x + 25, zoneY - 30);
    endShape(CLOSE);

    if (this.mouseTarget == "Turn" || this.transformMode == "Turn")
      strokeWeight(2);
    else if (this.mouseTarget == null && this.transformMode == null)
      strokeWeight(1);

    beginShape();
    vertex(this.x + xPositions[1], zoneY - 33);
    vertex(this.x + xPositions[1], zoneY - 37);
    vertex(this.x + xPositions[0], zoneY - 37);
    vertex(this.x + xPositions[0], zoneY - 33);
    endShape(CLOSE);

    if (this.transformMode == "Move") {
      if (!isMobile) this.x += mouseX - pmouseX;
      else this.x = mouseX;
      if (mouseX <= 5 || mouseX >= width - 5) this.readyToDelete = true;
      else this.readyToDelete = false;

      this.dripSound.pan(map(this.x, 0, width, -1, 1));
    }
    if (this.transformMode == "Turn") {
      this.rotation -= (mouseX - pmouseX) / 30;
    }
  }

  checkMouseTarget() {
    if (mouseX > this.x - 5 && mouseX < this.x + 45) {
      if (mouseY < zoneY && mouseY > zoneY - 20) this.mouseTarget = "Move";
      else if (mouseY < zoneY - 20) this.mouseTarget = "Turn";
      else this.mouseTarget = null;
    } else this.mouseTarget = null;
  }

  checkIfClicked() {
    if (isMobile) this.checkMouseTarget();
    this.transformMode = this.mouseTarget;
    if (this.transformMode != null) return true;
  }

  mouseUp() {
    this.transformMode = null;
    if (isMobile) this.mouseTarget = null;
    if (this.readyToDelete) this.destroy();
  }

  destroy() {
    drippers.splice(drippers.indexOf(this), 1);
  }

  drip() {
    droplets.push(new Droplet(this.x, zoneY, 6));
    this.dripSound.rate(random(0.5, 1.5));
    this.dripSound.play();
  }
}

class Droplet {
  constructor(x, y, size) {
    this.size = size;
    this.body = Bodies.circle(x, y, size / 2, {
      restitution: 1.0,
      friction: 0.01,
      collisionFilter: {
        category: 0o1,
        mask: 0o2,
      },
    });
    World.add(world, this.body);
  }

  update() {
    var pos = this.body.position;
    var angle = this.body.angle;
    //fill(255);
    //noStroke();
    strokeWeight(this.size);
    stroke(255);
    //ellipse(0,0,this.size,this.size);
    point(pos.x, pos.y);

    if (pos.y > height) this.destroy();
    if (this.body.isSleeping) this.destroy();
  }

  destroy() {
    World.remove(world, this.body);
    droplets.splice(droplets.indexOf(this), 1);
  }
}

class Bar {
  constructor(x, y, w, h, a) {
    this.w = w;
    this.h = h;
    this.a = a;
    this.struck = 0.0;

    this.mouseA;
    this.pmouseA;
    this.mouseMoveA;

    //Main Envelope
    this.env = new p5.Env();

    this.sound = loadSound("glockenspiel");
    this.sound.connect(reverb);
    this.sound.connect(delay);
    this.sound.amp(this.env);

    //Main Oscillator
    this.osc = new p5.Oscillator();
    this.osc.amp(this.env);
    this.osc.connect(reverb);
    this.osc.connect(delay);
    this.osc.start();

    this.body = Bodies.rectangle(x, y, w, h, {
      isStatic: true,
      collisionFilter: {
        category: 0o2,
      },
    });

    Body.setAngle(this.body, a);
    World.add(world, this.body);

    this.vertices = this.body.vertices;
    this.edges = [
      {
        x0: this.vertices[0].x,
        y0: this.vertices[0].y,
        x1: this.vertices[1].x,
        y1: this.vertices[1].y,
        hovered: false,
      },
      {
        x0: this.vertices[1].x,
        y0: this.vertices[1].y,
        x1: this.vertices[2].x,
        y1: this.vertices[2].y,
        hovered: false,
      },
      {
        x0: this.vertices[2].x,
        y0: this.vertices[2].y,
        x1: this.vertices[3].x,
        y1: this.vertices[3].y,
        hovered: false,
      },
      {
        x0: this.vertices[3].x,
        y0: this.vertices[3].y,
        x1: this.vertices[0].x,
        y1: this.vertices[0].y,
        hovered: false,
      },
    ];

    this.mouseOver = false;
    this.mouseSelected = false;
    this.transformMode = null;
    this.mouseTarget = null;
    this.readyToDelete = false;

    this.startVertices = this.vertices;
    this.newVertices = this.vertices;

    this.updateParameters();
  }

  updateParameters() {
    var pos = Vertices.centre(this.body.vertices);

    this.decay = map(this.h, 15, 50, 0.3, 0.75);
    this.env.setADSR(0.01, this.decay, 0.0, this.decay);
    this.freq = maxFreq / this.w;
    if (tuneNotes) {
      this.freq = freqToMidi(this.freq);
      this.freq = tuneNote(this.freq);
      this.freq = midiToFreq(this.freq);
    }
    this.osc.freq(this.freq);
    this.osc.pan(map(pos.x, 0, width, -1, 1));
    this.sound.rate(this.freq / 523.25);
    this.sound.pan(map(pos.x, 0, width, -1, 1));
  }

  update() {
    var colour = lerpColor(backgroundColour, color(255), this.struck);
    this.vertices = this.body.vertices;

    this.edges = [
      {
        x0: this.vertices[0].x,
        y0: this.vertices[0].y,
        x1: this.vertices[1].x,
        y1: this.vertices[1].y,
      },
      {
        x0: this.vertices[1].x,
        y0: this.vertices[1].y,
        x1: this.vertices[2].x,
        y1: this.vertices[2].y,
      },
      {
        x0: this.vertices[2].x,
        y0: this.vertices[2].y,
        x1: this.vertices[3].x,
        y1: this.vertices[3].y,
      },
      {
        x0: this.vertices[3].x,
        y0: this.vertices[3].y,
        x1: this.vertices[0].x,
        y1: this.vertices[0].y,
      },
    ];

    if (this.readyToDelete) stroke(255, 127);
    else stroke(255);
    strokeWeight(1);

    strokeWeight(2);
    if (
      this.mouseTarget == "ScaleHeight" ||
      this.transformMode == "ScaleHeight"
    ) {
      this.drawArrow("Top");
      this.drawArrow("Bottom");
      strokeWeight(1);
    } else if (
      this.mouseTarget == "ScaleWidth" ||
      this.transformMode == "ScaleWidth"
    ) {
      this.drawArrow("Left");
      this.drawArrow("Right");
      strokeWeight(1);
    } else if (this.mouseTarget == "Move" || this.transformMode == "Move") {
      strokeWeight(2);
      //this.drawArrow("Left");
      //this.drawArrow("Right");
      //this.drawArrow("Top");
      //this.drawArrow("Bottom");
      //strokeWeight(1);
    } else if (this.mouseTarget == "Turn" || this.transformMode == "Turn") {
      strokeWeight(2);
      stroke(255);
      noFill();
      this.drawArrow("Rotation");
      strokeWeight(1);
    } else strokeWeight(1);

    fill(colour);
    beginShape();
    vertex(this.vertices[0].x, this.vertices[0].y);
    vertex(this.vertices[1].x, this.vertices[1].y);
    vertex(this.vertices[2].x, this.vertices[2].y);
    vertex(this.vertices[3].x, this.vertices[3].y);
    endShape(CLOSE);

    if (this.struck > 0.0) {
      this.struck -= 0.05;
    }

    for (let d of droplets) {
      var collision = Matter.SAT.collides(this.body, d.body);

      if (collision.collided) {
        this.strike(
          collision.bodyB.speed,
          collision.bodyB.position.x,
          collision.bodyB.position.y
        );
      }
    }
  }

  checkMouseTarget() {
    var centre = Vertices.centre(this.body.vertices);
    var mouseDistance = dist(centre.x, centre.y, mouseX, mouseY);
    if (this.transformMode == null) {
      if (isMouseOnLine(this.edges[0], 6) || isMouseOnLine(this.edges[2], 6)) {
        this.mouseTarget = "ScaleHeight";
        return true;
      } else if (
        isMouseOnLine(this.edges[1], 6) ||
        isMouseOnLine(this.edges[3], 6)
      ) {
        this.mouseTarget = "ScaleWidth";
        return true;
      } else if (
        Vertices.contains(this.body.vertices, {
          x: mouseX,
          y: mouseY,
        })
      ) {
        this.mouseTarget = "Move";
        return true;
      } else if (mouseDistance < 75) {
        strokeWeight(1);
        stroke(255);
        noFill();
        this.drawArrow("Rotation");
        if (mouseDistance < 57 && mouseDistance > 43) {
          this.mouseTarget = "Turn";
          return true;
        } else {
          this.mouseTarget = null;
          return true;
        }
      } else if (this.transformMode != null) {
        this.mouseTarget = transformMode;
        return true;
      } else {
        this.mouseTarget = null;
        return false;
      }
    } else return false;
  }

  drawArrow(side) {
    switch (side) {
      case "Top":
        line(
          this.edges[0].x0,
          this.edges[0].y0,
          this.edges[0].x1,
          this.edges[0].y1
        );
        var midpoint = {
          x: (this.edges[0].x0 + this.edges[0].x1) / 2,
          y: (this.edges[0].y0 + this.edges[0].y1) / 2,
        };
        var target = {
          x: midpoint.x + 50 * cos(this.body.angle - Math.PI / 2),
          y: midpoint.y + 50 * sin(this.body.angle - Math.PI / 2),
        };
        line(midpoint.x, midpoint.y, target.x, target.y);
        line(
          target.x,
          target.y,
          target.x + 10 * cos(this.body.angle + Math.PI / 4),
          target.y + 10 * sin(this.body.angle + Math.PI / 4)
        );
        line(
          target.x,
          target.y,
          target.x + 10 * cos(this.body.angle + (Math.PI / 4) * 3),
          target.y + 10 * sin(this.body.angle + (Math.PI / 4) * 3)
        );
        break;
      case "Right":
        line(
          this.edges[1].x0,
          this.edges[1].y0,
          this.edges[1].x1,
          this.edges[1].y1
        );
        var midpoint = {
          x: (this.edges[1].x0 + this.edges[1].x1) / 2,
          y: (this.edges[1].y0 + this.edges[1].y1) / 2,
        };
        var target = {
          x: midpoint.x + 50 * cos(this.body.angle),
          y: midpoint.y + 50 * sin(this.body.angle),
        };
        line(midpoint.x, midpoint.y, target.x, target.y);
        line(
          target.x,
          target.y,
          target.x + 10 * cos(this.body.angle + (Math.PI / 4) * 5),
          target.y + 10 * sin(this.body.angle + (Math.PI / 4) * 5)
        );
        line(
          target.x,
          target.y,
          target.x + 10 * cos(this.body.angle + (Math.PI / 4) * 3),
          target.y + 10 * sin(this.body.angle + (Math.PI / 4) * 3)
        );
        break;
      case "Bottom":
        line(
          this.edges[2].x0,
          this.edges[2].y0,
          this.edges[2].x1,
          this.edges[2].y1
        );
        var midpoint = {
          x: (this.edges[2].x0 + this.edges[2].x1) / 2,
          y: (this.edges[2].y0 + this.edges[2].y1) / 2,
        };
        var target = {
          x: midpoint.x + 50 * cos(this.body.angle + Math.PI / 2),
          y: midpoint.y + 50 * sin(this.body.angle + Math.PI / 2),
        };
        line(midpoint.x, midpoint.y, target.x, target.y);
        line(
          target.x,
          target.y,
          target.x + 10 * cos(this.body.angle - Math.PI / 4),
          target.y + 10 * sin(this.body.angle - Math.PI / 4)
        );
        line(
          target.x,
          target.y,
          target.x + 10 * cos(this.body.angle - (Math.PI / 4) * 3),
          target.y + 10 * sin(this.body.angle - (Math.PI / 4) * 3)
        );
        break;
      case "Left":
        line(
          this.edges[3].x0,
          this.edges[3].y0,
          this.edges[3].x1,
          this.edges[3].y1
        );
        var midpoint = {
          x: (this.edges[3].x0 + this.edges[3].x1) / 2,
          y: (this.edges[3].y0 + this.edges[3].y1) / 2,
        };
        var target = {
          x: midpoint.x + 50 * cos(this.body.angle + Math.PI),
          y: midpoint.y + 50 * sin(this.body.angle + Math.PI),
        };
        line(midpoint.x, midpoint.y, target.x, target.y);
        line(
          target.x,
          target.y,
          target.x + 10 * cos(this.body.angle - (Math.PI / 4) * 7),
          target.y + 10 * sin(this.body.angle - (Math.PI / 4) * 7)
        );
        line(
          target.x,
          target.y,
          target.x + 10 * cos(this.body.angle - Math.PI / 4),
          target.y + 10 * sin(this.body.angle - Math.PI / 4)
        );
        break;
      case "Rotation":
        var centre = Vertices.centre(this.body.vertices);
        var arrowLength = Math.PI / 40;
        ellipse(centre.x, centre.y, 100, 100);
        5;
        line(
          centre.x + 50 * cos(this.body.angle - Math.PI / 2 + arrowLength),
          centre.y + 50 * sin(this.body.angle - Math.PI / 2 + arrowLength),
          centre.x + 57 * cos(this.body.angle - Math.PI / 2 - arrowLength),
          centre.y + 57 * sin(this.body.angle - Math.PI / 2 - arrowLength)
        );
        line(
          centre.x + 50 * cos(this.body.angle - Math.PI / 2 + arrowLength),
          centre.y + 50 * sin(this.body.angle - Math.PI / 2 + arrowLength),
          centre.x + 43 * cos(this.body.angle - Math.PI / 2 - arrowLength),
          centre.y + 43 * sin(this.body.angle - Math.PI / 2 - arrowLength)
        );
        line(
          centre.x + 50 * cos(this.body.angle + Math.PI / 2 + arrowLength),
          centre.y + 50 * sin(this.body.angle + Math.PI / 2 + arrowLength),
          centre.x + 57 * cos(this.body.angle + Math.PI / 2 - arrowLength),
          centre.y + 57 * sin(this.body.angle + Math.PI / 2 - arrowLength)
        );
        line(
          centre.x + 50 * cos(this.body.angle + Math.PI / 2 + arrowLength),
          centre.y + 50 * sin(this.body.angle + Math.PI / 2 + arrowLength),
          centre.x + 43 * cos(this.body.angle + Math.PI / 2 - arrowLength),
          centre.y + 43 * sin(this.body.angle + Math.PI / 2 - arrowLength)
        );
        break;
    }
  }

  updateTransform(mode) {
    var mouseMoveX = mouseX - pmouseX;
    var mouseMoveY = mouseY - pmouseY;

    var centre = Vertices.centre(this.body.vertices);

    this.mouseA = atan2(mouseY - centre.y, mouseX - centre.x);
    if (this.pmouseA != undefined) this.mouseMoveA = this.mouseA - this.pmouseA;
    else this.mouseMoveA = 0;
    this.pmouseA = this.mouseA;

    switch (mode) {
      case "Move":
        Body.setPosition(this.body, {
          x: mouseX,
          y: mouseY,
        });
        if (
          mouseX <= 5 ||
          mouseX >= width - 5 ||
          mouseY <= zoneY ||
          mouseY >= height - 5
        )
          this.readyToDelete = true;
        else this.readyToDelete = false;
        break;
      case "ScaleHeight":
        var nearestPoint = nearestPointOnLine({
          x0: (this.edges[3].x0 + this.edges[3].x1) / 2,
          y0: (this.edges[3].y0 + this.edges[3].y1) / 2,
          x1: (this.edges[1].x0 + this.edges[1].x1) / 2,
          y1: (this.edges[1].y0 + this.edges[1].y1) / 2,
        });
        this.h = dist(nearestPoint.x, nearestPoint.y, mouseX, mouseY) * 2;
        //this.h -= mouseMoveY;
        this.h = constrain(this.h, 15, 50);
        var newX1 =
          this.body.vertices[2].x + this.h * cos(this.body.angle - Math.PI / 2);
        var newY1 =
          this.body.vertices[2].y + this.h * sin(this.body.angle - Math.PI / 2);
        var newX2 =
          this.body.vertices[3].x + this.h * cos(this.body.angle - Math.PI / 2);
        var newY2 =
          this.body.vertices[3].y + this.h * sin(this.body.angle - Math.PI / 2);

        Body.setVertices(this.body, [
          {
            x: centre.x + newX2,
            y: centre.y + newY2,
          },
          {
            x: centre.x + newX1,
            y: centre.y + newY1,
          },
          {
            x: centre.x + this.body.vertices[2].x,
            y: centre.y + this.body.vertices[2].y,
          },
          {
            x: centre.x + this.body.vertices[3].x,
            y: centre.y + this.body.vertices[3].y,
          },
        ]);
        break;
      case "ScaleWidth":
        var nearestPoint = nearestPointOnLine({
          x0: (this.edges[0].x0 + this.edges[0].x1) / 2,
          y0: (this.edges[0].y0 + this.edges[0].y1) / 2,
          x1: (this.edges[2].x0 + this.edges[2].x1) / 2,
          y1: (this.edges[2].y0 + this.edges[2].y1) / 2,
        });
        this.w = dist(nearestPoint.x, nearestPoint.y, mouseX, mouseY) * 2;
        this.w = constrain(this.w, widthRange.min, widthRange.max);
        var newX1 = this.body.vertices[3].x + this.w * cos(this.body.angle);
        var newY1 = this.body.vertices[3].y + this.w * sin(this.body.angle);
        var newX2 = this.body.vertices[0].x + this.w * cos(this.body.angle);
        var newY2 = this.body.vertices[0].y + this.w * sin(this.body.angle);

        Body.setVertices(this.body, [
          {
            x: centre.x + this.body.vertices[0].x,
            y: centre.y + this.body.vertices[0].y,
          },
          {
            x: centre.x + newX2,
            y: centre.y + newY2,
          },
          {
            x: centre.x + newX1,
            y: centre.y + newY1,
          },
          {
            x: centre.x + this.body.vertices[3].x,
            y: centre.y + this.body.vertices[3].y,
          },
        ]);
        break;
      case "Turn":
        Body.rotate(this.body, this.mouseMoveA);
        break;
      default:
        break;
    }

    this.updateParameters();
  }

  checkIfClicked() {
    if (isMobile) this.checkMouseTarget();
    this.transformMode = this.mouseTarget;
    this.mouseA = atan2(
      mouseY - Vertices.centre(this.body.vertices).y,
      mouseX - Vertices.centre(this.body.vertices).x
    );
    //if (this.pmouseA != undefined) this.mouseMoveA = this.mouseA - this.pmouseA;
    //else this.mouseMoveA = 0;
    this.pmouseA = this.mouseA;
    if (this.transformMode != null) return true;
  }

  mouseUp() {
    this.transformMode = null;
    if (isMobile) this.mouseTarget = null;
    if (this.readyToDelete) this.destroy();
  }

  strike(magnitude, x, y) {
    if (magnitude > collisionThreshold) {
      if (this.sound.isLoaded()) this.sound.play();
      this.env.setRange(map(magnitude, 0, 20, 0.0, 0.3), 0.0);
      this.env.play();
      //this.env2.play();
      this.struck = map(magnitude, 0, 20, 0.0, 1.0);
      if (drawWaves) waves.push(new wave(x, y, magnitude));
    }

    //Bug fix for magnitude 0 collisions when bar first spawns
    else if (magnitude == 0) {
      if (this.sound.isLoaded()) this.sound.play();
      this.env.setRange(0.15);
      //this.pitchEnv.play();
      this.env.play();
      //this.env2.play();
      this.struck = 0.5;
      if (drawWaves) waves.push(new wave(x, y, 10));
    }
  }

  destroy() {
    World.remove(world, this.body);
    this.osc.stop();
    this.mod.stop();
    bars.splice(bars.indexOf(this), 1);
  }
}

class wave {
  constructor(x, y, magnitude) {
    this.x = x;
    this.y = y;
    this.size = 0;
    this.alpha = map(magnitude, 0, 20, 0, 200);
  }

  update() {
    if (this.alpha > 0) this.alpha -= 2;
    else this.destroy();
    this.size += 10;
    stroke(255, this.alpha);
    noFill();
    ellipse(this.x, this.y, this.size, this.size);
  }

  destroy() {
    waves.splice(waves.indexOf(this), 1);
  }
}

function mousePressed() {
  if (
    (!isMobile && mouseButton != RIGHT) ||
    (isMobile && event.type == "touchstart")
  ) {
    mouseStartX = mouseX;
    mouseStartY = mouseY;

    for (let b of bars) {
      if (b.checkIfClicked()) return;
    }
    for (let d of drippers) {
      if (d.checkIfClicked()) return;
    }

    if (mouseY < zoneY) {
      drippers.push(new Dripper(mouseX, round(random(2, 6))));
      return;
    } else {
      bars.push(
        new Bar(
          mouseX,
          mouseY,
          random(60, 300),
          random(25, 50),
          random(Math.PI / -4, Math.PI / 4)
        )
      );
      return;
    }
  }
}

function mouseReleased() {
  if (!isMobile || isMobile) {
    for (let b of bars) {
      b.mouseUp();
    }
    for (let d of drippers) {
      d.mouseUp();
    }
  }
}

function touchMoved() {
  for (let b of bars) {
    if (b.transformMode != null) b.updateTransform(b.transformMode);
  }
}

function checkMouseTarget() {
  var selectedBar;
  for (i = bars.length - 1; i >= 0; i--) {
    bars[i].mouseTarget = null;
  }
  for (i = bars.length - 1; i >= 0; i--) {
    if (bars[i].checkMouseTarget()) {
      selectedBar = i;
      break;
    }
  }
  for (i = drippers.length - 1; i >= 0; i--) {
    if (drippers[i].checkMouseTarget()) {
      break;
    }
  }
  return;
}

function keyPressed() {
  if (keyCode == 66) {
    //bars.push(new Bar(mouseX,mouseY,random(widthRange.min,widthRange.max/2),random(20,40),random(-0.5,0.5)));
    bars.push(
      new Bar(
        mouseX,
        mouseY,
        random(50, 200),
        random(20, 50),
        random(Math.PI / -4, Math.PI / 4)
      )
    );
  }
  if (keyCode == 68) {
    drippers.push(new Dripper(mouseX, round(random(2, 6))));
  }
}

function keyReleased() {}

function isMouseOnLine(line, tolerance) {
  //
  lerp = function (a, b, x) {
    return a + x * (b - a);
  };
  var dx = line.x1 - line.x0;
  var dy = line.y1 - line.y0;
  var t =
    ((mouseX - line.x0) * dx + (mouseY - line.y0) * dy) / (dx * dx + dy * dy);
  t = constrain(t, 0, 1);
  var lineX = lerp(line.x0, line.x1, t);
  var lineY = lerp(line.y0, line.y1, t);
  var dx = mouseX - lineX;
  var dy = mouseY - lineY;
  var distance = Math.abs(Math.sqrt(dx * dx + dy * dy));
  if (distance < tolerance) {
    return true;
  } else {
    return false;
  }
}

function nearestPointOnLine(line) {
  //
  lerp = function (a, b, x) {
    return a + x * (b - a);
  };
  var dx = line.x1 - line.x0;
  var dy = line.y1 - line.y0;
  var t =
    ((mouseX - line.x0) * dx + (mouseY - line.y0) * dy) / (dx * dx + dy * dy);
  t = constrain(t, 0, 1);
  var lineX = lerp(line.x0, line.x1, t);
  var lineY = lerp(line.y0, line.y1, t);
  return {
    x: lineX,
    y: lineY,
  };
}

function metronome(step) {
  for (let d of drippers) {
    if (d.rate == step) d.drip();
  }
}

function printTotalObjects() {
  print("Bars: " + bars.length);
  print("Droplets: " + droplets.length);
  print("Drippers: " + drippers.length);
  print("Waves: " + waves.length);
  print(
    "Total: " + (bars.length + droplets.length + drippers.length + waves.length)
  );
}

function tuneNote(note) {
  var keys = keySig.slice();
  var nearestA = Math.floor(note / 12) * 12;
  for (i = 0; i < keys.length; i++) {
    keys[i] += nearestA;
  }
  var closest = keys.reduce(function (prev, curr) {
    return Math.abs(curr - note) < Math.abs(prev - note) ? curr : prev;
  });

  return closest;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
