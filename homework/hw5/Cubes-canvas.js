/**
 * Created by youlongli on 3/11/15.
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

/************************Canvas Matrix************************/
var canvasCubes = initCanvas('cubes');

// For slide bar
var playgroundCubesAdjustment = getMatrixAdjustmentObj();
slideUpdate('cubes', playgroundCubesAdjustment);
playgroundCubesAdjustment.scale = 0.04;
playgroundCubesAdjustment.rX = 16;
playgroundCubesAdjustment.rY = 16;

var num = 343;
var unit = 7;

var phase = {
  currentPhase: 1
};

var cubes = new Array(num);
var cubesPhase1 = new Array(num);
var cubesPhase2 = new Array(num);
var cubesPhase3 = new Array(num);
var cubesPhase4 = new Array(num);
var cubesPhase5 = new Array(num);
var cubesPhase6 = new Array(num);

var getIndex = function(row, col, level) {
  return col + row * unit + level * Math.pow(unit, 2);
};

var getCoord = function(index) {
  var level = index / Math.pow(unit, 2);
  index -= level * Math.pow(unit, 2);
  var row = index / unit;
  index -= level * unit;
  var col = index;
  return {
    row: row,
    col: col,
    level: level
  }
};

/************************Phase one: line************************/
for (var i = 0; i < unit; i++) {
  for (var j = 0; j < unit; j++) {
    for (var k = 0; k < unit; k++) {
      var index = getIndex(i, j, k);
      var diffCol = j - Math.floor(unit / 2);
      cubesPhase1[index] = new Vector3(diffCol * 2, 0, 0);
    }
  }
}

/************************Phase two: plane************************/
for (var i = 0; i < unit; i++) {
  for (var j = 0; j < unit; j++) {
    for (var k = 0; k < unit; k++) {
      var index = getIndex(i, j, k);
      var diffCol = j - Math.floor(unit / 2);
      var diffRow = i - Math.floor(unit / 2);
      cubesPhase2[index] = new Vector3(diffCol * 2, diffRow * 2, 0);
    }
  }
}

/************************Phase three: matrix************************/
for (var i = 0; i < unit; i++) {
  for (var j = 0; j < unit; j++) {
    for (var k = 0; k < unit; k++) {
      var index = getIndex(i, j, k);
      var diffCol = j - Math.floor(unit / 2);
      var diffRow = i - Math.floor(unit / 2);
      var diffLevel = k - Math.floor(unit / 2);
      cubesPhase3[index] = new Vector3(diffCol * 2, diffRow * 2, diffLevel * 2);
    }
  }
}

/************************Phase four: explode************************/
for (var i = 0; i < unit; i++) {
  for (var j = 0; j < unit; j++) {
    for (var k = 0; k < unit; k++) {
      var index = getIndex(i, j, k);
      var diffCol = j - Math.floor(unit / 2);
      var diffRow = i - Math.floor(unit / 2);
      var diffLevel = k - Math.floor(unit / 2);
      cubesPhase4[index] = new Vector3(diffCol * 3, diffRow * 3, diffLevel * 3);
    }
  }
}

/************************Phase five: huge explode************************/
for (var i = 0; i < unit; i++) {
  for (var j = 0; j < unit; j++) {
    for (var k = 0; k < unit; k++) {
      var index = getIndex(i, j, k);
      var diffCol = j - Math.floor(unit / 2);
      var diffRow = i - Math.floor(unit / 2);
      var diffLevel = k - Math.floor(unit / 2);
      cubesPhase5[index] = new Vector3(diffCol * 6, diffRow * 6, diffLevel * 6);
    }
  }
}

/************************Phase Six: recover************************/
for (var i = 0; i < unit; i++) {
  for (var j = 0; j < unit; j++) {
    for (var k = 0; k < unit; k++) {
      var index = getIndex(i, j, k);
      cubesPhase6[index] = new Vector3(0, 0, 0);
    }
  }
}

for (var i = 0; i < num; i++) {
  cubes[i] = new Cube(new Vector3(0, 0, 0), new Vector3(1., 1., 1.));
}

