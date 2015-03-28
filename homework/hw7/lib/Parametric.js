/**
 * Created by youlongli on 3/20/15.
 */
function Parametric(nu, nv, uv2xyz) {
  this.nu = nu;
  this.nv = nv;
  // Special tuning variable
  this.t1 = 1;
  this.t2 = 1;
  this.t3 = 1;
  // surface
  this.surface = [new Vector3(0, 0, 0), new Vector3(0, 0, 0), new Vector3(0, 0, 0), new Vector3(0, 0, 0)];
  this.uv2xyz = uv2xyz;
}

Parametric.prototype = {
  render: function (canvas, matrix, g) {
    var du = 1 / this.nu;
    var dv = 1 / this.nv;
    for (var u = 0; u < .999; u += du) {
      for (var v = 0; v < .999; v += dv) {
        this.uv2xyz(u, v, this.surface[0]);
        this.uv2xyz(u + du, v, this.surface[1]);
        this.uv2xyz(u + du, v + dv, this.surface[2]);
        this.uv2xyz(u, v + dv, this.surface[3]);
        drawSurface(canvas, matrix, g, this.surface);
      }
    }
  },
  changeShape: function (uv2xyz) {
    this.uv2xyz = uv2xyz;
  },
  tune: function (t1, t2, t3) {
    this.t1 = t1;
    this.t2 = t2;
    this.t3 = t3;
  }
};

function drawSurface(canvas, matrix, g, loop) {
  var edges = [[0, 1], [1, 2], [2, 3], [3, 0]];

  for (var edgeIndex in edges) {
    var edge = edges[edgeIndex];
    var vertex1 = new Vector3(0, 0, 0);
    var vertex2 = new Vector3(0, 0, 0);
    matrix.transform(loop[edge[0]], vertex1);
    matrix.transform(loop[edge[1]], vertex2);
    vertex1.viewportTransformation(canvas);
    vertex2.viewportTransformation(canvas);

    g.beginPath();
    g.moveTo(vertex1.x, vertex1.y);
    g.lineTo(vertex2.x, vertex2.y);
    g.stroke();
  }
}

function uv2xyzCylinder(u, v, dst) {
  var TAU = 2 * Math.PI;
  var Theta = TAU * u;

  var x = Math.sin(Theta);
  var y = 2 * v - 1;
  var z = Math.cos(Theta);
  dst.set(x, y, z);
}

function uv2xyzSphere(u, v, dst) {
  var TAU = 2 * Math.PI;
  var Theta = TAU * u;
  var Phi = Math.PI * v - Math.PI / 2;

  var x = Math.cos(Phi) * Math.sin(Theta);
  var y = Math.sin(Phi);
  var z = Math.cos(Phi) * Math.cos(Theta);
  dst.set(x, y, z);
}

function uv2xyzFlag(u, v, dst) {
  var x = 2 * u - 1;
  var y = 2 * v - 1;
  var z = .5 * (new Noise()).noise([3 * u, 3 * v, 3 * time]) * u;
  dst.set(x, y, z);
}

function uv2xyzRipple(u, v, dst) {
  var TAU = 2 * Math.PI;
  var x = 2 * u - 1;
  var y = 2 * v - 1;
  var z = Math.sin((Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) - time) * 15) / 10;
  dst.set(x, y, z);
}

// Ref: http://en.wikipedia.org/wiki/Superquadrics
function uv2xyzSuperquadric(u, v, dst) {
  function sgn(x) {
    if (x == 0) return x;
    return x > 0 ? 1 : -1;
  }

  function c(w, m) {
    return sgn(Math.cos(w)) * Math.pow(Math.abs(Math.cos(w)), m);
  }

  function s(w, m) {
    return sgn(Math.sin(w)) * Math.pow(Math.abs(Math.sin(w)), m);
  }

  var TAU = 2 * Math.PI;
  var Theta = TAU * u;
  var Phi = Math.PI * v - Math.PI / 2;

  var x = c(Phi, this.t1) * c(Theta, this.t1);
  var y = c(Phi, this.t2) * s(Theta, this.t2);
  var z = s(Phi, this.t3);
  dst.set(x, y, z);
}

function uv2xyzCurving(u, v, dst) {
  var TAU = 2 * Math.PI;
  var Theta = TAU * u;

  var x = Math.cos(time * u) * u * .6;
  var y = Math.sin(time * u) * u * .6;
  var z = v * .6;
  dst.set(x, y, z);
}

function uv2xyzSpring(u, v, dst) {
  var TAU = 2 * Math.PI;
  var Theta = TAU * u;

  var x = Math.sin(Theta * time);
  var y = 2 * v - 1;
  var z = Theta * Math.cos(time);
  dst.set(x, y, z);
}

function uv2xyzExperiment(u, v, dst) {
  var TAU = 2 * Math.PI;
  var Theta = TAU * u;
  var R = 1;
  var r = .5;
  var t = 1;

  var x = Math.sin(Theta * time);
  var y = 2 * v - 1;
  var z = Theta * Math.cos(time);
  dst.set(x, y, z);
}