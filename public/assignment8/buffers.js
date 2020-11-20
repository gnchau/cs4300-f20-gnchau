
const initializeBuffers = (gl) => {
    const positionBuffer = initializePositionBuffer(gl);
    const textureCoordBuffer = initializeTextureBuffer(gl);
    const indexBuffer = initializeIndexBuffer(gl);

    return {
        position: positionBuffer,
        textureCoord: textureCoordBuffer,
        indices: indexBuffer,
    };
}

const initializePositionBuffer = (gl) => {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
        -1.0, -1.0,  1.0,   1.0, -1.0,  1.0,    1.0,  1.0,  1.0,   -1.0,  1.0,  1.0,        // front face
        -1.0, -1.0, -1.0,   -1.0,  1.0, -1.0,    1.0,  1.0, -1.0,    1.0, -1.0, -1.0,       // back face
        -1.0,  1.0, -1.0,   -1.0,  1.0,  1.0,    1.0,  1.0,  1.0,    1.0,  1.0, -1.0,       // top face
        -1.0, -1.0, -1.0,    1.0, -1.0, -1.0,    1.0, -1.0,  1.0,   -1.0, -1.0,  1.0,       // bottom face
        1.0, -1.0, -1.0,    1.0,  1.0, -1.0,    1.0,  1.0,  1.0,    1.0, -1.0,  1.0,        // right face
        -1.0, -1.0, -1.0,   -1.0, -1.0,  1.0,   -1.0,  1.0,  1.0,   -1.0,  1.0, -1.0,       // left face
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    return positionBuffer;
}

// buffer full of colors for each vertex
const initializeColorBuffer = (gl) => {
    const faceColors = [
        [1.0,  1.0,  1.0,  1.0],        // front face: white
        [1.0,  0.0,  0.0,  1.0],        // back face: red
        [0.0,  1.0,  0.0,  1.0],        // top face: green
        [0.0,  0.0,  1.0,  1.0],        // bottom face: blue
        [1.0,  1.0,  0.0,  1.0],        // right face: yellow
        [1.0,  0.0,  1.0,  1.0],        // left face: purple
    ];

    let colors = [];                    // convert array into table for all vertices

    for (let j = 0; j < faceColors.length; ++j) {
        const c = faceColors[j];
        colors = colors.concat(c, c, c, c);
    }

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,
                  new Float32Array(colors), gl.STATIC_DRAW);

    return colorBuffer;
}

// Create indices that refer the vertices and read from a buffer of indices that references the
// vertices. More efficient
const initializeIndexBuffer = (gl) => {
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    const indices = [
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23,   // left
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return indexBuffer
}

// Defines a texture coordinate for each vertex
function initializeTextureBuffer(gl) {
    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

    const textureCoordinates = [
        0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
        0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
        0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
        0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
        0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
        0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
    ];

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(textureCoordinates),
        gl.STATIC_DRAW);

    return textureCoordBuffer;

}

