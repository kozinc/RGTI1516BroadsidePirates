function LadjaNPC(pointsToVisit) {
    // Dedovanje (klici konstruktor razreda Object3D)
    THREE.Object3D.call(this);

    // Lastnosti
    this.health = 3;
    this.collisionObjectList = [];
    this.krogleList = [];

    // parametri premikanja
    this.position.x = pointsToVisit[0].x;
    this.position.z = pointsToVisit[0].z;
    this.direction = (new THREE.Vector3(0, 0, 0))
        .subVectors(pointsToVisit[1], pointsToVisit[0]).normalize();
    var firstPoint = pointsToVisit.shift();
    pointsToVisit.push(firstPoint);
    this.pointsToVisit = pointsToVisit;
    this.eps = 1;

    this.velMax = 0.15;
    this.vel = 0.15;
    this.velSink = 0.03;
    this.sinkMax = 8;

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
LadjaNPC.prototype = Object.create(THREE.Object3D.prototype);
LadjaNPC.prototype.constructor = LadjaNPC;

// Metode
LadjaNPC.prototype.takeAHit = function () {
    this.health -= 1;
};
LadjaNPC.prototype.shootForward = function () {
    var origin = this.position.clone();
    origin.y += 1;
    var directionFwd = new THREE.Vector3(-1, 0.05, 0);
    directionFwd.normalize();
    directionFwd.applyAxisAngle(new THREE.Vector3(0,1,0), this.rotation.y);

    var tmpKrogla = new Krogla(this.collisionObjectList, 0.6, origin, directionFwd);

    this.parent.add(tmpKrogla);
    this.krogleList.push(tmpKrogla);
};
LadjaNPC.prototype.shootLeft = function () {
    var origin = this.position.clone();
    origin.y += 1;
    var directionFwd = new THREE.Vector3(0, 0.02, 1);
    directionFwd.normalize();
    directionFwd.applyAxisAngle(new THREE.Vector3(0,1,0), this.rotation.y);

    var tmpKrogla = new Krogla(this.collisionObjectList, 0.6, origin, directionFwd);

    this.parent.add(tmpKrogla);
    this.krogleList.push(tmpKrogla);
};
LadjaNPC.prototype.shootRight = function () {
    var origin = this.position.clone();
    origin.y += 1;
    var directionFwd = new THREE.Vector3(0, 0.02, -1);
    directionFwd.normalize();
    directionFwd.applyAxisAngle(new THREE.Vector3(0,1,0), this.rotation.y);

    var tmpKrogla = new Krogla(this.collisionObjectList, 0.6, origin, directionFwd);

    this.parent.add(tmpKrogla);
    this.krogleList.push(tmpKrogla);
};

LadjaNPC.prototype.update = function () {
    // posodobi lego ladje
    this.position.x += this.direction.x * this.vel;
    this.position.z += this.direction.z * this.vel;

    // nastavi rotacijo ladje
    var dx = this.position.x - this.pointsToVisit[0].x;
    var dz = this.position.z - this.pointsToVisit[0].z;

    this.rotation.y = Math.atan2(dx, dz) - Math.PI / 2;

    if (Math.abs(dx) < this.eps && Math.abs(dz) < this.eps) {
        this.direction = (new THREE.Vector3(0, 0, 0))
            .subVectors(this.pointsToVisit[1], this.pointsToVisit[0]).normalize();
        var firstPoint = this.pointsToVisit.shift();
        this.pointsToVisit.push(firstPoint);
    }

    // ce pride do kolizije, potem iznici premik in rotacijo
    if (this.checkCollisions()) {
        this.position.x -= this.direction.x * this.vel;
        this.position.z -= this.direction.z * this.vel;
        this.vel = 0.0;
    } else {
        this.vel = this.velMax;
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
        this.vel = 0;
        if (this.position.y > -this.sinkMax) {
            this.translateY(-this.velSink);
        }
    }
};

LadjaNPC.prototype.checkCollisions = function () {
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

LadjaNPC.prototype.addCollisionObject = function (object) {
    this.collisionObjectList.push(object);
};
