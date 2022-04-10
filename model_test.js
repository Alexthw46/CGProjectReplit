import * as cubes from './common/shapes/cube.js';
import * as cylinders from './common/shapes/cylinder.js';
import simpleShaders from "./simple_shader.js";
import {create, mul, fromRotation, fromScaling, fromTranslation} from "./CGCarProject/common/libs/gl-matrix/src/mat4.js";

let angle = 0.0;
let angleZ = 0.0;
let angleY = 0.0;
let gl;
let canvas;
let id;

window.onload = helloRotations;

function helloRotations(){
    setup();
    id = setInterval(draw, 20);
}

function createObjectBuffers(gl, obj) {
    obj.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, obj.vertices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    obj.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, obj.triangleIndices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

}

let cube;
let cylinder;

function setupWhatToDraw() {
    cube = new cubes.Cube();
    createObjectBuffers(gl,cube);

    cylinder = new cylinders.Cylinder(15);
    createObjectBuffers(gl,cylinder);
}

function drawObject(gl, obj, fillColor) {
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
    gl.enableVertexAttribArray(simpleShader.aPositionIndex);
    gl.vertexAttribPointer(simpleShader.aPositionIndex, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBuffer);
    gl.uniform3fv(simpleShader.uColorLocation, fillColor);
    gl.drawElements(gl.TRIANGLES, obj.triangleIndices.length, gl.UNSIGNED_SHORT, 0);

    gl.disableVertexAttribArray(simpleShader.aPositionIndex);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

let simpleShader;
function setupHowToDraw(gl) {
    simpleShader = new simpleShaders(gl);
}

let wheelColor = [0.1,0.1,0.1];

function draw(){

    //angle += 0.005;

    gl.clearColor(0.8,0.8,0.8,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT,gl.DEPTH_BUFFER_BIT);

    // init the view transform
    let view_transform = glMatrix.mat4.create();
    glMatrix.mat4.lookAt(view_transform,[0.0,2.0,10.0],[0.0,0.0,0.0],[0,1,0]);

    // init the projection transform
    let projection_transform = glMatrix.mat4.create();
    glMatrix.mat4.perspective(projection_transform, 3.14/4.0, 1.0, 0.001, 15.0);

    // rotation around Y
    let rotate_transform = glMatrix.mat4.create();
    glMatrix.mat4.fromRotation(rotate_transform,angle,[0,1,0]);
    let rotate_transformV = glMatrix.mat4.create();
    glMatrix.mat4.fromRotation(rotate_transformV,angleY,[1,0,0]);
    mul(rotate_transform,rotate_transform,rotate_transformV);

    gl.useProgram(simpleShader);
    gl.uniformMatrix4fv(simpleShader.uProjectionMatrixLocation,false,projection_transform);
    gl.uniformMatrix4fv(simpleShader.uViewMatrixLocation,false,view_transform);
    gl.uniformMatrix4fv(simpleShader.uRotationMatrixLocation,false,rotate_transform);

    let scale_matrix = glMatrix.mat4.fromScaling(glMatrix.mat4.create(),[0.1,0.1,0.1]);

    let translate_matrix = glMatrix.mat4.create();
    let axis_matrix

    //ignore, axis setup
    for(let i=0; i < 3; ++i){
        axis_matrix = glMatrix.mat4.create();
        const color_translate = [0.0, 0.0, 0.0];
        const scaling = [0.01, 0.01, 0.01];
        color_translate[i] = 1.0;
        scaling[i] = 2;
        glMatrix.mat4.fromScaling(scale_matrix,scaling);
        glMatrix.mat4.fromTranslation(translate_matrix,color_translate);
        glMatrix.mat4.mul(axis_matrix,translate_matrix,scale_matrix);
        gl.uniformMatrix4fv(simpleShader.uM,false,axis_matrix);
        drawObject(gl,cube,color_translate);
    }

    //car hull

    gl.uniformMatrix4fv(simpleShader.uM,false, carMatrix());
    drawObject(gl,cube,[0.5,0.6,0.7]);
    gl.uniformMatrix4fv(simpleShader.uM,false, carMatrixB());
    drawObject(gl,cube,[0.5,0.6,0.7]);

    //wheels
    gl.uniformMatrix4fv(simpleShader.uM,false, wheelMatrix([1,0,1],-1));
    drawObject(gl,cylinder, wheelColor);

    gl.uniformMatrix4fv(simpleShader.uM,false, wheelMatrix([1,0,-1],1));
    drawObject(gl,cylinder, wheelColor);

    gl.uniformMatrix4fv(simpleShader.uM,false, wheelMatrix([-1,0,1],-1));
    drawObject(gl,cylinder, wheelColor);

    gl.uniformMatrix4fv(simpleShader.uM,false, wheelMatrix([-1,0,-1],1));
    drawObject(gl,cylinder, wheelColor);

    // ---------------------------------------------------------------------------
}

function wheelMatrix(tVec, rot){

    let matrixRot = fromRotation(create(), rot * 1.55, [1,0,0]);
    let matrixScale = fromScaling(create(),[0.5, 0.2, 0.5]);
    let matrixTran = fromTranslation(create(), tVec);
    let matrixWheel = fromRotation(create(), rot * angleZ, [0,1,0]);

    mul(matrixRot, matrixTran, matrixRot);
    mul(matrixWheel, matrixRot, matrixWheel);

    return mul(matrixWheel, matrixWheel, matrixScale);
}

function carMatrix(){

    let matrixScale = fromScaling(create(),[1.4, 0.4, 0.6]);
    let matrixTran = fromTranslation(create(), [0,0.5,0]);

    return mul(matrixTran,matrixTran,matrixScale);
}

function carMatrixB(){

    let matrixScale = fromScaling(create(),[0.6, 0.5, 0.6]);
    let matrixTran = fromTranslation(create(), [0,1.0,0]);

    return mul(matrixTran,matrixTran,matrixScale);
}

function setup(){
    canvas = document.getElementById("OUTPUT-CANVAS");
    gl = canvas.getContext('webgl');
    window.addEventListener("keydown", on_keydown,false);
    window.addEventListener("keyup", on_keyup,false);
    gl.enable(gl.DEPTH_TEST);
    setupWhatToDraw(gl);
    setupHowToDraw(gl);
}


function on_keyup(e){

}

function on_keydown(e){
    switch (e.key) {
        case 'ArrowRight':
            angle += 0.1;
            break;
        case 'ArrowUp':
            angleY += 0.1;
            break;
        case 'ArrowDown':
            angleY -= 0.1;
            break;
        case ' ':
            angleZ -= 0.1;
            break;
        default:
            angle -= 0.1;
            break;
    }
}