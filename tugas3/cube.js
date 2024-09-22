function main() {
  var canvas = document.getElementById("myCanvas");
  var gl = canvas.getContext("webgl");

  var vertices = [];

  var cubePoints = [
    [-0.5,  0.5,  0.5],   
    [-0.5, -0.5,  0.5],   
    [ 0.5, -0.5,  0.5],    
    [ 0.5,  0.5,  0.5],   
    [-0.5,  0.5, -0.5],   
    [-0.5, -0.5, -0.5],   
    [ 0.5, -0.5, -0.5],   
    [ 0.5,  0.5, -0.5]     
  ];

  var cubeColors = [
    [],
    [1.0, 0.0, 0.0],    
    [0.0, 1.0, 0.0],    
    [0.0, 0.0, 1.0],    
    [1.0, 1.0, 1.0],    
    [1.0, 0.5, 0.0],    
    [1.0, 1.0, 0.0],    
    []
  ];

  var cubeNormals = [
    [],
    [0.0, 0.0, 1.0],    
    [1.0, 0.0, 0.0],    
    [0.0, 1.0, 0.0],    
    [-1.0, 0.0, 0.0],    
    [0.0, 0.0, -1.0],   
    [0.0, -1.0, 0.0],   
    []
  ];

  function quad(a, b, c, d) {
    var indices = [a, b, c, c, d, a];
    for (var i=0; i<indices.length; i++) {
      for (var j=0; j<3; j++) {
        vertices.push(cubePoints[indices[i]][j]);
      }
      for (var j=0; j<3; j++) {
        vertices.push(cubeColors[a][j]);
      }
      for (var j=0; j<3; j++) {
        vertices.push(cubeNormals[a][j]);
      }
    }
  }
  quad(1, 2, 3, 0); 
  quad(2, 6, 7, 3); 
  quad(3, 7, 4, 0); 
  quad(4, 5, 1, 0); 
  quad(5, 4, 7, 6); 
  quad(6, 2, 1, 5); 

  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  var vertexShaderCode = document.getElementById("vertexShaderCode").text;

  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderCode);
  gl.compileShader(vertexShader);

  var fragmentShaderCode = document.getElementById("fragmentShaderCode").text;

  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderCode);
  gl.compileShader(fragmentShader);

  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  var aPosition = gl.getAttribLocation(shaderProgram, "a_Position");
  var aColor = gl.getAttribLocation(shaderProgram, "a_Color");
  var aNormal = gl.getAttribLocation(shaderProgram, "a_Normal");
  gl.vertexAttribPointer(
    aPosition, 
    3, 
    gl.FLOAT, 
    false, 
    9 * Float32Array.BYTES_PER_ELEMENT, 
    0);
  gl.vertexAttribPointer(
    aColor, 
    3, 
    gl.FLOAT, 
    false, 
    9 * Float32Array.BYTES_PER_ELEMENT, 
    3 * Float32Array.BYTES_PER_ELEMENT);
  gl.vertexAttribPointer(
    aNormal, 
    3, 
    gl.FLOAT, 
    false, 
    9 * Float32Array.BYTES_PER_ELEMENT, 
    6 * Float32Array.BYTES_PER_ELEMENT);
  gl.enableVertexAttribArray(aPosition);
  gl.enableVertexAttribArray(aColor);
  gl.enableVertexAttribArray(aNormal);

  gl.viewport(100, 0, canvas.height, canvas.height);
  gl.enable(gl.DEPTH_TEST);

  var primitive = gl.TRIANGLES;
  var offset = 0;
  var count = 36;

  var model = glMatrix.mat4.create();
  var view = glMatrix.mat4.create();
  glMatrix.mat4.lookAt(view,
    [0.0, 0.0, 2.0], 
    [0.0, 0.0, -2.0], 
    [0.0, 1.0, 0.0] 
    );
  var projection = glMatrix.mat4.create();
  glMatrix.mat4.perspective(projection, 
    glMatrix.glMatrix.toRadian(90), 
    1.0,  
    0.5,  
    10.0  
    );
  var uModel = gl.getUniformLocation(shaderProgram, 'u_Model');
  var uView = gl.getUniformLocation(shaderProgram, 'u_View');
  var uProjection = gl.getUniformLocation(shaderProgram, 'u_Projection');
  gl.uniformMatrix4fv(uProjection, false, projection);

  var uAmbientColor = gl.getUniformLocation(shaderProgram, 'u_AmbientColor');
  gl.uniform3fv(uAmbientColor, [0.2, 0.2, 0.2]);
  var uDiffuseColor = gl.getUniformLocation(shaderProgram, 'u_DiffuseColor');
  gl.uniform3fv(uDiffuseColor, [1.0, 1.0, 1.0]);
  var uDiffusePosition = gl.getUniformLocation(shaderProgram, 'u_DiffusePosition');
  gl.uniform3fv(uDiffusePosition, [1.0, 2.0, 1.0]);
  var uNormal = gl.getUniformLocation(shaderProgram, 'u_Normal');

  
  var lastPointOnTrackBall, currentPointOnTrackBall;
  var lastQuat = glMatrix.quat.create();
  function computeCurrentQuat() {
    
    var axisFromCrossProduct = glMatrix.vec3.cross(glMatrix.vec3.create(), lastPointOnTrackBall, currentPointOnTrackBall);
    var angleFromDotProduct = Math.acos(glMatrix.vec3.dot(lastPointOnTrackBall, currentPointOnTrackBall));
    var rotationQuat = glMatrix.quat.setAxisAngle(glMatrix.quat.create(), axisFromCrossProduct, angleFromDotProduct);
    glMatrix.quat.normalize(rotationQuat, rotationQuat);
    return glMatrix.quat.multiply(glMatrix.quat.create(), rotationQuat, lastQuat);
  }
  function getProjectionPointOnSurface(point) {
    var radius = canvas.width/3;  
    var center = glMatrix.vec3.fromValues(canvas.width/2, canvas.height/2, 0);  
    var pointVector = glMatrix.vec3.subtract(glMatrix.vec3.create(), point, center);
    pointVector[1] = pointVector[1] * (-1); 
    var radius2 = radius * radius;
    var length2 = pointVector[0] * pointVector[0] + pointVector[1] * pointVector[1];
    if (length2 <= radius2) pointVector[2] = Math.sqrt(radius2 - length2); 
    else {
      pointVector[0] *= radius / Math.sqrt(length2);
      pointVector[1] *= radius / Math.sqrt(length2);
      pointVector[2] = 0;
    }
    return glMatrix.vec3.normalize(glMatrix.vec3.create(), pointVector);
  }

  var scale = glMatrix.vec3.fromValues(1.0, 1.0, 1.0); 
  var translate = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);

  document.addEventListener('keydown', function(event) {
    switch(event.key) {
      case 'ArrowUp': 
        translate[1] += 0.1;
        break;
      case 'ArrowDown': 
        translate[1] -= 0.1;
        break;
      case 'ArrowLeft': 
        translate[0] -= 0.1;
        break;
      case 'ArrowRight': 
        translate[0] += 0.1;
        break;
      case '+': 
        scale[0] += 0.1;
        scale[1] += 0.1;
        scale[2] += 0.1;
        break;
      case '-': 
        scale[0] -= 0.1;
        scale[1] -= 0.1;
        scale[2] -= 0.1;
        break;
    }
  });

  var rotation = glMatrix.mat4.create();
  var dragging;
  function onMouseDown(event) {
    var x = event.clientX;
    var y = event.clientY;
    var rect = event.target.getBoundingClientRect();
    if (
      rect.left <= x &&
      rect.right > x &&
      rect.top <= y &&
      rect.bottom > y
    ) {
      dragging = true;
    }
    lastPointOnTrackBall = getProjectionPointOnSurface(glMatrix.vec3.fromValues(x, y, 0));
    currentPointOnTrackBall = lastPointOnTrackBall;
  }
  function onMouseUp(event) {
    dragging = false;
    if (currentPointOnTrackBall != lastPointOnTrackBall) {
      lastQuat = computeCurrentQuat();
    }
  }
  function onMouseMove(event) {
    if (dragging) {
      var x = event.clientX;
      var y = event.clientY;
      currentPointOnTrackBall = getProjectionPointOnSurface(glMatrix.vec3.fromValues(x, y, 0));
      glMatrix.mat4.fromQuat(rotation, computeCurrentQuat());
    }
  }
  document.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('mousemove', onMouseMove);

  function render() {
  model = glMatrix.mat4.create(); // Matriks model di-reset ulang setiap kali render
  
  glMatrix.mat4.translate(model, model, translate); // Transformasi translasi
  
  glMatrix.mat4.multiply(model, model, rotation); // Transformasi rotasi dengan quaternion
  
  glMatrix.mat4.scale(model, model, scale); // Transformasi scaling
  
  gl.uniformMatrix4fv(uModel, false, model);
  gl.uniformMatrix4fv(uView, false, view);
  
  var normal = glMatrix.mat3.create();
  glMatrix.mat3.normalFromMat4(normal, model);
  gl.uniformMatrix3fv(uNormal, false, normal);
  
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  gl.drawArrays(primitive, offset, count);
  requestAnimationFrame(render);
}

  requestAnimationFrame(render);
}

main();