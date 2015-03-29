/**
 * Created by youlongli on 3/8/15.
 */

var color = [
  'rgb(203,  27,  68)',
  'rgb(250, 214, 137)',
  'rgb(129, 199, 212)',
  'rgb(134, 193, 102)',
  'rgb(139, 129, 195)',
  'rgb(252, 250, 242)',
  'rgb( 12,  12,  12)'
];

/************************Canvas Playground************************/
var canvasPlayground = initCanvas('playground');

// For slide bar
var playgroundMatrixAdjustment = getMatrixAdjustmentObj();
slideUpdate('playground', playgroundMatrixAdjustment);

var num = 100;
var enemies = new Array(num);
var enemiesDir = new Array(num);
var enemiesDist = new Array(num);
for (var i = 0; i < num; i++) {
  enemiesDir[i] = true;
  enemiesDist[i] = [Math.floor(Math.random() * 3) + 1, Math.floor(Math.random() * 3) + 8];
  var choice = Math.floor(Math.random() * 7);
  var x = (Math.random() * 2 - 1) * 10;
  var y = (Math.random() * 2 - 1) * 10;
  var z = (Math.random() * 2 - 1) * 10;
  switch (choice) {
    case 0:
      enemies[i] = new Cube(new Vector3(x, y, z), new Vector3(.4, .4, .4));
      break;
    case 1:
      enemies[i] = new Tetrahedron(new Vector3(x, y, z), new Vector3(.4, .4, .4));
      break;
    case 2:
      enemies[i] = new Icosahedron(new Vector3(x, y, z), new Vector3(.4, .4, .4));
      break;
    case 3:
      enemies[i] = new Cylinder(new Vector3(x, y, z), 5, new Vector3(.4, .4, .4));
      break;
    case 4:
      enemies[i] = new Prism(new Vector3(x, y, z), new Vector3(.4, .4, .4));
      break;
    case 5:
      enemies[i] = new Octahedron(new Vector3(x, y, z), new Vector3(.4, .4, .4));
      break;
    default :
      enemies[i] = new Shpere(new Vector3(x, y, z), 2, new Vector3(.4, .4, .4));
      break;
  }
}

canvasPlayground.update = function (g) {
  var x = this.cursor.x, y = this.cursor.y;

  for (var i = 0; i < num; i++) {
    var mousePos = new Vector3(x, y, 0);
    mousePos.viewportReverseTransformation(this);
    mousePos.z = enemies[i].coord.z;
    mousePos.x /= playgroundMatrixAdjustment.scale;
    mousePos.y /= playgroundMatrixAdjustment.scale;
    mousePos.subtract(enemies[i].coord);

    if (mousePos.length() < enemiesDist[i][0]) {
      enemiesDir[i] = false;
    } else if (mousePos.length() > enemiesDist[i][1]) {
      enemiesDir[i] = true;
    }

    if (!enemiesDir[i]) {
      mousePos.reverse();
    }

    moveShape(enemies[i], mousePos, .05 + 0.01 * Math.floor(i % 10) + 0.5 * this.cursor.z);
  }

  // Initial the matrix
  var matrix = new Matrix();
  matrix.scale(playgroundMatrixAdjustment.scale, playgroundMatrixAdjustment.scale, playgroundMatrixAdjustment.scale);
  matrix.translate(playgroundMatrixAdjustment.translateX, playgroundMatrixAdjustment.translateY, playgroundMatrixAdjustment.translateZ);
  matrix.rotateX(playgroundMatrixAdjustment.rX);
  matrix.rotateY(playgroundMatrixAdjustment.rY);
  matrix.rotateZ(playgroundMatrixAdjustment.rZ);


  if (this.cursor.z) {
    for (var i = 0; i < num; i++) {
      var coord = new Vector3();
      matrix.transform(enemies[i].coord, coord);
      coord.viewportTransformation(this);
      g.strokeStyle = 'gray';
      g.beginPath();
      g.moveTo(this.cursor.x, this.cursor.y);
      g.lineTo(coord.x, coord.y);
      g.stroke();
    }
  }

  for (var i = 0; i < num; i++) {
    drawShape(this, matrix, enemies[i], function (vertex1, vertex2) {
      g.strokeStyle = color[i % color.length];
      g.beginPath();
      g.moveTo(vertex1.x, vertex1.y);
      g.lineTo(vertex2.x, vertex2.y);
      g.stroke();
    });
  }



  drawBoard(this, g);
};

