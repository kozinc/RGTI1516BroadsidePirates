function CanonBall(tmp_ladja) {
    var sphereGeometry = new THREE.SphereGeometry(0.5, 20, 20);
    var sphereMaterial = new THREE.MeshLambertMaterial({color: 0x000000});
    var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    // definiramo gravitacijski pospešek
    Object.defineProperty(sphere, "downwardMotion", {
                            value : -0.1,
                            writable : true,
                            enumerable : true,
                            configurable: true
                            });

    // definiramo razdaljo od ladje
    Object.defineProperty(sphere, "razdaljaKrogle", {
                            value : 0.0,
                            writable : true,
                            enumerable : true,
                            configurable: true
                            });
    //console.log(krogle);
    // position the sphere
    sphere.position.x = tmp_ladja.position.x;
    sphere.position.y = tmp_ladja.position.y + 1;
    sphere.position.z = tmp_ladja.position.z;

    sphere.rotation.y = tmp_ladja.rotation.y + 225*Math.PI/180;
    sphere.castShadow = false;
    return sphere;
}
