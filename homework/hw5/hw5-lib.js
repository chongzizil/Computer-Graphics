/**
 * Created by youlongli on 3/8/15.
 */

/************************Vector3************************/
function Vector3(x, y, z) {
  this.x = 0;
  this.y = 0;
  this.z = 0;
  this.set(x, y, z);
}

Vector3.prototype = {
  set: function (x, y, z) {
    if (x !== undefined) this.x = x;
    if (y !== undefined) this.y = y;
    if (z !== undefined) this.z = z;
  },
  add: function(that) {
    this.x += that.x;
    this.y += that.y;
    this.z += that.z;
  },
  subtract: function(that) {
    this.x -= that.x;
    this.y -= that.y;
    this.z -= that.z;
  },
  mul: function (that) {
    this.x *= that.x;
    this.y *= that.y;
    this.z *= that.z;
  },
  reverse: function () {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
  },
  length: function () {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
  },
  viewportTransformation: function (canvas) {
    var x = (canvas.width / 2.0) + this.x * (canvas.width / 2.0);
    var y = (canvas.height / 2.0) - this.y * (canvas.width / 2.0);
    this.x = x;
    this.y = y;
  },
  viewportReverseTransformation: function (canvas) {
    var x = (this.x - (canvas.width / 2.0)) / (canvas.width / 2.0);
    var y = -(this.y - (canvas.height / 2.0)) / (canvas.width / 2.0);
    this.x = x;
    this.y = y;
  }
};

var normalize = function (vec) {
  var length = Math.sqrt(Math.pow(vec.x, 2) + Math.pow(vec.y, 2) + Math.pow(vec.z, 2));
  vec.x /= length;
  vec.y /= length;
  vec.z /= length;
};

/************************Vector4************************/
function Vector4(x, y, z, w) {
  this.x = 0;
  this.y = 0;
  this.z = 0;
  this.w = 0;
  this.set(x, y, z, w);
}

Vector4.prototype = {
  set: function (x, y, z, w) {
    if (x !== undefined) this.x = x;
    if (y !== undefined) this.y = y;
    if (z !== undefined) this.z = z;
    if (w !== undefined) this.w = w;
  }
};

/************************Matrix************************/
function Matrix() {
  this.row = 4;
  this.col = 4;
  this.scaleEnv = new Vector3(1, 1, 1);
  this.matrix = new Array(this.row);
  this.initialMatrix = new Array(this.row);

  for (var i = 0; i < this.row; i++) {
    this.matrix[i] = new Array(this.col);
    this.initialMatrix[i] = new Array(this.col);
  }

  this.set();
}

