function Krogla(parentCollisionList, power, origin, direction) {
    // Dedovanje (klici konstruktor razreda Mesh)
    this.radius = 0.5;
    var sphereGeometry = new THREE.SphereGeometry(this.radius, 10, 10);
    var sphereMaterial = new THREE.MeshLambertMaterial({color: 0x000000});
    THREE.Mesh.call(this, sphereGeometry, sphereMaterial);

    // Lastnosti
    this.collisionObjectList = parentCollisionList;
    this.direction = direction;
    this.readyToDelete = false;

    this.velFwd = power;
    this.accFwd = 0.005; // ustavljanje krogle
    this.velDown = 0;
    this.accDown = 0.002; // padanje krogle

    // Konstruktor
    this.name = "krogla_".concat(this.id.toString());
    this.position.set(origin.x, origin.y, origin.z);
}
// Dedovanje (nastavi metode in konstruktor)
Krogla.prototype = Object.create(THREE.Mesh.prototype);
Krogla.prototype.constructor = Krogla;

// Metode
Krogla.prototype.update = function () {
    // posodobi lokacijo
    this.translateX(this.direction.x * this.velFwd);
    this.translateY(this.direction.y * this.velFwd - this.velDown);
    this.translateZ(this.direction.z * this.velFwd);

    // posodobi hitrosti
    this.velFwd -= this.accFwd;
    this.velDown += this.accDown;

    // odstrani geometrijo, ko je krogla v vodi
    if (this.position.y < -this.radius && this.parent) {
        this.parent.remove(this);
        this.readyToDelete = true;
    }

    // preveri ce pride do kolizije
    if (this.checkCollisions()) {
        this.velFwd = 0;
        this.accFwd = 0;
    }
};
Krogla.prototype.checkCollisions = function () {
    var origin = this.position.clone();
    var direction = this.direction.clone();
    direction.setY(0);

    var ray = new THREE.Raycaster(origin, direction, 0, 1);
    var intersectList = ray.intersectObjects(this.collisionObjectList, true);
    return (intersectList.length > 0);
};