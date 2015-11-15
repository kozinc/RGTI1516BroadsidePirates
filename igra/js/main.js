///////////////////////////////////////////////////////////////////////////////////////
// FRI 2015/2016, Racunalniska grafika in tehnologija iger

// Denis Kotnik (denis.kotnik@gmail.com)
// Klemen Červ (klemen.cerv@gmail.com)
// Kristian Žarn (kristian.zarn@gmail.com)
// Aljaž Kozina (kozinc@gmail.com)
///////////////////////////////////////////////////////////////////////////////////////

// globalne spremenljivke
var camera;
var scene;
var renderer;

var cameraMode;
var ladja;
var loader;

window.addEventListener('resize', onResize, false); // Ko spremenimo velikost brskalnika, poklicemo onResize.
window.addEventListener('keydown', handleKeyDown, false);
window.addEventListener('keyup', handleKeyUp, false);

window.onload = function () {
    // Inicializacija
    var stats = initStats(); // Prikazuj FPS-je zgoraj levo.
    var keyboard = new KeyboardState();
    loader = new THREE.OBJMTLLoader();

    // Ustvarimo kamero.
    ///////////////////////////////////////////////////////////////////////////////////////
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraMode = 2;

    // Ustvarimo 3D sceno, katera "drzi" vse objekte, osvetljevanje in kamere.
    ///////////////////////////////////////////////////////////////////////////////////////
    scene = new THREE.Scene();

    // Ustvarimo "render", ki skrbi za izris objektov za doloceno pozicijo/kot kamere.
    ///////////////////////////////////////////////////////////////////////////////////////
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0xFFFFFF, 1.0)); // Barva ozadja.
    renderer.setSize(window.innerWidth, window.innerHeight); // Velikost izrisovalne povrsine.
    // Ustvari sence. Potrebno je eksplicitno dolociti, kateri objekti mecejo in kateri prejemajo sence! In kater
    // vir svetlobe povzroca sence!
    renderer.shadowMapEnabled = true;
    document.getElementById("WebGL-output").appendChild(renderer.domElement);

    // Dodamo osi
    ///////////////////////////////////////////////////////////////////////////////////////
    /*var axes = new THREE.AxisHelper(10);
    scene.add(axes);*/

    // Dodamo ladjo igralca
    ///////////////////////////////////////////////////////////////////////////////////////
    ladja = new Ladja();
    scene.add(ladja);
    loader.load("models/ladja_majhna.obj", "models/ladja_majhna.mtl",
        function (object) {
            object.scale.set(1.5, 1.5, 1.5);
            ladja.add(object);
        });

    // Dodamo nasprotnike
    var nasprotniki = [];

    nasprotniki.push(new Ladja());
    nasprotniki[0].position.set(-55.553, 0.700, 31.663);
    nasprotniki[0].rotation.y = -0.662;
    scene.add(nasprotniki[0]);
    loader.load("models/ladja_majhna.obj", "models/ladja_majhna.mtl",
        function (object) {
            object.scale.set(1.5, 1.5, 1.5);
            nasprotniki[0].add(object);
        });

    nasprotniki.push(new Ladja());
    nasprotniki[1].position.set(-78.905, 0.700, -5.316);
    nasprotniki[1].rotation.y = 0.946;
    scene.add(nasprotniki[1]);
    loader.load("models/ladja_majhna.obj", "models/ladja_majhna.mtl",
        function (object) {
            object.scale.set(1.5, 1.5, 1.5);
            nasprotniki[1].add(object);
        });

    // collision: nasprotniki - igralec
    nasprotniki.forEach(function (tmp) {
        tmp.addCollisionObject(ladja);
        ladja.addCollisionObject(tmp);
    });

    // Dodamo morje in kopno
    ///////////////////////////////////////////////////////////////////////////////////////
    var voda = new Water(scene, renderer, camera);

    // Dodamo kopno
    loader.load("models/kopno.obj", "models/kopno.mtl",
        function (object) {
            object.name = "kopno";
            scene.add(object);

            // collision: ladje - kopno
            ladja.addCollisionObject(object);
            nasprotniki.forEach(function (tmp) {
                tmp.addCollisionObject(object);
            });
        });

    // Ambientna svetloba.
    ///////////////////////////////////////////////////////////////////////////////////////
    // add subtle ambient lighting
    var ambientLight = new THREE.AmbientLight(0x2E2E2E);
    scene.add(ambientLight);

    // Vir svetlobe.
    ///////////////////////////////////////////////////////////////////////////////////////

    var directionalLight = new THREE.DirectionalLight(0xffecb3, 0.9);
    directionalLight.position.set(600, 500, -600);
    scene.add(directionalLight);

    // dodan tudi skupaj z ladjico, morda bi bilo bolje luc prestaviti sem.

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
            console.log(ladja.position.x.toFixed(3) + ", " +
                ladja.position.y.toFixed(3) + ", " +
                ladja.position.z.toFixed(3) + ", " +
                ladja.rotation.y.toFixed(3) + ", " +
                ladja.health
            );
        };
        this.enemyShoot = function () {
            nasprotniki.forEach(function (tmp) {
                tmp.shootLeft();
                tmp.shootRight();
            });
        };
    };

    var gui = new dat.GUI();
    gui.add(guiControls, 'zamenjajKamero');
    gui.add(guiControls, 'printData');
    gui.add(guiControls, 'enemyShoot');

    // Renderiranje.
    ///////////////////////////////////////////////////////////////////////////////////////
    render();
    function render() {
        stats.update(); // Posodobi FPS-je.
        keyboard.update(); // Posodobi stanje tipkovnice.
        voda.update(); // Posodobi vodo.

        ladja.update(); // Posodobi ladjo in njene krogle
        nasprotniki.forEach(function (tmp) {
            tmp.update();
        });

        transformCamera();

        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

    // Dolocanje lokacije kamere, glede na izbrani nacin prikaza.
    function transformCamera() {
        if (cameraMode == 1) {
            camera.position.x = ladja.position.x -30;
            camera.position.y = ladja.position.y +50;
            camera.position.z = ladja.position.z +30;
            camera.lookAt(ladja.position);
        } else if (cameraMode == 2) {
            var relativeCameraOffset = new THREE.Vector3(30, 7, 0);
            var cameraOffset = relativeCameraOffset.applyMatrix4(ladja.matrixWorld);

            camera.position.x = cameraOffset.x;
            camera.position.y = cameraOffset.y;
            camera.position.z = cameraOffset.z;
            camera.lookAt(ladja.position);
        }
        skyBox.position.x = camera.position.x;
        skyBox.position.y = camera.position.y;
        skyBox.position.z = camera.position.z;

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
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
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
