/**
 * Created by youlongli on 3/27/15.
 */
function Bezier() {
}

Bezier.prototype = {
  /**
   * getCoord2 has the better performance :)
   */
  getCoord1: function (t, points) {
    var pascalK = this.getPascal(points.length);
    var point = new Vector3();
    var minusT = 1 - t;

    for (var i = 0; i < points.length; i++) {
      point.x += pascalK[i] * points[i].x * Math.pow(minusT, points.length - i - 1) * Math.pow(t, i);
      point.y += pascalK[i] * points[i].y * Math.pow(minusT, points.length - i - 1) * Math.pow(t, i);
    }

    return point;
  },
  getCoord2: function (t, points) {
    if (points === undefined || points.length < 3) {
      return;
    }

    if (points.length > 3) {
      var newPoints = [];

      for (var i = 0; i < points.length - 1; i++) {
        newPoints[i] = new Vector3();
        newPoints[i].x = (1 - t) * points[i].x + t * points[i + 1].x;
        newPoints[i].y = (1 - t) * points[i].y + t * points[i + 1].y;
      }

      return this.getCoord2(t, newPoints);
    } else if (points.length === 3) {
      var S = new Vector3();
      var T = new Vector3();
      S.x = (1 - t) * points[0].x + t * points[1].x;
      S.y = (1 - t) * points[0].y + t * points[1].y;
      T.x = (1 - t) * points[1].x + t * points[2].x;
      T.y = (1 - t) * points[1].y + t * points[2].y;
      var point = new Vector3();
      point.x = (1 - t) * S.x + t * T.x;
      point.y = (1 - t) * S.y + t * T.y;
      return point;
    }
  },
  /**
   * @param k the level of the pascal,
   */
  getPascal: function(k) {
    var curr = [];

    for (var i = 0; i < k; i++) {
      var next = [];
      for (var j = 0; j <= i; j++) {
        if (j === 0 || j === i) {
          next.push(1);
        } else {
          next.push(curr[j - 1] + curr[j]);
        }
      }
      curr = next;
    }

    return curr;
  }
};