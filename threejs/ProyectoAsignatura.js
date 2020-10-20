/**
 * Trabajo final de GPC. Gravity Maze.
 * Recreación en web del juego de la pelota en un laberinto.
 * Basado en físicas..
 * 
 * @requires three.min_r96.js, coordinates.js, orbitControls.js, dat.gui.js, tween.min.js, stats.min.js
 * Autor: David Villanova Aparisi
 * Fecha inicio: 08-10-2020
 */

// Motor, escena y cámara
var renderer, scene, camera;
//Control camaras
var focusTopCamera = false;
//Camara cenital
var l = -50;
var r = 50;
var b = -50;
var t = 50;
var planta;
//Otras globales
var cameraControls;

// Global GUI
var effectController;

//Angulo del laberinto
var anguloZ = 0;
var anguloX = 0;
//Velocidad de giro (10º/sg)
var velocGiro = 0.1745329;
//Booleanos pulsacion teclas de movimiento
var izq_pres, der_pres, arr_pres, abj_pres;

//Físicas
//Mundo físico y reloj
var world, reloj;

//Objetos físicos
var laberinto, esfera, planoInvis;

//Control tiempo
var antes = Date.now();

//Acciones
initPhysicWorld();
init();
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
 * Función para crear el laberinto (un único CANNON.Body)
 * junto con todas las cajas especificadas.
 * 
 * @param {*} dim: vector de dimensión de los cuerpos 
 * @param {*} off: vector de offset de los cuerpos
 * @param {*} mat; vector de materiales visuales
 * @param {*} matFis; material físico
 */
function laberinto(dim, off, mat, matFis) {
   var masa = 0;
   this.body = new CANNON.Body( {mass: masa, material: matFis} );
   this.body.position = new CANNON.Vec3(0,0,0);

   var i;
   this.visual = new THREE.Object3D();
   this.visual.position.copy(this.body.position);

   //Añadir shapes
   for(i = 0; i < dim.length; i++) {
      //Longitud lados caja
      var dx = Number(dim[i].x);
      var dy = Number(dim[i].y);
      var dz = Number(dim[i].z);
      
      //Corrección de offset
      var ajusteX = dz <= 1 ? dx / 2 : 0;
      var ajusteZ = dx <= 1 ? dz / 2 : 0;

      var off_i = off[i];
      off_i = new CANNON.Vec3(off[i].x + ajusteX, off[i].y, off[i].z + ajusteZ);


      //Añadir shape
      var dim_fis_i = new CANNON.Vec3(dim[i].x/2, dim[i].y/2, dim[i].z/2);
      this.body.addShape( new CANNON.Box(dim_fis_i), off_i);

      //Crear caja y ajustar posición visual
      var vis_i = new THREE.Mesh( new THREE.BoxGeometry(dx,dy,dz), mat[i]);
      vis_i.position.x = Number(off_i.x);
      vis_i.position.y = Number(off_i.y);
      vis_i.position.z = Number(off_i.z);

      //Añadir la caja a la visual
      this.visual.add(vis_i);
   }
}

//Creación del plano invisible para evitar que vuele la pelota
function planoInvis(dim,pos,mat,matFis) {
   var masa = 0;
   this.body = new CANNON.Body({mass: masa, material: matFis});
   var dim_fis = new CANNON.Vec3(dim.x/2, dim.y/2, dim.z/2);
   this.body.addShape( new CANNON.Box(dim_fis));
   this.body.position.copy(pos);
   var x = Number(dim.x);
   var y = Number(dim.y);
   var z = Number(dim.z);
   this.visual = new THREE.Mesh( new THREE.BoxGeometry(x,y,z), mat);

   //PROBLEMA: NO SE ESTÁ PONIENDO LA POSICIÓN DEL PLANO 
   this.visual.position.copy(this.body.position);
}

/**
 * Iniciar mundo físico 
 */
function initPhysicWorld() {
   //Reglas del mundo
   world = new CANNON.World();
   world.gravity.set(0,-9.8,0);
   world.solver.iterations = 10;

   //Materiales
   var matMadera = new CANNON.Material("matMadera");
   var matEsfera = new CANNON.Material("matEsfera");
   var matInvis = new CANNON.Material("matInvis");
   world.addMaterial(matMadera);
   world.addMaterial(matEsfera);
   world.addMaterial(matInvis);

   var esferaMaderaContactMaterial = new CANNON.ContactMaterial(matMadera,matEsfera, 
                                                               {friction: 0.02,
                                                                restitution: 0});
   var esferaMaderaInvisContactMaterial = new CANNON.ContactMaterial(matInvis,matEsfera,
                                                                     {friction: 0,
                                                                      restitution: 1});
   world.addContactMaterial(esferaMaderaContactMaterial);
   world.addContactMaterial(esferaMaderaInvisContactMaterial);

}

