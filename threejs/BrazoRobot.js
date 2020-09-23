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
    renderer.setClearColor(new THREE.Color(0x000BBBB));
    //Añadir un canvas al container
    document.getElementById("container").appendChild(renderer.domElement);
    
    // Escena
    scene = new THREE.Scene();

    // Camara
    // Razón de aspecto
    var ar = window.innerWidth / window.innerHeight;
    // Instanciar cámara (fovy, ar, near, far)
    camera = new THREE.PerspectiveCamera(50, ar, 0.1, 100);
    scene.add(camera);
    //Situar la cámara
    camera.position.set(0.5, 3, 9);
    //Dirección en la que mira la cámara
    camera.lookAt( new THREE.Vector3(0,2,0));
 }


 function loadScene() {
    //Construir el grafo de escena

    //Materiales
    var material = new THREE.MeshBasicMaterial({color: 'red',wireframe: true});

    //Geometrias
    var geobase = new THREE.CylinderGeometry(50,50,15,32);
    var geoeje = new THREE.BoxGeometry(18,120,12);
    var geoesparrago = new THREE.CylinderGeometry(20,20,18,32);
    var georotula = new THREE.SphereGeometry(20,32,32);
    var geodisco = new THREE.CylinderGeometry(22,22,6,32);
    var geonervio = new THREE.BoxGeometry(4,80,4)
    var geomano = new THREE.CylinderGeometry(15,15,40,32);

    //Objetos
    var robot = new THREE.Object3D();
    robot.position.y = 10
    var base = new THREE.Mesh(geobase,material);
    var brazo = new THREE.Object3D();
    var eje = new THREE.Mesh(geoeje,material);
    var esparrago = new THREE.Mesh(geoesparrago,material);
    esparrago.rotation.x = Math.PI / 2;
    var rotula = new THREE.Mesh(georotula,material);
    rotula.position.y = 120;
    var antebrazo = new THREE.Object3D();
    var disco = new THREE.Mesh(geodisco,material);
    var nervio1 = new THREE.Mesh(geonervio,material);
    nervio1.position.x = 12;
    nervio1.position.z = 12;
    var nervio2 = new THREE.Mesh(geonervio,material);
    nervio2.position.x = -12;
    nervio2.position.z = 12;
    var nervio3 = new THREE.Mesh(geonervio,material);
    nervio3.position.x = -12;
    nervio3.position.z = -12;
    var nervio4 = new THREE.Mesh(geonervio,material);
    nervio4.position.x = 12;
    nervio4.position.z = -12;
    var mano = new THREE.Mesh(geomano,material);
    mano.position.y = 80;

    //Organizacion de escena
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
    //scene.add(new THREE.AxisHelper(3));
 }

 //Variación de la escena entre frames
 function update() {
    //angulo += Math.PI/100;
 }


 function render() {
    //Construir el frame
    requestAnimationFrame(render);
    update();
    renderer.render(scene, camera);
 }