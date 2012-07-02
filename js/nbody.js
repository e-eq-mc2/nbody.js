/**
 * @author nk.nishizawa@gmail.com
 */

var V3 = function (x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
}

V3.prototype.add = function (v) {
	this.x += v.x;
	this.y += v.y;
	this.z += v.z;
	return this;
};

V3.prototype.sub = function (v) {
	this.x -= v.x;
	this.y -= v.y;
	this.z -= v.z;
	return this;
};

V3.prototype.mul = function (s) {
	this.x *= s;
	this.y *= s; 
	this.z *= s;
	return this;
};

Vector3.dot = function (v0, v1) {
	return v0[0]*v1[0] + v0[1]*v1[1] + v0[2]*v1[2];
};

Vector3.length = function (v) {
	var x = v[0]; var y = v[1]; var z = v[2];
	return Math.sqrt(x*x + y*y + z*z);
};

Vector3.length2 = function (v) {
	var x = v[0]; var y = v[1]; var z = v[2];
	return x*x + y*y + z*z;
};

Vector3.normalize = function (v) {
	var x = v[0]; var y = v[1]; var z = v[2];
	var s = 1.0 / Math.sqrt(x*x + y*y + z*z)
	var dst = new VECTOR_TYPE(3);
	dst[0] = s * x;
	dst[1] = s * y;
	dst[2] = s * z;
	return dst;
};