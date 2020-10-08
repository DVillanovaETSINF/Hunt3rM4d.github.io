/**
 * Trabajo final de GPC. Gravity Maze.
 * Recreación en web del juego de la pelota en un laberinto.
 * Basado en físicas..
 * 
 * @requires three.min_r96.js, coordinates.js, orbitControls.js, dat.gui.js, tween.min.js, stats.min.js
 * Autor: David Villanova Aparisi
 * Fecha: 08-10-2020
 */

//Variables de consenso
// Motor, escena y cámara
var renderer, scene, camera;

//Otras globales
var cameraControls;

// Monitor de recursos
var stats;
// Global GUI
var effectController;

//Camara cenital
var l = -100;
var r = 100;
var b = -100;
var t = 100;
var planta;

//Angulo del suelo
var anguloZ = 0;
var anguloX = 0;
//Velocidad de giro (30º/sg)
var velocGiro = 0.1745329*3;
//Teclas de movimiento
var izq_pres, der_pres, arr_pres, abj_pres;

//Objetos globales
var suelo;

//Físicas
//Mundo físico y reloj
var world, reloj;

//Objetos físicos
var laberinto, esfera;

//Control tiempo
var antes = Date.now();

//Acciones
initPhysicWorld();
init();
loadScene();
setupKeyControls();
setupGui();
loadWorld();
render();

//Construccion esfera
function esfera( radio, posicion, material ){
	var masa = 1;
	this.body = new CANNON.Body( {mass: masa, material: material} );
	this.body.addShape( new CANNON.Sphere( radio ) );
	this.body.position.copy( posicion );
	this.visual = new THREE.Mesh( new THREE.SphereGeometry( radio ), 
		          new THREE.MeshBasicMaterial( {wireframe: true, color: 'blue'} ) );
	this.visual.position.copy( this.body.position );
}

/**
 * Iniciar mundo físico con suelo y pelota
 */
function initPhysicWorld() {
   //Reglas del mundo
   world = new CANNON.World();
   world.gravity.set(0,-9.8,0);
   world.solver.iterations = 10;

   //Materiales
   var matMadera = new CANNON.Material("matMadera");
   var matEsfera = new CANNON.Material("matEsfera");
   world.addMaterial(matMadera);
   world.addMaterial(matEsfera);

   var esferaMaderaContactMaterial = new CANNON.ContactMaterial(matMadera,matEsfera, 
                                                               {friction: 0.2,
                                                                restitution: 0.7});
   world.addContactMaterial(esferaMaderaContactMaterial);

   //Suelo
   laberinto = new CANNON.Body({mass: 0, material: matMadera});
   var groundShape = new CANNON.Box(new CANNON.Vec3(50,5,50));
   laberinto.addShape(groundShape, new CANNON.Vec3(0,0,0));

   world.addBody(laberinto)
}

function setupKeyControls() {
   izq_pres = false;
   der_pres = false;
   arr_pres = false;
   abj_pres = false;
   document.onkeydown = function(e) {
     switch (e.keyCode) {
         //Flecha izq
         case 37:
         izq_pres = true;
         console.log("Izq_pres",izq_pres);
         break;
         //Flecha arr
         case 38:
         arr_pres = true;
         console.log("Arr_pres",arr_pres);
         break;
         //Flecha der
         case 39:
         der_pres = true;      
         console.log("Der_pres",der_pres);
         break;
         //Flecha abj
         case 40:
         abj_pres = true;
         console.log("Abj_pres",abj_pres);
         break;
     }
   };

   document.onkeyup = function(e) {
      switch (e.keyCode) {
          //Flecha izq
          case 37:
          izq_pres = false;
          console.log("Izq_pres",izq_pres);
          break;
          //Flecha arr
          case 38:
          arr_pres = false;
          console.log("Arr_pres",arr_pres);
          break;
          //Flecha der
          case 39:
          der_pres = false;     
          console.log("Der_pres",der_pres);  
          break;
          //Flecha abj
          case 40:
          abj_pres = false;
          console.log("Abj_pres",abj_pres);
          break;
      }
    };
 }

