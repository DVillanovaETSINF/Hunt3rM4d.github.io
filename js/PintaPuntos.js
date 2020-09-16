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

 function main() {

     //Recuperar el canvas (el lienzo)
    var canvas = document.getElementById("canvas");
    if( !canvas ) {
        console.log("Fallo la carga del canvas");
        return;
    }

    //Recuperar el contexto de render (caja de pinturas)
    var gl = getWebGLContext(canvas);
    if(!gl) {
        console.log("Falló la carga del contexto de render");
        return;
    }

    //Fija el color de borrado del canvas
    gl.clearColor(0.0, 0.0, 0.3, 1.0);

    //Borrado del canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Cargar, compilar y montar los shaders en un 'program'
    if( !initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("Falló la carga de los shaders");
        return;
    }

    //Localiza el atributo  en el shader
    var coordenadas = gl.getAttribLocation(gl.program, 'posicion');
 
    //Registrar el evento
    canvas.onmousedown = function(evento) { click(evento, gl, canvas, coordenadas)};
}

var puntos = []; //Array  de puntos
function click(evento, gl, canvas, coordenadas) {
    //Procesar la coordenada del click
    var x = evento.clientX;
    var y = evento.clientY;
    var rect = evento.target.getBoundingClientRect();

    //Conversión de coordenadas
    //x'
    x = ((x-rect.left) - canvas.width/2) * 2/canvas.width;
    //y'
    y = (canvas.height/2 - (y-rect.top)) * 2/canvas.height;

    //Guardar el punto
    puntos.push(x);puntos.push(y);

    //Borrar el canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Inserta las coordenadas de los puntos como atributos y
    //los dibuja uno a uno
    for( var i = 0; i < puntos.length; i+=2) {
        gl.vertexAttrib3f(coordenadas, puntos[i], puntos[i+1], 0.0);
        gl.drawArrays( gl.POINTS, 0, 1);
    }
}