/**
 * Seminario GPC #2. Forma Básica.
 * Dibujar formas básicas y un modelo importado.
 * Muestra el bucle típico de inicialización, escena y render.
 * 
 * @requires three.min_r96.js, coordinates.js, orbitControls.js, dat.gui.js, tween.min.js, stats.min.js
 * Autor: David Villanova Aparisi
 * Fecha: 23-09-2020
 */

//Variables de consenso
// Motor, escena y cámara
var renderer, scene, camera;

//Otras globales
var robot, angulo = 0;
var base, brazo, antebrazo, pinzas, pinza_izq, pinza_der;
var cameraControls;
var geopinza;
//Camara cenital
var l = -100;
var r = 100;
var b = -100;
var t = 100;
var planta;

// Monitor de recursos
var stats;
// Global GUI
var effectController;

//Acciones
init();
loadScene();
setupKeyControls();
setupGui();
render();


function setupKeyControls() {
   document.onkeydown = function(e) {
     switch (e.keyCode) {
       //Flecha izq
       case 37:
       robot.position.z += 1;
       planta.position.z += 1;
       break;
       //Flecha arr
       case 38:
       robot.position.x -= 1;
       planta.position.x -= 1;
       break;
       //Flecha der
       case 39:
       robot.position.z -= 1;
       planta.position.z -= 1;
       break;
       //Flecha abj
       case 40:
       robot.position.x += 1;
       planta.position.x += 1;
       break;
     }
   };
 }


function setupGui() {
   effectController = {
      giroBase: 0,
      giroBrazo: 0,
      giroAntebrazoY: 0,
      giroAntebrazoZ: 0,
      giroPinza: 0,
      aperturaPinza: 0
   };

   var gui = new dat.GUI()
   var h = gui.addFolder("Control Robot");
   var sensorBase = h.add(effectController, "giroBase",-180,180,1).name("Giro Base");
   var sensorBrazo = h.add(effectController, "giroBrazo", -45,45,1).name("Giro Brazo");
   var sensorAntebrazoY = h.add(effectController,"giroAntebrazoY",-180,180,1).name("Giro Antebrazo Y");
   var sensorAntebrazoZ = h.add(effectController,"giroAntebrazoZ",-90,90,1).name("Giro Antebrazo Z");
   var sensorPinza = h.add(effectController,"giroPinza",-40,220,1).name("Giro Pinza");
   var sensorAperturaPinza = h.add(effectController,"aperturaPinza",0,15,0.5).name("Apertura Pinza")

   //Callbacks
   sensorBase.onChange(function(giro) {
      base.rotation.y = giro * Math.PI / 180;
   });
   sensorBrazo.onChange(function(giro) {
      brazo.rotation.z = giro * Math.PI / 180;
   });
   sensorAntebrazoY.onChange(function(giro) {
      antebrazo.rotation.y = giro * Math.PI / 180;
   });
   sensorAntebrazoZ.onChange(function(giro) {
      antebrazo.rotation.z = giro * Math.PI / 180;
   });
   sensorPinza.onChange(function(giro) {
      pinzas.rotation.z = giro * Math.PI / 180;
      pinzas.position.x = Math.cos(pinzas.rotation.z) * 12;
      pinzas.position.z = Math.sin(pinzas.rotation.z) * 12;
   });
   sensorAperturaPinza.onChange(function(desp) {
      pinza_der.position.z = 4 + desp / 2;
      pinza_izq.position.z = 0 - desp / 2;
   });

}

function setCameras(ar) {
   var origen = new THREE.Vector3(0,0,0);

   //Camara perspectiva
   // Instanciar cámara (fovy, ar, near, far)
   camera = new THREE.PerspectiveCamera(50, ar, 0.1, 2000);
   //Situar la cámara
   camera.position.set(175, 250, 175);
   //Dirección en la que mira la cámara
   camera.lookAt( new THREE.Vector3(0,125,0));

   //CAMARA PLANTA
  /*if(ar > 1) {
      planta = new THREE.OrthographicCamera(l*ar, r*ar, t, b, -20, 400);
   } else {
      planta = new THREE.OrthographicCamera(l,r,t/ar,b/ar,-20,400);
   }*/
   planta = new THREE.OrthographicCamera(l,r,t,b,-20,400);

   planta.position.set(0,300,0);
   planta.lookAt(origen);
   planta.up = new THREE.Vector3(0,0,-1);
   planta.updateProjectionMatrix();

   scene.add(camera);
   scene.add(planta)
}

