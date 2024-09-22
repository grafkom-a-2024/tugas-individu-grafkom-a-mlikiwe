function main() {
  var canvas = document.getElementById("myCanvas");
  var gl = canvas.getContext("webgl");

  var vertices = [];

  // Generate points for a cylinder
  function generateCylinder(radius, height, segments) {
    var topCenter = [0.0, height / 2, 0.0];
    var bottomCenter = [0.0, -height / 2, 0.0];

    for (var i = 0; i < segments; i++) {
      var theta = 2 * Math.PI * i / segments;
      var nextTheta = 2 * Math.PI * (i + 1) / segments;

      // Top circle vertices
      var x1 = radius * Math.cos(theta);
      var z1 = radius * Math.sin(theta);
      var x2 = radius * Math.cos(nextTheta);
      var z2 = radius * Math.sin(nextTheta);

      // Create triangles for the top cap
      vertices.push(...topCenter, 1.0, 0.0, 0.0); // Red (center point)
      vertices.push(x1, height / 2, z1, 1.0, 0.0, 0.0); // Red (outer points)
      vertices.push(x2, height / 2, z2, 1.0, 0.0, 0.0);

      // Create triangles for the bottom cap
      vertices.push(...bottomCenter, 0.0, 0.0, 1.0); // Blue (center point)
      vertices.push(x1, -height / 2, z1, 0.0, 0.0, 1.0); // Blue (outer points)
      vertices.push(x2, -height / 2, z2, 0.0, 0.0, 1.0);

      // Create side faces
      vertices.push(x1, height / 2, z1, 0.0, 1.0, 0.0); // Green
      vertices.push(x1, -height / 2, z1, 0.0, 1.0, 0.0);
      vertices.push(x2, -height / 2, z2, 0.0, 1.0, 0.0);

      vertices.push(x1, height / 2, z1, 0.0, 1.0, 0.0); // Green
      vertices.push(x2, -height / 2, z2, 0.0, 1.0, 0.0);
      vertices.push(x2, height / 2, z2, 0.0, 1.0, 0.0);
    }
  }

  // Generate points for a cone
  function generateCone(radius, height, segments) {
    var apex = [0.0, height / 2, 0.0];
    var baseCenter = [0.0, -height / 2, 0.0];

    for (var i = 0; i < segments; i++) {
      var theta = 2 * Math.PI * i / segments;
      var nextTheta = 2 * Math.PI * (i + 1) / segments;

      // Base circle vertices
      var x1 = radius * Math.cos(theta);
      var z1 = radius * Math.sin(theta);
      var x2 = radius * Math.cos(nextTheta);
      var z2 = radius * Math.sin(nextTheta);

      // Create triangles for the base
      vertices.push(...baseCenter, 0.0, 0.0, 1.0); // Blue (center point)
      vertices.push(x1, -height / 2, z1, 0.0, 0.0, 1.0); // Blue (outer points)
      vertices.push(x2, -height / 2, z2, 0.0, 0.0, 1.0);

      // Create triangles for the sides
      vertices.push(...apex, 1.0, 0.0, 0.0); // Red (apex point)
      vertices.push(x1, -height / 2, z1, 1.0, 0.0, 0.0); // Red (base points)
      vertices.push(x2, -height / 2, z2, 1.0, 0.0, 0.0);
    }
  }

  // Choose to draw either a cylinder or a cone
  generateCylinder(0.5, 1.0, 36); // Cylinder with 36 segments
  // generateCone(0.5, 1.0, 36); // Uncomment to draw cone

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
  gl.vertexAttribPointer(
    aPosition,
    3,
    gl.FLOAT,
    false,
    6 * Float32Array.BYTES_PER_ELEMENT,
    0
  );
  gl.vertexAttribPointer(
    aColor,
    3,
    gl.FLOAT,
    false,
    6 * Float32Array.BYTES_PER_ELEMENT,
    3 * Float32Array.BYTES_PER_ELEMENT
  );
  gl.enableVertexAttribArray(aPosition);
  gl.enableVertexAttribArray(aColor);

  gl.viewport(100, 0, canvas.height, canvas.height);
  gl.enable(gl.DEPTH_TEST);

  var primitive = gl.TRIANGLES;
  var offset = 0;
  var count = vertices.length / 6;

  function render() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(primitive, offset, count);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