/************************Canvas0************************/

var canvas0 = initCanvas('canvas0');

// For slide bar
var canvas0Adjustment = getMatrixAdjustmentObj();
slideUpdate('canvas0', canvas0Adjustment);

canvas0.update = function (g) {
  var x = this.cursor.x, y = this.cursor.y;

  // Initial the matrix
  var matrix = new Matrix();
  matrix.scale(canvas0Adjustment.scale, canvas0Adjustment.scale, canvas0Adjustment.scale);
  matrix.translate(canvas0Adjustment.translateX, canvas0Adjustment.translateY, canvas0Adjustment.translateZ);
  matrix.rotateX(canvas0Adjustment.rX);
  matrix.rotateY(canvas0Adjustment.rY);
  matrix.rotateZ(canvas0Adjustment.rZ);

  var num = 50;
  var icosahedron = new Array(num);
  for (var i = 0; i < num; i++) {
    var speed = this.cursor.z ? 0 : 1;
    icosahedron[i] = new Icosahedron(new Vector3(Math.cos(time * speed + i), Math.sin(time * speed + i), 0));
  }

  g.strokeStyle = this.cursor.z ? color[0] : color[2];

  for (var i = 0; i < num; i++) {
    drawShape(this, matrix, icosahedron[i], function (vertexPixel1, vertexPixel2) {

      g.beginPath();
      g.moveTo(vertexPixel1.x, vertexPixel1.y);
      g.lineTo(vertexPixel2.x, vertexPixel2.y);
      g.stroke();
    });
  }

  drawBoard(this, g);
};

/************************Canvas1************************/
var canvas1 = initCanvas('canvas1');

// For slide bar
var canvas1Adjustment = getMatrixAdjustmentObj();
slideUpdate('canvas1', canvas1Adjustment);

canvas1.update = function (g) {
  var x = this.cursor.x, y = this.cursor.y;

  var matrix = new Matrix();
  matrix.scale(canvas1Adjustment.scale, canvas1Adjustment.scale, canvas1Adjustment.scale);
  matrix.translate(canvas1Adjustment.translateX, canvas1Adjustment.translateY, canvas1Adjustment.translateZ);
  matrix.rotateX(canvas1Adjustment.rX);
  matrix.rotateY(canvas1Adjustment.rY);
  matrix.rotateZ(canvas1Adjustment.rZ);

  var shapes = [
    new Cube(new Vector3(0, 0, 0)),
    new Tetrahedron(new Vector3(-4, -4, 0)),
    new Prism(new Vector3( 4, -4, 0)),
    new Octahedron(new Vector3( -4, 4, 0)),
    new Icosahedron(new Vector3( 4, 4, 0))
  ];

  g.fillStyle = this.cursor.z ? 'red' : 'rgb(255,255,128)';

  for (var index in shapes) {
    drawShape(this, matrix, shapes[index], function (vertexPixel1, vertexPixel2) {
      g.beginPath();
      g.moveTo(vertexPixel1.x, vertexPixel1.y);
      g.lineTo(vertexPixel2.x, vertexPixel2.y);
      g.stroke();
    });
  }

  drawBoard(this, g);
};

/************************Canvas2************************/
var canvas2 = initCanvas('canvas2');

// For slide bar
var canvas2Adjustment = getMatrixAdjustmentObj();
slideUpdate('canvas2', canvas2Adjustment);

canvas2.update = function (g) {
  var x = this.cursor.x, y = this.cursor.y;

  var matrix = new Matrix();
  matrix.scale(canvas2Adjustment.scale, canvas2Adjustment.scale, canvas2Adjustment.scale);
  matrix.translate(canvas2Adjustment.translateX, canvas2Adjustment.translateY, canvas2Adjustment.translateZ);
  matrix.rotateX(canvas2Adjustment.rX);
  matrix.rotateY(canvas2Adjustment.rY);
  matrix.rotateZ(canvas2Adjustment.rZ);

  var cylinder = new Cylinder(new Vector3(0, 0, 0), canvas2Adjustment.x1 + 1);

  g.fillStyle = this.cursor.z ? 'red' : 'rgb(255,255,128)';

  drawShape(this, matrix, cylinder, function (vertexPixel1, vertexPixel2) {
    g.beginPath();
    g.moveTo(vertexPixel1.x, vertexPixel1.y);
    g.lineTo(vertexPixel2.x, vertexPixel2.y);
    g.stroke();
  });

  drawBoard(this, g);
};

