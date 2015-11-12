function Water(scene, ms_Renderer, ms_Camera) {
    // Lastnosti
    this.model;
    this.ms_Canvas = null;
    this.ms_Renderer = ms_Renderer;
    this.ms_Camera = ms_Camera;
    this.ms_Scene = scene;
    this.ms_Controls = null;
    this.ms_Water = null;


    var group = new THREE.Group();
    this.model = group;
    this.model.name = 'morje_iz_Water.js';
    scene.add(this.model);

    this.ms_Renderer = this.enable? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
    //this.ms_Canvas.html(this.ms_Renderer.domElement);

    // Add light
    var directionalLight = new THREE.DirectionalLight(0xffff55, 1);
    directionalLight.position.set(-600, 500, 600);
    scene.add(directionalLight);
    
    // Load textures        
    var waterNormals = new THREE.ImageUtils.loadTexture('textures/waternormals.jpg');
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping; 
    
    // Create the water effect
    this.ms_Water = new THREE.Water(ms_Renderer, ms_Camera, scene, {
        textureWidth: 256,
        textureHeight: 256,
        waterNormals: waterNormals,
        alpha:  1.0,
        sunDirection: directionalLight.position.normalize(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        betaVersion: 0,
        side: THREE.DoubleSide
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
Water.prototype.enable = function () {
    try {
        var aCanvas = document.createElement('canvas');
        return !! window.WebGLRenderingContext && (aCanvas.getContext('webgl') || aCanvas.getContext('experimental-webgl'));
    }
    catch(e) {
        return false;
    }
};

Water.prototype.display = function () {
    this.ms_Water.render();
    this.ms_Renderer.render(this.ms_Scene, this.ms_Camera);
};

Water.prototype.update = function () {
    this.ms_Water.material.uniforms.time.value += 1.0 / 60.0;
    //this.ms_Controls.update();
    this.display();
};
