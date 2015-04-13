/**
 * Created by youlongli on 4/12/15.
 */

/*********************************Support code*********************************/

window.time = 0;
window.SimpleScene = function () {
    this.init = function (name) {
        this.scene = new THREE.Scene();

        // CREATE THE CAMERA, AND ATTACH IT TO THE SCENE.

        var camera = new THREE.PerspectiveCamera(50, 16/9, 1, 10000);
        camera.position.z = 2500;
        this.scene.add(camera);

        // CREATE THE WEBGL RENDERER, AND ATTACH IT TO THE DOCUMENT BODY.

        var renderer = new THREE.WebGLRenderer({alpha: true});
        renderer.setSize(1200, 675);
        document.getElementById(name).appendChild(renderer.domElement);

        // CALL THE USER'S SETUP FUNCTION JUST ONCE.

        this.setup();

        // START THE ANIMATION LOOP.

        var that = this;
        (function tick() {
            time = (new Date().getTime()) / 1000;
            that.update();
            renderer.render(that.scene, camera);
            requestAnimationFrame(tick);
        })();
    }
};

/**********************************Playground**********************************/
var geometry = new THREE.BufferGeometry();
var particleSystem;
var geometryArray;
var count = 0;
var depth = 500;
var speed = 1;
var pattern = 1;
var rotateX = 0;
var rotateY = 0;
var rotateZ = 0;
var scale = 1;

function SceneT() {
    this.setup = function () {
        var light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1, 1, 1).normalize();
        this.scene.add(light);

        var row = 270;
        var col = 480;
        //var n = 250;
        var particles = row * col;
        var positions = new Float32Array(particles * 3);
        var colors = new Float32Array(particles * 3);
        var color = new THREE.Color();

        var radiusX = 1600;
        var radiusY = 900;
        //var radius = 1000;
        var interval = 2 * radiusX / col;

        for (var i = 0; i < positions.length; i += 3) {
            // positions
            var iRow = Math.floor(Math.floor(i / 3) / col);
            var iCol = Math.floor(Math.floor(i / 3) % col);
            var x = iCol * interval - radiusX;
            var y = iRow * interval - radiusY;
            var z = 1;
            positions[i] = x;
            positions[i + 1] = y;
            positions[i + 2] = z;

            // colors
            var vx = ( x / radiusX ) + 0.5;
            var vy = ( y / radiusX ) + 0.5;
            var vz = ( z / radiusX ) + 0.5;
            color.setRGB(vx, vy, vz);
            colors[i] = color.r;
            colors[i + 1] = color.g;
            colors[i + 2] = color.b;
        }

        geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometryArray = JSON.parse(JSON.stringify(geometry.attributes.position.array));

        //
        var material = new THREE.PointCloudMaterial({
            size: 15,
            vertexColors: THREE.VertexColors
        });

        particleSystem = new THREE.PointCloud(geometry, material);
        //particleSystem.rotation.x = -10;
        this.scene.add(particleSystem);
    };

    this.update = function () {
        var p = particleSystem.geometry.attributes.position.array;
        particleSystem.geometry.attributes.position.needsUpdate = true;

        count++;
        if (count % 100000) {
            depth = parseFloat($('#depth').val());
            speed = parseFloat($('#speed').val());
            pattern = parseFloat($('#pattern').val());
            rotateX = parseFloat($('#rotate-x').val());
            rotateY = parseFloat($('#rotate-y').val());
            rotateZ = parseFloat($('#rotate-z').val());
            scale = parseFloat($('#scale').val());
            count = 0;
        }

        for (var i = 0; i < p.length; i += 3) {
            var dst = Math.sqrt(Math.pow(p[i], 2) + Math.pow(p[i + 1], 2));

            p[i + 2] = geometryArray[i + 2] * depth * Math.sin(speed * time + pattern * dst);
        }

        particleSystem.rotation.x = rotateX;
        particleSystem.rotation.y = rotateY;
        particleSystem.rotation.z = rotateZ;
        particleSystem.scale.set(scale, scale, scale);
    }
}
SceneT.prototype = new SimpleScene;
new SceneT().init('scene1');



$('#depth').noUiSlider({
    start: [500],
    step: 10,
    range: {
        'min': [10],
        'max': [1000]
    }
});

$('#speed').noUiSlider({
    start: [1],
    step: 0.1,
    range: {
        'min': [0.1],
        'max': [10.0]
    }
});

$('#pattern').noUiSlider({
    start: [1],
    step: 0.05,
    range: {
        'min': [0.05],
        'max': [3.00]
    }
});

$('#rotate-x').noUiSlider({
    start: [0],
    step: 0.01,
    range: {
        'min': [-Math.PI],
        'max': [Math.PI]
    }
});

$('#rotate-y').noUiSlider({
    start: [0],
    step: 0.01,
    range: {
        'min': [-Math.PI],
        'max': [Math.PI]
    }
});

$('#rotate-z').noUiSlider({
    start: [0],
    step: 0.01,
    range: {
        'min': [-Math.PI],
        'max': [Math.PI]
    }
});

$('#scale').noUiSlider({
    start: [1],
    step: 0.1,
    range: {
        'min': [.1],
        'max': [6]
    }
});