/**
 * CYLINDER DEFINITION
 *
 * Resolution is the number of faces used to tessellate the cylinder.
 * Cylinder is defined to be centered at the origin of the coordinate axis, and lying on the XZ plane.
 * Cylinder height is assumed to be 2.0. Cylinder radius is assumed to be 1.0 .
 */
export function Cylinder (resolution) {

    let i;
    this.name = "cylinder";

    // vertices definition
    ////////////////////////////////////////////////////////////

    this.vertices = new Float32Array(3*(2*resolution+2));

    const radius = 1.0;
    let angle;
    const step = 6.283185307179586476925286766559 / resolution;

    // lower circle
    let vertexOffset = 0;
    for (i = 0; i < resolution; i++) {

        angle = step * i;

        this.vertices[vertexOffset] = radius * Math.cos(angle);
        this.vertices[vertexOffset+1] = 0.0;
        this.vertices[vertexOffset+2] = radius * Math.sin(angle);
        vertexOffset += 3;
    }

    // upper circle
    for (i = 0; i < resolution; i++) {

        angle = step * i;

        this.vertices[vertexOffset] = radius * Math.cos(angle);
        this.vertices[vertexOffset+1] = 2.0;
        this.vertices[vertexOffset+2] = radius * Math.sin(angle);
        vertexOffset += 3;
    }

    this.vertices[vertexOffset] = 0.0;
    this.vertices[vertexOffset+1] = 0.0;
    this.vertices[vertexOffset+2] = 0.0;
    vertexOffset += 3;

    this.vertices[vertexOffset] = 0.0;
    this.vertices[vertexOffset+1] = 2.0;
    this.vertices[vertexOffset+2] = 0.0;


    // triangles definition
    ////////////////////////////////////////////////////////////

    this.triangleIndices = new Uint16Array(3*4*resolution);

    // lateral surface
    let triangleoffset = 0;
    for (i = 0; i < resolution; i++)
    {
        this.triangleIndices[triangleoffset] = i;
        this.triangleIndices[triangleoffset+1] = (i+1) % resolution;
        this.triangleIndices[triangleoffset+2] = (i % resolution) + resolution;
        triangleoffset += 3;

        this.triangleIndices[triangleoffset] = (i % resolution) + resolution;
        this.triangleIndices[triangleoffset+1] = (i+1) % resolution;
        this.triangleIndices[triangleoffset+2] = ((i+1) % resolution) + resolution;
        triangleoffset += 3;
    }

    // bottom of the cylinder
    for (i = 0; i < resolution; i++)
    {
        this.triangleIndices[triangleoffset] = i;
        this.triangleIndices[triangleoffset+1] = (i+1) % resolution;
        this.triangleIndices[triangleoffset+2] = 2*resolution;
        triangleoffset += 3;
    }

    // top of the cylinder
    for (i = 0; i < resolution; i++)
    {
        this.triangleIndices[triangleoffset] = resolution + i;
        this.triangleIndices[triangleoffset+1] = ((i+1) % resolution) + resolution;
        this.triangleIndices[triangleoffset+2] = 2*resolution+1;
        triangleoffset += 3;
    }

    this.numVertices = this.vertices.length/3;
    this.numTriangles = this.triangleIndices.length/3;
}