canvasCubes.update = function (g) {
  var x = this.cursor.x, y = this.cursor.y;

  // Initial the matrix
  var matrix = new Matrix();
  matrix.scale(playgroundCubesAdjustment.scale, playgroundCubesAdjustment.scale, playgroundCubesAdjustment.scale);
  matrix.translate(playgroundCubesAdjustment.translateX, playgroundCubesAdjustment.translateY, playgroundCubesAdjustment.translateZ);
  matrix.rotateX(playgroundCubesAdjustment.rX);
  matrix.rotateY(playgroundCubesAdjustment.rY);
  matrix.rotateZ(playgroundCubesAdjustment.rZ);

  // Movement
  if (this.cursor.z) {
    generateMatrix(phase, cubes, cubesPhase6, .3);
  } else {
    switch (phase.currentPhase) {
      case 1: generateMatrix(phase, cubes, cubesPhase1, .06); break;
      case 2: generateMatrix(phase, cubes, cubesPhase2, .06); break;
      case 3: generateMatrix(phase, cubes, cubesPhase3, .06); break;
      case 4: generateMatrix(phase, cubes, cubesPhase4, .06); break;
      case 5: generateMatrix(phase, cubes, cubesPhase5, .06); break;
      case 6: generateMatrix(phase, cubes, cubesPhase6, .06); break;
      default : break;
    }
  }

  for (var i = 0; i < num; i++) {
    drawShape(this, matrix, cubes[i], function (vertex1, vertex2) {
      //g.strokeStyle = color[i % color.length];
      g.beginPath();
      g.moveTo(vertex1.x, vertex1.y);
      g.lineTo(vertex2.x, vertex2.y);
      g.stroke();
    });
  }

  drawBoard(this, g);
};

var generateMatrix = function (phase, cubes, cubesPhase, speed) {
  var finished = true;
  for (var index in cubes) {
    if (!cubes[index].coord.equals(cubesPhase[index])) {
      finished = false;
      moveCube(cubes, cubesPhase, index, speed);
    } else {
      // In place, update to correct coordinate
      cubes[index].coord.x = cubesPhase[index].x;
      cubes[index].coord.y = cubesPhase[index].y;
      cubes[index].coord.z = cubesPhase[index].z;
    }
  }

  if (finished) {
    phase.currentPhase++;
    if (phase.currentPhase === 7) {
      phase.currentPhase = 1;
    }
  }
};

// DRY = .=....
var moveCube = function (cubes, cubesPhase, i, speed) {
  var move = cubesPhase[i].clone();
  move.subtract(cubes[i].coord);
  move.mul(new Vector3(speed, speed, speed));

  for (var index in cubes[i].vertices) {
    cubes[i].vertices[index].add(move);
  }

  cubes[i].coord.add(move);
};

/************************Sliders************************/
$('#canvasCubes-scale').noUiSlider({
  start: [0.1],
  step: 0.01,
  range: {
    'min': [0.01],
    'max': [0.3]
  }
});

$('#canvasCubes-scale').on('slide', function () {
  playgroundCubesAdjustment.scale = parseFloat($("#canvasCubes-scale").val());
});

$('#canvasCubes-translateX').noUiSlider({
  start: [0.0],
  step: 0.01,
  range: {
    'min': [0.0],
    'max': [1.0]
  }
});

$('#canvasCubes-translateX').on('slide', function () {
  playgroundCubesAdjustment.translateX = parseFloat($("#canvasCubes-translateX").val());
});

$('#canvasCubes-translateY').noUiSlider({
  start: [0.0],
  step: 0.01,
  range: {
    'min': [0.0],
    'max': [1.0]
  }
});

$('#canvasCubes-translateY').on('slide', function () {
  playgroundCubesAdjustment.translateY = parseFloat($("#canvasCubes-translateY").val());
});

$('#canvasCubes-translateZ').noUiSlider({
  start: [0.0],
  step: 0.01,
  range: {
    'min': [0.0],
    'max': [1.0]
  }
});

$('#canvasCubes-translateZ').on('slide', function () {
  playgroundCubesAdjustment.translateZ = parseFloat($("#canvasCubes-translateZ").val());
});

$('#canvasCubes-rotateX').noUiSlider({
  start: [0.0],
  step: 1,
  range: {
    'min': [0.0],
    'max': [180.0]
  }
});

$('#canvasCubes-rotateX').on('slide', function () {
  playgroundCubesAdjustment.rX = parseFloat($("#canvasCubes-rotateX").val());
});

$('#canvasCubes-rotateY').noUiSlider({
  start: [0.0],
  step: 1,
  range: {
    'min': [0.0],
    'max': [180.0]
  }
});

$('#canvasCubes-rotateY').on('slide', function () {
  playgroundCubesAdjustment.rY = parseFloat($("#canvasCubes-rotateY").val());
});

$('#canvasCubes-rotateZ').noUiSlider({
  start: [0.0],
  step: 1,
  range: {
    'min': [0.0],
    'max': [180.0]
  }
});

$('#canvasCubes-rotateZ').on('slide', function () {
  playgroundCubesAdjustment.rZ = parseFloat($("#canvasCubes-rotateZ").val());
});