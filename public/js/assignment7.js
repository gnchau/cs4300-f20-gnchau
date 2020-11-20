const up = [0, 1, 0]
let target = [0, 0, 0]
let lookAt = false

const RED_HEX = "#FF0000"
const RED_RGB = webglUtils.hexToRgb(RED_HEX)
const BLUE_HEX = "#0000FF"
const BLUE_RGB = webglUtils.hexToRgb(BLUE_HEX)
const GREEN_HEX = "#00FF00"
const GREEN_RGB = webglUtils.hexToRgb(GREEN_HEX)
const RECTANGLE = "RECTANGLE"
const TRIANGLE = "TRIANGLE"
const CIRCLE = "CIRCLE"
const CUBE = "CUBE"
const origin = {x: 0, y: 0, z: 0}
const sizeOne = {width: 1, height: 1, depth: 1}

let gl
let attributeCoords
let uniformMatrix
let uniformColor
let bufferCoords
let selectedShapeIndex = 0
let fieldOfViewRadians = m4.degToRad(60)

let attributeNormals
let uniformWorldViewProjection
let uniformWorldInverseTranspose
let uniformReverseLightDirectionLocation
let normalBuffer

let camera = {
  translation: {x: -45, y: -35, z: 21},
  rotation: {x: 40, y: 235, z: 0}
}

let lightSource = [0.4, 0.3, 0.5]

let shapes = [
  {
    type: CUBE,
    position: origin,
    dimensions: sizeOne,
    color: BLUE_RGB,
    translation: {x:  0, y: 0, z: 0},
    scale:       {x:   0.5, y:   0.5, z:   0.5},
    rotation:    {x:   0, y:  0, z:   0},
  },
  {
    type: CUBE,
    position: origin,
    dimensions: sizeOne,
    color: GREEN_RGB,
    translation: {x: 20, y: 0, z: 0},
    scale:       {x:   0.5, y:   0.5, z:   0.5},
    rotation:    {x:   0, y:  0, z:   0},
  },
  {
    type: CUBE,
    position: origin,
    dimensions: sizeOne,
    color: RED_RGB,
    translation:  {x: -20, y: 0, z: 0},
    scale:       {x:   0.5, y:   0.5, z:   0.5},
    rotation:     {x: 0, y: 0, z: 0}
  },
]