Matrix.prototype = {
  set: function (initialMatrixArray) {
    this.initialMatrix = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];

    for (var i = 0; i < this.row; i++) {
      for (var j = 0; j < this.col; j++) {
        this.matrix[i][j] = this.initialMatrix[i][j];
      }
    }

    this.identity();
  },
  identity: function () {
    this.initialMatrix = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];

    for (var i = 0; i < this.row; i++) {
      for (var j = 0; j < this.col; j++) {
        if (i == 0 && j == 3) {
          this.matrix[i][j] = this.initialMatrix[i][j] * this.scaleEnv.x;
        } else if (i == 1 && j == 3) {
          this.matrix[i][j] = this.initialMatrix[i][j] * this.scaleEnv.y;
        } else if (i == 2 && j == 3) {
          this.matrix[i][j] = this.initialMatrix[i][j] * this.scaleEnv.z;
        } else {
          this.matrix[i][j] = this.initialMatrix[i][j];
        }
      }
    }
  },
  translate: function (x, y, z) {
    if (x !== undefined) this.matrix[0][3] = x;
    if (y !== undefined) this.matrix[1][3] = y;
    if (z !== undefined) this.matrix[2][3] = z;
  },
  rotateX: function (theta) {
    if (theta !== undefined) {
      this.matrix[1][1] = Math.cos(theta * Math.PI / 180.0) * this.scaleEnv.y;
      this.matrix[1][2] = -Math.sin(theta * Math.PI / 180.0) * this.scaleEnv.y;
      this.matrix[2][1] = Math.sin(theta * Math.PI / 180.0) * this.scaleEnv.z;
      this.matrix[2][2] = Math.cos(theta * Math.PI / 180.0) * this.scaleEnv.z;
    }
  },
  rotateY: function (theta) {
    if (theta !== undefined) {
      this.matrix[0][0] = Math.cos(theta * Math.PI / 180.0) * this.scaleEnv.x;
      this.matrix[0][2] = Math.sin(theta * Math.PI / 180.0) * this.scaleEnv.x;
      this.matrix[2][0] = -Math.sin(theta * Math.PI / 180.0) * this.scaleEnv.z;
      this.matrix[2][2] = Math.cos(theta * Math.PI / 180.0) * this.scaleEnv.z;
    }
  },
  rotateZ: function (theta) {
    if (theta !== undefined) {
      this.matrix[0][0] = Math.cos(theta * Math.PI / 180.0) * this.scaleEnv.x;
      this.matrix[0][1] = -Math.sin(theta * Math.PI / 180.0) * this.scaleEnv.x;
      this.matrix[1][0] = Math.sin(theta * Math.PI / 180.0) * this.scaleEnv.y;
      this.matrix[1][1] = Math.cos(theta * Math.PI / 180.0) * this.scaleEnv.y;
    }
  },
  scale: function (x, y, z) {
    if (x !== undefined) this.scaleEnv.x = x;
    if (y !== undefined) this.scaleEnv.y = y;
    if (z !== undefined) this.scaleEnv.z = z;
    if (this.scaleEnv.x !== undefined) this.matrix[0][0] *= this.scaleEnv.x;
    if (this.scaleEnv.y !== undefined) this.matrix[1][1] *= this.scaleEnv.y;
    if (this.scaleEnv.z !== undefined) this.matrix[2][2] *= this.scaleEnv.z;
  },
  transform: function (src, dst) {
    dst.x = this.matrix[0][0] * src.x + this.matrix[0][1] * src.y + this.matrix[0][2] * src.z + this.matrix[0][3];
    dst.y = this.matrix[1][0] * src.x + this.matrix[1][1] * src.y + this.matrix[1][2] * src.z + this.matrix[1][3];
    dst.z = this.matrix[2][0] * src.x + this.matrix[2][1] * src.y + this.matrix[2][2] * src.z + this.matrix[2][3];
  }
};

/************************Square************************/
function Square(coord, scale) {
  this.vertices = new Array(4);
  this.edges = new Array(4);
  this.coord = new Vector3(0, 0, 0);
  this.scale = new Vector3(1, 1, 1);
  this.set(coord, scale);
}

Square.prototype = {
  set: function (coord, scale) {
    if (coord !== undefined) {
      this.coord = coord;
    }
    if (scale !== undefined) {
      this.scale = scale;
    }

    this.vertices = [
      new Vector3(-1, -1, 0),
      new Vector3(1, -1, 0),
      new Vector3(-1, 1, 0),
      new Vector3(1, 1, 0)
    ];

    this.edges = [
      [0, 1], [1, 3], [3, 2], [2, 0]
    ];

    for (var index in this.vertices) {
      this.vertices[index].mul(this.scale);
      this.vertices[index].add(this.coord);
    }
  }
};

/************************Cube************************/
function Cube(coord, scale) {
  this.vertices = new Array(8);
  this.edges = new Array(12);
  this.coord = new Vector3(0, 0, 0);
  this.scale = new Vector3(1, 1, 1);
  this.movement = new Vector3(0, 0, 0);
  this.set(coord, scale);
}