/************************Canvas3************************/
var canvas3 = initCanvas('canvas3');

// For slide bar
var canvas3Adjustment = getMatrixAdjustmentObj();
slideUpdate('canvas3', canvas3Adjustment);

canvas3.update = function (g) {
  var x = this.cursor.x, y = this.cursor.y;

  var matrix = new Matrix();
  matrix.scale(canvas3Adjustment.scale, canvas3Adjustment.scale, canvas3Adjustment.scale);
  matrix.translate(canvas3Adjustment.translateX, canvas3Adjustment.translateY, canvas3Adjustment.translateZ);
  matrix.rotateX(canvas3Adjustment.rX);
  matrix.rotateY(canvas3Adjustment.rY);
  matrix.rotateZ(canvas3Adjustment.rZ);

  var sphere = new Shpere(new Vector3(0, 0, 0), canvas3Adjustment.x1);
  //var sphere = new Shpere(new Vector3(0, 0, 0), canvas3Adjustment.x1);

  g.fillStyle = this.cursor.z ? 'red' : 'rgb(255,255,128)';

  drawShape(this, matrix, sphere, function (vertexPixel1, vertexPixel2) {
    g.beginPath();
    g.moveTo(vertexPixel1.x, vertexPixel1.y);
    g.lineTo(vertexPixel2.x, vertexPixel2.y);
    g.stroke();
  });

  drawBoard(this, g);
};

/************************Sliders For Canvas Playground************************/
$('#playground-scale').noUiSlider({
  start: [0.1],
  step: 0.01,
  range: {
    'min': [0.1],
    'max': [0.3]
  }
});

$('#playground-scale').on('slide', function () {
  playgroundMatrixAdjustment.scale = parseFloat($("#playground-scale").val());
});

$('#playground-translateX').noUiSlider({
  start: [0.0],
  step: 0.01,
  range: {
    'min': [0.0],
    'max': [1.0]
  }
});

$('#playground-translateX').on('slide', function () {
  playgroundMatrixAdjustment.translateX = parseFloat($("#playground-translateX").val());
});

$('#playground-translateY').noUiSlider({
  start: [0.0],
  step: 0.01,
  range: {
    'min': [0.0],
    'max': [1.0]
  }
});

$('#playground-translateY').on('slide', function () {
  playgroundMatrixAdjustment.translateY = parseFloat($("#playground-translateY").val());
});

$('#playground-translateZ').noUiSlider({
  start: [0.0],
  step: 0.01,
  range: {
    'min': [0.0],
    'max': [1.0]
  }
});

$('#playground-translateZ').on('slide', function () {
  playgroundMatrixAdjustment.translateZ = parseFloat($("#playground-translateZ").val());
});

$('#playground-rotateX').noUiSlider({
  start: [0.0],
  step: 1,
  range: {
    'min': [0.0],
    'max': [180.0]
  }
});

$('#playground-rotateX').on('slide', function () {
  playgroundMatrixAdjustment.rX = parseFloat($("#playground-rotateX").val());
});

$('#playground-rotateY').noUiSlider({
  start: [0.0],
  step: 1,
  range: {
    'min': [0.0],
    'max': [180.0]
  }
});

$('#playground-rotateY').on('slide', function () {
  playgroundMatrixAdjustment.rY = parseFloat($("#playground-rotateY").val());
});

$('#playground-rotateZ').noUiSlider({
  start: [0.0],
  step: 1,
  range: {
    'min': [0.0],
    'max': [180.0]
  }
});

$('#playground-rotateZ').on('slide', function () {
  playgroundMatrixAdjustment.rZ = parseFloat($("#playground-rotateZ").val());
});

/************************Sliders For Canvas0************************/
$('#canvas0-scale').noUiSlider({
  start: [0.1],
  step: 0.01,
  range: {
    'min': [0.1],
    'max': [0.3]
  }
});

$('#canvas0-scale').on('slide', function () {
  canvas0Adjustment.scale = parseFloat($("#canvas0-scale").val());
});

$('#canvas0-translateX').noUiSlider({
  start: [0.0],
  step: 0.01,
  range: {
    'min': [0.0],
    'max': [1.0]
  }
});

$('#canvas0-translateX').on('slide', function () {
  canvas0Adjustment.translateX = parseFloat($("#canvas0-translateX").val());
});

$('#canvas0-translateY').noUiSlider({
  start: [0.0],
  step: 0.01,
  range: {
    'min': [0.0],
    'max': [1.0]
  }
});