//Actualizar parámetros de las cámaras
function updateCameras() {
   
   var ar = window.innerWidth / window.innerHeight;
   if(focusTopCamera){
      //Ajustar frustum camara cenital
      if (ar > 1) {
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
      planta.updateProjectionMatrix();

      //Razon de aspecto cámara perspectiva a 1
      camera.aspect = 1;
      camera.updateProjectionMatrix();
   } else {
      //Volver a fijar frustum cuadrado cámara cenital
      planta.top = t;
      planta.bottom = b;
      planta.left = l;
      planta.right = r;
      planta.updateProjectionMatrix();

      //Razon de aspecto cámara perspectiva actualizada
      camera.aspect = ar;
      camera.updateProjectionMatrix();
   }
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
         break;
         //Flecha arr
         case 38:
         arr_pres = true;
         break;
         //Flecha der
         case 39:
         der_pres = true;      
         break;
         //Flecha abj
         case 40:
         abj_pres = true;
         break;
         //Tecla c
         case 67:
         focusTopCamera = !focusTopCamera
         updateCameras();
         break;
         //Tecla r
         case 83:
         reiniciar();
         break;
     }
   };

   document.onkeyup = function(e) {
      switch (e.keyCode) {
          //Flecha izq
          case 37:
          izq_pres = false;
          break;
          //Flecha arr
          case 38:
          arr_pres = false;
          break;
          //Flecha der
          case 39:
          der_pres = false;     
          break;
          //Flecha abj
          case 40:
          abj_pres = false;
          break;
      }
    };
 }

function reiniciar() {
   //Fijar angulo del laberinto a 0,0
   anguloZ = anguloX = 0;
   update();

   //Eliminar todo movimiento de la esfera y devolverla a la pos. inic.
   esfera.body.position = new CANNON.Vec3(-23, 4.1, -23);
   esfera.body.velocity = new CANNON.Vec3(0,0,0);
   esfera.body.angularVelocity = new CANNON.Vec3(0,0,0);
   esfera.body.force = new CANNON.Vec3(0,0,0);
   esfera.body.inertia = new CANNON.Vec3(0,0,0);
   update();

   //Volver a colocar cámaras en su sitio
   camera.position.set(0,150,50);
   camera.lookAt(new THREE.Vector3(0,0,0));

   //Reiniciar cameraControls
   cameraControls.target.set(0,0,0);
}

//GUI con botón de reinicio, boton alternar cámaras y slider gravedad
function setupGui() {
   //Controles
   effectController = {
      g: -9.8,
      altCam: function() {
         focusTopCamera = !focusTopCamera;
         updateCameras();
      },
      reiniciar: function() {
         reiniciar();
      }
   }

   //Interfaz
   var gui = new dat.GUI();

   //Construcción menu
   var h = gui.addFolder("Configuración");
   var sensorGrav = h.add(effectController,"g", -20, -2, 0.1).name("Gravedad");
   h.add(effectController, "altCam").name("Alternar vistas");

   gui.add(effectController,"reiniciar").name("Reiniciar");

   sensorGrav.onChange(function(grav) {
      world.gravity.set(0,grav,0);
   });
}

function setCameras(ar) {
   var origen = new THREE.Vector3(0,0,0);

   //Camara perspectiva
   // Instanciar cámara (fovy, ar, near, far)
   camera = new THREE.PerspectiveCamera(50, ar, 0.1, 1000);
   //Situar la cámara
   camera.position.set(0, 150, 50);
   //Dirección en la que mira la cámara
   camera.lookAt( new THREE.Vector3(0,0,0));

   //CAMARA PLANTA
   planta = new THREE.OrthographicCamera(l,r,t,b,-20,100);

   planta.position.set(0,30,0);
   planta.lookAt(origen);
   planta.up = new THREE.Vector3(0,0,1);
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
   //Actualizar info camaras
   updateCameras();
}

