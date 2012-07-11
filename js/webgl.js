/**
 * @author nk.nishizawa@gmail.com
 */

$(function () {
"use strict";

	console.log(typeof ary0);
	console.log(typeof ary1);

	var canvas = $("#webglCanvas").get(0);
	canvas.width  = $("#canvasArea").width();
	canvas.height = $("#canvasArea").height();

	var gl    = webglUtil.initGL(canvas);
	var pgObj = webglUtil.initShaders(gl);
	var txObj = webglUtil.initTexture(gl, "img/karada.png");

	var attrib = {
		position : {
			vbo      : gl.createBuffer(),
			location : gl.getAttribLocation(pgObj, "position"),
			size     : 3, // number of components per generic vertex attribute
			type     : gl.FLOAT
		},
		texCoord : {
			vbo      : gl.createBuffer(),
			location : gl.getAttribLocation(pgObj, "texCoord"),
			size     : 2, // number of components per generic vertex attribute
			type     : gl.FLOAT
		}
	};
	
	var uniform = {
		projectionMatrix : {
			location  : gl.getUniformLocation(pgObj, "projectionMatrix"),
			transpose : false
		},
		modelViewMatrix : {
			location  : gl.getUniformLocation(pgObj, "modelViewMatrix"),
			transpose : false
		},
		drawMode : {
			location  : gl.getUniformLocation(pgObj, "drawMode"),
		},
		pointSize : {
			location  : gl.getUniformLocation(pgObj, "pointSize"),
		},
		color : {
			location  : gl.getUniformLocation(pgObj, "color"),
		},
		texSampler : {
			location  : gl.getUniformLocation(pgObj, "texSampler"),
		}
	};
	
	//var NUM_BODY =  4096;
	//var NUM_BODY =  2048;
	var NUM_BODY =  1024;
	//const NUM_BODY =  512;
	var MAX_LOOP = 10000;
	
	var nbSys = new NbodySystem(NUM_BODY);
	nbSys.init();
	
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
		
		var DRAW_MODE = {POINT: 0, POINTSPRITE: 1, BILLBOARD:2};
		var drawMode = $('input:radio:[name="drawMode"]:checked').val();
		gl.uniform1i(uniform.drawMode.location, Number(drawMode));
		// selects which texture unit subsequent texture state calls will affect
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, txObj);
		switch ( Number(drawMode) ) {
			case DRAW_MODE.POINT:
				gl.uniform4fv(uniform.color.location, [0, 0, 0, 0.5]);
				gl.uniform1f(uniform.pointSize.location, 8);
				
				setAttrib(gl, attrib.position, nbSys.pos);
				
				gl.drawArrays(gl.POINTS, 0, nbSys.num);
				break;
			case DRAW_MODE.POINTSPRITE:
				gl.uniform1i(uniform.texSampler.location, 0);
				gl.uniform4fv(uniform.color.location, [1, 1, 1, 0.7]);
				gl.uniform1f(uniform.pointSize.location, 32);

				setAttrib(gl, attrib.position, nbSys.pos);
				
				gl.drawArrays(gl.POINTS, 0, nbSys.num);
				break;
			case DRAW_MODE.BILLBOARD:
				gl.uniform1i(uniform.texSampler.location, 0);
				gl.uniform4fv(uniform.color.location, [1, 1, 1, 0.7]);
				
				var board = new BillBoard(nbSys.num, nbSys.pos, 0.05, 0.05);
				setAttrib(gl, attrib.position, board.pos);
				setAttrib(gl, attrib.texCoord, board.tex);
				
				gl.drawArrays(gl.TRIANGLES, 0, board.numVertex);
				break;
			default:
				alert("No support DRAW_MODE.");
				break;
		}
		
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.flush();
		
		++loop;
		
		var err = gl.getError();
		if (err != gl.NO_ERROR && err != gl.CONTEXT_LOST_WEBGL) {
			alert( WebGLDebugUtils.glEnumToString(err) );
		}
		
		timer0.stop();
		var ela0 = Math.ceil(timer0.elapsedMsec());
		var ela1 = Math.ceil(timer1.elapsedMsec());
		var ave0 = Math.ceil(timer0.elapsedTotalMsec()/loop);
		var ave1 = Math.ceil(timer1.elapsedTotalMsec()/loop);
		
		$("#info").html(
			"<p>" + nbSys.num + " bodies, step: " + loop + "</p>" +
		    "<p>" +  "N-body Elapsed: " + num2str(ela1, 4) + " msec " + "(ave. " +  num2str(ave1, 4) + ")" + "</p>" +
			"<p>" +  "+WebGL Elapsed: " + num2str(ela0, 4) + " msec " + "(ave. " +  num2str(ave0, 4) + ")" + "</p>"
		);
	
		function deg2rad(deg) {return deg * Math.PI / 180;}
		angle += deg2rad(360/10) * ela0/1000;

		var timeoutId = setTimeout(drawLoop, 33);
		
		if ( loop >= MAX_LOOP )
			clearTimeout(timeoutId);
	} // end of function drawLoop()
		
	function setAttrib(gl, attrib, data) {
		//console.log("webgl: bind VBO(array buffer) to current BO(buffer object) ...");
		gl.bindBuffer(gl.ARRAY_BUFFER, attrib.vbo);
		//console.log("webgl: create data store in current BO(buffer object) and transfer data to current BO ...");
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
		// enable vertex array attribute specified by location(index). if enabled, it is used for rendering such as gl.Draw(Arrays|Elements|etc.)
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
	
	function BillBoard(num, center, width, height) {
		this.num       = num;
		this.numVertex = num*6;
		this.pos = new Float32Array(this.numVertex*3);
		this.tex = new Float32Array(this.numVertex*2);
		var harfW = width  / 2;
		var harfH = height / 2;
		for (var i=0; i < num; ++i) {
			var ii = i*3;
			var cx = center[ii  ]; 
			var cy = center[ii+1];
			var cz = center[ii+2];
			var aij = e012([cx, cy, cz]);
			var idx = [0, 1, 3, 0, 3, 2];
			for (var j=0, j0=i*6; j < 6; ++j) {
				var jp = (j0 + j) * 3;
				var jt = (j0 + j) * 2;
				var swX = idx[j] & 1;
				var swY = idx[j] & 2;
				var px = (swX ? harfW : -harfW);
				var py = (swY ? harfH : -harfH);
				this.pos[jp    ] = cx + aij[0]*px + aij[3]*py + aij[6]*0;
				this.pos[jp + 1] = cy + aij[1]*px + aij[4]*py + aij[7]*0;
				this.pos[jp + 2] = cz + aij[2]*px + aij[5]*py + aij[8]*0;
				this.tex[jt    ] = swX ? 1.0 : 0.0;
				this.tex[jt + 1] = swY ? 0.0 : 1.0;
			}
		}
		
		////////////////////
		// local function //
		////////////////////
		function e012(c) {
			// e2 = z-axis
			var e2 = [-c[0], -c[1], -c[2]]; 
			var le2 = length(e2);
			if ( le2 == 0 ) {
				e2[0] = 0;
				e2[1] = 0;
				e2[2] = 1;
			} else {
				le2 = 1 / le2;
				e2[0] *= le2;
				e2[1] *= le2;
				e2[2] *= le2;
			}
			// e0 = x-axis
			var e0 = cross([0, 1, 0], e2);
			var le0 = length(e0);
			if ( le0 == 0 ) {
				e0[0] =-1;
				e0[1] = 0;
				e0[2] = 0;
			} else {
				le0 = 1 / le0;
				e0[0] *= le0;
				e0[1] *= le0;
				e0[2] *= le0;
			}
			// e1 = y-axis
			var e1 = cross(e2, e0);
			return [e0[0], e0[1], e0[2], e1[0], e1[1], e1[2], e2[0], e2[1], e2[2]];
		}
		
		function length(v) {
			return Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]); 
		}
	
		function cross(v0, v1) {
			var cx = v0[1]*v1[2] - v0[2]*v1[1];
		    var cy = v0[2]*v1[0] - v0[0]*v1[2];
		    var cz = v0[0]*v1[1] - v0[1]*v1[0];	
		    return [cx, cy, cz];
		}
		
		
	} // end of BillBoard
		

	
	function num2str(num, len) {
		var str = num + "";
		while( str.length <  len ) 
			str = "0" + str;
		return str;
	}

}); // end of $(document).ready();


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
	}
    //set view port
	gl.viewportWidth  = canvas.width ;
	gl.viewportHeight = canvas.height;
	//return gl;
	return WebGLDebugUtils.makeDebugContext(gl);
};