$('#canvas0-translateY').on('slide', function () {
  canvas0Adjustment.translateY = parseFloat($("#canvas0-translateY").val());
});

$('#canvas0-translateZ').noUiSlider({
  start: [0.0],
  step: 0.01,
  range: {
    'min': [0.0],
    'max': [1.0]
  }
});

$('#canvas0-translateZ').on('slide', function () {
  canvas0Adjustment.translateZ = parseFloat($("#canvas0-translateZ").val());
});

$('#canvas0-rotateX').noUiSlider({
  start: [0.0],
  step: 1,
  range: {
    'min': [0.0],
    'max': [180.0]
  }
});

$('#canvas0-rotateX').on('slide', function () {
  canvas0Adjustment.rX = parseFloat($("#canvas0-rotateX").val());
});

$('#canvas0-rotateY').noUiSlider({
  start: [0.0],
  step: 1,
  range: {
    'min': [0.0],
    'max': [180.0]
  }
});

$('#canvas0-rotateY').on('slide', function () {
  canvas0Adjustment.rY = parseFloat($("#canvas0-rotateY").val());
});

$('#canvas0-rotateZ').noUiSlider({
  start: [0.0],
  step: 1,
  range: {
    'min': [0.0],
    'max': [180.0]
  }
});

$('#canvas0-rotateZ').on('slide', function () {
  canvas0Adjustment.rZ = parseFloat($("#canvas0-rotateZ").val());
});

/************************Sliders For Canvas1************************/
$('#canvas1-scale').noUiSlider({
  start: [0.1],
  step: 0.01,
  range: {
    'min': [0.1],
    'max': [0.3]
  }
});

$('#canvas1-scale').on('slide', function () {
  canvas1Adjustment.scale = parseFloat($("#canvas1-scale").val());
});

$('#canvas1-translateX').noUiSlider({
  start: [0.0],
  step: 0.01,
  range: {
    'min': [0.0],
    'max': [1.0]
  }
});

$('#canvas1-translateX').on('slide', function () {
  canvas1Adjustment.translateX = parseFloat($("#canvas1-translateX").val());
});

$('#canvas1-translateY').noUiSlider({
  start: [0.0],
  step: 0.01,
  range: {
    'min': [0.0],
    'max': [1.0]
  }
});

$('#canvas1-translateY').on('slide', function () {
  canvas1Adjustment.translateY = parseFloat($("#canvas1-translateY").val());
});

$('#canvas1-translateZ').noUiSlider({
  start: [0.0],
  step: 0.01,
  range: {
    'min': [0.0],
    'max': [1.0]
  }
});

$('#canvas1-translateZ').on('slide', function () {
  canvas1Adjustment.translateZ = parseFloat($("#canvas1-translateZ").val());
});

$('#canvas1-rotateX').noUiSlider({
  start: [0.0],
  step: 1,
  range: {
    'min': [0.0],
    'max': [180.0]
  }
});

$('#canvas1-rotateX').on('slide', function () {
  canvas1Adjustment.rX = parseFloat($("#canvas1-rotateX").val());
});

$('#canvas1-rotateY').noUiSlider({
  start: [0.0],
  step: 1,
  range: {
    'min': [0.0],
    'max': [180.0]
  }
});

$('#canvas1-rotateY').on('slide', function () {
  canvas1Adjustment.rY = parseFloat($("#canvas1-rotateY").val());
});

$('#canvas1-rotateZ').noUiSlider({
  start: [0.0],
  step: 1,
  range: {
    'min': [0.0],
    'max': [180.0]
  }
});

$('#canvas1-rotateZ').on('slide', function () {
  canvas1Adjustment.rZ = parseFloat($("#canvas1-rotateZ").val());
});

/************************Sliders For Canvas0************************/
$('#canvas2-scale').noUiSlider({
  start: [0.1],
  step: 0.01,
  range: {
    'min': [0.1],
    'max': [0.3]
  }
});

$('#canvas2-scale').on('slide', function () {
  canvas2Adjustment.scale = parseFloat($("#canvas2-scale").val());
});

$('#canvas2-translateX').noUiSlider({
  start: [0.0],
  step: 0.01,
  range: {
    'min': [0.0],
    'max': [1.0]
  }
});

$('#canvas2-translateX').on('slide', function () {
  canvas2Adjustment.translateX = parseFloat($("#canvas2-translateX").val());
});