const init = () => {
  // get a reference to the canvas and WebGL context
  const canvas = document.querySelector("#canvas");
  canvas.addEventListener(
      "mousedown",
      webglUtils.doMouseDown,
      false);
  gl = canvas.getContext("webgl");

  // create and use a GLSL program
  const program = webglUtils.createProgramFromScripts(gl,
      "#vertex-shader-3d", "#fragment-shader-3d");
  gl.useProgram(program);

  // get reference to GLSL attributes and uniforms
  attributeCoords = gl.getAttribLocation(program, "a_coords");
  uniformMatrix = gl.getUniformLocation(program, "u_matrix");
  const uniformResolution = gl.getUniformLocation(program, "u_resolution");
  uniformColor = gl.getUniformLocation(program, "u_color");

  // initialize coordinate attribute to send each vertex to GLSL program
  gl.enableVertexAttribArray(attributeCoords);

  // initialize coordinate buffer to send array of vertices to GPU
  bufferCoords = gl.createBuffer();

  // get the attributes and normals declared earlier
  attributeNormals = gl.getAttribLocation(program, "a_normals");
  gl.enableVertexAttribArray(attributeNormals);
  normalBuffer = gl.createBuffer();

  uniformWorldViewProjection
      = gl.getUniformLocation(program, "u_worldViewProjection");
  uniformWorldInverseTranspose
      = gl.getUniformLocation(program, "u_worldInverseTranspose");
  uniformReverseLightDirectionLocation
      = gl.getUniformLocation(program, "u_reverseLightDirection");

  // configure canvas resolution and clear the canvas
  gl.uniform2f(uniformResolution, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  document.getElementById("tx").onchange = event => webglUtils.updateTranslation(event, "x")
  document.getElementById("ty").onchange = event => webglUtils.updateTranslation(event, "y")
  document.getElementById("tz").onchange = event => webglUtils.updateTranslation(event, "z")

  document.getElementById("sx").onchange = event => webglUtils.updateScale(event, "x")
  document.getElementById("sy").onchange = event => webglUtils.updateScale(event, "y")
  document.getElementById("sz").onchange = event => webglUtils.updateScale(event, "z")

  document.getElementById("rx").onchange = event => webglUtils.updateRotation(event, "x")
  document.getElementById("ry").onchange = event => webglUtils.updateRotation(event, "y")
  document.getElementById("rz").onchange = event => webglUtils.updateRotation(event, "z")

  document.getElementById("fv").onchange = event => webglUtils.updateFieldOfView(event)

  document.getElementById("color").onchange = event => webglUtils.updateColor(event)

  document.getElementById("lookAt").onchange = event => webglUtils.toggleLookAt(event)
  document.getElementById("ctx").onchange = event => webglUtils.updateCameraTranslation(event, "x")
  document.getElementById("cty").onchange = event => webglUtils.updateCameraTranslation(event, "y")
  document.getElementById("ctz").onchange = event => webglUtils.updateCameraTranslation(event, "z")
  document.getElementById("crx").onchange = event => webglUtils.updateCameraRotation(event, "x")
  document.getElementById("cry").onchange = event => webglUtils.updateCameraRotation(event, "y")
  document.getElementById("crz").onchange = event => webglUtils.updateCameraRotation(event, "z")
  document.getElementById("ltx").onchange = event => webglUtils.updateLookAtTranslation(event, 0)
  document.getElementById("lty").onchange = event => webglUtils.updateLookAtTranslation(event, 1)
  document.getElementById("ltz").onchange = event => webglUtils.updateLookAtTranslation(event, 2)

  document.getElementById("lookAt").checked = lookAt
  document.getElementById("ctx").value = camera.translation.x
  document.getElementById("cty").value = camera.translation.y
  document.getElementById("ctz").value = camera.translation.z
  document.getElementById("crx").value = camera.rotation.x
  document.getElementById("cry").value = camera.rotation.y
  document.getElementById("crz").value = camera.rotation.z

  document.getElementById("dlrx").value = lightSource[0]
  document.getElementById("dlry").value = lightSource[1]
  document.getElementById("dlrz").value = lightSource[2]

  // light direction
  document.getElementById("dlrx").onchange = event => webglUtils.updateLightDirection(event, 0)
  document.getElementById("dlry").onchange = event => webglUtils.updateLightDirection(event, 1)
  document.getElementById("dlrz").onchange = event => webglUtils.updateLightDirection(event, 2)
  webglUtils.selectShape(0)
}

const render = () => {
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoords);
  gl.vertexAttribPointer(attributeCoords, 3, gl.FLOAT,false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.vertexAttribPointer(attributeNormals, 3, gl.FLOAT, false, 0, 0);

  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);

  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 1;
  const zFar = 2000;

  gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoords);

  let cameraMatrix = m4.identity()
  if (lookAt) {
    cameraMatrix = m4.translate(
        cameraMatrix,
        camera.translation.x,
        camera.translation.y,
        camera.translation.z)

    const cameraPosition = [
      cameraMatrix[12],
      cameraMatrix[13],
      cameraMatrix[14]]

    cameraMatrix = m4.lookAt(
        cameraPosition,
        target,
        up)

    cameraMatrix = m4.inverse(cameraMatrix)

  } else {
    cameraMatrix = m4.zRotate(
        cameraMatrix,
        m4.degToRad(camera.rotation.z));
    cameraMatrix = m4.xRotate(
        cameraMatrix,
        m4.degToRad(camera.rotation.x));
    cameraMatrix = m4.yRotate(
        cameraMatrix,
        m4.degToRad(camera.rotation.y));
    cameraMatrix = m4.translate(
        cameraMatrix,
        camera.translation.x,
        camera.translation.y,
        camera.translation.z);
  }

  const projectionMatrix = m4.perspective(
      fieldOfViewRadians, aspect, zNear, zFar)
  const viewProjectionMatrix = m4.multiply(
      projectionMatrix, cameraMatrix)

  let worldMatrix = m4.identity()
  const worldViewProjectionMatrix
      = m4.multiply(viewProjectionMatrix, worldMatrix);
  const worldInverseMatrix
      = m4.inverse(worldMatrix);
  const worldInverseTransposeMatrix
      = m4.transpose(worldInverseMatrix);

  gl.uniformMatrix4fv(uniformWorldViewProjection, false,
      worldViewProjectionMatrix);
  gl.uniformMatrix4fv(uniformWorldInverseTranspose, false,
      worldInverseTransposeMatrix);

  gl.uniform3fv(uniformReverseLightDirectionLocation,
      m4.normalize(lightSource));

  const $shapeList = $("#object-list")
  $shapeList.empty()
  shapes.forEach((shape, index) => {
    const $li = $(`
         <li>
            <button onclick="webglUtils.deleteShape(${index})">
            Delete
            </button>
            <label>
            <input
                 type="radio"
                 id="${shape.type}-${index}"
                 name="shape-index"
                 ${index === selectedShapeIndex ? "checked" : ""}
                 onclick="webglUtils.selectShape(${index})"
                 value="${index}"/>
             ${shape.type};
             X: ${shape.translation.x};
             Y: ${shape.translation.y}
           </label>
         </li>
       `)
    $shapeList.append($li)
  })

  shapes.forEach(shape => {
    gl.uniform4f(uniformColor,
        shape.color.red,
        shape.color.green,
        shape.color.blue, 1
    );

    let M = computeModelViewMatrix(shape, worldViewProjectionMatrix)
    gl.uniformMatrix4fv(uniformWorldViewProjection, false, M)

    if(shape.type === RECTANGLE) {
      webglUtils.renderRectangle(shape)
    } else if(shape.type === TRIANGLE) {
      webglUtils.renderTriangle(shape)
    } else if (shape.type === CUBE) {
      webglUtils.renderCube(shape)
    }

  })
}

const computeModelViewMatrix = (shape, viewProjectionMatrix) => {
  let M = m4.translate(viewProjectionMatrix,
      shape.translation.x,
      shape.translation.y,
      shape.translation.z)
  M = m4.xRotate(M, m4.degToRad(shape.rotation.x))
  M = m4.yRotate(M, m4.degToRad(shape.rotation.y))
  M = m4.zRotate(M, m4.degToRad(shape.rotation.z))
  M = m4.scale(M, shape.scale.x, shape.scale.y, shape.scale.z)
  return M
}


