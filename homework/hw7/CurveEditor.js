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

$('.selectpicker').selectpicker();
$('.selectpicker').selectpicker('val', '0'); // Default shape

/**
 * Change the current points index according to the selectors
 */
$('.selectpicker').on('change', function () {
  currPointsIndex = parseInt($('.selectpicker').val());
});

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

/************************ Event Functions ************************/
// Output the coordinates
$('#outputButton').on('click', function () {
  window.prompt("Copy to clipboard: Ctrl/CMD + C, Enter", JSON.stringify(points));
});

// Clear the canvas
$('#clearButton').on('click', function () {
  points = [[], [], [], [], [], [], []];
});

// Submit the input coordinates
$('#submitCoordinates').on('click', function () {
  var input = $.trim($("#coordinates").val());
  var pointObjects = JSON.parse(input);
  var newPoints = [];

  for (var i = 0; i < pointObjects.length; i++) {
    newPoints[i] = [];
    for (var j = 0; j < pointObjects[i].length; j++) {
      newPoints[i][j] = new Vector3(pointObjects[i][j].x, pointObjects[i][j].y, pointObjects[i][j].z);
    }
  }

  points = newPoints;
  $('#inputModal').modal('hide');
});

// Clear the textarea
$('#clearInput').on('click', function () {
  $("#coordinates").val("");
});

/************************ Basic Functions ************************/

// When the mouse is clicked in the canvas, add a new point for Bezier
canvasPlayground.onclick = function () {
  if (hasMovedPoint) {
    return;
  }

  var x = canvasPlayground.cursor.x, y = canvasPlayground.cursor.y;
  var newPoint = new Vector3(x, y, 0);

  // Skip if the cursor is within a point
  for (var i = 0; i < points[currPointsIndex].length; i++) {
    var vertex = new Vector3(0, 0, 0);
    matrix.transform(points[currPointsIndex][i], vertex);
    vertex.viewportTransformation(canvasPlayground);
    if (isInCircle(vertex)) {
      return;
    }
  }

  newPoint.viewportReverseTransformation(canvasPlayground);
  points[currPointsIndex].push(newPoint);
};

// Press 'D' while the cursor pointing on a point to delete it for Bezier
// Press 'X' to delete the last adding point for Bezier
document.onkeypress = function (event) {
  if (!event) {
    event = window.event;
  }
  var code = event.keyCode;
  if (event.charCode && code == 0) {
    code = event.charCode;
  }

  var x = canvasPlayground.cursor.x, y = canvasPlayground.cursor.y;

  if (code === 100) {
    // Key: D
    // Delete the point the cursor is currently pointing to.
    deletePoint(x, y);
  } else if (code === 120) {
    // Key: X
    // Delete the last point
    deletePoint(x, y, true);
  }
};

var mouseIsDown = false;
var hasMovedPoint = false;
var movingPoints = [-1, -1];

canvasPlayground.onmousedown = function (e) {
  hasMovedPoint = false;
  movingPoints = [-1, -1];
  mouseIsDown = true;
};
canvasPlayground.onmouseup = function (e) {
  mouseIsDown = false;
};

document.onmousemove = function (e) {
  if (!mouseIsDown) {
    return;
  }

  var x = canvasPlayground.cursor.x, y = canvasPlayground.cursor.y;

  if (movingPoints[0] === -1) {
    for (var j = 0; j < numOfCurves; j++) {
      for (var i = 0; i < points[j].length; i++) {
        var vertex = new Vector3(0, 0, 0);
        matrix.transform(points[j][i], vertex);
        vertex.viewportTransformation(canvasPlayground);
        if (isInCircle(vertex)) {
          movingPoints = [j, i];
          hasMovedPoint = true;
          var newPosition = new Vector3(x, y, 0);
          newPosition.viewportReverseTransformation(canvasPlayground);
          points[j][i] = newPosition;
        }
      }
    }
  } else {
    hasMovedPoint = true;
    var newPosition = new Vector3(x, y, 0);
    newPosition.viewportReverseTransformation(canvasPlayground);
    points[movingPoints[0]][movingPoints[1]] = newPosition;
  }


};

var deletePoint = function (x, y, deleteLast) {
  if (deleteLast) {
    points[currPointsIndex].splice(points[currPointsIndex].length - 1, 1);
  } else {
    var clickPoint = new Vector3(x, y, 0);
    clickPoint.viewportReverseTransformation(canvasPlayground);

    for (var j = 0; j < numOfCurves; j++) {
      for (var i = 0; i < points[j].length; i++) {
        var vertex = new Vector3(0, 0, 0);
        matrix.transform(points[j][i], vertex);
        vertex.viewportTransformation(canvasPlayground);
        if (isInCircle(vertex)) {
          points[j].splice(i, 1);
          return;
        }
      }
    }
  }
};

var drawPoint = function (index) {
  var g = getContextG();

  for (var i = 0; i < points[index].length; i++) {
    var point = points[index][i];
    var vertex = new Vector3(0, 0, 0);
    matrix.transform(point, vertex);
    vertex.viewportTransformation(canvasPlayground);

    g.beginPath();
    g.arc(vertex.x, vertex.y, radius, 0, 2 * Math.PI, false);
    g.fillStyle = isInCircle(vertex) ? 'red' : 'black';
    g.fill();
    g.lineWidth = 1;
    g.strokeStyle = '#003300';
    g.stroke();
  }
};

/**
 * Check if the coordinate is within the circle
 */
var isInCircle = function (circle) {
  var x = canvasPlayground.cursor.x, y = canvasPlayground.cursor.y;
  var dist = Math.sqrt(Math.pow(x - circle.x, 2) + Math.pow(y - circle.y, 2));
  return dist <= radius;
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
canvasPlayground.update = function (g) {
  var x = this.cursor.x, y = this.cursor.y;

  //var P0 = new Vector3(-1, 0, 0);
  //var P1 = new Vector3(1, 0, 0);
  //var R0 = 1;
  //var R1 = 10;
  //drawHermiteSpline(this, matrix, g, P0, P1, R0, R1);

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