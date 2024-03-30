class Spring {
    constructor(_p5, p, v, a) {
        this._5p = _p5;
        this.p = p;
        this.v = v;
        this.a = a;
        this.k = 0.025;
        this.defaultPos = p.copy();
    }

    addForce(a) {
        this.a.add(a);
    }

    avoid(mouse, mouseVelocity) {
        let force;
        let dist = p5.Vector.dist(this.p, mouse);
        let maxForce = mouseVelocity.mag();

        if (maxForce > 10) {
            maxForce = 10
        };

        let len = 40;

        if (dist < len) {
            mouseVelocity.normalize();
            force = this._5p.map(mouseVelocity.mag(), len, 0, 0, maxForce);
            mouseVelocity.mult(force);
            mouseVelocity.x = 0;
            return mouseVelocity;
        }
    }

    update() {
        this.v.add(this.a);
        this.p.add(this.v);
        this.a.mult(0);
    }
}

class Wave {
    constructor(_p5) {
        this._p5 = _p5;
        this.springNum = 0;
        this.springs = [];
        this.springs_interval = 0;
        this.leftDeltas = [];
        this.rightDeltas = [];
        this.spread = 0.25;
        this.defaultWaterLevel = 0;
        this.dumping = 0.95;

        //setting basic parameter
        const meinDiv = document.getElementById("meinDiv");
        const width = meinDiv.offsetWidth;
        const height = meinDiv.offsetHeight;

        //init springs
        for (let i = 0; i < width / 3; i++) {
            let x = i * width / (width / 3 - 1);
            let y = height / 2;
            this.springs.push(new Spring(this._p5, this._p5.createVector(x, y), this._p5.createVector(0, 0), _p5.createVector(0, 0)));
        }
    }

    updateSprings() {
        //spring basic move
        this.springs.forEach((spring, i, springs) => {
            //spring force
            let springForce = this._p5.createVector(0, 0);;
            let diff = spring.p.y - spring.defaultPos.y;
            springForce.y = -(spring.k * diff);
            spring.addForce(springForce);

            //mouse force
            let mouse = this._p5.createVector(this._p5.mouseX, this._p5.mouseY);
            let pmouse = this._p5.createVector(this._p5.pmouseX, this._p5.pmouseY);
            let mouseVelocity = p5.Vector.sub(mouse, pmouse);

            let avoid = spring.avoid(mouse, mouseVelocity);
            spring.addForce(avoid);

            //dump
            spring.v.mult(this.dumping);

            //update
            spring.update();
        })

        //make wave
        let leftDeltas = [this.springNum];
        let rightDeltas = [this.springNum];

        for (let t = 0; t < 8; t++) {
            this.springs.forEach((spring, i, springs) => {
                if (i > 0) {
                    leftDeltas[i] = this.spread * (springs[i].p.y - springs[i - 1].p.y);
                    springs[i - 1].v.y += leftDeltas[i];
                }

                if (i < springs.length - 1) {
                    rightDeltas[i] = this.spread * (springs[i].p.y - springs[i + 1].p.y);
                    springs[i + 1].v.y += rightDeltas[i];
                }
            });

            this.springs.forEach((spring, i, springs) => {
                if (i > 0) {
                    springs[i - 1].p.y += leftDeltas[i];
                }

                if (i < springs.length - 1) {
                    springs[i + 1].p.y += rightDeltas[i];
                }
            });
        }
    }

    show() {
        this._p5.noStroke();

        //gradation
        let grad = this._p5.drawingContext.createLinearGradient(0, 0, 0, this._p5.windowHeight);
        grad.addColorStop(0.0, 'rgb(0, 150, 200)');
        grad.addColorStop(0.5, 'rgb(0, 150, 200)');
        grad.addColorStop(1.0, 'rgb(0, 150, 200)');

        this._p5.drawingContext.fillStyle = grad;

        //draw wave
        this._p5.beginShape();
        this._p5.vertex(0, this._p5.windowHeight); //first control point
        this._p5.vertex(0, this._p5.windowHeight); //first point

        this.springs.forEach((spring, i) => {
            let x = spring.p.x;
            let y = spring.p.y;
            this._p5.vertex(x, y);
        })

        this._p5.vertex(this._p5.windowWidth, this._p5.windowHeight);
        //last point
        this._p5.vertex(this._p5.windowWidth, this._p5.windowHeight); //last control point
        this._p5.endShape();

    }

    splash() {
        let index = this._p5.floor(this._p5.random(1, this.springNum));
        let vy = this._p5.random(100, this._p5.windowHeight);

        if (index > 0 && index < this.springNum) {
            this.springs[index].v.y = vy;
        }
    }
}

let scketch = function (_p5) {

    let wave;

    _p5.setup = function () {
        // create canvas inside meinDiv
        const meinDiv = document.getElementById("meinDiv");
        const canvas = _p5.createCanvas(meinDiv.offsetWidth, meinDiv.offsetHeight);
        canvas.parent("meinDiv");

        _p5.background('#fff');

        // generate wave
        wave = new Wave(_p5);

        //first splash
        for (let i = 0; i < 3; i++) {
            setTimeout(function () {
                wave.splash();
            }, 250 * i);
        }
    }

    _p5.draw = function () {
        _p5.background('#fff');
        wave.updateSprings();
        wave.show();
    }

    _p5.mousePressed = function (event) {
        wave.splash();
    };

    _p5.windowResized = function () {
        canvas.size(meinDiv.offsetWidth, meinDiv.offsetHeight);
        wave = new Wave(_p5);
    }

}

new p5(scketch);