/**
 * Seminario GPC #2. Forma Básica.
 * Dibujar formas básicas y un modelo importado.
 * Muestra el bucle típico de inicialización, escena y render.
 * 
 * Autor: David Villanova Aparisi
 * Fecha: 23-09-2020
 */

//Variables de consenso
// Motor, escena y cámara
var renderer, scene, camera;

//Otras globales
var robot, angulo = 0;

//Acciones
init();
loadScene();
render();

function init() {
   //Configurar el motor de render y el canvas
   renderer = new THREE.WebGLRenderer();
   //Tomar el tamaño máximo posible
   renderer.setSize(window.innerWidth, window.innerHeight);
   //Dar color de borrado al renderer (En RGB hexadecimal)
   renderer.setClearColor(new THREE.Color(0xFFFFFF));
   //Añadir un canvas al container
   document.getElementById("container").appendChild(renderer.domElement);
   
   // Escena
   scene = new THREE.Scene();

   // Camara
   // Razón de aspecto
   var ar = window.innerWidth / window.innerHeight;
   // Instanciar cámara (fovy, ar, near, far)
   camera = new THREE.PerspectiveCamera(50, ar, 0.1, 1000);
   scene.add(camera);
   //Situar la cámara
   camera.position.set(175, 250, 175);
   //Dirección en la que mira la cámara
   camera.lookAt( new THREE.Vector3(0,125,0));
}


function loadScene() {
   //Construir el grafo de escena

   //Materiales
   var material = new THREE.MeshBasicMaterial({color: 'red',wireframe: true});
   var material_solido = new THREE.MeshBasicMaterial({color: 'blue',wireframe: false});

   //Geometría pinzas
   var geopinza = new THREE.Geometry();
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
   
   //Geometrias
   var geosuelo = new THREE.PlaneGeometry(1000,1000,10,10)
   var geobase = new THREE.CylinderGeometry(50,50,15,32);
   var geoeje = new THREE.BoxGeometry(18,120,12);
   var geoesparrago = new THREE.CylinderGeometry(20,20,18,32);
   var georotula = new THREE.SphereGeometry(20,32,32);
   var geodisco = new THREE.CylinderGeometry(22,22,6,32);
   var geonervio = new THREE.BoxGeometry(4,80,4)
   var geomano = new THREE.CylinderGeometry(15,15,40,32);
   

   //Objetos
   var suelo = new THREE.Mesh(geosuelo, material);
   suelo.rotation.x = Math.PI / 2;
   var robot = new THREE.Object3D();
   robot.position.y = 10
   var base = new THREE.Mesh(geobase,material);
   var brazo = new THREE.Object3D();
   var eje = new THREE.Mesh(geoeje,material);
   eje.position.y = 60;
   var esparrago = new THREE.Mesh(geoesparrago,material);
   esparrago.rotation.x = Math.PI / 2;
   var rotula = new THREE.Mesh(georotula,material);
   rotula.position.y = 120;
   var antebrazo = new THREE.Object3D();
   antebrazo.position.y = 120;
   var disco = new THREE.Mesh(geodisco,material);
   var nervio1 = new THREE.Mesh(geonervio,material);
   nervio1.position.y = 40;
   nervio1.position.x = 12;
   nervio1.position.z = 12;
   var nervio2 = new THREE.Mesh(geonervio,material);
   nervio2.position.y = 40;
   nervio2.position.x = -12;
   nervio2.position.z = 12;
   var nervio3 = new THREE.Mesh(geonervio,material);
   nervio3.position.y = 40;
   nervio3.position.x = -12;
   nervio3.position.z = -12;
   var nervio4 = new THREE.Mesh(geonervio,material);
   nervio4.position.y = 40;
   nervio4.position.x = 12;
   nervio4.position.z = -12;
   var mano = new THREE.Mesh(geomano,material);
   mano.position.y = 80;
   mano.rotation.x = Math.PI/2;
   var pinzas = new THREE.Object3D();
   pinzas.position.x = 12;
   pinzas.position.z = -12;
   pinzas.rotation.x = Math.PI / 2;
   var pinza_izq = new THREE.Mesh(geopinza, material);
   pinza_izq.position.z = 14;
   var pinza_der = new THREE.Mesh(geopinza,material);
   pinza_der.position.z = -10;
   

   //Organizacion de escena
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
   scene.add(suelo);
   //scene.add(new THREE.AxisHelper(3));
}

function render()
{
	requestAnimationFrame( render );
	renderer.render( scene, camera );
}