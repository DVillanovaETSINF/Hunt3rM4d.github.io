/**
 * Seminario #1 GPC. Pintar el canvas simplemente
 * Autor: David Villanova Aparisi
 * Fecha: 16/9/2021
 */

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
        console.log("Falló la carga del contexto de render")
        return;
    }

    //Fija el color de borrado del canvas
    gl.clearColor(0.0, 0.0, 0.3, 1.0)

    //Borrado del canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

 }