Cube.prototype = {
  set: function (coord, scale) {
    if (coord !== undefined) {
      this.coord = coord;
    }
    if (scale !== undefined) {
      this.scale = scale;
    }

    this.vertices = [
      new Vector3(-1, -1, -1),
      new Vector3(1, -1, -1),
      new Vector3(-1, 1, -1),
      new Vector3(1, 1, -1),
      new Vector3(-1, -1, 1),
      new Vector3(1, -1, 1),
      new Vector3(-1, 1, 1),
      new Vector3(1, 1, 1)
    ];

    this.edges = [
      [0, 1], [1, 3], [3, 2], [2, 0],
      [4, 5], [5, 7], [7, 6], [6, 4],
      [0, 4], [1, 5], [3, 7], [2, 6]
    ];

    for (var index in this.vertices) {
      this.vertices[index].mul(this.scale);
      this.vertices[index].add(this.coord)
    }
  }
};

/************************Tetrahedron************************/
function Tetrahedron(coord, scale) {
  this.vertices = new Array(4);
  this.edges = new Array(6);
  this.coord = new Vector3(0, 0, 0);
  this.scale = new Vector3(1, 1, 1);
  this.set(coord, scale);
}

Tetrahedron.prototype = {
  set: function (coord, scale) {
    if (coord !== undefined) {
      this.coord = coord;
    }
    if (scale !== undefined) {
      this.scale = scale;
    }

    this.vertices = [
      new Vector3(-1, -0.5, -1),
      new Vector3(1, -0.5, -1),
      new Vector3(0, Math.sqrt(3) / 2, -1),
      new Vector3(0, 0, 0)
    ];

    this.edges = [
      [0, 1], [1, 2], [2, 0],
      [0, 3], [1, 3], [2, 3]
    ];

    for (var index in this.vertices) {
      this.vertices[index].mul(this.scale);
      this.vertices[index].add(this.coord)
    }
  }
};


/************************Prism************************/
function Prism(coord, scale) {
  this.vertices = new Array(4);
  this.edges = new Array(6);
  this.coord = new Vector3(0, 0, 0);
  this.scale = new Vector3(1, 1, 1);
  this.set(coord, scale);
}

Prism.prototype = {
  set: function (coord, scale) {
    if (coord !== undefined) {
      this.coord = coord;
    }
    if (scale !== undefined) {
      this.scale = scale;
    }

    this.vertices = [
      new Vector3(-1, -1, -1), // 0
      new Vector3( 1, -1, -1), // 1
      new Vector3(-1,  1, -1), // 2
      new Vector3( 1,  1, -1), // 3
      new Vector3( 0, -1,  1), // 4
      new Vector3( 0,  1,  1)  // 5
    ];

    this.edges = [
      [0, 1], [1, 3], [3, 2], [2, 0],
      [0, 4], [1, 4], [2, 5], [3, 5],
      [4, 5]
    ];

    for (var index in this.vertices) {
      this.vertices[index].mul(this.scale);
      this.vertices[index].add(this.coord)
    }
  }
};

/************************Octahedron************************/
function Octahedron(coord, scale) {
  this.Octahedron = new Array(4);
  this.edges = new Array(6);
  this.coord = new Vector3(0, 0, 0);
  this.scale = new Vector3(1, 1, 1);
  this.set(coord, scale);
}

Octahedron.prototype = {
  set: function (coord, scale) {
    if (coord !== undefined) {
      this.coord = coord;
    }
    if (scale !== undefined) {
      this.scale = scale;
    }

    this.vertices = [
      new Vector3(-1, -1, -1), // 0
      new Vector3( 1, -1, -1), // 1
      new Vector3(-1,  1, -1), // 2
      new Vector3( 1,  1, -1), // 3
      new Vector3( 0,  0,  -1),// 4
      new Vector3( 0,  0,  1)  // 5
    ];

    this.edges = [
      [0, 1], [1, 3], [3, 2], [2, 0],
      [0, 4], [1, 4], [2, 4], [3, 4],
      [0, 5], [1, 5], [2, 5], [3, 5],
    ];

    for (var index in this.vertices) {
      this.vertices[index].mul(this.scale);
      this.vertices[index].add(this.coord)
    }
  }
};

