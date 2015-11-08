
var camera;
var scene;
var renderer;

var controls;
var cameraMode;

window.addEventListener('resize', onResize, false);
window.addEventListener('keydown', handleKeyDown, false);
window.addEventListener('keyup', handleKeyUp, false);

window.onload = function() {
    var stats = initStats();

    controls = new function() {
        this.speedxplus = 0.0;
        this.speedxminus = 0.0;
        this.speedzplus = 0.0;
        this.speedzminus = 0.0;
    };

    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
    cameraMode = 2;

    // Ustvarimo 3D sceno, katera "drzi" vse objekte, osvetljevanje in kamere.
    scene = new THREE.Scene();

    // Ustvarimo "render", ki skrbi za izris objektov za doloceno pozicijo/kot kamere.
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0xFFFFFF, 1.0)); // Barva ozadja.
    renderer.setSize(window.innerWidth, window.innerHeight); // Velikost izrisovalne povrsine.
    // Ustvari sence. Potrebno je eksplicitno dolociti, kateri objekti mecejo in kateri prejemajo sence! In kater
    // vir svetlobe povzroca sence!
    renderer.shadowMapEnabled = true;

    // Ustvarimo osi in jih dodamo v sceno.
    var axes = new THREE.AxisHelper(5);
    scene.add(axes);


    var planeGeometry = new THREE.PlaneGeometry(100, 100); // Podamo velikost ravnine (x in y koordinate).
    // Material MeshBasicMaterial se ne odziva na svetlobo!
    var planeMaterial = new THREE.MeshBasicMaterial({color: 0x00BFFF});
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true; // Vklopino prejemanje/projekcijo senc na to ravnino.

    // Zarotiramo ravnino po X-osi.
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.x = 0;
    plane.position.y = 0;
    plane.position.z = 0;

    // V sceno dodamo ravnino.
    scene.add(plane);

    var cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
    var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xff0000});
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.castShadow = true; // Vklopimo metanje senc kocke. Pac da kocka mece sence.

    cube.position.x = 0;
    cube.position.y = 2;
    cube.position.z = 0;

    scene.add(cube);

    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.castShadow = true; // Vklopimo sence. Tu povemo, kater vir svetlobe naj povzroca sence.
    spotLight.position.set(-40, 60, -10);
    scene.add(spotLight);

    document.getElementById("WebGL-output").appendChild(renderer.domElement);

    //dat.gui

    var guiControls = { changeCamera:function(){
        if (cameraMode == 1) {
            cameraMode = 2;
        } else {
            cameraMode = 1;
        }
    }};
    var gui = new dat.GUI();
    gui.add(guiControls,'changeCamera');

    // call the render function
    renderScene();
    function renderScene() {
        stats.update();

        cube.position.x += controls.speedxplus;
        cube.position.x -= controls.speedxminus;
        cube.position.z += controls.speedzplus;
        cube.position.z -= controls.speedzminus;

        transformCamera();

        requestAnimationFrame(renderScene);
        renderer.render(scene, camera);
    }

    function transformCamera() {
        if (cameraMode == 1) {
            camera.position.x = -30;
            camera.position.y = 40;
            camera.position.z = 30;
            camera.lookAt(cube.position);
        } else if (cameraMode == 2){
            camera.position.x = -30 + cube.position.x;
            camera.position.y = 30;
            camera.position.z = cube.position.z;
            camera.lookAt(cube.position);
        }
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

function handleKeyDown(event) {
    switch (event.keyCode) {
        case 37:
            controls.speedzminus = 0.1;
            break;
        case 38:
            controls.speedxplus = 0.1;
            break;
        case 39:
            controls.speedzplus = 0.1;
            break;
        case 40:
            controls.speedxminus = 0.1;
            break;
    }
}

function handleKeyUp(event) {
    switch (event.keyCode) {
        case 37:
            controls.speedzminus = 0.0;
            break;
        case 38:
            controls.speedxplus = 0.0;
            break;
        case 39:
            controls.speedzplus = 0.0;
            break;
        case 40:
            controls.speedxminus = 0.0;
            break;
    }
}