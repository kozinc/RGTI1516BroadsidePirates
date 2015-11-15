
var spriteMap = THREE.ImageUtils.loadTexture("textures/boom2.png");

function Krogla(parentCollisionList, power, origin, direction) {
    // Dedovanje (klici konstruktor razreda Mesh)
    this.radius = 0.6;
    var sphereGeometry = new THREE.SphereGeometry(this.radius, 10, 10);
    var sphereMaterial = new THREE.MeshBasicMaterial({color: 0x2E2E2E});
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

    // Sprite, ki se doda na sceno ob morebitnem trku
    var spriteMaterial = new THREE.SpriteMaterial({map: spriteMap});
    this.explosion = new THREE.Sprite(spriteMaterial);
    this.explosion.scale.set(10, 10, 10);
    this.explosion.visible = false;
    this.add(this.explosion);
    this.timeout = 15;
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

    // odstrani geometrijo
    if (this.timeout < 0 && this.parent) {
        this.remove(this.explosion);
        this.parent.remove(this);
        this.readyToDelete = true;
    }

    // preveri ce pride do kolizije
    var intersectList = this.checkCollisions();
    if (intersectList.length > 0) {
        this.velFwd = 0;
        this.accFwd = 0;
        this.velDown = 0;
        this.accDown = 0;

        // prikazi eksplozijo
        this.material.visible = false;
        this.explosion.visible = true;
        this.timeout -= 1;
    }
};
Krogla.prototype.checkCollisions = function () {
    var origin = this.position.clone();
    var direction = this.direction.clone();
    direction.setY(0);

    var ray = new THREE.Raycaster(origin, direction, 0, this.radius);
    return ray.intersectObjects(this.collisionObjectList, true);
};