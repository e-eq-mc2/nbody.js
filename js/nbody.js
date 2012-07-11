/**
 * @author nk.nishizawa@gmail.com
 */

function NbodySystem(num) {
	this.num = num;
	this.pos = new Float32Array(this.num*3);
	this.vel = new Float32Array(this.num*3);
	this.mas = new Float32Array(this.num  );
	this.dt = 0.0002;
	this.soften2 = 0.1250; // softening factor
	this.damping = 0.9995;
}

NbodySystem.prototype.init = function () {
	var num = this.num;
	for (var i = 0; i < num; ++i) {
		var u = randomV3();
		var ii = i * 3;
		this.pos[ii  ] = u[0] * 0.5;
		this.pos[ii+1] = u[1] * 0.5;
		this.pos[ii+2] = u[2] * 0.5;
		
		this.vel[ii  ] = u[0] * 0.5;
		this.vel[ii+1] = u[1] * 0.5;
		this.vel[ii+2] = u[2] * 0.5;
		
		this.mas[i   ] = Math.random();
		if ( i == 0 ) {
			this.pos[ii  ] = 0;
			this.pos[ii+1] = 0;
			this.pos[ii+2] = 0;
			this.vel[ii  ] = 0;
			this.vel[ii+1] = 0;
			this.vel[ii+2] = 0;
			this.mas[i   ] =10;
		}
	};
	
	function randomV3() {
		var the = Math.random() * Math.PI * 2;
		// angle z aixs <--> v in x-y-z space
		var phi = Math.random() * Math.PI * 2;
		// angle x aixs <--> v on x-y   space
		var r = Math.random()*2 - 1; // [0 1) -> [-1 1)
		var z = r * Math.cos(the);
		var rxy = Math.sqrt(r*r - z*z);
		var x = rxy * Math.cos(phi);
		var y = rxy * Math.sin(phi);
		return new Float32Array([x, y, z]);
	}
};

NbodySystem.prototype.update = function () {
	var num = this.num;
	var dt = this.dt;
	var soften2 = this.soften2;
	var damping = this.damping;
	// update velocity
	for (var i = 0; i < num; ++i) {
		var ii = i * 3;
		var pix = this.pos[ii   ];
		var piy = this.pos[ii+ 1];
		var piz = this.pos[ii+ 2];
		var aix = 0;
		var aiy = 0;
		var aiz = 0;
		for (var j = 0; j < num; ++j) {
			//if ( i == j ) continue;
			var jj = j * 3;
			var pjx = this.pos[jj  ];
			var pjy = this.pos[jj+1];
			var pjz = this.pos[jj+2];
			var rx = pjx - pix;
			var ry = pjy - piy;
			var rz = pjz - piz;
			// ai = sum j ( rij * mj / (rij^2 + e^2)^(3/2) ) j : 1 <= j <= N
			var ls = (rx*rx + ry*ry + rz*rz) + soften2;
			var ls3 = ls * ls * ls;
			var inv = 1 / Math.sqrt(ls3);
			var s = this.mas[j] * inv;
			aix += rx * s;
			aiy += ry * s;
			aiz += rz * s;
		}
		this.vel[ii  ] = (this.vel[ii  ] + aix*dt)*damping;
		this.vel[ii+1] = (this.vel[ii+1] + aiy*dt)*damping;
		this.vel[ii+2] = (this.vel[ii+2] + aiz*dt)*damping;
	}
	// update position
	for (var i = 0; i < num; ++i) {
		var ii = i * 3;
		this.pos[ii  ] += this.vel[ii  ] * dt;
		this.pos[ii+1] += this.vel[ii+1] * dt;
		this.pos[ii+2] += this.vel[ii+2] * dt;
	}
}
