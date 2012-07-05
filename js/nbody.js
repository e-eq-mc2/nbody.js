/**
 * @author nk.nishizawa@gmail.com
**/

function runNbodySystem() {
	const NUM_BODY = 1000;
	
	var nbodySystem = new function (n) {
		this.num = n;
		this.pos = new Array(this.num);
		this.vel = new Array(this.num);
		this.mas = new Array(this.num);
		this.dt = 0.05;
		this.soften2 = 0.00125; // softening factor ^ 2
		this.damping = 0.995;
	} (NUM_BODY);
	
	new function initNbodySystem (nsys) {
		var num = nsys.num;
		for (var i = 0; i < num; ++i) {
			var v = Vector3.randomUnit();
			nsys.pos[i] = Vector3.scale(v, 1);
			nsys.vel[i] = Vector3.scale(v, 1);
			nsys.mas[i] = 1;
		}
	} (nbodySystem);
	
	var loopCount = 0;
	var timer = new Timer();
	new function loopNbodySystem(nsys) {
		timer.start();
		updateNbodySystem(nsys);
		timer.stop();
		
		++loopCount;
		var p = document.getElementById("printElapsed");
		if ( !!p ) {
			var e1msec = timer.elapsedMsec();
			var etmsec = timer.elapsedTotalMsec();
			p.innerHTML  = loopCount + "th ";
			p.innerHTML += "Elapsed : " + e1msec + " ";
			p.innerHTML += "Ave. : " + Math.ceil(etmsec/loopCount) +" msec";
		}
		
		// pass function OBJECT (Don't call function !!)
		var timeoutId = setTimeout(function () {loopNbodySystem(nsys);}, 100);
		if ( loopCount >= 20 ) 
			clearTimeout(timeoutId);
	} (nbodySystem);
}

function updateNbodySystem(nsys) {
	var num = nsys.num;
	var pos = nsys.pos;
	var vel = nsys.vel;
	var mas = nsys.mas;
	var dt = nsys.dt;
	var soften2 = nsys.soften2;
	var damping = nsys.damping;
	// update velocity
	for (var i = 0; i < num; ++i) {
		var pi = nsys.pos[i];
		var ax = 0;
		var ay = 0;
		var az = 0;
		for (var j = 0; j < num; ++j) {
			//if ( i == j ) continue;
			var pj = nsys.pos[j];
			var mj = nsys.mas[j];
			var rx = pj.x - pi.x;
			var ry = pj.y - pi.y;
			var rz = pj.z - pi.z;
			// ai = sum j ( rij * mj / (rij^2 + e^2)^(3/2) ) j : 1 <= j <= N
			var ls = (rx*rx + ry*ry + rz*rz) + soften2;
			var ls3 = ls * ls * ls;
			var inv = 1 / Math.sqrt(ls3);
			var s = mj * inv;
			ax += rx * s;
			ay += ry * s;
			az += rz * s;
		}
		var vi = nsys.vel[i];
		vi.x = (vi.x + ax * dt) * damping;
		vi.y = (vi.y + ay * dt) * damping;
		vi.z = (vi.z + az * dt) * damping;
	}
	// update position
	for (var i = 0; i < num; ++i) {
		var pi = nsys.pos[i];
		var vi = nsys.vel[i];
		pi.x += vi.x * dt;
		pi.y += vi.y * dt;
		pi.z += vi.z * dt;
	}
}

//////// Timer ////////
function Timer() {
	Timer.prototype.reset = function () {
		this.timeStart    = 0;
		this.timeStop     = 0;
		this.elapsed      = 0;
		this.elapsedTotal = 0;
	};
	Timer.prototype.start = function () {
		this.timeStart = new Date().getTime();
		return this.timeStart;
	};
	Timer.prototype.stop = function () {
		this.timeStop = new Date().getTime();
		this.elapsed = this.timeStop - this.timeStart;
		this.elapsedTotal += this.elapsed;
		return this.timeStop;
	};
	Timer.prototype.elapsedMsec = function () {
		return this.elapsed;
	};
	Timer.prototype.elapsedTotalMsec = function () {
		return this.elapsedTotal;
	};
	this.reset();
}

