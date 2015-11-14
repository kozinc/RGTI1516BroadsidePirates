function Krogla(scene, power, origin, direction) {
    // Lastnosti
    this.scene = scene;

    this.model;
    this.origin = origin;
    this.direction = direction;

    this.velFwd = power;
    this.accFwd = 0.005; // ustavljanje krogle
    this.velDown = 0;
    this.accDown = 0.002; // padanje krogle

    this.radius = 0.5;
    // Konstruktor
    var sphereGeometry = new THREE.SphereGeometry(this.radius, 10, 10);
    var sphereMaterial = new THREE.MeshLambertMaterial({color: 0x000000});
    var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    sphere.position.set(origin.x, origin.y, origin.z);

    this.model = sphere;
    scene.add(sphere);
}
// Metode
Krogla.prototype.update = function () {
    // posodobi lokacijo
    this.model.translateX(this.direction.x * this.velFwd);
    this.model.translateY(this.direction.y * this.velFwd - this.velDown);
    this.model.translateZ(this.direction.z * this.velFwd);

    // posodobi hitrosti
    this.velFwd -= this.accFwd;
    this.velDown += this.accDown;

    // odstrani geometrijo, ko je krogla v vodi
    if (this.model.position.y < -this.radius) {
        this.scene.remove(this.model);
    }
};
Krogla.prototype.checkDelete = function () {
    // vrne true, ce je kroglo potrebno odstraniti
    return (this.model.position.y < -this.radius);
};
