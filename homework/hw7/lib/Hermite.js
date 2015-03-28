/**
 * Created by youlongli on 3/27/15.
 */
function Hermite() {
  this.P0 = new Vector3();
  this.P1 = new Vector3();
  this.R0 = 0.0;
  this.R1 = 0.0;
  this.matrix = [];

  this.set();
}

Hermite.prototype = {
  set: function () {
    this.matrix = [
      [2, -2, 1, 1],
      [-3, 3, -2, -1],
      [0, 0, 1, 0],
      [1, 0, 0, 0]
    ];
  },
  setParam: function (P0, P1, R0, R1) {
    this.P0 = P0;
    this.P1 = P1;
    this.R0 = R0;
    this.R1 = R1;

  },
  getCoord: function (t) {
    if (this.P0 === undefined || this.P1 === undefined || this.R0 === undefined || this.R1 === undefined) {
      throw "Parameters are not defined...";
    }
    var point = new Vector3();

    for (var i = 0; i < 4; i++) {
      var tmp = Math.pow(t, 3) * this.matrix[0][i] + Math.pow(t, 2) * this.matrix[1][i] + Math.pow(t, 1) * this.matrix[2][i] + Math.pow(t, 0) * this.matrix[3][i];

      switch (i) {
        case 0:
          point.x += tmp * this.P0.x;
          point.y += tmp * this.P0.y;
          break;
        case 1:
          point.x += tmp * this.P1.x;
          point.y += tmp * this.P1.y;
          break;
        case 2:
          point.x += tmp * this.R0;
          point.y += tmp * this.R0;
          break;
        default :
          point.x += tmp * this.R1;
          point.y += tmp * this.R1;
      }
    }

    return point;
  }
};