$('#canvas2-translateY').noUiSlider({
  start: [0.0],
  step: 0.01,
  range: {
    'min': [0.0],
    'max': [1.0]
  }
});

$('#canvas2-translateY').on('slide', function () {
  canvas2Adjustment.translateY = parseFloat($("#canvas2-translateY").val());
});

$('#canvas2-translateZ').noUiSlider({
  start: [0.0],
  step: 0.01,
  range: {
    'min': [0.0],
    'max': [1.0]
  }
});

$('#canvas2-translateZ').on('slide', function () {
  canvas2Adjustment.translateZ = parseFloat($("#canvas2-translateZ").val());
});

$('#canvas2-rotateX').noUiSlider({
  start: [0.0],
  step: 1,
  range: {
    'min': [0.0],
    'max': [180.0]
  }
});

$('#canvas2-rotateX').on('slide', function () {
  canvas2Adjustment.rX = parseFloat($("#canvas2-rotateX").val());
});

$('#canvas2-rotateY').noUiSlider({
  start: [0.0],
  step: 1,
  range: {
    'min': [0.0],
    'max': [180.0]
  }
});

$('#canvas2-rotateY').on('slide', function () {
  canvas2Adjustment.rY = parseFloat($("#canvas2-rotateY").val());
});

$('#canvas2-rotateZ').noUiSlider({
  start: [0.0],
  step: 1,
  range: {
    'min': [0.0],
    'max': [180.0]
  }
});

$('#canvas2-rotateZ').on('slide', function () {
  canvas2Adjustment.rZ = parseFloat($("#canvas2-rotateZ").val());
});

$('#canvas2-smooth').noUiSlider({
  start: [0.0],
  step: 1,
  range: {
    'min': [0.0],
    'max': [16]
  }
});

$('#canvas2-smooth').on('slide', function () {
  canvas2Adjustment.x1 = parseFloat($("#canvas2-smooth").val());
});

/************************Sliders For Canvas0************************/
$('#canvas3-scale').noUiSlider({
  start: [0.1],
  step: 0.01,
  range: {
    'min': [0.1],
    'max': [0.3]
  }
});

$('#canvas3-scale').on('slide', function () {
  canvas3Adjustment.scale = parseFloat($("#canvas3-scale").val());
});

$('#canvas3-translateX').noUiSlider({
  start: [0.0],
  step: 0.01,
  range: {
    'min': [0.0],
    'max': [1.0]
  }
});

$('#canvas3-translateX').on('slide', function () {
  canvas3Adjustment.translateX = parseFloat($("#canvas3-translateX").val());
});

$('#canvas3-translateY').noUiSlider({
  start: [0.0],
  step: 0.01,
  range: {
    'min': [0.0],
    'max': [1.0]
  }
});

$('#canvas3-translateY').on('slide', function () {
  canvas3Adjustment.translateY = parseFloat($("#canvas3-translateY").val());
});

$('#canvas3-translateZ').noUiSlider({
  start: [0.0],
  step: 0.01,
  range: {
    'min': [0.0],
    'max': [1.0]
  }
});

$('#canvas3-translateZ').on('slide', function () {
  canvas3Adjustment.translateZ = parseFloat($("#canvas3-translateZ").val());
});

$('#canvas3-rotateX').noUiSlider({
  start: [0.0],
  step: 1,
  range: {
    'min': [0.0],
    'max': [180.0]
  }
});

$('#canvas3-rotateX').on('slide', function () {
  canvas3Adjustment.rX = parseFloat($("#canvas3-rotateX").val());
});

$('#canvas3-rotateY').noUiSlider({
  start: [0.0],
  step: 1,
  range: {
    'min': [0.0],
    'max': [180.0]
  }
});

$('#canvas3-rotateY').on('slide', function () {
  canvas3Adjustment.rY = parseFloat($("#canvas3-rotateY").val());
});

$('#canvas3-rotateZ').noUiSlider({
  start: [0.0],
  step: 1,
  range: {
    'min': [0.0],
    'max': [180.0]
  }
});

$('#canvas3-rotateZ').on('slide', function () {
  canvas3Adjustment.rY = parseFloat($("#canvas3-rotateY").val());
});

$('#canvas3-smooth').noUiSlider({
  start: [0.0],
  step: 1,
  range: {
    'min': [0.0],
    'max': [16]
  }
});

$('#canvas3-smooth').on('slide', function () {
  canvas3Adjustment.x1 = parseFloat($("#canvas3-smooth").val());
});