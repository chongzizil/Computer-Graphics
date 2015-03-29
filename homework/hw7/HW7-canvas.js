/**
 * Created by youlongli on 3/27/15.
 */
var color = [
  'rgb(0,     0,   0)',
  'rgb(203,  27,  68)',
  'rgb(250, 214, 137)',
  'rgb(129, 199, 212)',
  'rgb(134, 193, 102)',
  'rgb(139, 129, 195)',
  'rgb(45, 75, 122)'
];

var radius = 5;
var matrix = new Matrix();
var canvasPlayground = initCanvas('playground');

var points = [];
var bird = [];
var birds = [];

/************************ Switch & Selector ************************/

$("[name='drawAuxiliary']").bootstrapSwitch();
$("[name='drawAuxiliary']").bootstrapSwitch('state', false);
$("[name='drawAuxiliary']").bootstrapSwitch('onText', "On");
$("[name='drawAuxiliary']").bootstrapSwitch('offText', "Off");

$("[name='drawDot']").bootstrapSwitch();
$("[name='drawDot']").bootstrapSwitch('state', false);
$("[name='drawDot']").bootstrapSwitch('onText', "On");
$("[name='drawDot']").bootstrapSwitch('offText', "Off");

/************************ Spline Functions ************************/
var getContextG = function () {
  return canvasPlayground.getContext('2d');
};

var drawBezierSpline = function (points, colorIndex) {
  var num = points.length;

  if (num < 3) {
    return;
  }

  var ut = 1.0 / (num * 20);
  var vertices = [];

  for (var t = 0; t < .999; t += ut) {
    vertices.push((new Bezier()).getCoord2(t, points));
  }

  drawSpline(vertices, colorIndex);
};

var drawHermiteSpline = function (P0, P1, R0, R1) {
  var hermite = new Hermite();
  hermite.setParam(P0, P1, R0, R1);

  var ut = 1.0 / 20;
  var res = [];

  for (var t = 0; t < .999; t += ut) {
    res.push(hermite.getCoord(t));
  }

  drawSpline(res);
};

var drawSpline = function (vertices, colorIndex) {
  var g = getContextG();

  for (var i = 0; i < vertices.length - 1; i++) {
    var vertex1 = new Vector3(0, 0, 0);
    var vertex2 = new Vector3(0, 0, 0);
    matrix.transform(vertices[i], vertex1);
    matrix.transform(vertices[i + 1], vertex2);
    vertex1.viewportTransformation(canvasPlayground);
    vertex2.viewportTransformation(canvasPlayground);

    g.strokeStyle = color[colorIndex];
    g.beginPath();
    g.moveTo(vertex1.x, vertex1.y);
    g.lineTo(vertex2.x, vertex2.y);
    g.stroke();
  }
};

/************************ Basic Functions ************************/

var drawPoint = function (points) {
  var g = getContextG();

  for (var i = 0; i < points.length; i++) {
    var point = points[i];
    var vertex = new Vector3(0, 0, 0);
    matrix.transform(point, vertex);
    vertex.viewportTransformation(canvasPlayground);

    g.beginPath();
    g.arc(vertex.x, vertex.y, radius, 0, 2 * Math.PI, false);
    g.fillStyle = 'black';
    g.fill();
    g.lineWidth = 1;
    g.strokeStyle = '#003300';
    g.stroke();
  }
};

/**
 * Draw the auxiliary lines.
 */
var drawAuxiliaryLines = function (points) {
  var g = getContextG();
  var defaultLineDash = g.getLineDash();
  g.setLineDash([2]);
  g.strokeStyle = 'gray';

  for (var i = 0; i < points.length - 1; i++) {
    var vertex1 = new Vector3(0, 0, 0);
    var vertex2 = new Vector3(0, 0, 0);
    matrix.transform(points[i], vertex1);
    matrix.transform(points[i + 1], vertex2);
    vertex1.viewportTransformation(canvasPlayground);
    vertex2.viewportTransformation(canvasPlayground);

    g.beginPath();
    g.moveTo(vertex1.x, vertex1.y);
    g.lineTo(vertex2.x, vertex2.y);
    g.stroke();
  }

  g.setLineDash(defaultLineDash);
};

/************************Canvas Playground************************/
var direction = "DOWN";
var col = canvasPlayground.width;
var row = canvasPlayground.height;
var u = 100;
var numOfMountain = col / u;
var updateCount = 0;
var mountainWidth = 0;

// Mountains
for (var i = 0; i <= numOfMountain; i++) {
  points[i] = [];
  var height = 200 + Math.random() * 150;
  var leftPoint = new Vector3(i * u, row, 0);
  var topPoint  = new Vector3(i * u + u / 2, row - height, 0);
  var rightPoint  = new Vector3(i * u + u, row, 0);
  leftPoint .viewportReverseTransformation(canvasPlayground);
  points[i].push(leftPoint);
  topPoint .viewportReverseTransformation(canvasPlayground);
  points[i].push(topPoint);
  rightPoint .viewportReverseTransformation(canvasPlayground);
  points[i].push(rightPoint);
}