//////// Vector3 ////////
var Vector3 = function (x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
};

Vector3.prototype.set = function (v) {
	this.x = v.x;
	this.y = v.y;
	this.z = v.z;
	return this;
};

Vector3.prototype.add = function (v) {
	this.x += v.x;
	this.y += v.y;
	this.z += v.z;
	return this;
};

Vector3.prototype.subtract = function (v) { //subtraction
	this.x -= v.x;
	this.y -= v.y;
	this.z -= v.z;
	return this;
};

Vector3.prototype.scale = function (s) {
	this.x *= s;
	this.y *= s; 
	this.z *= s;
	return this;
};

Vector3.prototype.negate = function () {
	this.x = -this.x;
	this.y = -this.y; 
	this.z = -this.z;
	return this;
};

Vector3.prototype.normalize = function () {
	var x = this.x; 
	var y = this.y; 
	var z = this.z;
	var s = 1 / Math.sqrt(x*x + y*y + z*z);
	this.x *= s;
	this.y *= s;
	this.z *= s;
	return this;
};

Vector3.prototype.length = function () {
	var x = this.x; 
	var y = this.y; 
	var z = this.z;
	return Math.sqrt(x*x + y*y + z*z);
};

Vector3.prototype.length2 = function () {
	var x = this.x;
	var y = this.y; 
	var z = this.z;
	return (x*x + y*y + z*z);
};

Vector3.prototype.clone = function () {
	return new Vector3(this.x, this.y, this.z);
};

Vector3.prototype.randomUnit = function () {
	var the = Math.random() * Math.PI*2; // angle z aixs <--> v in x-y-z space
	var phi = Math.random() * Math.PI*2; // angle x aixs <--> v on x-y   space
	var z = Math.cos(the);
	var r = Math.sqrt(1 - z*z);
	this.x = r * Math.cos(phi);
	this.y = r * Math.sin(phi);
	this.z = z;
	return this;
};

Vector3.add = function (v0, v1) {
	return new Vector3(v0.x+v1.x, v0.y+v1.y, v0.z+v1.z);
};

Vector3.subtract = function (v0, v1) {
	return new Vector3(v0.x-v1.x, v0.y-v1.y, v0.z-v1.z);
};

Vector3.scale = function (v, s) {
	return new Vector3(v.x*s, v.y*s, v.z*s);
};

Vector3.negate = function (v) {
	return new Vector3(-v.x, -v.y, -v.z);
};

Vector3.dot = function (v0, v1) {
	return (v0.x*v1.x + v0.y*v1.y + v0.z*v1.z);
};

Vector3.cross = function(v0, v1){
	var x0 = v0.x;
	var y0 = v0.y;
	var z0 = v0.z;
	var x1 = v1.x;
	var y1 = v1.y;
	var z1 = v1.z;
	return new Vector3(y0*z1 - z0*y1, z0*x1 - x0*z1, x0*y1 - y0*x1);
};

Vector3.normalize = function (v) {
	var x = this.x;
	var y = this.y;
	var z = this.z;
	var s = 1.0 / Math.sqrt(x*x + y*y + z*z);
	x *= s;
	y *= s;
	z *= s;
	return new Vector3(x, y, z);
};

Vector3.randomUnit = function () {
	var the = Math.random() * Math.PI*2; // angle z aixs <--> v in x-y-z space
	var phi = Math.random() * Math.PI*2; // angle x aixs <--> v on x-y   space
	var z = Math.cos(the);
	var r = Math.sqrt(1 - z*z);
	var x = r * Math.cos(phi);
	var y = r * Math.sin(phi);
	return new Vector3(x, y, z);
};