function init() {
   //Configurar el motor de render y el canvas
   renderer = new THREE.WebGLRenderer();
   //Tomar el tamaño máximo posible
   renderer.setSize(window.innerWidth, window.innerHeight);
   //Dar color de borrado al renderer (En RGB hexadecimal)
   renderer.setClearColor(new THREE.Color(0xFFFFFF));
   //Activar el calculo de sombras
   renderer.shadowMap.enabled = true;
   //No auto clear para poder tener dos cámaras superpuestas
   renderer.autoClear = false
   //Añadir un canvas al container
   document.getElementById("container").appendChild(renderer.domElement);
   
   // Escena
   scene = new THREE.Scene();

   // Camara
   var ar = window.innerWidth / window.innerHeight;
   setCameras(ar);

   //Controlador de camara
   cameraControls = new THREE.OrbitControls( camera, renderer.domElement);
   //Punto de interes sobre el que se va a orbitar
   cameraControls.target.set(0,0,0);
   //Que no se puedan utilizar las teclas
   cameraControls.noKeys = true;

   //Luces
   //Luz ambiental (color, intensidad)
   var luzAmbiente = new THREE.AmbientLight(0xFFFFFF,0.1);
   scene.add(luzAmbiente);

   //Luz puntual (color, intensidad)
   var luzPuntual = new THREE.PointLight(0xBBBB00,0.4);
   luzPuntual.position.set(-400, 200, -400);
   scene.add(luzPuntual);

   //luz focal (color, intensidad)
   var luzFocal = new THREE.SpotLight(0xFFFFFF, 0.8, );
   //Posición
   luzFocal.position.set( -200, 400, 0);
   //Dirección
   luzFocal.target.position.set(0,0,0);
   //Angulo cutoff en radianes
   luzFocal.angle = Math.PI / 5; 
   //Penumbra hace antialisaing  
   luzFocal.penumbra = 0.6;
   luzFocal.castShadow = true;
   //Arreglar problema sombras chungas
   luzFocal.shadow.camera.near = 0.1;
   luzFocal.shadow.camera.far = 1000;
   luzFocal.shadow.camera.fov = 36;
   scene.add(luzFocal);

   //Captura de eventos --> Tolerancia a resize
   window.addEventListener('resize',updateAspectRatio);
}

function updateAspectRatio() {
   //Ajustar el tamaño del canvas tras redimensionado de la ventana
   renderer.setSize(window.innerWidth, window.innerHeight);

   //Razon de aspecto
   var ar = window.innerWidth / window.innerHeight;

   //Camara perspectiva
   camera.aspect = ar;

   //Que no haga wide Putin meme
   camera.updateProjectionMatrix();

   //Ajustar caja de la cámara cenital (es necesario?)
   /*if (ar > 1) {
      planta.left = l * ar;
      planta.right = r * ar;
      planta.bottom = b;
      planta.top = t;
   } else {
      planta.top = t / ar;
      planta.bottom = b / ar;
      planta.left = l;
      planta.right = r;
   }
   planta.updateProjectionMatrix();*/
}

