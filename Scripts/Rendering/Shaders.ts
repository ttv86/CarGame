export const vertexData: string = `#version 300 es

in vec2 textureCoord;
in vec3 vertexPosition;

uniform mat4 worldMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;

// These are sent to pixel shader
out vec2 vTextureCoord;

void main(void) {
    gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);
    vTextureCoord = textureCoord;
}`;

export const fragmentData: string = `#version 300 es

precision highp float;

uniform sampler2D sampler;
uniform bool useAlpha;

// There are coming from vertex shader
in vec2 vTextureCoord;

out vec4 color;

void main(void) {
	vec4 texColor = texture(sampler, vec2(vTextureCoord.s, vTextureCoord.t));
    if (texColor.a < 1.0) {
        if (useAlpha) {
            discard;
        } else {
            texColor = vec4(0.0,0.0,0.0,1.0);
        }
    }

    color = texColor;
}`;