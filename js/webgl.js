/**
 * @author nk.nishizawa@gmail.com
 */

$(function () {
"use strict";
	var canvas = $("#webglCanvas").get(0);
	canvas.width  = $("#canvasArea").width();
	canvas.height = $("#canvasArea").height();
	
	var gl     = webglUtil.initGL(canvas);
	var prgObj = webglUtil.initShaders(gl);
	var texObj = webglUtil.initTexture(gl, "img/karada1.png");

	var attrib = {
		vertex : {
			vbo      : gl.createBuffer(),
			location : gl.getAttribLocation(prgObj, "vertex"),
			size     : 3, // number of components per generic vertex attribute
			type     : gl.FLOAT
		},
		texCoord : {
			vbo      : gl.createBuffer(),
			location : gl.getAttribLocation(prgObj, "texCoord"),
			size     : 2, // number of components per generic vertex attribute
			type     : gl.FLOAT
		}
	};
	var uniform = {
		projectionMatrix : {
			location  : gl.getUniformLocation(prgObj, "projectionMatrix"),
			transpose : false
		},
		modelViewMatrix : {
			location  : gl.getUniformLocation(prgObj, "modelViewMatrix"),
			transpose : false
		},
		drawMode : {
			location  : gl.getUniformLocation(prgObj, "drawMode"),
		},
		pointSize : {
			location  : gl.getUniformLocation(prgObj, "pointSize"),
		},
		color : {
			location  : gl.getUniformLocation(prgObj, "color"),
		},
		texSampler : {
			location  : gl.getUniformLocation(prgObj, "texSampler"),
		}
	};
	
	var NUM_BODY =  256;
	var MAX_LOOP = 5000;
	
	var nbSys = new NbodySystem(NUM_BODY);
	nbSys.init();
	
	var t3Idx = createBoardIndex(gl, NUM_BODY);
	
	var angle = 0;
	var loop  = 0;
	var timer0 = new Timer();
	var timer1 = new Timer();
	drawLoop();
	
	////////////////////
	// local function //
	////////////////////
	function drawLoop() {
		timer0.start();
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
		//gl.enable(gl.CULL_FACE);
		gl.clearColor(1, 1, 1, 1);
		gl.clearDepth(1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		timer1.start();
		nbSys.update();
		timer1.stop();
		
		var  pM = M4x4.clone(M4x4.I);
		var mvM = M4x4.clone(M4x4.I);
		M4x4.makeFrustum(-0.1, 0.1, -0.1, 0.1, 0.3, 10, pM); // left right bottom top near far
		M4x4.translate3(0, 0, -1.5, mvM, mvM); // mvM = mvM * T
		M4x4.rotate(angle, [0, 1, 0], mvM, mvM); // mvM = mvM * R
		gl.uniformMatrix4fv(uniform.projectionMatrix.location, uniform.projectionMatrix.transpose,  pM);
		gl.uniformMatrix4fv(uniform. modelViewMatrix.location, uniform. modelViewMatrix.transpose, mvM);
		
		var drawMode = $('input:radio:[name="drawMode"]:checked').val();
		var DRAW_MODE = {POINT: 0, POINT_SPRITE: 1, BILL_BOARD: 2};
		gl.uniform1i(uniform.drawMode.location, Number(drawMode));
		// selects which texture unit subsequent texture state calls will affect
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texObj);
		switch ( Number(drawMode) ) {
			case DRAW_MODE.POINT:
				gl.uniform4fv(uniform.color.location, [0, 0, 0, 0.5]);
				gl.uniform1f(uniform.pointSize.location, 8);
				setAttrib(gl, attrib.vertex, nbSys.pos);
				
				gl.drawArrays(gl.POINTS, 0, nbSys.num);
				
				unsetAttrib(gl, attrib.vertex);
				break;
			case DRAW_MODE.POINT_SPRITE:
				gl.uniform1i(uniform.texSampler.location, 0);
				gl.uniform4fv(uniform.color.location, [1, 1, 1, 0.7]);
				gl.uniform1f(uniform.pointSize.location, 32);
				setAttrib(gl, attrib.vertex, nbSys.pos);
				
				gl.drawArrays(gl.POINTS, 0, nbSys.num);
				
				unsetAttrib(gl, attrib.vertex);
				break;
			case DRAW_MODE.BILL_BOARD:
				var board = new BillBoard(nbSys.num, nbSys.pos, 0.08, 0.08);
				gl.uniform1i(uniform.texSampler.location, 0);
				gl.uniform4fv(uniform.color.location, [1, 1, 1, 0.7]);
				setAttrib(gl, attrib.vertex, board.pos);
				setAttrib(gl, attrib.texCoord, board.tex);
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, t3Idx.ibo);
				
				// can not use gl.QUADS
				// can not use gl.UNSIGNED_INT
				gl.drawElements(gl.TRIANGLES, t3Idx.data.length, gl.UNSIGNED_SHORT, 0); 
				
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
				unsetAttrib(gl, attrib.texCoord);
				unsetAttrib(gl, attrib.vertex);
				break;
			default:
				alert("ERROR: No supported DRAW_MODE.");
				break;
		}
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.flush();
		
		var err = gl.getError();
		if (err != gl.NO_ERROR && err != gl.CONTEXT_LOST_WEBGL) {
			alert( WebGLDebugUtils.glEnumToString(err) );
		}
		
		++loop;
		
		timer0.stop();
		var ela0 = Math.ceil(timer0.elapsedMsec());
		var ela1 = Math.ceil(timer1.elapsedMsec());
		var ave0 = Math.ceil(timer0.elapsedTotalMsec()/loop);
		var ave1 = Math.ceil(timer1.elapsedTotalMsec()/loop);
		angle += deg2rad(360/10) * ela0/1000;
		
		ela0 = num2str(ela0, 4);
		ela1 = num2str(ela1, 4);
		ave0 = num2str(ave0, 4);
		ave1 = num2str(ave1, 4);
		$("#info").html(
			'<p>' + nbSys.num + ' bodies, step: ' + loop + '</p>' +
		    '<p>' +  'N-body Elapsed: ' + ela1 + ' msec ' + '(ave. ' +  ave1 + ')' + '</p>' +
			'<p>' +  '+WebGL Elapsed: ' + ela0 + ' msec ' + '(ave. ' +  ave0 + ')' + '</p>'
		);

		var timeoutId = setTimeout(drawLoop, 33);
		
		if (loop >= MAX_LOOP)
			clearTimeout(timeoutId);
	} // end of function drawLoop()

	////////////////////
	// local function //
	////////////////////
	function setAttrib(gl, attrib, data) {
		//console.log("webgl: bind VBO(array buffer) to current BO(buffer object) ...");
		gl.bindBuffer(gl.ARRAY_BUFFER, attrib.vbo);
		//console.log("webgl: create data store in current BO(buffer object) and transfer data to current BO ...");
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
		// enable vertex attribute array specified by location(index). if enabled, it is used for rendering such as gl.Draw(Arrays|Elements|etc.)
		gl.enableVertexAttribArray(attrib.location);
		// specifiey data format of the array of vertex attribute at location == specifey how to map vbo to generic vertex attribute
		gl.vertexAttribPointer(
			attrib.location, // location of generic vertex attribute to be modified
			attrib.size,
			attrib.type,
			false, 0, 0
		);	
		//console.log("webgl: un-bind VBO(array buffer) ...");
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}
	
	////////////////////
	// local function //
	////////////////////
	function unsetAttrib(gl, attrib) {
		gl.bindBuffer(gl.ARRAY_BUFFER, attrib.vbo);
		gl.disableVertexAttribArray(attrib.location);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}
	

	////////////////////
	// local function //
	////////////////////
	function deg2rad(deg) {
		return deg * Math.PI / 180;
	}
	
	function num2str(num, len) {
		var str = num + ""; 
		while (str.length < len)
			str = " " + str;
		return str.replace(/ /g, "&nbsp;");
	}
	
	////////////////////
	// local function //
	////////////////////
	function BillBoard(numBoard, center, width, height) {
		var perBoard = 4; // 4 vertices / board
		this.pos = new Float32Array(numBoard * perBoard * 3); // x, y, z = 3
		this.tex = new Float32Array(numBoard * perBoard * 2); // s, t    = 2
		var harfW = width  / 2;
		var harfH = height / 2;
		for (var i=0; i < numBoard; ++i) {
			var ii = i * 3;
			var cx = center[ii  ]; 
			var cy = center[ii+1];
			var cz = center[ii+2];
			var aij = makeE012(cx, cy, cz); // openGL order (column major)
			var j0 = i * perBoard;
			for (var j=0; j < perBoard; ++j) {
				// 2 --- 3
				// |     |
				// |     |
				// 0 --- 1
				var jj = j0 + j;
				var jp = jj * 3;
				var jt = jj * 2;
				var swX = j & 1;
				var swY = j & 2;
				var px = (swX ? harfW : -harfW);
				var py = (swY ? harfH : -harfH);
				// pi= aji * pj(local) = [a]^t {p(local)}
				this.pos[jp  ] = cx + aij[0]*px + aij[1]*py + aij[2]*0;
				this.pos[jp+1] = cy + aij[3]*px + aij[4]*py + aij[5]*0;
				this.pos[jp+2] = cz + aij[6]*px + aij[7]*py + aij[8]*0;
				this.tex[jt  ] = swX ? 1.0 : 0.0;
				this.tex[jt+1] = swY ? 0.0 : 1.0;
			}
		}
	
		////////////////////
		// local function //
		////////////////////
		function makeE012(cx, cy, cz) {
			// local unit basis e2 = z-axis
			//var e2 = [-cx, -cy, -cz];
			var e2 = [cx, cy, cz];
			var le2 = V3.length(e2);
			if (le2 == 0) {
				V3.set(e2, [0, 0, 1]);
			} else {
				V3.scale(e2, 1 / le2);
			}
			// local unit basis e0 = x-axis
			var e0 = V3.cross([0, 1, 0], e2);
			var le0 = V3.length(e0);
			if (le0 == 0) {
				V3.set(e0, [-1, 0, 0]);
			} else {
				V3.scale(e0, 1 / le0);
			}
			// local unit basis e1 = y-axis
			var e1 = V3.cross(e2, e0);
			return [e0[0], e1[0], e2[0], e0[1], e1[1], e2[1], e0[2], e1[2], e2[2]]; // openGL order (column major)
		}
	} // end of BillBoard
	
	function createBoardIndex(gl, numBoard) {
		var t3Idx = {};
		var perBoard = 6; // 1 board = 2 triangles = 6 vertices
		var num      = numBoard * perBoard;
		if ( num > 1<<16 ) 
			alert("ERROR: Too many indices (" + num + " > " + (1<<16) + ")");
		//console.log("webgl: create IBO(index buffer) ...");
		t3Idx.ibo = gl.createBuffer();
		t3Idx.data = new Uint16Array(num);
		for (var i=0; i < numBoard; ++i) {
			// 2 --- 3
			// |     |
			// |     |
			// 0 --- 1
			var ii = i * perBoard;
			var jj = i * 4;
			t3Idx.data[ii  ] = jj    ;
			t3Idx.data[ii+1] = jj + 1;
			t3Idx.data[ii+2] = jj + 2;
			t3Idx.data[ii+3] = jj + 1;
			t3Idx.data[ii+4] = jj + 3;
			t3Idx.data[ii+5] = jj + 2;
		}
		//console.log("webgl: bind IBO(index buffer) to current BO(buffer object) ...");
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, t3Idx.ibo);
		//console.log("webgl: create data store in current BO(buffer object) and transfer data to current BO ...");
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, t3Idx.data, gl.STATIC_DRAW);
		//console.log("webgl: un-bind IBO(index buffer) to current BO(buffer object) ...");
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		return t3Idx;
	}
	
}); // end of $(document).ready();

