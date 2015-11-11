///////////////////////////////////////////////////////////////////////////////////////
// FRI 2015/2016, Racunalniska grafika in tehnologija iger

// Denis Kotnik (denis.kotnik@gmail.com)
// Klemen Červ (klemen.cerv@gmail.com)
// Kristian Žarn (kristian.zarn@gmail.com)
// Aljaž Kozina (kozinc@gmail.com)
///////////////////////////////////////////////////////////////////////////////////////

var camera;
var scene;
var renderer;

var cameraMode;

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
    /*camera.position.x = -30;
     camera.position.y = 40;
     camera.position.z = 30;
     camera.lookAt(new THREE.Vector3(0, 0, 0));*/
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

    // Dodamo morje
    ///////////////////////////////////////////////////////////////////////////////////////
    var morjeTexture = new THREE.ImageUtils.loadTexture('textures/checkerboard.jpg');
    morjeTexture.wrapS = morjeTexture.wrapT = THREE.RepeatWrapping;
    morjeTexture.repeat.set(25, 25);
    // DoubleSide: render texture on both sides of mesh
    //var morjeMaterial = new THREE.MeshLambertMaterial({map: morjeTexture});
    var morjeMaterial = new THREE.MeshLambertMaterial({color: 0x3D64B1});

    var morjeGeometry = new THREE.PlaneGeometry(100, 100, 1, 1);
    var morje = new THREE.Mesh(morjeGeometry, morjeMaterial);
    morje.rotation.x = -0.5 * Math.PI;
    morje.position.x = 0;
    morje.position.y = 0;
    morje.position.z = 0;
    morje.receiveShadow = true;
    scene.add(morje);

    // Dodamo model ladje
    ///////////////////////////////////////////////////////////////////////////////////////
    var ladja = new Ladja(scene, "ladja_majhna");

    // Ambientna svetloba.
    ///////////////////////////////////////////////////////////////////////////////////////
    // add subtle ambient lighting
    var ambientLight = new THREE.AmbientLight(0x2B2B2B);
    scene.add(ambientLight);

    // Vir svetlobe.
    ///////////////////////////////////////////////////////////////////////////////////////
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(40, 50, -20);
    directionalLight.castShadow = true;
    directionalLight.shadowCameraNear = 2;
    directionalLight.shadowCameraFar = 200;
    directionalLight.shadowCameraLeft = -50;
    directionalLight.shadowCameraRight = 50;
    directionalLight.shadowCameraTop = 50;
    directionalLight.shadowCameraBottom = -50;

    directionalLight.distance = 0;
    directionalLight.intensity = 1.0;
    directionalLight.shadowMapHeight = 2048;
    directionalLight.shadowMapWidth = 2048;

    scene.add(directionalLight);

    // Skybox
    ///////////////////////////////////////////////////////////////////////////////////////
    var imagePrefix = "textures/skybox_";
    var directions = ["front", "back", "up", "down", "left", "right"];
    var imageSuffix = ".jpg";
    var skyGeometry = new THREE.CubeGeometry(500, 500, 500);

    var materialArray = [];
    for (var i = 0; i < 6; i++)
        materialArray.push(new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture(imagePrefix + directions[i] + imageSuffix),
            side: THREE.BackSide
        }));
    var skyMaterial = new THREE.MeshFaceMaterial(materialArray);
    var skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
    //scene.add(skyBox);

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
    };

    var gui = new dat.GUI();
    gui.add(guiControls, 'zamenjajKamero');

    // Renderiranje.
    ///////////////////////////////////////////////////////////////////////////////////////
    render();
    function render() {
        stats.update(); // Posodobi FPS-je.
        keyboard.update(); // Posodobi stanje tipkovnice.

        if (keyboard.pressed("up")) {
            ladja.moveForwardStart();
        } else {
            ladja.moveForwardStop();
        }
        if (keyboard.pressed("down")) {
            ladja.moveBackStart();
        } else {
            ladja.moveBackStop();
        }
        if (keyboard.pressed("left")) {
            ladja.turnLeftStart();
        } else {
            ladja.turnLeftStop()
        }
        if (keyboard.pressed("right")) {
            ladja.turnRightStart();
        } else {
            ladja.turnRightStop();
        }

        //ostane lahko samo to ce uporabim listenerje
        ladja.updatePose();

        transformCamera();

        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

    // Dolocanje lokacije kamere, glede na izbrani nacin prikaza.
    function transformCamera() {
        if (cameraMode == 1) {
            camera.position.x = -30;
            camera.position.y = 40;
            camera.position.z = 30;
            camera.lookAt(ladja.model.position);
        } else if (cameraMode == 2) {
            var relativeCameraOffset = new THREE.Vector3(20, 10, 0);
            var cameraOffset = relativeCameraOffset.applyMatrix4(ladja.model.matrixWorld);

            camera.position.x = cameraOffset.x;
            camera.position.y = cameraOffset.y;
            camera.position.z = cameraOffset.z;
            camera.lookAt(ladja.model.position);
        }
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
    var tmp_ladja = scene.getObjectByName("ladja_igralec");
    switch (event.keyCode) {
        case 37: // left arrow
            break;
        case 38: // up arrow
            break;
        case 39: // right arrow
            break;
        case 40: // down arrow
            break;
    }
}
// Ko spustimo tipke.
function handleKeyUp(event) {
    var tmp_ladja = scene.getObjectByName("ladja_igralec");
    switch (event.keyCode) {
        case 37: // left arrow
            break;
        case 38: // up arrow
            break;
        case 39: // right arrow
            break;
        case 40: // down arrow
            break;
    }
}

function Ladja(scene, model_name) {
    // Lastnosti
    this.model;
    this.vel = 0.0;
    this.velTurn = 0.0;

    this.movingFwd = false;
    this.movingBack = false;
    this.turningLeft = false;
    this.turningRight = false;

    // parametri premikanja
    this.accFwd = 0.005;
    this.accBack = 0.002;
    this.accStop = 0.005;
    this.velFwdMax = 0.2;
    this.velBackMax = 0.1;

    this.accTurn = 0.001;
    this.accTurnStop = 0.0005;
    this.velTurnMax = 0.01;

    // Konstruktor
    var group = new THREE.Group();
    this.model = group;
    scene.add(this.model);

    var loader = new THREE.OBJMTLLoader();
    loader.load("models/".concat(model_name).concat(".obj"), "models/".concat(model_name).concat(".mtl"),
        function (object) {
            object.scale.set(1, 1, 1);
            object.name = 'ladja_igralec';
            object.translateY(1);
            object.children.forEach(function (tmp1) {
                tmp1.children.forEach(function (tmp2) {
                    tmp2.castShadow = true;
                    tmp2.receiveShadow = true;
                })
            });
            group.add(object);
        });
}
// Metode
Ladja.prototype.moveForwardStart = function () {
    this.movingFwd = true;
};
Ladja.prototype.moveForwardStop = function () {
    this.movingFwd = false;
};
Ladja.prototype.moveBackStart = function () {
    this.movingBack = true;
};
Ladja.prototype.moveBackStop = function () {
    this.movingBack = false;
};

Ladja.prototype.turnLeftStart = function () {
    this.turningLeft = true;
};
Ladja.prototype.turnLeftStop = function () {
    this.turningLeft = false;
};
Ladja.prototype.turnRightStart = function () {
    this.turningRight = true;
};
Ladja.prototype.turnRightStop = function () {
    this.turningRight = false;
};

Ladja.prototype.updatePose = function () {
    if (this.movingFwd) {
        if (this.vel < this.velFwdMax) {
            this.vel += this.accFwd;
        }
    } else if (this.movingBack) {
        if (this.vel > -this.velBackMax) {
            this.vel -= this.accBack;
        }
    } else {
        var sign = (this.vel >= 0) ? 1 : -1;
        var velMag = Math.abs(this.vel);
        if (velMag > 0) {
            this.vel -= sign*this.accStop;
        }
        if (velMag < this.accStop) {
            this.vel = 0.0;
        }
    }

    if (this.turningLeft) {
        if (this.velTurn < this.velTurnMax) {
            this.velTurn += this.accTurn;
        }
    } else if (this.turningRight) {
        if (this.velTurn > -this.velTurnMax) {
            this.velTurn -= this.accTurn;
        }
    } else {
        var sign = (this.velTurn >= 0) ? 1 : -1;
        var velMag = Math.abs(this.velTurn);
        if (velMag > 0) {
            this.velTurn -= sign*this.accTurnStop;
        }
        if (velMag < this.accTurnStop) {
            this.velTurn = 0.0;
        }
    }

    this.model.translateX(-this.vel);
    this.model.rotation.y += this.velTurn;
};
