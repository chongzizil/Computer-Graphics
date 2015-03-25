var moveShape = function (shape, dir, speed) {
  var move = new Vector3(dir.x * speed * shape.scale.x, dir.y * speed * shape.scale.y, 0);

  for (var index in shape.vertices) {
    shape.vertices[index].add(move);
  }
  shape.coord.add(move);
};

var drawShape = function (canvas, matrix, icosahedron, callback) {
  for (var edgeIndex in icosahedron.edges) {
    var edge = icosahedron.edges[edgeIndex];
    var vertex1 = new Vector3(0, 0, 0);
    var vertex2 = new Vector3(0, 0, 0);
    matrix.transform(icosahedron.vertices[edge[0]], vertex1);
    matrix.transform(icosahedron.vertices[edge[1]], vertex2);
    vertex1.viewportTransformation(canvas);
    vertex2.viewportTransformation(canvas);
    callback(vertex1, vertex2);
  }
};

var drawBoard = function (canvas, g) {
  g.strokeStyle = 'black';
  g.beginPath();
  g.moveTo(0, 0);
  g.lineTo(canvas.width, 0);
  g.lineTo(canvas.width, canvas.height);
  g.lineTo(0, canvas.height);
  g.lineTo(0, 0);
  g.stroke();
};

var getMatrixAdjustmentObj = function () {
  return {
    scale: .16,
    translateX: 0,
    translateY: 0,
    translateZ: 0,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    x1: 0
  }
};

var slideUpdate = function (canvasName, matrixAdjustmentObj) {
  $('#' + canvasName + '-scale').slider().on('slide', function (ev) {
    matrixAdjustmentObj.scale = ev.value;
  });
  $('#' + canvasName + '-translateX').slider().on('slide', function (ev) {
    matrixAdjustmentObj.translateX = ev.value;
  });
  $('#' + canvasName + '-translateY').slider().on('slide', function (ev) {
    matrixAdjustmentObj.translateY = ev.value;
  });
  $('#' + canvasName + '-translateZ').slider().on('slide', function (ev) {
    matrixAdjustmentObj.translateZ = ev.value;
  });
  $('#' + canvasName + '-rotateX').slider().on('slide', function (ev) {
    matrixAdjustmentObj.rX = ev.value;
  });
  $('#' + canvasName + '-rotateY').slider().on('slide', function (ev) {
    matrixAdjustmentObj.rY = ev.value;
  });
  $('#' + canvasName + '-rotateZ').slider().on('slide', function (ev) {
    matrixAdjustmentObj.rZ = ev.value;
  });
  if ($('#' + canvasName + '-x1') !== undefined) {
    $('#' + canvasName + '-x1').slider().on('slide', function (ev) {
      matrixAdjustmentObj.x1 = ev.value;
    });
  }
};

var startTime = (new Date()).getTime() / 1000, time = startTime;
var canvases = [];

function initCanvas(id) {
  var canvas = document.getElementById(id);

  canvas.setCursor = function(x, y, z) {
    var r = this.getBoundingClientRect();
    this.cursor.set(x - r.left, y - r.top, z);
  };

  canvas.cursor = new Vector3(0, 0, 0);

  canvas.onmousedown = function (e) {
    this.setCursor(e.clientX, e.clientY, 1);
  };

  canvas.onmousemove = function (e) {
    this.setCursor(e.clientX, e.clientY);
  };

  canvas.onmouseup = function (e) {
    this.setCursor(e.clientX, e.clientY, 0);
  };

  canvases.push(canvas);
  return canvas;
}

function tick() {
  time = (new Date()).getTime() / 1000 - startTime;
  for (var i = 0; i < canvases.length; i++)
    if (canvases[i].update !== undefined) {
      var canvas = canvases[i];
      var g = canvas.getContext('2d');
      g.clearRect(0, 0, canvas.width, canvas.height);
      canvas.update(g);
    }
  setTimeout(tick, 1000 / 60);
}

tick();