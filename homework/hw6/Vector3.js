/**
 * Created by youlongli on 3/20/15.
 */
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
  sub: function(that){
    this.x -= that.x;
    this.y -= that.y;
    this.z -= that.z;
  },
  mul: function (that) {
    this.x *= that.x;
    this.y *= that.y;
    this.z *= that.z;
  },
  div: function (that) {
    this.x /= that.x;
    this.y /= that.y;
    this.z /= that.z;
  },
  equals: function(that) {
    return Math.abs(this.x - that.x) < 0.001
        && Math.abs(this.y - that.y) < 0.001
        && Math.abs(this.z - that.z) < 0.001;
  },
  clone: function () {
    return new Vector3(this.x, this.y, this.z);
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
  },
  normalize: function (src, dst) {
    var dst = new Vector3(0, 0, 0);
    var length = Math.sqrt(Math.pow(src.x, 2) + Math.pow(src.y, 2) + Math.pow(src.z, 2));
    dst.x = src.x / length;
    dst.y = src.y / length;
    dst.z = src.z / length;
  },
  toArray: function () {
    var array = [];
    array[0] = this.x;
    array[1] = this.y;
    array[2] = this.z;
    return array;
  }
};