/**
 * @author nk.nishizawa@gmail.com
 */

var a="window.a";
var obj = {
	a : "obs.a",
	func : 
		function () {
			alert(a);
		}
};

obj.func();