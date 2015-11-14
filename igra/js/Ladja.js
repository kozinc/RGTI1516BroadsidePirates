function Ladja(scene, model_name) {
    // Lastnosti
    this.collisionObjectList = [];

    this.model;
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

    // Konstruktor
    var group = new THREE.Group();
    this.model = group;
    this.model.name = 'ladja_igralec';
    this.model.rotation.order = 'YXZ';
    scene.add(this.model);

    var loader = new THREE.OBJMTLLoader();
    loader.load("models/".concat(model_name).concat(".obj"), "models/".concat(model_name).concat(".mtl"),
        function (object) {
            object.scale.set(1, 1, 1);
            object.translateY(0.7);
            object.children.forEach(function (tmp1) {
                tmp1.children.forEach(function (tmp2) {
                    tmp2.castShadow = true;
                    tmp2.receiveShadow = true;
                })
            });
            group.add(object);
        });
}
// Metode
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

Ladja.prototype.updatePose = function () {
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
        if (this.model.rotation.x > -this.rollMax) {
            this.model.rotation.x -= this.velRoll;
        }
    } else if (this.turningRight) {
        // turn
        if (this.velTurn > -this.velTurnMax) {
            this.velTurn -= this.accTurn;
        }
        // roll
        if (this.model.rotation.x < this.rollMax) {
            this.model.rotation.x += this.velRoll;
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
        var signRoll = (this.model.rotation.x >= 0) ? 1 : -1;
        var magRoll = Math.abs(this.model.rotation.x);
        if (magRoll > 0) {
            this.model.rotation.x -= signRoll*this.velRoll;
        }
        if (magRoll < this.velRoll) {
            this.model.rotation.x = 0.0;
        }
    }

    this.model.translateX(-this.vel);
    this.model.rotation.y += this.velTurn;

    if (this.checkCollisions()) {
        // ce pride do kolizije, potem iznici premik in rotacijo
        this.model.translateX(this.vel);
        this.model.rotation.y -= this.velTurn;
        this.vel = 0.0;
        this.velTurn = 0.0;
    }
};

Ladja.prototype.checkCollisions = function () {
    var origin = this.model.position.clone();
    var directionFwd = new THREE.Vector3(-1,0,0);
    directionFwd.applyAxisAngle(new THREE.Vector3(0,1,0), this.model.rotation.y);
    var directionBack = new THREE.Vector3(1,0,0);
    directionBack.applyAxisAngle(new THREE.Vector3(0,1,0), this.model.rotation.y);

    var rayFwd = new THREE.Raycaster(origin, directionFwd, 0, 1.8);
    var rayBack = new THREE.Raycaster(origin, directionBack, 0, 1.8);

    return (rayFwd.intersectObjects(this.collisionObjectList).length > 0 ||
        rayBack.intersectObjects(this.collisionObjectList).length > 0);
};

Ladja.prototype.addCollisionObject = function (object) {
    this.collisionObjectList.push(object);
};