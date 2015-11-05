
var camera;
var scene;
var renderer;

window.onload = function() {
    var stats = initStats();
    window.addEventListener('resize', onResize, false);

    // 3D scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;

    var axes = new THREE.AxisHelper(5);
    scene.add(axes);

    var planeGeometry = new THREE.PlaneGeometry(50, 50);
    var planeMaterial = new THREE.MeshLambertMaterial({color: 0xcccccc});
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;

    plane.rotation.x = -0.5 * Math.PI;
    plane.position.x = 0;
    plane.position.y = 0;
    plane.position.z = 0;

    scene.add(plane);

    var cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
    var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xff0000});
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.castShadow = true;

    cube.position.x = 0;
    cube.position.y = 2;
    cube.position.z = 0;

    scene.add(cube);

    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.castShadow = true;
    spotLight.position.set(-40, 60, -10);
    scene.add(spotLight);

    camera.position.x = -30;
    camera.position.y = 40;
    camera.position.z = 30;
    camera.lookAt(cube.position);

    document.getElementById("WebGL-output").appendChild(renderer.domElement);

    //dat.gui
    var controls = new function() {
        this.speedxplus = 0.0;
        this.speedxminus = 0.0;
        this.speedzplus = 0.0;
        this.speedzminus = 0.0;
    };
    var gui = new dat.GUI();
    gui.add(controls, 'speedxplus', 0, 0.1);
    gui.add(controls, 'speedxminus', 0, 0.1);
    gui.add(controls, 'speedzplus', 0, 0.1);
    gui.add(controls, 'speedzminus', 0, 0.1);

    // call the render function
    renderScene();
    function renderScene() {
        stats.update();

        cube.position.x += controls.speedxplus;
        cube.position.x -= controls.speedxminus;
        cube.position.z += controls.speedzplus;
        cube.position.z -= controls.speedzminus;

        camera.lookAt(cube.position);

        requestAnimationFrame(renderScene);
        renderer.render(scene, camera);
    }

};

function initStats() {
    var stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.getElementById("Stats-output").appendChild(stats.domElement);
    return stats;
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
