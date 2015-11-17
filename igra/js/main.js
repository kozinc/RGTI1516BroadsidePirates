///////////////////////////////////////////////////////////////////////////////////////
// FRI 2015/2016, Racunalniska grafika in tehnologija iger

// Denis Kotnik (denis.kotnik@gmail.com)
// Klemen Červ (klemen.cerv@gmail.com)
// Kristian Žarn (kristian.zarn@gmail.com)
// Aljaž Kozina (kozinc@gmail.com)
///////////////////////////////////////////////////////////////////////////////////////

// globalne spremenljivke
var camera1;
var camera2;
var cameraMap;
var cameraWater;
var cameraMode;

var scene;
var renderer;

var ladja;
var objMtlLoader = new THREE.OBJMTLLoader();

var healthbarDOM;
var coinsDOM;

window.addEventListener('resize', onResize, false); // Ko spremenimo velikost brskalnika, poklicemo onResize.
window.addEventListener('keydown', handleKeyDown, false);
window.addEventListener('keyup', handleKeyUp, false);

window.onload = function () {
    // Inicializacija
    //var stats = initStats(); // Prikazuj FPS-je zgoraj levo.
    healthbarDOM = document.getElementById("Healthbar");
    coinsDOM = document.getElementById("CollectedCoins");

    // Ustvarimo 3D sceno, katera "drzi" vse objekte, osvetljevanje in kamere.
    ///////////////////////////////////////////////////////////////////////////////////////
    scene = new THREE.Scene();

    // Ustvarimo kamero.
    ///////////////////////////////////////////////////////////////////////////////////////
    camera1 = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera2 = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraMode = 2;

    //cameraMap = new THREE.OrthographicCamera(mapWidth / - d, mapWidth / d, mapHeight / d, mapHeight / - d, 1, 500);
    cameraMap = new THREE.OrthographicCamera(-100, 100, 100, -100, 1, 500);
    cameraWater = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Ustvarimo "render", ki skrbi za izris objektov za doloceno pozicijo/kot kamere.
    ///////////////////////////////////////////////////////////////////////////////////////
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0xFFFFFF, 1.0)); // Barva ozadja.
    renderer.setSize(window.innerWidth, window.innerHeight); // Velikost izrisovalne povrsine.
    // Ustvari sence. Potrebno je eksplicitno dolociti, kateri objekti mecejo in kateri prejemajo sence! In kater
    // vir svetlobe povzroca sence!
    renderer.shadowMapEnabled = true;
    document.getElementById("WebGL-output").appendChild(renderer.domElement);
    renderer.autoClear = false;

    // Dodamo osi
    ///////////////////////////////////////////////////////////////////////////////////////
    /*var axes = new THREE.AxisHelper(10);
    scene.add(axes);*/

    // Dodamo ladje
    ///////////////////////////////////////////////////////////////////////////////////////
    //ladja igralca
    ladja = new Ladja();
    ladja.position.set(-162.250, 1.000, -94.557);
    ladja.rotation.y = 1.878;
    scene.add(ladja);

    // Dodamo nasprotnike
    var nasprotniki = [];

    var path1 = [
        new THREE.Vector3(-122.286, 0, 95.835),
        new THREE.Vector3(-82.594, 0, 17.436),
        new THREE.Vector3(-16.663, 0, 47.433),
        new THREE.Vector3(9.322, 0, 98.946),
        new THREE.Vector3(-44.747, 0, 149.477),
        new THREE.Vector3(-111.017, 0, 128.967)
    ];
    nasprotniki.push(new LadjaNPC(path1, ladja));
    scene.add(nasprotniki[0]);

    var path2 = [
        new THREE.Vector3(144.035, 1.000, 150.561),
        new THREE.Vector3(81.573, 1.000, 147.484),
        new THREE.Vector3(49.792, 1.000, 85.671),
        new THREE.Vector3(83.296, 1.000, 37.585),
        new THREE.Vector3(128.498, 1.000, 31.236),
        new THREE.Vector3(152.179, 1.000, 66.821),
        new THREE.Vector3(151.942, 1.000, 116.46)
    ];
    nasprotniki.push(new LadjaNPC(path2, ladja));
    scene.add(nasprotniki[1]);

    var path3 = [
        new THREE.Vector3(-44.631, 1.000, 1.849),
        new THREE.Vector3(-16.029, 1.000, 39.528),
        new THREE.Vector3(10.484, 1.000, 60.148),
        new THREE.Vector3(37.552, 1.000, 43.743),
        new THREE.Vector3(14.797, 1.000, 4.604),
        new THREE.Vector3(25.622, 1.000, -30.887),
        new THREE.Vector3(-34.327, 1.000, -6.573)
    ];
    nasprotniki.push(new LadjaNPC(path3, ladja));
    scene.add(nasprotniki[2]);

    var path4 = [
        new THREE.Vector3(-1.251, 1.000, -116.488),
        new THREE.Vector3(102.658, 1.000, -115.505),
        new THREE.Vector3(141.622, 1.000, -92.990),
        new THREE.Vector3(155.163, 1.000, -55.813),
        new THREE.Vector3(140.654, 1.000, -22.735),
        new THREE.Vector3(117.402, 1.000, 0.836),
        new THREE.Vector3(138.397, 1.000, 5.729),
        new THREE.Vector3(157.493, 1.000, -33.383),
        new THREE.Vector3(149.401, 1.000, -115.072),
        new THREE.Vector3(54.614, 1.000, -144.990),
        new THREE.Vector3(-13.446, 1.000, -134.987)
    ];
    nasprotniki.push(new LadjaNPC(path4, ladja));
    scene.add(nasprotniki[3]);

    // collision: nasprotniki - igralec
    nasprotniki.forEach(function (tmp) {
        tmp.addCollisionObject(ladja);
        ladja.addCollisionObject(tmp);
    });

    // Dodamo okolico (morje, kopno, ...)
    ///////////////////////////////////////////////////////////////////////////////////////
    var voda = new Water(scene, renderer, cameraWater);

    // Dodamo kopno
    objMtlLoader.load("models/kopno.obj", "models/kopno.mtl",
        function (object) {
            object.name = "kopno";
            scene.add(object);

            // collision: ladje - kopno
            ladja.addCollisionObject(object);
            nasprotniki.forEach(function (tmp) {
                tmp.addCollisionObject(object);
            });
        });

    // Svetilnik
    objMtlLoader.load("models/lighthouse.obj", "models/lighthouse.mtl",
        function (object) {
            object.scale.set(1.5, 1.5, 1.5);
            object.position.set(40, 1, 8);
            object.rotation.y = -1;
            scene.add(object);
        }
    );

    // Dodamo cekine
    ///////////////////////////////////////////////////////////////////////////////////////
    var cekini = [];

    for (var i = 0; i < 50; i++) {
        cekini.push(new Coin(ladja));
        scene.add(cekini[i]);
    }

    // Ambientna svetloba.
    ///////////////////////////////////////////////////////////////////////////////////////
    // add subtle ambient lighting
    var ambientLight = new THREE.AmbientLight(0x2E2E2E);
    scene.add(ambientLight);

    // Vir svetlobe.
    ///////////////////////////////////////////////////////////////////////////////////////

    var directionalLight1 = new THREE.DirectionalLight(0xffecb3, 0.9);
    directionalLight1.position.set(600, 500, -600);
    scene.add(directionalLight1);

    var directionalLight2 = new THREE.DirectionalLight(0xffe699, 0.5);
    directionalLight2.position.set(-600, 500, 600);
    scene.add(directionalLight2);

    // Skybox
    ///////////////////////////////////////////////////////////////////////////////////////
    var aCubeMap = THREE.ImageUtils.loadTextureCube([
          'textures/px.jpg', // px
          'textures/nx.jpg', // nx
          'textures/py.jpg', // py
          'textures/ny.jpg', // ny
          'textures/pz.jpg', // pz
          'textures/nz.jpg' // nz
        ]);
    aCubeMap.format = THREE.RGBFormat;

    var aShader = THREE.ShaderLib['cube'];
    aShader.uniforms['tCube'].value = aCubeMap;

    var aSkyBoxMaterial = new THREE.ShaderMaterial({
      fragmentShader: aShader.fragmentShader,
      vertexShader: aShader.vertexShader,
      uniforms: aShader.uniforms,
      depthWrite: false,
      side: THREE.BackSide
    });

    var skyBox = new THREE.Mesh(new THREE.BoxGeometry(1000, 1000, 1000), aSkyBoxMaterial);
    scene.add(skyBox);

    // GUI kontrole.
    ///////////////////////////////////////////////////////////////////////////////////////
    var guiControls = new function () {
        // Spremenimo kamero.
        this.zamenjajKamero = function () {
            if (cameraMode == 1) {
                cameraMode = 2;
            } else {
                cameraMode = 1;
            }
        };
        // zapisi lokacijo ladje.
        this.printData = function () {
            console.log(
                ladja.position.x.toFixed(3) + ", " +
                ladja.position.y.toFixed(3) + ", " +
                ladja.position.z.toFixed(3)
            );
        };
        this.enemyShoot = function () {
            nasprotniki.forEach(function (tmp) {
                tmp.shootLeft();
                tmp.shootRight();
            });
        };
    };

    /*var gui = new dat.GUI();
    gui.add(guiControls, 'zamenjajKamero');
    gui.add(guiControls, 'enemyShoot');
    gui.add(guiControls, 'printData');*/

    // Renderiranje.
    ///////////////////////////////////////////////////////////////////////////////////////
    render();
    function render() {
        renderer.clear();
        renderer.setViewport( 0, 0, window.innerWidth, window.innerHeight );
        //stats.update(); // Posodobi FPS-je.
        voda.update(); // Posodobi vodo.

        ladja.update(); // Posodobi ladjo in njene krogle
        nasprotniki.forEach(function (tmp) {
            tmp.update();
        });

        cekini.forEach(function (tmp) { // Posodobi cekine
            tmp.update();
        });

        transformCamera();
        updateHUD();

        requestAnimationFrame(render);
        if (cameraMode == 1) {
            renderer.render(scene, camera1);
        } else {
            renderer.render(scene, camera2);
            //Minimap render
            var k = 0.3;
            renderer.setViewport(
                0, window.innerHeight - window.innerHeight*k,
                window.innerHeight*k, window.innerHeight*k);
            renderer.render( scene, cameraMap );
        }
    }

    // Dolocanje lokacije kamere, glede na izbrani nacin prikaza.
    function transformCamera() {
        camera1.position.x = ladja.position.x - 30;
        camera1.position.y = ladja.position.y + 80;
        camera1.position.z = ladja.position.z + 30;
        camera1.lookAt(ladja.position);

        var relativeCameraOffset = new THREE.Vector3(30, 7, 0);
        var cameraOffset = relativeCameraOffset.applyMatrix4(ladja.matrixWorld);

        camera2.position.x = cameraOffset.x;
        camera2.position.y = cameraOffset.y;
        camera2.position.z = cameraOffset.z;
        camera2.lookAt(ladja.position);

        cameraMap.position.x = ladja.position.x;
        cameraMap.position.y = ladja.position.y + 60;
        cameraMap.position.z = ladja.position.z;
        cameraMap.lookAt(ladja.position);

        cameraWater.position.x = ladja.position.x + 30;
        cameraWater.position.y = ladja.position.y + 50;
        cameraWater.position.z = ladja.position.z + 30;
        cameraWater.lookAt(ladja.position);

        skyBox.position.x = ladja.position.x;
        skyBox.position.y = ladja.position.y;
        skyBox.position.z = ladja.position.z;
    }

    function updateHUD() {
        if (healthbarDOM.children.length < ladja.health) {
            // povecaj health
            var tmp = document.createElement("img");
            tmp.setAttribute('src', 'textures/heart_small.png');
            healthbarDOM.appendChild(tmp);
        } else if (healthbarDOM.children.length > ladja.health) {
            // zmanjsaj health
            healthbarDOM.removeChild(healthbarDOM.children[0]);
        }
        coinsDOM.textContent = collectedCoins.toString();
    }
};

