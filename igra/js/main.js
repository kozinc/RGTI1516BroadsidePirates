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

    // Ustvarimo kamero.
    ///////////////////////////////////////////////////////////////////////////////////////
    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
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

    // Ustvarimo osi in jih dodamo v sceno.
    ///////////////////////////////////////////////////////////////////////////////////////
    var axes = new THREE.AxisHelper(5);
    scene.add(axes);

    // Neka modra ravnina
    ///////////////////////////////////////////////////////////////////////////////////////
    /*var planeGeometry = new THREE.PlaneGeometry(50, 40); // Podamo velikost ravnine (x in y koordinate).
    // Material MeshBasicMaterial se ne odziva na svetlobo!
    var planeMaterial = new THREE.MeshLambertMaterial({color: 0x0099FF});
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true; // Vklopino prejemanje/projekcijo senc na to ravnino.

    // Zarotiramo ravnino po X-osi.
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.x = 15;
    plane.position.y = 0;
    plane.position.z = 0;*/

    // V sceno dodamo ravnino.
    //scene.add(plane);

    // Texture za tla (namesto modre ravnine)
    ///////////////////////////////////////////////////////////////////////////////////////
    var floorTexture = new THREE.ImageUtils.loadTexture( 'textures/water.jpg' );
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
    floorTexture.repeat.set( 25, 25 );
    // DoubleSide: render texture on both sides of mesh
    var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
    var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -0.5 * Math.PI;
    floor.position.x = 15;
    floor.position.y = 0;
    floor.position.z = 0;
    scene.add(floor);

    // Dodamo ladjo - "ladja"
    ///////////////////////////////////////////////////////////////////////////////////////

    var cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
    var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xffff00});
    var ladja = new THREE.Mesh(cubeGeometry, cubeMaterial);
    ladja.castShadow = true; // Vklopimo metanje senc kocke. Pac da kocka mece sence.

    ladja.position.x = -4;
    ladja.position.y = 2;
    ladja.position.z = 0;

    scene.add(ladja);

    // Ambientna svetloba.
    ///////////////////////////////////////////////////////////////////////////////////////
    // add subtle ambient lighting
    var ambientLight = new THREE.AmbientLight(0x0c0c0c);
    scene.add(ambientLight);

    // Vir svetlobe.
    ///////////////////////////////////////////////////////////////////////////////////////
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-40, 60, -10); // Lokacija izvira
    spotLight.castShadow = true; // Vklopimo sence. Tu povemo, ali naj ta vir svetlobe naj povzroca sence.
    scene.add(spotLight);

    // Skybox
    ///////////////////////////////////////////////////////////////////////////////////////
    var imagePrefix = "textures/skybox_";
    var directions  = ["front", "back", "up", "down", "left", "right"];
    var imageSuffix = ".jpg";
    var skyGeometry = new THREE.CubeGeometry( 500, 500, 500 );   
    
    var materialArray = [];
    for (var i = 0; i < 6; i++)
        materialArray.push( new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
            side: THREE.BackSide
        }));
    var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
    var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
    scene.add( skyBox );

    // Poiscemo HTML objekt.
    ///////////////////////////////////////////////////////////////////////////////////////
    document.getElementById("WebGL-output").appendChild(renderer.domElement);

    // GUI kontrole.
    ///////////////////////////////////////////////////////////////////////////////////////
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
                cube2.position.x = -30 + Math.round((Math.random() * floorGeometry.parameters.width));
                cube2.position.y = Math.round((Math.random() * 5));
                cube2.position.z = -20 + Math.round((Math.random() * floorGeometry.parameters.height));

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
            if (e instanceof THREE.Mesh && e != ladja && e != floor && e != skyBox) {

                e.rotation.x += controls.rotationSpeed;
                e.rotation.y += controls.rotationSpeed;
                e.rotation.z += controls.rotationSpeed;
            }
        });
        // Kontrole - premikanje ladje.
        ladja.translateX(controls.translacijaX);
        //cube.translateX(-controls.translacijaX);
        
        // Zavrti kocko po Y-osi, ce smo jo s smernimi tipkami zavrteli.
        ladja.rotation.y += controls.rotationY;
        //console.log(controls.rotationY) // izpisuj "hitrost" vrtenja ladje.

        transformCamera();

        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

    // Kamera naj sledi ladji.
    function transformCamera() {
        if (cameraMode == 1) {
            camera.position.x = -30;
            camera.position.y = 40;
            camera.position.z = 30;
            camera.lookAt(ladja.position);
        } else if (cameraMode == 2){
            var relativeCameraOffset = new THREE.Vector3(-25,8,0);
            var cameraOffset = relativeCameraOffset.applyMatrix4( ladja.matrixWorld );

            camera.position.x = cameraOffset.x;
            camera.position.y = cameraOffset.y;
            camera.position.z = cameraOffset.z;
            camera.lookAt(ladja.position);
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

// Ko spustimo tipke.
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