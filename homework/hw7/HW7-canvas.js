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
var numOfCurves = 7;
var matrix = new Matrix();
var canvasPlayground = initCanvas('playground');

var currPointsIndex = 0;
var points = [[], [], [], [], [], [], []];

/************************ Switch & Selector ************************/

$("[name='drawAuxiliary']").bootstrapSwitch();
$("[name='drawAuxiliary']").bootstrapSwitch('onText', "Aux On");
$("[name='drawAuxiliary']").bootstrapSwitch('offText', "Aux Off");

$("[name='drawDot']").bootstrapSwitch();
$("[name='drawDot']").bootstrapSwitch('onText', "On");
$("[name='drawDot']").bootstrapSwitch('offText', "Off");

/************************ Spline Functions ************************/
var getContextG = function () {
  return canvasPlayground.getContext('2d');
};

var drawBezierSpline = function (index) {
  var num = points[index].length;

  if (num < 3) {
    return;
  }

  var ut = 1.0 / (num * 10);
  var res = [];

  for (var t = 0; t < .999; t += ut) {
    res.push((new Bezier()).getCoord2(t, points[index]));
  }

  drawSpline(res, index);
};

var drawHermiteSpline = function (P0, P1, R0, R1) {
  var hermite = new Hermite();
  hermite.setParam(P0, P1, R0, R1);

  var ut = 1.0 / 10;
  var res = [];

  for (var t = 0; t < .999; t += ut) {
    res.push(hermite.getCoord(t));
  }

  drawSpline(res, 0);
};

var drawSpline = function (vertices, index) {
  var g = getContextG();

  for (var i = 0; i < vertices.length - 1; i++) {
    var vertex1 = new Vector3(0, 0, 0);
    var vertex2 = new Vector3(0, 0, 0);
    matrix.transform(vertices[i], vertex1);
    matrix.transform(vertices[i + 1], vertex2);
    vertex1.viewportTransformation(canvasPlayground);
    vertex2.viewportTransformation(canvasPlayground);

    g.strokeStyle = color[index];
    g.beginPath();
    g.moveTo(vertex1.x, vertex1.y);
    g.lineTo(vertex2.x, vertex2.y);
    g.stroke();
  }
};

/************************ Basic Functions ************************/

var drawPoint = function (index) {
  var g = getContextG();

  for (var i = 0; i < points[index].length; i++) {
    var point = points[index][i];
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
var drawAuxiliaryLines = function (index) {
  var g = getContextG();
  var defaultLineDash = g.getLineDash();
  g.setLineDash([2]);
  g.strokeStyle = 'gray';

  for (var i = 0; i < points[index].length - 1; i++) {
    var vertex1 = new Vector3(0, 0, 0);
    var vertex2 = new Vector3(0, 0, 0);
    matrix.transform(points[index][i], vertex1);
    matrix.transform(points[index][i + 1], vertex2);
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
var currX = 0;
var currY = 0;
var u = 50;
var updateCount = 0;

var pointMatrix = [];

for (var i = 0; i <= col; i += u) {
  var newPoint = new Vector3(i, row / 2, 0);
  newPoint.viewportReverseTransformation(canvasPlayground);
  pointMatrix.push(newPoint);
}

points[0] = pointMatrix;

canvasPlayground.update = function (g) {
  //updateCount++;

  //if (updateCount % 10 === 0) {
  //  updateCount = 0;
  //  for (var i = 1; i < points[0].length - 1; i++) {
  //    if (i % 2 === 0) {
  //      points[0][i].y = (Math.sin(time) + 1) / 4;
  //    } else {
  //      points[0][i].y = (Math.cos(time) - 1) / 4;
  //    }
  //  }
  //}

  for (var i = 0; i <= currPointsIndex; i++) {
    drawBezierSpline(i);

    if ($('input[name="drawDot"]').bootstrapSwitch('state')) {
      drawPoint(i);
    }

    if ($('input[name="drawAuxiliary"]').bootstrapSwitch('state')) {
      drawAuxiliaryLines(i);
    }
  }

  drawBoard(this, g);
};