// Funkcija za inicializacijo prikazovanja FPS-jev zgoraj levo.
function initStats() {
    var stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.getElementById("Stats-output").appendChild(stats.domElement);
    return stats;
}

// Ko spremenimo velikost brskalnika.
function onResize() {
    camera1.aspect = window.innerWidth / window.innerHeight;
    camera1.updateProjectionMatrix();

    camera2.aspect = window.innerWidth / window.innerHeight;
    camera2.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Ko pritisnemo tipke.
function handleKeyDown(event) {
    switch (event.keyCode) {
        case 32: // SPACE
            ladja.shootLeft();
            ladja.shootRight();
            break;
        case 37: // left arrow
            ladja.turnLeftStart();
            break;
        case 38: // up arrow
            ladja.moveForwardStart();
            break;
        case 39: // right arrow
            ladja.turnRightStart();
            break;
        case 40: // down arrow
            ladja.moveBackStart();
            break;
        case 67: // crka C
            if (cameraMode == 1) {
                cameraMode = 2;
            } else {
                cameraMode = 1;
            }
            break;
    }
}
// Ko spustimo tipke.
function handleKeyUp(event) {
    switch (event.keyCode) {
        case 37: // left arrow
            ladja.turnLeftStop();
            break;
        case 38: // up arrow
            ladja.moveForwardStop();
            break;
        case 39: // right arrow
            ladja.turnRightStop();
            break;
        case 40: // down arrow
            ladja.moveBackStop();
            break;
    }
}