mountainWidth = points[0][2].x - points[0][0].x;

// Birds
var leftWingPoint = (new Vector3(0, 0, 0));
leftWingPoint.viewportReverseTransformation(canvasPlayground);
var rightWingPoint = (new Vector3(0, 50, 0));
rightWingPoint.viewportReverseTransformation(canvasPlayground);
var head = (new Vector3(75, 25, 0));
head.viewportReverseTransformation(canvasPlayground);
var tail = (new Vector3(50, 25, 0));
tail.viewportReverseTransformation(canvasPlayground);
bird = [leftWingPoint.clone(), head.clone(), tail.clone(), rightWingPoint.clone()];

var numOfBirds = 60;
var birdBlast = false;
var blastTime = 2.2;

var initalBirds = function () {
  for (var i = 0; i < numOfBirds; i++) {
    birds[i] = [leftWingPoint.clone(), head.clone(), tail.clone(), rightWingPoint.clone()];
    var diffX = 2 * Math.random();
    var diffY = -1 * Math.random();
    birds[i][1].x += diffX - 2;
    birds[i][1].y += diffY;
    birds[i][2].x += diffX - 2;
    birds[i][2].y += diffY;
    birds[i][0].x += diffX - 2;
    birds[i][0].y += diffY;
    birds[i][3].x += diffX - 2;
    birds[i][3].y += diffY;
  }
};

canvasPlayground.onclick = function () {
  initalBirds();
  birdBlast = true;
  blastTime = 4;
};

canvasPlayground.update = function (g) {
  updateCount++;

  var x = this.cursor.x, y = this.cursor.y;
  var cursorPos = new Vector3(x, y, 0);
  cursorPos.viewportReverseTransformation(canvasPlayground);

  var diffX = cursorPos.x - tail.x;
  var diffY = cursorPos.y - tail.y;
  bird[1].x = head.x + diffX;
  bird[1].y = head.y + diffY;
  bird[2].x = tail.x + diffX;
  bird[2].y = tail.y +  diffY;
  bird[0].x = leftWingPoint.x + diffX;
  bird[0].y = leftWingPoint.y + diffY;
  bird[3].x = rightWingPoint.x + diffX;
  bird[3].y = rightWingPoint.y + diffY;

  if (updateCount % 2 === 0) {
    updateCount = 0;

    // Move the birds
    bird[1].x += Math.sin(time) * .005;
    bird[2].x += Math.sin(time) * .005;
    bird[0].y += Math.cos(time) * .0025;
    bird[3].y -= Math.cos(time) * .0025;

    if (birdBlast) {
      for (var i = 0; i < numOfBirds; i++) {
        birds[i][0].x += .1;
        birds[i][1].x += .1;
        birds[i][2].x += .1;
        birds[i][3].x += .1;
      }
      blastTime -= .1;
      if (blastTime < 0) {
        birdBlast = false;
      }
    }

    // Move the mountains
    for (var i = 0; i < points.length; i++) {
      points[i][0].x = points[i][0].x - (2 + mountainWidth) * .01;
      points[i][1].x = points[i][1].x - (2 + mountainWidth) * .01;
      points[i][2].x = points[i][2].x - (2 + mountainWidth) * .01;
      if (points[i][2].x < -1) {
        points[i][0].x = points[i][0].x + 2 + mountainWidth;
        points[i][1].x = points[i][1].x + 2 + mountainWidth;
        points[i][2].x = points[i][2].x + 2 + mountainWidth;
      }
    }
  }

  // Draw the mountains
  for (var i = 0; i < points.length; i++) {
    drawBezierSpline(points[i], 4);

    if ($('input[name="drawDot"]').bootstrapSwitch('state')) {
      drawPoint(points[i], 4);
    }

    if ($('input[name="drawAuxiliary"]').bootstrapSwitch('state')) {
      drawAuxiliaryLines(points[i]);
    }
  }

  // Draw the birds
  drawBezierSpline([bird[0], bird[1], bird[3]], 0);
  drawBezierSpline([bird[0], bird[2], bird[3]], 0);

  if (birdBlast) {
    for (var i = 0; i < numOfBirds; i++) {
      var colorIndex = Math.floor(Math.random() * color.length);
      drawBezierSpline([birds[i][0], birds[i][1], birds[i][3]], colorIndex);
      drawBezierSpline([birds[i][0], birds[i][2], birds[i][3]], colorIndex);
    }
  }

  drawBoard(this, g);
};