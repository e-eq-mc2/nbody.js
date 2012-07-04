/**
 * @author nk.nishizawa@gmail.com
**/

/*
onload = function(){
	// canvasエレメントを取得
	var c = document.getElementById('canvas');
	c.width = 300;
	c.height = 300;

	// webglコンテキストを取得
	var gl = c.getContext('webgl') || c.getContext('experimental-webgl');
	// canvasを初期化する色を設定する
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	// canvasを初期化する際の深度を設定する
	gl.clearDepth(1.0);
	// canvasを初期化
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	// 頂点シェーダとフラグメントシェーダの生成
	var v_shader = create_shader('vs');
	var f_shader = create_shader('fs');
	// プログラムオブジェクトの生成とリンク
	var prg = create_program(v_shader, f_shader);
	// attributeLocationの取得
	var attLocation = gl.getAttribLocation(prg, 'position');
	// attributeの要素数(この場合は xyz の3要素)
	var attStride = 3;
	// モデル(頂点)データ
	var vertex_position = [
		 0.0, 1.0, 0.0,
		 1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0
	];
	
	// VBOの生成
	var vbo = create_vbo(vertex_position);
	// VBOをバインド
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	// attribute属性を有効にする
	gl.enableVertexAttribArray(attLocation);
	// attribute属性を登録
	gl.vertexAttribPointer(attLocation, attStride, gl.FLOAT, false, 0, 0);
	// minMatrix.js を用いた行列関連処理
	// matIVオブジェクトを生成
	var m = new matIV();
	
	// 各種行列の生成と初期化
	var mMatrix = m.identity(m.create());
	var vMatrix = m.identity(m.create());
	var pMatrix = m.identity(m.create());
	var mvpMatrix = m.identity(m.create());
	// ビュー座標変換行列
	m.lookAt([0.0, 1.0, 3.0], [0, 0, 0], [0, 1, 0], vMatrix);
	// プロジェクション座標変換行列
	m.perspective(90, c.width / c.height, 0.1, 100, pMatrix);
	// 各行列を掛け合わせ座標変換行列を完成させる
	m.multiply(pMatrix, vMatrix, mvpMatrix);
	m.multiply(mvpMatrix, mMatrix, mvpMatrix);
	
	// uniformLocationの取得
	var uniLocation = gl.getUniformLocation(prg, 'mvpMatrix');
	// uniformLocationへ座標変換行列を登録
	gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
	// モデルの描画
	gl.drawArrays(gl.TRIANGLES, 0, 3);
	// コンテキストの再描画
	gl.flush();
	
	// シェーダを生成する関数
	function create_shader(id){
		// シェーダを格納する変数
		var shader;
		// HTMLからscriptタグへの参照を取得
		var scriptElement = document.getElementById(id);
		// scriptタグが存在しない場合は抜ける
		if(!scriptElement){return;}
		// scriptタグのtype属性をチェック
		switch(scriptElement.type){
			// 頂点シェーダの場合
			case 'x-shader/x-vertex':
				shader = gl.createShader(gl.VERTEX_SHADER);
				break;
			// フラグメントシェーダの場合
			case 'x-shader/x-fragment':
				shader = gl.createShader(gl.FRAGMENT_SHADER);
				break;
			default :
				return;
		}
		// 生成されたシェーダにソースを割り当てる
		gl.shaderSource(shader, scriptElement.text);
		// シェーダをコンパイルする
		gl.compileShader(shader);
		// シェーダが正しくコンパイルされたかチェック
		if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
			// 成功していたらシェーダを返して終了
			return shader;
		}else{
			// 失敗していたらエラーログをアラートする
			alert(gl.getShaderInfoLog(shader));
		}
	}
	
	// プログラムオブジェクトを生成しシェーダをリンクする関数
	function create_program(vs, fs){
		// プログラムオブジェクトの生成
		var program = gl.createProgram();
		// プログラムオブジェクトにシェーダを割り当てる
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		// シェーダをリンク
		gl.linkProgram(program);
		// シェーダのリンクが正しく行なわれたかチェック
		if(gl.getProgramParameter(program, gl.LINK_STATUS)){
			// 成功していたらプログラムオブジェクトを有効にする
			gl.useProgram(program);
			// プログラムオブジェクトを返して終了
			return program;
		}else{
			// 失敗していたらエラーログをアラートする
			alert(gl.getProgramInfoLog(program));
		}
	}
	
	// VBOを生成する関数
	function create_vbo(data){
		// バッファオブジェクトの生成
		var vbo = gl.createBuffer();
		// バッファをバインドする
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		// バッファにデータをセット
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
		// バッファのバインドを無効化
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		// 生成した VBO を返して終了
		return vbo;
	}
};
*/

function runNbodySystem() {
	const NUM_BODY = 5000;
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
			var v = randomUnit();
			nsys.pos[i] = Vector3.scale(v, 1);
			nsys.vel[i] = Vector3.scale(v, 1);
			nsys.mas[i] = 1;
		}
		function randomUnit() {
			var the = Math.random() * Math.PI*2; // angle z aixs <--> v in x-y-z space
			var phi = Math.random() * Math.PI*2; // angle x aixs <--> v on x-y   space
			var z = Math.cos(the);
			var r = Math.sqrt(1 - z*z);
			var x = r * Math.cos(phi);
			var y = r * Math.sin(phi);
			return new Vector3(x, y, z);
		}
	} (nbodySystem);
	
	var loopCount = 0;
	new function loopNbodySystem(nsys) {
		var startTime = new Date();
		updateNbodySystem(nsys);
		var stopTime = new Date();
		
		++loopCount;
		
		var elapsed = stopTime.getTime() - startTime.getTime();
		
		var p = document.getElementById("printElapsed");
		if ( !!p ) {
			p.innerHTML = "Elapsed(" + loopCount + "): " + elapsed + " msec";
		}
		
		var timeoutId = setTimeout(function () {loopNbodySystem(nsys);}, 1000);
		if ( loopCount >= 20 ) clearTimeout(timeoutId);
	} (nbodySystem);
}

function updateNbodySystem(nsys) {
	var num = nsys.num;
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
		vi.x += ax * dt;
		vi.y += ay * dt;
		vi.z += az * dt;
		vi.x *= damping;
		vi.y *= damping;
		vi.z *= damping;
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