/* 
 * 
 * Vector3
 * 
 */
var V3 = {};
V3.set = function (v0, v1) {
    v0[0] = v1[0], v0[1] = v1[1], v0[2] = v1[2];
    return v0;
};
V3.scale = function (v, s) {
    v[0] *= s, v[1] *= s, v[2] *= s;
    return v;
};
V3.length = function(v) {
    return Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]); 
};
V3.length2 = function(v) {
    return v[0]*v[0] + v[1]*v[1] + v[2]*v[2]; 
};
V3.dot = function (v0, v1) {
    return v0[0]*v1[0] + v0[1]*v1[1] + v0[2]*v1[2]; 
};
V3.cross = function (v0, v1) {
    var cx = v0[1]*v1[2] - v0[2]*v1[1];
    var cy = v0[2]*v1[0] - v0[0]*v1[2];
    var cz = v0[0]*v1[1] - v0[1]*v1[0];	
    return [cx, cy, cz];
};

/* 
 * 
 * webGL Utility 
 * 
 */
var webglUtil = {};
webglUtil.initGL = function (canvas) {
	var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl"); // A || B : if (A == true) return A else return B
	if ( !gl ) {
		alert('ERROR: not support "webgl" | "experimental-webgl"');
		return;
	}
    //set view port
	gl.viewportWidth  = canvas.width ;
	gl.viewportHeight = canvas.height;
	//return gl;
	return WebGLDebugUtils.makeDebugContext(gl);
};

