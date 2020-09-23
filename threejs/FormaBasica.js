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
 var esferaCubo, angulo = 0;

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
    camera.position.set(0.5, 2, 5);
    //Dirección en la que mira la cámara
    camera.lookAt( new THREE.Vector3(0,0,0));
 }


 function loadScene() {
    //Construir el grafo de escena

    //Materiales
    var material = new THREE.MeshBasicMaterial({color: 'yellow',wireframe: true});

    //Geometrias
    var geocubo = new THREE.BoxGeometry(2,2,2);

    //Objtos
    var cubo = new THREE.Mesh();

    //Organización
    scene.add(cubo)
 }

 //Variación de la escena entre frames
 function update() {

 }


 function render() {
    //Construir el frame
    requestAnimationFrame(render);
    update();
    renderer.render(scene, camera);
 }