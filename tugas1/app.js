function helloShapes() {
    var canvas = document.getElementById('hellotriangle');
    var gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    var vertexShaderSource = document.querySelector("#vertex-shader-2d").text;
    var fragmentShaderSource = document.querySelector("#fragment-shader-2d").text;

    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    var program = createProgram(gl, vertexShader, fragmentShader);
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.enableVertexAttribArray(positionAttributeLocation);

    var size = 2;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

    drawTriangle(gl, -0.5, 0.5, -1, -0.87, 0, -0.87);
    drawTriangle(gl, 0.5, 0.5, 0.05, -0.87, 1.05, -0.87);
    drawTriangle(gl, 0.52, -2.2, 0.05, -0.95, 1.05, -0.95);
    drawTriangle(gl, -0.5, -2.2, -1, -0.95, 0, -0.95);
    drawTriangle(gl, 0.025, -0.77, -0.5, 0.7, 0.5, 0.7);
    drawTriangle(gl, 0.025, 2.3, -0.5, 0.77, 0.5, 0.77);
}

helloShapes();

function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }
   
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
};

function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }
   
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
};

function drawTriangle(gl, x1, y1, x2, y2, x3, y3) {
    var scaleFactor = 0.4;
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1 * scaleFactor, y1 * scaleFactor,
        x2 * scaleFactor, y2 * scaleFactor,
        x3 * scaleFactor, y3 * scaleFactor
    ]), gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function drawRectangle(gl, x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
       x1, y1,
       x2, y1,
       x1, y2,
       x1, y2,
       x2, y1,
       x2, y2,
    ]), gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

function drawCircle(gl, centerX, centerY, radius, numSegments) {
    let circleVertices = [];
    const angleStep = (2 * Math.PI) / numSegments;

    circleVertices.push(centerX);
    circleVertices.push(centerY);

    for (let i = 0; i <= numSegments; i++) {
        let angle = i * angleStep;
        let x = centerX + radius * Math.cos(angle);
        let y = centerY + radius * Math.sin(angle);
        circleVertices.push(x);
        circleVertices.push(y);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circleVertices), gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, numSegments + 2);
}
