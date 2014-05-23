var SpheroManager = (function() {
	var spheros;

	function SpheroManager() {
		this.spheros = [];
	}

	SpheroManager.prototype.addSphero = function(name) {
		this.spheros.push({ name: name, active: false });
	};

	SpheroManager.prototype.removeSphero = function(name) {
		var index = this.getSphero(name);
		return (index) ? this.spheros.splice(index, 1) : false;
	};

	SpheroManager.prototype.getSphero = function(name) {
		var i = this.spheros.indexOf(name);
		return (i >= 0) ? i : false;
	};

	SpheroManager.prototype.getSpheroAt = function(i) {
		var in_range = i < this.spheros.length && i >= 0;
		return in_range ? this.spheros[i] : false;
	};

	SpheroManager.prototype.numSpheros = function() {
		return this.spheros.length;
	};

	return SpheroManager;
})();