webglUtil.initShaders = function (gl) {
	var vxsObj = createShaderObj(gl, "vxs");
	var fgsObj = createShaderObj(gl, "fgs");
	var prgObj = createProgramObj(gl, vxsObj, fgsObj);
	
	return prgObj;
	
	////////////////////
	// local function //
	////////////////////
	function createShaderObj(gl, elemId) {
		var elem = document.getElementById(elemId);
		if ( !elem ) {
			alert('ERROR: can not find element "id=' + elemId + '"');
			return; // will return undefined
		}
		
		// create shader object
		var shaderObj;
		console.log("webgl: create shader object ...");
		switch( elem.type ) {
			case "x-shader/x-vertex":
				shaderObj = gl.createShader(gl.VERTEX_SHADER);
				break;
			case "x-shader/x-fragment":
				shaderObj = gl.createShader(gl.FRAGMENT_SHADER);
				break;
			default:
				alert('ERROR: element type must be "x-shader/(x-vertex|x-fragment)"');
				return; // will return undefined
		}
		console.log("webgl: attach shader source code to shader object ...");
		gl.shaderSource(shaderObj, elem.text);
		console.log("webgl: compile shader source code ...");
		gl.compileShader(shaderObj);
		
		// check shader object status (compile)
		if ( !gl.getShaderParameter(shaderObj, gl.COMPILE_STATUS) ) {
			alert(gl.getShaderInfoLog(shaderObj));
			alert('ERROR: compile shader source code "element id=' + elem.id + ' type=' + elem.type + '"');
			return; // will return undefined
		}
		return shaderObj;
	}
	
	////////////////////
	// local function //
	////////////////////
	function createProgramObj(gl, vxsObj, fgsObj) {
		var prgObj = gl.createProgram();
		console.log("webgl: attach shader object to program object ...");
		gl.attachShader(prgObj, vxsObj);
		console.log("webgl: attach shader object to program object ...");
		gl.attachShader(prgObj, fgsObj);
		console.log("webgl: link program(vertex&fragment shader) object ...");
		gl.linkProgram(prgObj);
		// check program object status (link)
		if ( !gl.getProgramParameter(prgObj, gl.LINK_STATUS) ) {
			alert(gl.getProgramInfoLog(prgObj));
			alert("ERROR: link program object");
			return; // will return undefined
		}
		console.log("webgl: install program object as current rendering state ...");
	    gl.useProgram(prgObj);
		return prgObj;
	}
};

