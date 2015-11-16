var collectedCoins = 0;

function Coin(igralec) {
    // Dedovanje (klici konstruktor razreda Mesh)
    this.radius = 1.5;
    var cylinderGeometry = new THREE.CylinderGeometry(this.radius, this.radius, 0.6, 12);
    var cylinderMaterial = new THREE.MeshLambertMaterial({color: 0xFFEA00});
    THREE.Mesh.call(this, cylinderGeometry, cylinderMaterial);
    this.translateY(2);
    this.rotation.z = Math.PI / 2;

    // Lastnosti
    this.igralec = igralec;
    this.velRotate = 0.05;
    this.readyToDelete = false;

    // Konstruktor
    this.setRandomPosition();
}
// Dedovanje (nastavi metode in konstruktor)
Coin.prototype = Object.create(THREE.Mesh.prototype);
Coin.prototype.constructor = Coin;

// Metode
Coin.prototype.update = function () {
    if (!this.readyToDelete) {
        this.rotation.y += this.velRotate;

        // Preveri, ce je igralec pobral cekin
        if (this.checkCollect()) {
            collectedCoins += 1;
            this.parent.remove(this);
            this.readyToDelete = true;
        }
    }
};
Coin.prototype.checkCollect = function() {
    var dx = Math.abs(this.position.x - this.igralec.position.x);
    var dz = Math.abs(this.position.z - this.igralec.position.z);

    return (dx < this.radius*2 && dz < this.radius*2);
};
Coin.prototype.setRandomPosition = function() {
    var min = -190;
    var max = 190;
    this.position.x = Math.random() * (max - min) + min;
    this.position.z = Math.random() * (max - min) + min;
};