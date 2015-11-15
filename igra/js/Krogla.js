function Krogla(power, origin, direction) {
    // Dedovanje (klici konstruktor razreda Mesh)
    this.radius = 0.5;
    var sphereGeometry = new THREE.SphereGeometry(this.radius, 10, 10);
    var sphereMaterial = new THREE.MeshLambertMaterial({color: 0x000000});
    THREE.Mesh.call(this, sphereGeometry, sphereMaterial);

    // Lastnosti
    this.origin = origin;
    this.direction = direction;

    this.velFwd = power;
    this.accFwd = 0.005; // ustavljanje krogle
    this.velDown = 0;
    this.accDown = 0.002; // padanje krogle

    this.readyToDelete = false;

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
};
