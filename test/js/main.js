
var camera;
var scene;
var renderer;

var controls;
var cameraMode;

window.addEventListener('resize', onResize, false); // Ko spremenimo velikost brskalnika, poklicemo onResize.
window.addEventListener('keydown', handleKeyDown, false);
window.addEventListener('keyup', handleKeyUp, false);

window.onload = function() {
    var stats = initStats(); // Prikazuj FPS-je zgoraj levo.

    controls = new function() {
        this.speedxplus = 0.0;
        this.speedxminus = 0.0;

        this.translacijaX = 0.0;
        this.rotationSpeed = 0.01;
        this.rotationY = 0.0;
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


    var planeGeometry = new THREE.PlaneGeometry(50, 40); // Podamo velikost ravnine (x in y koordinate).
    // Material MeshBasicMaterial se ne odziva na svetlobo!
    var planeMaterial = new THREE.MeshLambertMaterial({color: 0x0099FF});
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true; // Vklopino prejemanje/projekcijo senc na to ravnino.

    // Zarotiramo ravnino po X-osi.
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.x = 15;
    plane.position.y = 0;
    plane.position.z = 0;

    // V sceno dodamo ravnino.
    scene.add(plane);


    var cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
    var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xffff00});
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.castShadow = true; // Vklopimo metanje senc kocke. Pac da kocka mece sence.

    cube.position.x = -4;
    cube.position.y = 2;
    cube.position.z = 0;

    scene.add(cube);

    // add subtle ambient lighting
    var ambientLight = new THREE.AmbientLight(0x0c0c0c);
    scene.add(ambientLight);

    // Vir svetlobe.
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-40, 60, -10); // Lokacija izvira
    spotLight.castShadow = true; // Vklopimo sence. Tu povemo, ali naj ta vir svetlobe naj povzroca sence.
    scene.add(spotLight);

    document.getElementById("WebGL-output").appendChild(renderer.domElement);


    var guiControls = new function() { 
        // Spremenimo kamero.
        this.zamenjajKamero = function(){
            if (cameraMode == 1) {
                cameraMode = 2;
            } else {
                cameraMode = 1;
            }
        }

        this.dodajKocko = function () {

                var cubeSize = Math.ceil((Math.random() * 3));
                var cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
                var cubeMaterial = new THREE.MeshLambertMaterial({color: Math.random() * 0xffffff});
                var cube2 = new THREE.Mesh(cubeGeometry, cubeMaterial);
                cube2.castShadow = true;
                cube2.name = "cube-" + scene.children.length;


                // position the cube randomly in the scene
                cube2.position.x = -30 + Math.round((Math.random() * planeGeometry.parameters.width));
                cube2.position.y = Math.round((Math.random() * 5));
                cube2.position.z = -20 + Math.round((Math.random() * planeGeometry.parameters.height));

                // add the cube to the scene
                scene.add(cube2);
                this.numberOfObjects = scene.children.length;
            };
        // V konzolo izpise vse objekte. Ce zelimo izpisati samo kocke, dodamo if (lastObject instanceof THREE.Mesh)
        // console.log(scene. getObjectByName("cube-17")
        this.izpisiObjekte = function () {
                console.log(scene.children);
        }
    };

    var gui = new dat.GUI();
    // Dodamo kontrole
    gui.add(guiControls,'zamenjajKamero');
    gui.add(guiControls,'dodajKocko');
    gui.add(guiControls,'izpisiObjekte');

    // Poklici funkcijo za renderiranje.
    render();
    // Renderiranje.
    function render() {
        stats.update(); // Posodobi FPS-je.
        
        // rotate the cubes around its axes
        scene.traverse(function (e) {
            if (e instanceof THREE.Mesh && e != plane && e != cube) {

                e.rotation.x += controls.rotationSpeed;
                e.rotation.y += controls.rotationSpeed;
                e.rotation.z += controls.rotationSpeed;
            }
        });
        // Kontrole.
        cube.translateX(controls.translacijaX);
        //cube.translateX(-controls.translacijaX);
        
        // Zavrti kocko po Y-osi, ce smo jo s smernimi tipkami zavrteli.
        cube.rotation.y += controls.rotationY;
        //console.log(controls.rotationY) // izpisuj "hitrost" vrtenja ladje.

        transformCamera();

        requestAnimationFrame(render);
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

        var relativeCameraOffset = new THREE.Vector3(-20,10,0);
        var cameraOffset = relativeCameraOffset.applyMatrix4( cube.matrixWorld );

        camera.position.x = cameraOffset.x;
        camera.position.y = cameraOffset.y;
        camera.position.z = cameraOffset.z;
        camera.lookAt(cube.position);
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

function handleKeyDown(event) {
    switch (event.keyCode) {
        case 37:
            //controls.speedzminus += 0.1;
            // Z naslednjim stavkom povemo najvecjo hitrost obracanja ladje v levo.
            if (controls.rotationY < 0.015){
                controls.rotationY += 0.005;
            }
            break;
        case 38:
            // Povecuj hitrost naprej.
            if (controls.translacijaX < 0.4){
                controls.translacijaX += 0.05;
            }
            break;
        case 39:
            //controls.speedzplus += 0.1;
            // Z naslednjim stavkom povemo najvecjo hitrost obracanja ladje v desno.
            if (controls.rotationY > -0.015){
                controls.rotationY -= 0.005;
            }
            break;
        case 40:
            if (controls.translacijaX > -0.01){
                controls.translacijaX -= 0.05;
            }
            break;
    }
}

function handleKeyUp(event) {
    switch (event.keyCode) {
        case 37:
            //controls.speedzminus = 0.0;
            break;
        case 38:
            //controls.translacijaX = 0.0;
            break;
        case 39:
            //controls.speedzplus = 0.0;
            break;
        case 40:
            //controls.translacijaX = 0.0;
            break;
    }
}