/************************Icosahedron************************/
function Icosahedron(coord, scale) {
  this.vertices = new Array(12);
  this.edges = new Array(30);
  this.coord = new Vector3(0, 0, 0);
  this.scale = new Vector3(1, 1, 1);
  this.set(coord, scale);
}

Icosahedron.prototype = {
  set: function (coord, scale) {
    if (coord !== undefined) {
      this.coord = coord;
    }
    if (scale !== undefined) {
      this.scale = scale;
    }

    var Phi = (1 + Math.sqrt(5)) / 2;
    this.vertices = [
      new Vector3(0, -1, Phi), // 0
      new Vector3(Phi, 0, 1),  // 1
      new Vector3(0, 1, Phi),  // 2
      new Vector3(-Phi, 0, 1), // 3

      new Vector3(1, -Phi, 0), // 4
      new Vector3(1, Phi, 0),  // 5
      new Vector3(-1, Phi, 0), // 6
      new Vector3(-1, -Phi, 0),// 7

      new Vector3(0, -1, -Phi),// 8
      new Vector3(Phi, 0, -1), // 9
      new Vector3(0, 1, -Phi), // 10
      new Vector3(-Phi, 0, -1) // 11
    ];

    this.edges = [
      [0, 2], [0, 1], [1, 2], [2, 3], [3, 0],
      [0, 7], [0, 4], [1, 4], [1, 5], [2, 5], [2, 6], [3, 6], [3, 7],
      [1, 9], [3, 11], [4, 5], [5, 6], [6, 7], [7, 4],
      [8, 7], [8, 4], [9, 4], [9, 5], [10, 5], [10, 6], [11, 6], [11, 7],
      [8, 10], [8, 9], [9, 10], [10, 11], [11, 8]
    ];

    for (var index in this.vertices) {
      this.vertices[index].mul(this.scale);
      this.vertices[index].add(this.coord)
    }
  }
};

/************************Cylinder************************/
function Cylinder(coord, round, scale) { // vertices = 2 * 4 * round...
  this.round = 1;
  if (round !== undefined) {
    this.vertices = new Array(2 * 4 * round);
    this.edges = new Array(3 * 4 * round);
  } else {
    this.vertices = new Array(8);
    this.edges = new Array(12);
  }

  this.coord = new Vector3(0, 0, 0);
  this.scale = new Vector3(1, 1, 1);
  this.set(coord, round, scale);
}

Cylinder.prototype = {
  set: function (coord, round, scale) {
    if (coord !== undefined) {
      this.coord = coord;
    }

    if (round != undefined) {
      this.round = round;
    }

    if (scale !== undefined) {
      this.scale = scale;
    }

    var num = 4 * this.round; // Number of vertices of the top or bottom face
    for (var i = 0; i < 2 * num; i++) {
      var theta = 360 / num;
      if (Math.floor(i / num) == 0) {
        this.vertices[i] =
            new Vector3(Math.cos(i * theta * Math.PI / 180), Math.sin(i * theta * Math.PI / 180), -1);
      } else {
        this.vertices[i] =
            new Vector3(Math.cos(i * theta * Math.PI / 180), Math.sin(i * theta * Math.PI / 180), 1);
      }
    }

    for (var i = 0; i < 3 * num; i++) {
      if (Math.floor(i / num) == 0) {
        this.edges[i] = i !== num - 1 ? [i, i + 1] : [i, 0];
      } else if (Math.floor(i / num) == 1) {
        this.edges[i] = [i - num, i];
      } else {
        this.edges[i] = i !== 3 * num - 1 ? [i - num, i - num + 1] : [i - num, i - 2 * num + 1];
      }
    }

    for (var index in this.vertices) {
      this.vertices[index].mul(this.scale);
      this.vertices[index].add(this.coord)
    }
  }
};


/*****************************************************/
/************************Other************************/
/*****************************************************/

var moveShape = function (shape, dir, speed) {
  normalize(dir);
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
    scale: .15,
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