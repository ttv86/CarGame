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
uniform bool useSolidColor;
uniform vec3 solidColor;

// There are coming from vertex shader
in vec2 vTextureCoord;

out vec4 color;

void main(void) {
    if (useSolidColor) {
        color = vec4(solidColor,1.0);
    } else {
        vec4 texColor = texture(sampler, vec2(vTextureCoord.s, vTextureCoord.t));
        if (texColor.a < 0.5) {
            if (useAlpha) {
                discard;
            } else {
                texColor = vec4(texColor.rgb,1.0);
            }
        }

        color = texColor;
    }
}`;