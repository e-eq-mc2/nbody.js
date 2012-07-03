/**
 * @author nk.nishizawa@gmail.com
**/

var V3 = function (x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
};

V3.prototype.set = function (v) {
	this.x = v.x;
	this.y = v.y;
	this.z = v.z;
	return this;
};

V3.prototype.add = function (v) {
	this.x += v.x;
	this.y += v.y;
	this.z += v.z;
	return this;
};

V3.prototype.subtract = function (v) { //subtraction
	this.x -= v.x;
	this.y -= v.y;
	this.z -= v.z;
	return this;
};

V3.prototype.scale = function (s) {
	this.x *= s;
	this.y *= s; 
	this.z *= s;
	return this;
};

V3.prototype.negate = function () {
	this.x = -this.x;
	this.y = -this.y; 
	this.z = -this.z;
	return this;
};

V3.prototype.normalize = function () {
	var x = this.x; 
	var y = this.y; 
	var z = this.z;
	var s = 1.0 / Math.sqrt(x*x + y*y + z*z);
	this.x *= s;
	this.y *= s;
	this.z *= s;
	return this;
};

V3.prototype.length = function () {
	var x = this.x; 
	var y = this.y; 
	var z = this.z;
	return Math.sqrt(x*x + y*y + z*z);
};

V3.prototype.length2 = function () {
	var x = this.x;
	var y = this.y; 
	var z = this.z;
	return (x*x + y*y + z*z);
};

V3.prototype.clone = function () {
	return new V3(this.x, this.y, this.z);
};

V3.add = function (v0, v1) {
	return new V3(v0.x+v1.x, v0.y+v1.y, v0.z+v1.z);
};

V3.subtract = function (v0, v1) {
	return new V3(v0.x-v1.x, v0.y-v1.y, v0.z-v1.z);
};

V3.dot = function (v0, v1) {
	return (v0.x*v1.x + v0.y*v1.y + v0.z*v1.z);
};

V3.cross = function(v0, v1){
    var x0 = v0.x;
    var y0 = v0.y;
    var z0 = v0.z;
    var x1 = v1.x;
    var y1 = v1.y;
    var z1 = v1.z;
    return new V3(y0*z1 - z0*y1, z0*x1 - x0*z1, x0*y1 - y0*x1);
};

V3.normalize = function (v) {
	var x = this.x;
	var y = this.y;
	var z = this.z;
	var s = 1.0 / Math.sqrt(x*x + y*y + z*z);
	x *= s;
	y *= s;
	z *= s;
	return new V3(x, y, z);
};