webglUtil.initShaders = function (gl) {
	// create shader object
	var vsObj = createShaderObj(gl, "vs");
	var fsObj = createShaderObj(gl, "fs");
	// create program object
	var pgObj = createProgramObj(gl, vsObj, fsObj);
	
	return pgObj;
	
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
	function createProgramObj(gl, vsObj, fsObj) {
		var pgObj = gl.createProgram();
		console.log("webgl: attach shader object to program object ...");
		gl.attachShader(pgObj, vsObj);
		console.log("webgl: attach shader object to program object ...");
		gl.attachShader(pgObj, fsObj);
		console.log("webgl: link program(vertex&fragment shader) object ...");
		gl.linkProgram(pgObj);
		// check program object status (link)
		if ( !gl.getProgramParameter(pgObj, gl.LINK_STATUS) ) {
			alert(gl.getProgramInfoLog(pgObj));
			alert("ERROR: link program object");
			return; // will return undefined
		}
		console.log("webgl: install program object as current rendering state ...");
	    gl.useProgram(pgObj);
		return pgObj;
	}
};

webglUtil.initTexture = function (gl, src) {
	var img = new Image();
	console.log("webgl: create texture object ...");
	var txObj = gl.createTexture();
	img.onload = function () {
		console.log("webgl: Image finish loading ... " + new Date().toLocaleString() );
		
		console.log("webgl: bind texture object to current TO(TEXTURE_2D) ...");
		gl.bindTexture(gl.TEXTURE_2D, txObj);
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
	console.log("webgl: Image begin loading .... " + new Date().toLocaleString() );
	
	return txObj;
}

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
