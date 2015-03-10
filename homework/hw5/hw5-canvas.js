/**
 * Created by youlongli on 3/8/15.
 */

/************************Canvas Playground************************/
var canvasPlayground = initCanvas('playground');

// For slide bar
var playgroundMatrixAdjustment = getMatrixAdjustmentObj();
slideUpdate('playground', playgroundMatrixAdjustment);

var num = 50;
var enemies = new Array(num);
var enemiesDir = new Array(num);
var enemiesDist = new Array(num);
for (var i = 0; i < num; i++) {
  enemiesDir[i] = true;
  enemiesDist[i] = [Math.floor(Math.random() * 3) + 1, Math.floor(Math.random() * 3) + 8];
  var choice = Math.floor(Math.random() * 6);
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
      enemies[i] = new Cylinder(new Vector3(x, y, z), Math.floor(3) + 1, new Vector3(.4, .4, .4));
      break;
    case 4:
      enemies[i] = new Prism(new Vector3(x, y, z), new Vector3(.4, .4, .4));
      break;
    case 5:
      enemies[i] = new Octahedron(new Vector3(x, y, z), new Vector3(.4, .4, .4));
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

    moveShape(enemies[i], mousePos, .05 + 0.01 * Math.floor(i % 10));
  }

  // Initial the matrix
  var matrix = new Matrix();
  matrix.scale(playgroundMatrixAdjustment.scale, playgroundMatrixAdjustment.scale, playgroundMatrixAdjustment.scale);
  matrix.translate(playgroundMatrixAdjustment.translateX, playgroundMatrixAdjustment.translateY, playgroundMatrixAdjustment.translateZ);
  matrix.rotateX(playgroundMatrixAdjustment.rX);
  matrix.rotateY(playgroundMatrixAdjustment.rY);
  matrix.rotateZ(playgroundMatrixAdjustment.rZ);

  g.fillStyle = this.cursor.z ? 'red' : 'rgb(255,255,128)';

  //for (var i = 0; i < num; i++) {
  //  var coord = new Vector3();
  //  matrix.transform(enemies[i].coord, coord);
  //  coord.viewportTransformation(this);
  //  g.beginPath();
  //  g.moveTo(this.cursor.x, this.cursor.y);
  //  g.lineTo(coord.x, coord.y);
  //  g.stroke();
  //}

  for (var i = 0; i < num; i++) {
    drawShape(this, matrix, enemies[i], function (vertex1, vertex2) {
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
    icosahedron[i] = new Icosahedron(new Vector3(Math.cos(time + i), Math.sin(time + i), 0));
  }

  g.fillStyle = this.cursor.z ? 'red' : 'rgb(255,255,128)';

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