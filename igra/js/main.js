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

var seznamKrogel = [];

var ladja;

window.addEventListener('resize', onResize, false); // Ko spremenimo velikost brskalnika, poklicemo onResize.
window.addEventListener('keydown', handleKeyDown, false);
window.addEventListener('keyup', handleKeyUp, false);

window.onload = function () {
    // Inicializacija
    var stats = initStats(); // Prikazuj FPS-je zgoraj levo.
    var keyboard = new KeyboardState();

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
    var axes = new THREE.AxisHelper(10);
    scene.add(axes);

    // Dodamo model ladje
    ///////////////////////////////////////////////////////////////////////////////////////
    ladja = new Ladja(scene, "ladja_majhna");

    // Dodamo morje in kopno
    ///////////////////////////////////////////////////////////////////////////////////////
    var voda = new Water(scene, renderer, camera);

    // Dodamo kopno
    var loader = new THREE.OBJMTLLoader();
    loader.load("models/kopno.obj", "models/kopno.mtl",
        function (object) {
            object.name = "kopno";
            scene.add(object);

            object.children.forEach(function (tmp) {
                ladja.addCollisionObject(tmp);
            });
        });

    // Ambientna svetloba.
    ///////////////////////////////////////////////////////////////////////////////////////
    // add subtle ambient lighting
    var ambientLight = new THREE.AmbientLight(0x2B2B2B);
    scene.add(ambientLight);

    // Vir svetlobe.
    ///////////////////////////////////////////////////////////////////////////////////////

    var directionalLight = new THREE.DirectionalLight(0xffecb3, 0.8);
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
        this.printPosition = function () {
            console.log(ladja.model.position.x.toFixed(3) + ", " +
                ladja.model.position.y.toFixed(3) + ", " +
                ladja.model.position.z.toFixed(3));
        }
    };

    var gui = new dat.GUI();
    gui.add(guiControls, 'zamenjajKamero');
    gui.add(guiControls, 'printPosition');

    // Renderiranje.
    ///////////////////////////////////////////////////////////////////////////////////////
    render();
    function render() {
        stats.update(); // Posodobi FPS-je.
        keyboard.update(); // Posodobi stanje tipkovnice.
        voda.update(); // Posodobi vodo.

        ladja.updatePose();

        transformCamera();
        posodabljajLetKrogel();

        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

    // Dolocanje lokacije kamere, glede na izbrani nacin prikaza.
    function transformCamera() {
        if (cameraMode == 1) {
            
            camera.position.x = ladja.model.position.x -30;
            camera.position.y = ladja.model.position.y +40;
            camera.position.z = ladja.model.position.z +30;
            camera.lookAt(ladja.model.position);
        } else if (cameraMode == 2) {
            var relativeCameraOffset = new THREE.Vector3(20, 7, 0);
            var cameraOffset = relativeCameraOffset.applyMatrix4(ladja.model.matrixWorld);

            camera.position.x = cameraOffset.x;
            camera.position.y = cameraOffset.y;
            camera.position.z = cameraOffset.z;
            camera.lookAt(ladja.model.position);
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

function posodabljajLetKrogel(){
    seznamKrogel.forEach(function(krogla){
        krogla[0].translateX(1);
        krogla[0].translateZ(1);
        krogla[0].downwardMotion += 0.01;
        krogla[0].position.y -= krogla[0].downwardMotion;
        /*
        var razdaljaKrogle = Math.sqrt(Math.pow(krogla[1].position.x - krogla[0].position.x, 2) + Math.pow(krogla[1].position.y - krogla[0].position.y, 2));
        //console.log(razdaljaKrogle);
        // Ce je dlje od nekatere dolzine, potem jo izbrisi iz seznama krogle (z metodo .pop ???) in scene!
        if (razdaljaKrogle > 50) {
            // seznamKrogel.izbrisi(krogla);
            scene.remove(krogla);
        }
        */
    });
}

// Ustreli s topom ko pritisnemo SPACE.
function ustreli() {
    var tmp_ladja = scene.getObjectByName("ladja_igralec"); // Pridobimo ladjo.
    var krogla = new CanonBall(tmp_ladja); // Ustvari kroglo.
    seznamKrogel.push([krogla, tmp_ladja]); // Dodaj kroglo in ladja v seznam krogle.
    scene.add(krogla); // Dodaj kroglo v sceno.
}

// Ko pritisnemo tipke.
function handleKeyDown(event) {
    var tmp_ladja = scene.getObjectByName("ladja_igralec");
    switch (event.keyCode) {
        case 32: // SPACE
            ustreli();
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
    var tmp_ladja = scene.getObjectByName("ladja_igralec");
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
