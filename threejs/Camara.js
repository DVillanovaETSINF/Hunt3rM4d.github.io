/**
 * Seminario GPC #2. Cámara.
 * Manejar diferentes camaras, marcos y picking
 * 
 * Autor: David Villanova Aparisi
 * Fecha: 23-09-2020
 */



//Variables de consenso
// Motor, escena y cámara
var renderer, scene, camera;

//Otras globales
var esferaCubo, angulo = 0;
var l = b = -4;
var r = t = 4;
var cameraControls;
//Cámaras ortográficas
var alzado, planta, perfil;

//Acciones
init();
loadScene();
render();

function setCameras(ar) {
   //Construye las cámaras planta, alzado, perfil y perspectiva
   var origen = new THREE.Vector3(0,0,0);
   var camaraOrtografica;
   if(ar > 1) {
      camaraOrtografica = new THREE.OrthographicCamera(l*ar, r*ar, t, b, -20, 20);
   } else {
      camaraOrtografica = new THREE.OrthographicCamera(l,r,t/ar,b/ar,-20,20);
   }

   //Camaras ortográficas
   alzado = camaraOrtografica.clone();
   alzado.position.set(0,0,5);
   alzado.lookAt(origen);

   perfil = camaraOrtografica.clone();
   perfil.position.set(5,0,0);
   perfil.lookAt(origen);

   planta = camaraOrtografica.clone();
   planta.position.set(0,5,0);
   planta.lookAt(origen);
   planta.up = new THREE.Vector3(0,0,-1);
   
   //Camara perspectiva
   var camaraPerspectiva = new THREE.PerspectiveCamera(50,ar,0.1,50);
   camaraPerspectiva.position.set(1,2,10);
   camaraPerspectiva.lookAt(origen);

   camera = camaraPerspectiva.clone();

   scene.add(alzado);
   scene.add(planta);
   scene.add(perfil);
   scene.add(camera);

}

function init() {
   //Configurar el motor de render y el canvas
   renderer = new THREE.WebGLRenderer();
   //Tomar el tamaño máximo posible
   renderer.setSize(window.innerWidth, window.innerHeight);
   //Dar color de borrado al renderer (En RGB hexadecimal)
   renderer.setClearColor(new THREE.Color(0x00BBBB));
   //Hacer que al invocar render() no se borre el render previo
   renderer.autoClear = false;
   //Añadir un canvas al container
   document.getElementById("container").appendChild(renderer.domElement);
   
   // Escena
   scene = new THREE.Scene();

   // Camara
   var ar = window.innerWidth / window.innerHeight;
   setCameras(ar);
   
   /*// Razón de aspecto
   var ar = window.innerWidth / window.innerHeight;
   // Instanciar cámara (fovy, ar, near, far)
   camera = new THREE.PerspectiveCamera(50, ar, 0.1, 1000);
   //camera = new THREE.OrthographicCamera(l, r, t, b, -10, 10);
   scene.add(camera);
   //Situar la cámara
   camera.position.set(0.5, 3, 9);
   //Dirección en la que mira la cámara
   camera.lookAt( new THREE.Vector3(0,0,0) );*/

   //Controlador de camara
   cameraControls = new THREE.OrbitControls( camera, renderer.domElement);
   //Punto de interes sobre el que se va a orbitar
   cameraControls.target.set(0,0,0);
   //Que no se puedan utilizar las teclas
   cameraControls.noKeys = true;

   //Captura de eventos
   window.addEventListener('resize',updateAspectRatio);
   renderer.domElement.addEventListener('dblclick', rotate);
}