function loadScene() {
   //Construir el grafo de escena

   //Texturas
   var path = "images/";
   //Textura de suelo --> No wrap
   var texturaSuelo = new THREE.TextureLoader().load(path+'pisometalico_1024.jpg'); 
   //texturaSuelo.magFilter = THREE.LinearFilter;
   //texturaSuelo.minFilter = THREE.LinearFilter;
   //Repetir textura
   texturaSuelo.repeat.set(2,2);
   texturaSuelo.wrapS = texturaSuelo.wrapT = THREE.MirroredRepeatWrapping;
   //Textura madera (permitir wrap?)
   var texturaMadera = new THREE.TextureLoader().load(path+'wood512.jpg');
   texturaMadera.magFilter = THREE.LinearFilter;
   texturaMadera.minFilter = THREE.LinearFilter;
   texturaMadera.wrapS = texturaMadera.wrapT = THREE.MirroredRepeatWrapping;
   //Textura metal
   var texturaMetal = new THREE.TextureLoader().load(path+'metal_128x128.jpg');
   texturaMetal.magFilter = THREE.LinearFilter;
   texturaMetal.minFilter = THREE.LinearFilter;
   texturaMetal.repeat.set(1,1);
   texturaMetal.wrapS = texturaMetal.wrapT = THREE.RepeatWrapping;

   //Mapa entorno
   var paredes = [path + 'posx.jpg', path + 'negx.jpg',
                  path + 'posy.jpg', path + 'negy.jpg',
                  path + 'posz.jpg', path + 'negz.jpg',];
   var mapaEntorno = new THREE.CubeTextureLoader().load(paredes);

   //Materiales
   //Materiales antiguos --> Sin sombras
   var material = new THREE.MeshBasicMaterial({color: 'red',wireframe: true});
   var material_solido = new THREE.MeshBasicMaterial({color: 'blue',wireframe: false});
   
   //Materiales nuevos --> Tratamiento de luces y texturas
   //Suelo sin brillos
   var matSuelo = new THREE.MeshLambertMaterial({color: 'white', map: texturaSuelo});
   //Madera sin brillos
   var matMaderaSB = new THREE.MeshLambertMaterial({color: 'white', map: texturaMadera});
   //Metal con brillos
   var matMetalCB = new THREE.MeshPhongMaterial({color: 'gray',
                                                specular:'white',
                                                shininess: 30,
                                                map: texturaMetal});
   //Metal sin brillos --> Oxidado?
   var matMetalSB = new THREE.MeshLambertMaterial({color: 'brown', map: texturaMetal});
   //Material pinzas
   var matPinzas = new THREE.MeshLambertMaterial({color: 'white',
                                                wireframe: false});
   //Material rotula
   var matRotula = new THREE.MeshPhongMaterial({color: 'white',
                                                specular:'white',
                                                shininess: 60,
                                                envMap: mapaEntorno});

   //Geometría pinzas
   geopinza = new THREE.Geometry();
   //Añadir vértices componen caras
   geopinza.vertices.push(
   new THREE.Vector3(0,0,0),
   new THREE.Vector3(19,0,0),
   new THREE.Vector3(19,20,0),
   new THREE.Vector3(0,20,0),
   new THREE.Vector3(0,20,-4),
   new THREE.Vector3(19,20,-4),
   new THREE.Vector3(0,0,-4),
   new THREE.Vector3(19,0,-4),
   new THREE.Vector3(38,4,0),
   new THREE.Vector3(38,4,-4),
   new THREE.Vector3(38,16,-4),
   new THREE.Vector3(38,16,0)
   );
   //Añadir caras triangulares, 1 vector3 por cara
   geopinza.faces.push(
   new THREE.Face3(0,1,2),
   new THREE.Face3(0,2,3),
   new THREE.Face3(3,2,4),
   new THREE.Face3(2,5,4),
   new THREE.Face3(1,7,2),
   new THREE.Face3(7,5,2),
   new THREE.Face3(6,7,0),
   new THREE.Face3(7,1,0),
   new THREE.Face3(6,0,3),
   new THREE.Face3(6,3,4),
   new THREE.Face3(4,5,6),
   new THREE.Face3(5,7,6),
   new THREE.Face3(1,8,11),
   new THREE.Face3(1,11,2),
   new THREE.Face3(2,11,5),
   new THREE.Face3(11,10,5),
   new THREE.Face3(8,9,10),
   new THREE.Face3(8,10,11),
   new THREE.Face3(7,9,8),
   new THREE.Face3(7,8,1),
   new THREE.Face3(7,5,9),
   new THREE.Face3(5,10,9)
   );

   geopinza.computeFaceNormals();
   
   //Geometrias
   var geosuelo = new THREE.PlaneGeometry(1000,1000,100,100);
   var geobase = new THREE.CylinderGeometry(50,50,15,32);
   var geoeje = new THREE.BoxGeometry(18,120,12);
   var geoesparrago = new THREE.CylinderGeometry(20,20,18,32);
   var georotula = new THREE.SphereGeometry(20,32,32);
   var geodisco = new THREE.CylinderGeometry(22,22,6,32);
   var geonervio = new THREE.BoxGeometry(4,80,4)
   var geomano = new THREE.CylinderGeometry(15,15,40,32);
   

   //Objetos
   var suelo = new THREE.Mesh(geosuelo, matSuelo);
   //Suelo recibe sombras
   suelo.receiveShadow = true;
   suelo.rotation.x = -Math.PI / 2;
   robot = new THREE.Object3D();
   //Habilitar emisión de sombras arrojadas y recepción
   //robot.receiveShadow = true;
   //robot.castShadow = true;
   robot.position.y = 10
   base = new THREE.Mesh(geobase,matMetalSB);
   base.receiveShadow = true;
   base.castShadow = true;
   brazo = new THREE.Object3D();
   var eje = new THREE.Mesh(geoeje,matMetalCB);
   eje.receiveShadow = true;
   eje.castShadow = true;
   eje.position.y = 60;
   var esparrago = new THREE.Mesh(geoesparrago,matMaderaSB);
   esparrago.receiveShadow = true;
   esparrago.castShadow = true;
   esparrago.rotation.x = Math.PI / 2;
   var rotula = new THREE.Mesh(georotula,matRotula);
   rotula.receiveShadow = true;
   rotula.castShadow = true;
   rotula.position.y = 120;
   antebrazo = new THREE.Object3D();
   antebrazo.position.y = 120;
   var disco = new THREE.Mesh(geodisco,matMaderaSB);
   disco.receiveShadow = true;
   disco.castShadow = true;
   var nervio1 = new THREE.Mesh(geonervio,matMetalCB);
   nervio1.receiveShadow = true;
   nervio1.castShadow = true;
   nervio1.position.y = 40;
   nervio1.position.x = 12;
   nervio1.position.z = 12;
   var nervio2 = new THREE.Mesh(geonervio,matMetalCB);
   nervio2.receiveShadow = true;
   nervio2.castShadow = true;
   nervio2.position.y = 40;
   nervio2.position.x = -12;
   nervio2.position.z = 12;
   var nervio3 = new THREE.Mesh(geonervio,matMetalCB);
   nervio3.receiveShadow = true;
   nervio3.castShadow = true;
   nervio3.position.y = 40;
   nervio3.position.x = -12;
   nervio3.position.z = -12;
   var nervio4 = new THREE.Mesh(geonervio,matMetalCB);
   nervio4.receiveShadow = true;
   nervio4.castShadow = true;
   nervio4.position.y = 40;
   nervio4.position.x = 12;
   nervio4.position.z = -12;
   var mano = new THREE.Mesh(geomano,matMetalSB);
   mano.receiveShadow = true;
   mano.castShadow = true;
   mano.position.y = 80;
   mano.rotation.x = Math.PI/2;
   pinzas = new THREE.Object3D();
   pinzas.position.x = 12;
   pinzas.rotation.x = Math.PI / 2;
   pinza_izq = new THREE.Mesh(geopinza, matPinzas);
   pinza_izq.castShadow = true;
   pinza_izq.receiveShadow = true;
   pinza_izq.position.z = 14;
   pinza_izq.position.y = -10;
   pinza_der = new THREE.Mesh(geopinza,matPinzas);
   pinza_der.castShadow = true;
   pinza_der.receiveShadow = true;
   pinza_der.position.z = -10;
   pinza_der.position.y = -10;
   

   //Organizacion de escena
   scene.add(suelo);
   pinzas.add(pinza_izq);
   pinzas.add(pinza_der);

   mano.add(pinzas);

   antebrazo.add(disco);
   antebrazo.add(nervio1);
   antebrazo.add(nervio2);
   antebrazo.add(nervio3);
   antebrazo.add(nervio4);
   antebrazo.add(mano);

   brazo.add(eje);
   brazo.add(esparrago);
   brazo.add(rotula);
   brazo.add(antebrazo);
   
   base.add(brazo);
   
   robot.add(base);
   
   scene.add(robot);
   
   //Habitación
   var shader = THREE.ShaderLib.cube;
   shader.uniforms.tCube.value = mapaEntorno;

   var matParedes = new THREE.ShaderMaterial({
      fragmentShader: shader.fragmentShader,
      vertexShader: shader.vertexShader,
      uniforms: shader.uniforms,
      depthWrite: false,
      side: THREE.BackSide
   });

   var habitacion = new THREE.Mesh(new THREE.CubeGeometry(1000,1000,1000), matParedes);
   habitacion.position.y = 0;
   scene.add(habitacion);

   //scene.add(new THREE.AxisHelper(3));
}

function render()
{
   //Siguiente frame
   requestAnimationFrame( render );
   
   //Borrar anterior frame
   renderer.clear();

   //Renderizar el frame
   //Camara perspectiva
   renderer.setViewport(0,0,window.innerWidth,window.innerHeight);
   renderer.render( scene, camera );
   
   //Camara cenital
   var plantaViewSize;
   if(window.innerWidth < window.innerHeight) {
      plantaViewSize = window.innerWidth / 4;
   } else {
      plantaViewSize = window.innerHeight / 4;
   }
   renderer.setViewport(0,0,plantaViewSize,plantaViewSize);
   renderer.render(scene,planta);
}