webglUtil.initTexture = function (gl, src) {
	var img = new Image();
	console.log("webgl: create texture object ...");
	var texObj = gl.createTexture();
	img.onload = function () {
		console.log("webgl: Image finish loading ... " + new Date().toLocaleString());
		
		console.log("webgl: bind texture object to current TO(TEXTURE_2D) ...");
		gl.bindTexture(gl.TEXTURE_2D, texObj);
		console.log("webgl: attach image data to point(TEXTURE_2D) ...");
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
		
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);	
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		
		console.log("webgl: generate mipmap ...");
		gl.generateMipmap(gl.TEXTURE_2D);
		
		console.log("webgl: un-bind texture object ...");
		gl.bindTexture(gl.TEXTURE_2D, null);
	};
	img.src = src;
	console.log("webgl: Image begin loading .... " + new Date().toLocaleString());
	return texObj;
};

/* 
 * 
 * Timer
 * 
 */
function Timer() {
	Timer.prototype.reset = function() {
		this.timeStart = 0;
		this.timeStop = 0;
		this.elapsed = 0;
		this.elapsedTotal = 0;
	};
	Timer.prototype.start = function() {
		this.timeStart = new Date().getTime();
		return this.timeStart;
	};
	Timer.prototype.stop = function() {
		this.timeStop = new Date().getTime();
		this.elapsed = this.timeStop - this.timeStart;
		this.elapsedTotal += this.elapsed;
		return this.timeStop;
	};
	Timer.prototype.elapsedMsec = function() {
		return this.elapsed;
	};
	Timer.prototype.elapsedTotalMsec = function() {
		return this.elapsedTotal;
	};
	this.reset();
}