//GUI con botón de reinicio
function setupGui() {
   
}

function setCameras(ar) {
   var origen = new THREE.Vector3(0,0,0);

   //Camara perspectiva
   // Instanciar cámara (fovy, ar, near, far)
   camera = new THREE.PerspectiveCamera(50, ar, 0.1, 1000);
   //Situar la cámara
   camera.position.set(150, 250, 0);
   //Dirección en la que mira la cámara
   camera.lookAt( new THREE.Vector3(0,0,0));

   //CAMARA PLANTA
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
   //No auto clear para poder tener dos cámaras superpuestas
   renderer.autoClear = false
   //Añadir un canvas al container
   document.getElementById("container").appendChild(renderer.domElement);
   
   // Escena
   scene = new THREE.Scene();

   // Reloj
	reloj = new THREE.Clock();
	reloj.start();

   // Camara
   var ar = window.innerWidth / window.innerHeight;
   setCameras(ar);

   //Controlador de camara
   cameraControls = new THREE.OrbitControls( camera, renderer.domElement);
   //Punto de interes sobre el que se va a orbitar
   cameraControls.target.set(0,0,0);
   //Que no se puedan utilizar las teclas
   cameraControls.noKeys = true;

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

}

function update() {
   //var ahora = Date.now();
   //var deltaSg = (ahora-antes)/1000;
   //antes = ahora;

   var deltaSg = reloj.getDelta();
   world.step(deltaSg);
   esfera.visual.position.copy(esfera.body.position);
   esfera.visual.quaternion.copy(esfera.body.quaternion);

   //Incremento de los ángulos en función del tiempo (Por testear)
   if(izq_pres) anguloX += deltaSg*velocGiro;
   if(der_pres) anguloX -= deltaSg*velocGiro;
   if(abj_pres) anguloZ -= deltaSg*velocGiro;
   if(arr_pres) anguloZ += deltaSg*velocGiro;

   //Límite de giro de 45º del plano
   if(anguloX < (-Math.PI)/4) anguloX = -Math.PI/4;
   if(anguloX > Math.PI/4) anguloX = Math.PI/4;
   if(anguloZ < (-Math.PI)/4) anguloZ = -Math.PI/4;
   if(anguloZ > Math.PI/4) anguloZ = Math.PI/4;

   //Antiguo act. del suelo
   suelo.rotation.y = anguloZ;
   suelo.rotation.x = (Math.PI / 2) + anguloX;
   
   laberinto.quaternion.setFromEuler(anguloX,0,anguloZ)
}

//Antigua carga de escena (solo objetos visuales)
function loadScene() {
   //Construir el grafo de escena
   //Materiales
   var material = new THREE.MeshBasicMaterial({color: 'red',wireframe: true});

   //Geometria del suelo
   var geosuelo = new THREE.PlaneGeometry(1000,1000,10,10);
   
   //Objetos
   suelo = new THREE.Mesh(geosuelo, material);
   suelo.rotation.x = Math.PI / 2;

   scene.add(suelo);
   scene.add(new THREE.AxisHelper(3));
}

/**
 * Cargar objetos en mundo físico y visual
 */
function loadWorld()
{
   //Generar la esfera
   var materialEsfera;
	for( i=0; i<world.materials.length; i++){
		if( world.materials[i].name === "sphereMaterial" ) materialEsfera = world.materials[i];
   }
   
   //Radio, posicion, material
   esfera = new esfera( 1, new CANNON.Vec3( 0, 5, 0 ), materialEsfera );
   world.addBody( esfera.body );
	scene.add( esfera.visual );
}

function render()
{
   //Siguiente frame
   requestAnimationFrame( render );
   
   //Actualización
   update();

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