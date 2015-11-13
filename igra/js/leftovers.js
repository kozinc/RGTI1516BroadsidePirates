// preostala koda, ki ni v uporabi, ampak morda pride prav

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

/*var imagePrefix = "textures/skybox_";
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
 scene.add(skyBox);*/

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