function update() {
   //var ahora = Date.now();
   //var deltaSg = (ahora-antes)/1000;
   //antes = ahora;

   var deltaSg = reloj.getDelta();
   
   //Incremento de los ángulos en función del tiempo (Por testear)
   if(izq_pres) anguloZ += deltaSg*velocGiro;
   if(der_pres) anguloZ -= deltaSg*velocGiro;
   if(abj_pres) anguloX += deltaSg*velocGiro;
   if(arr_pres) anguloX -= deltaSg*velocGiro;

   //Límite de giro de 45º del plano
   if(anguloX < (-Math.PI)/6) anguloX = -Math.PI/6;
   if(anguloX > Math.PI/6) anguloX = Math.PI/6;
   if(anguloZ < (-Math.PI)/6) anguloZ = -Math.PI/6;
   if(anguloZ > Math.PI/6) anguloZ = Math.PI/6;

   //Actualizacion obj. físicos
   esfera.visual.position.copy(esfera.body.position);
   esfera.visual.quaternion.copy(esfera.body.quaternion);

   laberinto.body.quaternion.setFromEuler(anguloX,0,anguloZ);
   laberinto.visual.position.copy(laberinto.body.position);
   laberinto.visual.quaternion.copy(laberinto.body.quaternion);

   planoInvis.body.quaternion.setFromEuler(anguloX,0,anguloZ);
   planoInvis.visual.position.copy(planoInvis.body.position);
   planoInvis.visual.quaternion.copy(planoInvis.body.quaternion);

   world.step(deltaSg);
}

/**
 * Cargar objetos en mundo físico y visual
 */
