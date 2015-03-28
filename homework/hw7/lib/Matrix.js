/**
 * Created by youlongli on 3/20/15.
 */
function Matrix() {
  this.row = 4;
  this.col = 4;
  this.matrix = [];
  this.scaleEnv = new Vector3(1, 1, 1);
  this.identityMatrix = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ];

  for (var i = 0; i < this.row; i++) {
    this.matrix[i] = [];
  }

  this.identity();
}

Matrix.prototype = {
  set: function (m) {
    // No checking
    for (var i = 0; i < this.row; i++) {
      for (var j = 0; j < this.col; j++) {
        this.matrix[i][j] = m[i][j];
      }
    }
  },
  identity: function () {
    for (var i = 0; i < this.row; i++) {
      for (var j = 0; j < this.col; j++) {
        this.matrix[i][j] = this.identityMatrix[i][j];
      }
    }
  },
  translate: function (x, y, z) {
    var T = this.cloneIdentity();
    if (x !== undefined) T.matrix[0][3] = x;
    if (y !== undefined) T.matrix[1][3] = y;
    if (z !== undefined) T.matrix[2][3] = z;
    this.multiply(this.clone(), T, this);
  },
  rotateX: function (theta) {
    if (theta !== undefined) {
      var T = this.cloneIdentity();
      T.matrix[1][1] = Math.cos(theta * Math.PI / 180.0);
      T.matrix[1][2] = -Math.sin(theta * Math.PI / 180.0);
      T.matrix[2][1] = Math.sin(theta * Math.PI / 180.0);
      T.matrix[2][2] = Math.cos(theta * Math.PI / 180.0);
      this.multiply(this.clone(), T, this);
    }
  },
  rotateY: function (theta) {
    if (theta !== undefined) {
      var T = this.cloneIdentity();
      T.matrix[0][0] = Math.cos(theta * Math.PI / 180.0);
      T.matrix[0][2] = Math.sin(theta * Math.PI / 180.0);
      T.matrix[2][0] = -Math.sin(theta * Math.PI / 180.0);
      T.matrix[2][2] = Math.cos(theta * Math.PI / 180.0);
      this.multiply(this.clone(), T, this);
    }
  },
  rotateZ: function (theta) {
    if (theta !== undefined) {
      var T = this.cloneIdentity();
      T.matrix[0][0] = Math.cos(theta * Math.PI / 180.0);
      T.matrix[0][1] = -Math.sin(theta * Math.PI / 180.0);
      T.matrix[1][0] = Math.sin(theta * Math.PI / 180.0);
      T.matrix[1][1] = Math.cos(theta * Math.PI / 180.0);
      this.multiply(this.clone(), T, this);
    }
  },
  scale: function (x, y, z) {
    var T = this.cloneIdentity();
    if (x !== undefined) this.scaleEnv.x = x;
    if (y !== undefined) this.scaleEnv.y = y;
    if (z !== undefined) this.scaleEnv.z = z;
    if (this.scaleEnv.x !== undefined) T.matrix[0][0] *= this.scaleEnv.x;
    if (this.scaleEnv.y !== undefined) T.matrix[1][1] *= this.scaleEnv.y;
    if (this.scaleEnv.z !== undefined) T.matrix[2][2] *= this.scaleEnv.z;
    this.multiply(this.clone(), T, this);
  },
  transform: function (src, dst) {
    w = this.matrix[3][0] * src.x + this.matrix[3][1] * src.y + this.matrix[3][2] * src.z + this.matrix[3][3];
    dst.x = (this.matrix[0][0] * src.x + this.matrix[0][1] * src.y + this.matrix[0][2] * src.z + this.matrix[0][3]) / w;
    dst.y = (this.matrix[1][0] * src.x + this.matrix[1][1] * src.y + this.matrix[1][2] * src.z + this.matrix[1][3]) / w;
    dst.z = (this.matrix[2][0] * src.x + this.matrix[2][1] * src.y + this.matrix[2][2] * src.z + this.matrix[2][3]) / w;
  },
  perspective: function (x, y, z) {
    var T = this.cloneIdentity();
    if (x !== undefined) T.matrix[3][0] = x;
    if (y !== undefined) T.matrix[3][1] = y;
    if (z !== undefined) T.matrix[3][2] = z;
    this.multiply(this.clone(), T, this);
  },
  perspective2: function (f) {
    var T = this.cloneIdentity();
    if (f !== undefined) {
      T.matrix[3][2] = 1 / f;
      T.matrix[3][3] = 0;
    }
    this.multiply(this.clone(), T, this);
  },
  clone: function () {
    var clone = new Matrix();
    clone.set(this.matrix);
    return clone;
  },
  cloneIdentity: function () {
    var clone = new Matrix();
    clone.set(this.identityMatrix);
    return clone;
  },
  multiply: function (A, B, C) {
    for (var i = 0; i < this.row; i++) {
      for (var j = 0; j < this.col; j++) {
        var sum = 0;
        for (var k = 0; k < this.row; k++) {
          sum += A.matrix[i][k] * B.matrix[k][j];
        }
        C.matrix[i][j] = sum;
      }
    }
  },
  // REF: http://mrl.nyu.edu/~perlin/courses/spring2015/0311/simpleInvert.js
  invert: function (src, dst) {
    // COMPUTE ADJOINT COFACTOR MATRIX FOR THE ROTATION+SCALE 3x3
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        var i0 = (i + 1) % 3;
        var i1 = (i + 2) % 3;
        var j0 = (j + 1) % 3;
        var j1 = (j + 2) % 3;
        dst.matrix[j + 4 * i] = src.matrix[i0 + 4 * j0] * src.matrix[i1 + 4 * j1] - src.matrix[i0 + 4 * j1] * src.matrix[i1 + 4 * j0];
      }
    }

    // RENORMALIZE BY DETERMINANT TO GET ROTATION+SCALE 3x3 INVERSE
    var determinant = src.matrix[0 + 4 * 0] * dst.matrix[0 + 4 * 0]
        + src.matrix[1 + 4 * 0] * dst.matrix[0 + 4 * 1]
        + src.matrix[2 + 4 * 0] * dst.matrix[0 + 4 * 2];
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        dst.matrix[i + 4 * j] /= determinant;
      }
    }


    // COMPUTE INVERSE TRANSLATION
    for (var i = 0; i < 3; i++) {
      dst.matrix[i + 4 * 3] = -dst.matrix[i + 4 * 0] * src[0 + 4 * 3]
      - dst.matrix[i + 4 * 1] * src.matrix[1 + 4 * 3]
      - dst.matrix[i + 4 * 2] * src.matrix[2 + 4 * 3];
    }
  }
};