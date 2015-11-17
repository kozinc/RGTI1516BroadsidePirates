function Ladja() {
    // Dedovanje (klici konstruktor razreda Object3D)
    THREE.Object3D.call(this);

    // Lastnosti
    this.health = 3;

    this.collisionObjectList = [];
    this.krogleList = [];

    this.vel = 0.0;
    this.velTurn = 0.0;

    this.movingFwd = false;
    this.movingBack = false;
    this.turningLeft = false;
    this.turningRight = false;

    // parametri premikanja
    this.accFwd = 0.005;
    this.accBack = 0.002;
    this.accStop = 0.005;
    this.velFwdMax = 0.2;
    this.velBackMax = 0.1;

    this.accTurn = 0.001;
    this.accTurnStop = 0.0005;
    this.velTurnMax = 0.01;

    this.velRoll = 0.003;
    this.rollMax = 0.1;

    this.velSink = 0.03;
    this.sinkMax = 3;

    // Konstruktor
    this.name = "ladja_".concat(this.id.toString());
    this.rotation.order = 'YXZ';
    this.translateY(1);

    var self = this;
    var loader = new THREE.OBJMTLLoader();
    loader.load("models/ladja_majhna.obj", "models/ladja_majhna.mtl",
        function (object) {
            object.scale.set(1.5, 1.5, 1.5);
            self.add(object);
        });
}
// Dedovanje (nastavi metode in konstruktor)
Ladja.prototype = Object.create(THREE.Object3D.prototype);
Ladja.prototype.constructor = Ladja;

// Metode
Ladja.prototype.takeAHit = function () {
    this.health -= 1;
};
Ladja.prototype.shootForward = function () {
    var origin = this.position.clone();
    origin.y += 1;
    var directionFwd = new THREE.Vector3(-1, 0.05, 0);
    directionFwd.normalize();
    directionFwd.applyAxisAngle(new THREE.Vector3(0,1,0), this.rotation.y);

    var tmpKrogla = new Krogla(this.collisionObjectList, 0.6, origin, directionFwd);

    this.parent.add(tmpKrogla);
    this.krogleList.push(tmpKrogla);
};
Ladja.prototype.shootLeft = function () {
    var origin = this.position.clone();
    origin.y += 1;
    var directionFwd = new THREE.Vector3(0, 0.02, 1);
    directionFwd.normalize();
    directionFwd.applyAxisAngle(new THREE.Vector3(0,1,0), this.rotation.y);

    var tmpKrogla = new Krogla(this.collisionObjectList, 0.6, origin, directionFwd);

    this.parent.add(tmpKrogla);
    this.krogleList.push(tmpKrogla);
};
Ladja.prototype.shootRight = function () {
    var origin = this.position.clone();
    origin.y += 1;
    var directionFwd = new THREE.Vector3(0, 0.02, -1);
    directionFwd.normalize();
    directionFwd.applyAxisAngle(new THREE.Vector3(0,1,0), this.rotation.y);

    var tmpKrogla = new Krogla(this.collisionObjectList, 0.6, origin, directionFwd);

    this.parent.add(tmpKrogla);
    this.krogleList.push(tmpKrogla);
};

Ladja.prototype.moveForwardStart = function () {
    this.movingFwd = true;
};
Ladja.prototype.moveForwardStop = function () {
    this.movingFwd = false;
};
Ladja.prototype.moveBackStart = function () {
    this.movingBack = true;
};
Ladja.prototype.moveBackStop = function () {
    this.movingBack = false;
};

Ladja.prototype.turnLeftStart = function () {
    this.turningLeft = true;
};
Ladja.prototype.turnLeftStop = function () {
    this.turningLeft = false;
};
Ladja.prototype.turnRightStart = function () {
    this.turningRight = true;
};
Ladja.prototype.turnRightStop = function () {
    this.turningRight = false;
};

Ladja.prototype.update = function () {
    // posodobi lego ladje
    if (this.movingFwd && this.vel >= 0) {
        if (this.vel < this.velFwdMax) {
            this.vel += this.accFwd;
        }
    } else if (this.movingBack && this.vel <= 0) {
        if (this.vel > -this.velBackMax) {
            this.vel += -this.accBack;
        }
    } else {
        var sign = (this.vel >= 0) ? 1 : -1;
        var velMag = Math.abs(this.vel);
        if (velMag > 0) {
            this.vel -= sign*this.accStop;
        }
        if (velMag < this.accStop) {
            this.vel = 0.0;
        }
    }

    if (this.turningLeft) {
        // turn
        if (this.velTurn < this.velTurnMax) {
            this.velTurn += this.accTurn;
        }
        // roll
        if (this.rotation.x > -this.rollMax) {
            this.rotation.x -= this.velRoll;
        }
    } else if (this.turningRight) {
        // turn
        if (this.velTurn > -this.velTurnMax) {
            this.velTurn -= this.accTurn;
        }
        // roll
        if (this.rotation.x < this.rollMax) {
            this.rotation.x += this.velRoll;
        }
    } else {
        // turn
        var signTurn = (this.velTurn >= 0) ? 1 : -1;
        var velMagTurn = Math.abs(this.velTurn);
        if (velMagTurn > 0) {
            this.velTurn -= signTurn*this.accTurnStop;
        }
        if (velMagTurn < this.accTurnStop) {
            this.velTurn = 0.0;
        }
        // roll
        var signRoll = (this.rotation.x >= 0) ? 1 : -1;
        var magRoll = Math.abs(this.rotation.x);
        if (magRoll > 0) {
            this.rotation.x -= signRoll*this.velRoll;
        }
        if (magRoll < this.velRoll) {
            this.rotation.x = 0.0;
        }
    }

    this.translateX(-this.vel);
    this.rotation.y += this.velTurn;

    // ce pride do kolizije, potem iznici premik in rotacijo
    if (this.checkCollisions()) {
        this.translateX(this.vel);
        this.rotation.y -= this.velTurn;
        this.vel = 0.0;
        this.velTurn = 0.0;
    }

    // posodobi lego krogel
    this.krogleList.forEach(function (tmp) {
        tmp.update();
    });
    // posodobi tabelo krogel (odstrani prvo, ce je potrebno)
    if (this.krogleList.length > 0 && this.krogleList[0].readyToDelete) {
        this.krogleList.shift();
    }

    // potopi se, ce je "health" prazen
    if (this.health <= 0) {
        this.movingFwd = false;
        this.movingBack = false;
        this.turningLeft = false;
        this.turningRight = false;

        if (this.position.y > -this.sinkMax) {
            this.translateY(-this.velSink);
        }
    }
};

Ladja.prototype.checkCollisions = function () {
    var origin = this.position.clone();
    var directionFwd = new THREE.Vector3(-1,0,0);
    directionFwd.applyAxisAngle(new THREE.Vector3(0,1,0), this.rotation.y);
    var directionBack = new THREE.Vector3(1,0,0);
    directionBack.applyAxisAngle(new THREE.Vector3(0,1,0), this.rotation.y);

    var rayFwd = new THREE.Raycaster(origin, directionFwd, 0, 2.5);
    var rayBack = new THREE.Raycaster(origin, directionBack, 0, 5);

    var intersectListFwd = rayFwd.intersectObjects(this.collisionObjectList, true);
    var intersectListBack = rayBack.intersectObjects(this.collisionObjectList, true);
    return (intersectListFwd.length > 0 || intersectListBack.length > 0);
};

Ladja.prototype.addCollisionObject = function (object) {
    this.collisionObjectList.push(object);
};
