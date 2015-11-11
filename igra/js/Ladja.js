function Ladja(scene, model_name) {
    // Lastnosti
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

    // Konstruktor
    var group = new THREE.Group();
    this.model = group;
    scene.add(this.model);

    var loader = new THREE.OBJMTLLoader();
    loader.load("models/".concat(model_name).concat(".obj"), "models/".concat(model_name).concat(".mtl"),
        function (object) {
            object.scale.set(1, 1, 1);
            object.name = 'ladja_igralec';
            object.translateY(1);
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
    if (this.movingFwd) {
        if (this.vel < this.velFwdMax) {
            this.vel += this.accFwd;
        }
    } else if (this.movingBack) {
        if (this.vel > -this.velBackMax) {
            this.vel -= this.accBack;
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
        if (this.velTurn < this.velTurnMax) {
            this.velTurn += this.accTurn;
        }
    } else if (this.turningRight) {
        if (this.velTurn > -this.velTurnMax) {
            this.velTurn -= this.accTurn;
        }
    } else {
        var sign = (this.velTurn >= 0) ? 1 : -1;
        var velMag = Math.abs(this.velTurn);
        if (velMag > 0) {
            this.velTurn -= sign*this.accTurnStop;
        }
        if (velMag < this.accTurnStop) {
            this.velTurn = 0.0;
        }
    }

    this.model.translateX(-this.vel);
    this.model.rotation.y += this.velTurn;
};
