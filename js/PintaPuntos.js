/**
 * Seminario #1 GPC. Pintar puntos en pantalla
 * que el usuario va clicando
 */

 //SHADER VERTICES
 var VSHADER_SOURCE = 
 'attribute vec4 posicion;          \n' +
 'void main(){                      \n' +
 '  gl_Position = posicion;         \n' +
 '  gl_PointSize = 10.0;            \n' +
 '}                                 \n';
 
 //SHADER FRAGMENTOS
 var FSHADER_SOURCE = 
 'void main(){                      \n' +
 '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);         \n' +
 '}                                 \n';

 