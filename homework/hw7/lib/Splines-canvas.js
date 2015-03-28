/**
 * Created by youlongli on 3/27/15.
 */

$(function () {
  var color = [
    'rgb(203,  27,  68)',
    'rgb(250, 214, 137)',
    'rgb(129, 199, 212)',
    'rgb(134, 193, 102)',
    'rgb(139, 129, 195)',
    'rgb(252, 250, 242)',
    'rgb( 12,  12,  12)'
  ];

  var canvasPlayground = initCanvas('playground');
  var parametric = new Parametric(20, 20, uv2xyzSphere);
  // Initial the matrix
  var matrix = new Matrix();
  var radius = 5;
  var points = [];

  $("[name='drawAuxiliary']").bootstrapSwitch();

  /************************Spline Functions************************/
  var drawBezierSpline = function (canvas, matrix, g, points) {
    var num = points.length;

    if (num < 3) {
      return;
    }

    var ut = 1.0 / (num * 20);
    var res = [];

    for (var t = 0; t < .999; t += ut) {
      res.push((new Bezier()).getCoord2(t, points));
    }

    drawSpline(canvas, matrix, g, res);
  };

  var drawHermiteSpline = function (canvas, matrix, g, P0, P1, R0, R1) {
    var hermite = new Hermite();
    hermite.setParam(P0, P1, R0, R1);

    var ut = 1.0 / 100;
    var res = [];

    for (var t = 0; t < .999; t += ut) {
      res.push(hermite.getCoord(t));
    }

    drawSpline(canvas, matrix, g, res);
  };

  var drawSpline = function (canvas, matrix, g, points) {
    for (var i = 0; i < points.length - 1; i++) {
      var vertex1 = new Vector3(0, 0, 0);
      var vertex2 = new Vector3(0, 0, 0);
      matrix.transform(points[i], vertex1);
      matrix.transform(points[i + 1], vertex2);
      vertex1.viewportTransformation(canvas);
      vertex2.viewportTransformation(canvas);

      g.beginPath();
      g.moveTo(vertex1.x, vertex1.y);
      g.lineTo(vertex2.x, vertex2.y);
      g.stroke();
    }
  };

  /************************Basic Functions************************/
  // When the mouse is clicked in the canvas, add a new point for Bezier
  canvasPlayground.onclick = function() {
    if (hasMovedPoint) {
      return;
    }

    var x = canvasPlayground.cursor.x, y = canvasPlayground.cursor.y;
    var newPoint = new Vector3(x, y, 0);

    // Skip if the cursor is within a point
    for (var i = 0; i < points.length; i++) {
      var vertex = new Vector3(0, 0, 0);
      matrix.transform(points[i], vertex);
      vertex.viewportTransformation(canvasPlayground);
      if (isInCircle(canvasPlayground, vertex)) {
        return;
      }
    }

    newPoint.viewportReverseTransformation(canvasPlayground);
    points.push(newPoint);
  };

  // Press 'D' while the cursor pointing on a point to delete it for Bezier
  // Press 'X' to delete the last adding point for Bezier
  document.onkeypress = function(event){
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

  canvasPlayground.onmousedown = function(e){
    hasMovedPoint = false;
    mouseIsDown = true;
  };
  canvasPlayground.onmouseup = function(e){
    mouseIsDown = false;
  };

  document.onmousemove = function(event){
    if (!mouseIsDown) {
      return;
    }

    var x = canvasPlayground.cursor.x, y = canvasPlayground.cursor.y;

    for (var i = 0; i < points.length; i++) {
      var vertex = new Vector3(0, 0, 0);
      matrix.transform(points[i], vertex);
      vertex.viewportTransformation(canvasPlayground);
      if (isInCircle(canvasPlayground, vertex)) {
        hasMovedPoint = true;
        var newPosition = new Vector3(x, y, 0);
        newPosition.viewportReverseTransformation(canvasPlayground);
        points[i] = newPosition;
      }
    }
  };

  var deletePoint = function(x, y, deleteLast) {
    if (deleteLast) {
      points.splice(points.length - 1, 1);
    } else {
      var clickPoint = new Vector3(x, y, 0);
      clickPoint.viewportReverseTransformation(canvasPlayground);

      for (var i = 0; i < points.length; i++) {
        var vertex = new Vector3(0, 0, 0);
        matrix.transform(points[i], vertex);
        vertex.viewportTransformation(canvasPlayground);
        if (isInCircle(canvasPlayground, vertex)) {
          points.splice(i, 1);
          return;
        }
      }
    }
  };

  var drawPoint = function (canvas, matrix, g, points) {
    for (var i = 0; i < points.length; i++) {
      var point = points[i];
      var vertex = new Vector3(0, 0, 0);
      matrix.transform(point, vertex);
      vertex.viewportTransformation(canvas);

      g.beginPath();
      g.arc(vertex.x, vertex.y, radius, 0, 2 * Math.PI, false);
      g.fillStyle = isInCircle(canvas, vertex) ? 'red' : 'black';
      g.fill();
      g.lineWidth = 1;
      g.strokeStyle = '#003300';
      g.stroke();
    }
  };

  /**
   * Check if the coordinate is within the circle
   */
  var isInCircle = function (canvas, circle) {
    var x = canvas.cursor.x, y = canvas.cursor.y;
    var dist = Math.sqrt(Math.pow(x - circle.x, 2) + Math.pow(y - circle.y, 2));
    return dist <= radius;
  };

  /**
   * Draw the auxiliary lines.
   */
  var drawAuxiliaryLines = function (g) {
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
  canvasPlayground.update = function (g) {
    var x = this.cursor.x, y = this.cursor.y;


    //matrix.scale(.2, .2, .2);

    var P0 = new Vector3(-1, 0, 0);
    var P1 = new Vector3(1, 0, 0);
    var R0 = 1;
    var R1 = 10;

    drawBezierSpline(this, matrix, g, points);
    //drawHermiteSpline(this, matrix, g, P0, P1, R0, R1);

    drawPoint(this, matrix, g, points);

    drawBoard(this, g);

    if ($('input[name="drawAuxiliary"]').bootstrapSwitch('state')) {
      drawAuxiliaryLines(g);
    }
  };

  $('#outputButton').on('click', function () {
    copyToClipboard(JSON.stringify(points));

    //$('#outputModalContent').empty();
    //$('#outputModalContent').append("<p>");
    //for (var i = 0; i < points.length; i++) {
    //  if (i === points.length - 1) {
    //    $('#outputModalContent').append(JSON.stringify(points[i]));
    //  } else {
    //    $('#outputModalContent').append(JSON.stringify(points[i]) + ', ');
    //  }
    //}
    //$('#outputModalContent').append("</p>");
  });

  $('#submitCoordinates').on('click', function () {
    var input = $.trim($("#coordinates").val());
    var pointObjects = JSON.parse(input);
    var newPoints = [];
    for (var i = 0; i < pointObjects.length; i++) {
      newPoints[i] = new Vector3(pointObjects[i].x, pointObjects[i].y, pointObjects[i].z);
    }
    points = newPoints;
    $('#inputModal').modal('hide');
  });

  $('#clearInput').on('click', function () {
    $("#coordinates").val("");
  });

  function copyToClipboard(text) {
    window.prompt("Copy to clipboard: Ctrl/CMD + C, Enter", text);
  }
});