function Water(scene, ms_Renderer, ms_Camera) {
    // Load textures        
    var waterNormals = new THREE.ImageUtils.loadTexture('textures/waternormals.jpg');
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping; 
    
    // Create the water effect
    this.ms_Water = new THREE.Water(ms_Renderer, ms_Camera, scene, {
        textureWidth: 256,
        textureHeight: 256,
        waterNormals: waterNormals,
        alpha:  1.0,
        //sunDirection: directionalLight.position.normalize(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        betaVersion: 0
    });
    var aMeshMirror = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(400, 400, 10, 10),
        this.ms_Water.material
    );
    aMeshMirror.add(this.ms_Water);
    aMeshMirror.rotation.x = - Math.PI * 0.5;
    
    scene.add(aMeshMirror);
}

// Metode
Water.prototype.update = function () {
    this.ms_Water.material.uniforms.time.value += 1.0 / 60.0;
    this.ms_Water.render();
};
