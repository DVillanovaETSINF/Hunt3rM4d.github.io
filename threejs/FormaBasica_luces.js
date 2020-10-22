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

var cameraControl;

 //Otras globales
 var esferaCubo, angulo = 0;
var video, videoImage, videoImageContext, videoTexture;

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
   renderer.setClearColor(new THREE.Color(0x888888));
   //Activar el calculo de sombras
   renderer.shadowMap.enabled = true;
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
   camera.position.set(300, 400, 300);
   //Dirección en la que mira la cámara
   camera.lookAt( new THREE.Vector3(0,2,0));

   cameraControl = new THREE.OrbitControls( camera, renderer.domElement);
   cameraControl.target.set(0,0,0);

   //Luces
   //Luz ambiental (color, intensidad)
   var luzAmbiente = new THREE.AmbientLight(0xFFFFFF,0.15);
   scene.add(luzAmbiente);

   //Luz puntual (color, intensidad)
   var luzPuntual = new THREE.PointLight(0xFFFFFF,0.5);
   luzPuntual.position.set(10,10,-10);
   scene.add(luzPuntual);

   //Luz direccional (color, intensidad)
   var luzDireccional = new THREE.DirectionalLight(0xFFFFFF, 0.5);
   luzDireccional.position.set(-10,5,10);
   scene.add(luzDireccional);

   //luz focal (color, intensidad)
   var luzFocal = new THREE.SpotLight(0xFFFFFF, 0.5);
   //Posición
   luzFocal.position.set( 10, 10, 0);
   //Dirección
   luzFocal.target.position.set(0,0,0);
   //Angulo cutoff en radianes
   luzFocal.angle = Math.PI / 5; 
   //Penumbra hace antialisaing  
   luzFocal.penumbra = 0.5;
   luzFocal.castShadow = true;
   scene.add(luzFocal);
}


 function loadScene() {
   //Construir el grafo de escena

   //Texturas
   var path = "images/";
   var texturaSuelo = new THREE.TextureLoader().load(path+'wet_ground_512x512.jpg');
   //Contrarrestar minificación y magnificación (aliasing)
   texturaSuelo.magFilter = THREE.LinearFilter;
   texturaSuelo.minFilter = THREE.LinearFilter;
   texturaSuelo.repeat.set(3,2);
   //texturaSuelo.wrapS = texturaSuelo.wrapT = THREE.RepeatWrapping;
   texturaSuelo.wrapS = texturaSuelo.wrapT = THREE.MirroredRepeatWrapping;

   var texturaCubo = new THREE.TextureLoader().load(path+'wood512.jpg');

   var texturaEsfera = new THREE.TextureLoader().load(path+'Earth.jpg');

   var paredes = [ path + 'mapaEntornoPrueba/posx.jpg', path + 'mapaEntornoPrueba/negx.jpg',
                   path + 'mapaEntornoPrueba/posy.jpg', path + 'mapaEntornoPrueba/negy.jpg',
                   path + 'mapaEntornoPrueba/posz.jpg', path + 'mapaEntornoPrueba/negz.jpg'];
   var mapaEntorno = new THREE.CubeTextureLoader().load(paredes);


   //Materiales
   var material = new THREE.MeshBasicMaterial({color: 'yellow',wireframe: true});

   //Material difuso color mate blanco
   var materialMate = new THREE.MeshLambertMaterial({color: 'brown', map: texturaCubo});
   //Suelo con textura
   var materialSuelo = new THREE.MeshLambertMaterial({color: 'white', map: texturaSuelo});

   //Material especular
   /*var materialBrillante = new THREE.MeshPhongMaterial({color: 'white',
                                                      specular:'white',
                                                      shinniness: 50,
                                                      map: texturaEsfera});*/
   var materialBrillante = new THREE.MeshPhongMaterial({color: 'white',
                                                      specular:'white',
                                                      shininess: 50,
                                                      envMap: mapaEntorno});

   //Geometrias
   var geocubo = new THREE.BoxGeometry(2,2,2);
   var geoesfera = new THREE.SphereGeometry(1,30,30);
   var geosuelo = new THREE.PlaneGeometry(20,20,50,20);

   //Objetos
   var cubo = new THREE.Mesh(geocubo, materialMate);

   //Rotación y después traslación
   //Orden en el que se indican las rotaciones, traslaciones y escalado
   //no importan. Se hacen sobre el sistema de coordenadas fijo (0,0,0).
   cubo.position.x = -1;
   cubo.rotation.y = Math.PI/4;
   //Habilitar sombras arrojadas
   cubo.receiveShadow = true;
   cubo.castShadow = true;

   var esfera = new THREE.Mesh(geoesfera, materialBrillante);
   esfera.position.x = 3;
   //Habilitar sombras arrojadas
   esfera.receiveShadow = true;
   esfera.castShadow = true;
   
   esferaCubo = new THREE.Object3D();
   esferaCubo.position.y = 0.5;
   esferaCubo.rotation.y = angulo;

   var suelo = new THREE.Mesh(geosuelo, materialSuelo);
   suelo.rotation.x = -Math.PI/2;
   suelo.position.y = -0.5;
   //Habilitar sombras arrojadas
   suelo.receiveShadow = true;

   //Modelo externo
   var loader = new THREE.ObjectLoader();
   loader.load('../models/soldado/soldado.json',
               function(obj) {
                  var objtx = new THREE.TextureLoader().load('models/soldado/soldado.png');
                  obj.position.set(0,1,0);
                  obj.material.map = objtx;
                  cubo.add(obj);
                  //Habilitar sombras arrojadas
                  obj.receiveShadow = true;
                  obj.castShadow = true;
   });

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

   var habitacion = new THREE.Mesh(new THREE.CubeGeometry(20,20,20), matParedes);
   scene.add(habitacion);


   //Pantalla y vídeo
   video = document.createElement('video');
   video.src = "videos/Pixar.mp4";
   video.muted = "muted";
   video.load();
   video.play();

   //Asociar la imagen de video a un canvas 2D
   videoImage = document.createElement('canvas');
   videoImage.width = 632;
   videoImage.height = 256;

   //Obtener contexto para canvas
   videoImageContext = videoImage.getContext('2d');
   videoImageContext.fillStyle = '#0000FF';
   videoImageContext.fillRect(0,0,videoImage.width,videoImage.height);

   //Crear la textura
   videoTexture = new THREE.Texture(videoImage);
   videoTexture.minFilter = THREE.LinearFilter;
   videoTexture.magFilter = THREE.LinearFilter;

   //Crear el material con la textura
   var movieMaterial = new THREE.MeshBasicMaterial({map: videoTexture,
                                                    side: THREE.DoubleSide});

   //Crear la geometria de la pantalla, misma relación de aspecto que el vídeo
   var movieGeometry = new THREE.PlaneGeometry(15, (256/632)*15);
   var movie = new THREE.Mesh(movieGeometry, movieMaterial);
   movie.position.set(0,10,-7);
   scene.add(movie);

   //Organización de la escena
   esferaCubo.add(cubo);
   esferaCubo.add(esfera);
   scene.add(esferaCubo);
   scene.add(new THREE.AxisHelper(3));
   scene.add(suelo);
 }

 //Variación de la escena entre frames
function update() {
   angulo += Math.PI/100;
   //esferaCubo.rotation.y = angulo;
 
   //Actualizar video
   if(video.readyState == video.HAVE_ENOUGH_DATA) {
      videoImageContext.drawImage(video,0,0);
      if(videoTexture) videoTexture.needsUpdate = true;
   }
}


 function render() {
    //Construir el frame
    requestAnimationFrame(render);
    update();
    renderer.render(scene, camera);
 }