//Cuando se da click sobre un objeto, hacer que gire X grados sobre sí mismo (Y)
function rotate(event) {
   // Coordenadas en el sistema de referencia del canvas 
   var x = event.clientX;
   var y = event.clientY;

   //Transformación a cuadrado 2x2
   //x = (x / window.innerWidth) * 2 - 1;
   //y = -(y / window.innerHeight) * 2 + 1;

   //Transformación a cuadrado 2x2 para 4 cámaras

   //Cuadrante para la x,y
   var derecha = false, abajo = false;
   if ( x > window.innerWidth / 2) {
      //Estamos a la derecha de la pantalla --> Corregir para estar en el primer cuadrante
      x -= window.innerWidth / 2;
      derecha = true;
   }

   if ( y > window.innerHeight / 2) {
      y -= window.innerHeight / 2;
      abajo = true;
   }

   var cam;
   if ( derecha) {
      if(abajo) {
         cam = camera;
      } else {
         cam = perfil;
      }
   } else {
      if (abajo) {   
         cam = planta;
      } else {
         cam = alzado;
      }
   }

   x = (x*2 / window.innerWidth) * 2 - 1;
   y = - ( 2*y / window.innerHeight) * 2 + 1;

   var rayo = new THREE.Raycaster();
   rayo.setFromCamera( new THREE.Vector2(x,y), cam);

   var interseccion = rayo.intersectObjects( scene.children, true );
   //console.log(interseccion);

   if(interseccion.length > 0) {
      interseccion[0].object.rotation.y += Math.PI / 4;
   }
}

function updateAspectRatio() {
   //Ajustar el tamaño del canvas tras redimensionado de la ventana
   renderer.setSize(window.innerWidth, window.innerHeight);

   //Razon de aspecto
   var ar = window.innerWidth / window.innerHeight;

   //Ajustar caja de la cámara ortográfica
   /*
   if (ar > 1) {
      camera.left = l * ar;
      camera.right = r * ar;
      camera.bottom = b;
      camera.top = t;
   } else {
      camera.top = t / ar;
      camera.bottom = b / ar;
      camera.left = l;
      camera.right = r;
   }
   */

   //Camara perspectiva
   camera.aspect = ar;

   //Que no haga wide Putin meme
   camera.updateProjectionMatrix();
}


function loadScene() {
   //Construir el grafo de escena

   //Materiales
   var material = new THREE.MeshBasicMaterial({color: 'yellow',wireframe: true});

   //Geometrias
   var geocubo = new THREE.BoxGeometry(2,2,2);
   var geoesfera = new THREE.SphereGeometry(1,30,30);

   //Objtos
   var cubo = new THREE.Mesh(geocubo, material);

   //Rotación y después traslación
   //Orden en el que se indican las rotaciones, traslaciones y escalado
   //no importan. Se hacen sobre el sistema de coordenadas fijo (0,0,0).
   cubo.position.x = -1;
   cubo.rotation.y = Math.PI/4;

   var esfera = new THREE.Mesh(geoesfera, material);
   esfera.position.x = 3;
   
   esferaCubo = new THREE.Object3D();
   esferaCubo.position.y = 0.5;
   esferaCubo.rotation.y = angulo;

   //Modelo externo
   var loader = new THREE.ObjectLoader();
   loader.load('../models/soldado/soldado.json',
               function(obj) {
                  obj.position.set(0,1,0);
                  cubo.add(obj);
   });

   //Organización de la escena
   esferaCubo.add(cubo);
   esferaCubo.add(esfera);
   scene.add(esferaCubo);
   //scene.add(new THREE.AxisHelper(3));
}

//Variación de la escena entre frames
function update() {

}


function render() {
   //Construir el frame
   requestAnimationFrame(render);
   update();

   //borrado manual
   renderer.clear();

   //Par cada rernder debo indicar el viewport
   renderer.setViewport(window.innerWidth / 2, 0,
                        window.innerWidth / 2, window.innerHeight / 2 );
   renderer.render(scene, perfil);
   
   renderer.setViewport(0, 0, 
                        window.innerWidth / 2, window.innerHeight / 2);
   renderer.render(scene, alzado);
   
   renderer.setViewport(0, window.innerHeight / 2,
                        window.innerWidth / 2, window.innerHeight / 2);
   renderer.render(scene, planta);
   
   renderer.setViewport(window.innerWidth/2, window.innerHeight / 2,
                        window.innerWidth / 2, window.innerHeight / 2);
   renderer.render(scene, camera);
   

}