function loadWorld()
{
   //Materiales
   var matFis, matFisInvis, materialEsfera;
   for( i=0; i<world.materials.length; i++){
      if( world.materials[i].name === "matEsfera" ) materialEsfera = world.materials[i];
      if( world.materials[i].name === "matMadera" ) matFis = world.materials[i];
      if( world.materials[i].name === "matInvis" ) matFisInvis = world.materials[i];
   }
   
   //Radio, posicion, material
   esfera = new esfera( 1.5, new CANNON.Vec3( -23, 4.1, -23 ), materialEsfera );
   world.addBody( esfera.body );
   scene.add( esfera.visual );
   
   
   //Laberinto
   var matVisSuelo = new THREE.MeshBasicMaterial( {wireframe: false, color: 'green' } );
   var matVisPared = new THREE.MeshBasicMaterial( {wireframe: false, color: 'red'});
   var matInvis = new THREE.MeshBasicMaterial({opacity: 0, transparent: true});

   //laberinto = new caja( new CANNON.Vec3(50,5,50), new CANNON.Vec3(0,0,0), materialParedes);
   var dim = [
      new CANNON.Vec3(50,5,50),
      new CANNON.Vec3(30,5,1),
      new CANNON.Vec3(15,5,1),
      new CANNON.Vec3(1,5,5),
      new CANNON.Vec3(15,5,1),
      new CANNON.Vec3(15,5,1),
      new CANNON.Vec3(10,5,1),
      new CANNON.Vec3(1,5,5),
      new CANNON.Vec3(1,5,5),
      new CANNON.Vec3(5,5,1),
      new CANNON.Vec3(15,5,1),
      new CANNON.Vec3(20,5,1),
      new CANNON.Vec3(1,5,10),
      new CANNON.Vec3(1,5,5),
      new CANNON.Vec3(5,5,1),
      new CANNON.Vec3(25,5,1),
      new CANNON.Vec3(1,5,10),
      new CANNON.Vec3(1,5,5),
      new CANNON.Vec3(1,5,10),
      new CANNON.Vec3(30,5,1),
      new CANNON.Vec3(10,5,1),
      new CANNON.Vec3(15,5,1),
      new CANNON.Vec3(25,5,1),
      new CANNON.Vec3(1,5,20),
      new CANNON.Vec3(10,5,1),
      new CANNON.Vec3(20,5,1),
      new CANNON.Vec3(1,5,5),
      new CANNON.Vec3(1,5,5),
      new CANNON.Vec3(1,5,10),
      new CANNON.Vec3(5,5,1),
      new CANNON.Vec3(10,5,1),
      new CANNON.Vec3(5,5,1),
      new CANNON.Vec3(10,5,1),
      new CANNON.Vec3(1,5,10),
      new CANNON.Vec3(1,5,5),
      new CANNON.Vec3(15,5,1),
      new CANNON.Vec3(5,5,1),
      new CANNON.Vec3(5,5,1),
      new CANNON.Vec3(5,5,1),
      new CANNON.Vec3(1,5,10),
      new CANNON.Vec3(1,5,5),
      new CANNON.Vec3(1,5,10),
      new CANNON.Vec3(10,5,1),
      new CANNON.Vec3(1,5,5),
      new CANNON.Vec3(1,5,5),
      new CANNON.Vec3(1,5,5),
      new CANNON.Vec3(1,5,5),
      new CANNON.Vec3(10,5,1),
      new CANNON.Vec3(5,5,1),
      new CANNON.Vec3(5,5,1)      
   ];

   var off = [
      new CANNON.Vec3(0,0,0),
      new CANNON.Vec3(-25,5,-25),
      new CANNON.Vec3(10,5,-25),
      new CANNON.Vec3(-25,5,-25),
      new CANNON.Vec3(-25,5,-20),
      new CANNON.Vec3(-5,5,-20),
      new CANNON.Vec3(15,5,-20),
      new CANNON.Vec3(10,5,-20),
      new CANNON.Vec3(25,5,-20),
      new CANNON.Vec3(-25,5,-15),
      new CANNON.Vec3(-15,5,-15),
      new CANNON.Vec3(5,5,-15),
      new CANNON.Vec3(-25,5,-15),
      new CANNON.Vec3(-15,5,-15),
      new CANNON.Vec3(-20,5,-10),
      new CANNON.Vec3(-5,5,-10),
      new CANNON.Vec3(-10,5,-10),
      new CANNON.Vec3(10,5,-10),
      new CANNON.Vec3(25,5,-10),
      new CANNON.Vec3(-20,5,-5),
      new CANNON.Vec3(15,5,-5),
      new CANNON.Vec3(-25,5,0),
      new CANNON.Vec3(0,5,0),
      new CANNON.Vec3(-5,5,0),
      new CANNON.Vec3(-20,5,5),
      new CANNON.Vec3(-5,5,5),
      new CANNON.Vec3(-25,5,5),
      new CANNON.Vec3(-15,5,5),
      new CANNON.Vec3(0,5,5),
      new CANNON.Vec3(-25,5,10),
      new CANNON.Vec3(-15,5,10),
      new CANNON.Vec3(5,5,10),
      new CANNON.Vec3(15,5,10),
      new CANNON.Vec3(5,5,10),
      new CANNON.Vec3(25,5,10),
      new CANNON.Vec3(-20,5,15),
      new CANNON.Vec3(0,5,15),
      new CANNON.Vec3(10,5,15),
      new CANNON.Vec3(20,5,15),
      new CANNON.Vec3(-25,5,15),
      new CANNON.Vec3(10,5,15),
      new CANNON.Vec3(15,5,15),
      new CANNON.Vec3(-15,5,20),
      new CANNON.Vec3(-20,5,20),
      new CANNON.Vec3(0,5,20),
      new CANNON.Vec3(20,5,20),
      new CANNON.Vec3(25,5,20),
      new CANNON.Vec3(-15,5,25),
      new CANNON.Vec3(0,5,25),
      new CANNON.Vec3(20,5,25),      
   ];

   var mat = [
      matVisSuelo, matVisPared, matVisPared, matVisPared,
      matVisPared, matVisPared, matVisPared, matVisPared,
      matVisPared, matVisPared, matVisPared, matVisPared,
      matVisPared, matVisPared, matVisPared, matVisPared,
      matVisPared, matVisPared, matVisPared, matVisPared,
      matVisPared, matVisPared, matVisPared, matVisPared,
      matVisPared, matVisPared, matVisPared, matVisPared,
      matVisPared, matVisPared, matVisPared, matVisPared,
      matVisPared, matVisPared, matVisPared, matVisPared,
      matVisPared, matVisPared, matVisPared, matVisPared,
      matVisPared, matVisPared, matVisPared, matVisPared,
      matVisPared, matVisPared, matVisPared, matVisPared,
      matVisPared, matVisPared
   ];
   
   laberinto = new laberinto(dim, off, mat, matFis);
   planoInvis = new planoInvis(new CANNON.Vec3(50,0.5,50), new CANNON.Vec3(0,6.1,0), matInvis, matFisInvis);
   world.addBody(laberinto.body);
   world.addBody(planoInvis.body);
   scene.add(laberinto.visual);
   scene.add(planoInvis.visual);
   scene.add(THREE.AxisHelper(100,100,100))
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
   if(focusTopCamera) {      
     
      renderer.setViewport(0,0,window.innerWidth,window.innerHeight);
      renderer.render( scene, planta );

      var perspectiveViewSize;
      if(window.innerWidth < window.innerHeight) {
         perspectiveViewSize = window.innerWidth / 3;
      } else {
         perspectiveViewSize = window.innerHeight / 3;
      }

      renderer.setViewport(0,0,perspectiveViewSize,perspectiveViewSize);
      renderer.render(scene, camera);

   } else {
      

      renderer.setViewport(0,0,window.innerWidth,window.innerHeight);
      renderer.render( scene, camera );
   
      //Camara cenital
      var plantaViewSize;
      if(window.innerWidth < window.innerHeight) {
         plantaViewSize = window.innerWidth / 3;
      } else {
         plantaViewSize = window.innerHeight / 3;
      }
      renderer.setViewport(0,0,plantaViewSize,plantaViewSize);
      renderer.render(scene,planta);
   }

   
}