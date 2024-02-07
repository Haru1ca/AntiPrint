(function() {
	"use strict";
	const originalUserAgent = window.navigator.userAgent;
	const fakeUserAgent = originalUserAgent.replace(
		/\(.*?(?=(; rv:[^\)]+)?\))/,
		"(Windows NT 10.0; Win64; x64"
	);
	const fakeVersion = fakeUserAgent.substr(8);
	window.navigator.__defineGetter__("appVersion", function() {
		return fakeVersion;
	});
	window.navigator.__defineGetter__("language", function() {
		return "en-US";
	});
	window.navigator.__defineGetter__("languages", function() {
		return ["en-US", "en"];
	});
	window.navigator.__defineGetter__("mimeTypes", function() {
		return {
			length: 0,
			item: () => null,
			namedItem: () => null,
			refresh: () => {},
		};
	});
	window.navigator.__defineGetter__("oscpu", function() {
		return undefined;
	});
	window.navigator.__defineGetter__("platform", function() {
		return "Win32";
	});
	window.navigator.__defineGetter__("plugins", function() {
		return {
			length: 0,
			item: () => null,
			namedItem: () => null,
			refresh: () => {},
		};
	});
	window.navigator.__defineGetter__("userAgent", function() {
		return fakeUserAgent;
	});
})();

(function() {
	const getImageData = CanvasRenderingContext2D.prototype.getImageData;
	let noisify = function(canvas, context) {
		if (context) {
			const shift = {
				'r': Math.floor(Math.random() * 10) - 5,
				'g': Math.floor(Math.random() * 10) - 5,
				'b': Math.floor(Math.random() * 10) - 5,
				'a': Math.floor(Math.random() * 10) - 5
			};
			//
			const width = canvas.width;
			const height = canvas.height;
			if (width && height) {
				const imageData = getImageData.apply(context, [0, 0, width, height]);
				for (let i = 0; i < height; i++) {
					for (let j = 0; j < width; j++) {
						const n = ((i * (width * 4)) + (j * 4));
						imageData.data[n + 0] = imageData.data[n + 0] + shift.r;
						imageData.data[n + 1] = imageData.data[n + 1] + shift.g;
						imageData.data[n + 2] = imageData.data[n + 2] + shift.b;
						imageData.data[n + 3] = imageData.data[n + 3] + shift.a;
					}
				}
				context.putImageData(imageData, 0, 0);
			}
		}
	};
	HTMLCanvasElement.prototype.toBlob = new Proxy(HTMLCanvasElement.prototype.toBlob, {
		apply(target, self, args) {
			noisify(self, self.getContext("2d"));
			return Reflect.apply(target, self, args);
		}
	});
	HTMLCanvasElement.prototype.toDataURL = new Proxy(HTMLCanvasElement.prototype.toDataURL, {
		apply(target, self, args) {
			noisify(self, self.getContext("2d"));
			//
			return Reflect.apply(target, self, args);
		}
	});
	CanvasRenderingContext2D.prototype.getImageData = new Proxy(CanvasRenderingContext2D.prototype.getImageData, {
		apply(target, self, args) {
			noisify(self.canvas, self);
			return Reflect.apply(target, self, args);
		}
	});
	document.documentElement.dataset.cbscriptallow = true;
})();

(function() {
	var config = {
		random: {
			value: function() {
				return Math.random();
			},
			item: function(e) {
				var rand = e.length * config.random.value();
				return e[Math.floor(rand)];
			},
			array: function(e) {
				var rand = config.random.item(e);
				return new Int32Array([rand, rand]);
			},
			items: function(e, n) {
				var length = e.length;
				var result = new Array(n);
				var taken = new Array(length);
				if (n > length) n = length;
				while (n--) {
					var i = Math.floor(config.random.value() * length);
					result[n] = e[i in taken ? taken[i] : i];
					taken[i] = --length in taken ? taken[length] : length;
				}
				return result;
			},
		},
		spoof: {
			webgl: {
				buffer: function(target) {
					const bufferData = target.prototype.bufferData;
					Object.defineProperty(target.prototype, "bufferData", {
						value: function() {
							var index = Math.floor(config.random.value() * 10);
							var noise = 0.1 * config.random.value() * arguments[1][index];
							arguments[1][index] = arguments[1][index] + noise;
							return bufferData.apply(this, arguments);
						},
					});
				},
				parameter: function(target) {
					const getParameter = target.prototype.getParameter;
					Object.defineProperty(target.prototype, "getParameter", {
						value: function() {
							var float32array = new Float32Array([1, 8192]);
							if (arguments[0] === 3415) return 0;
							else if (arguments[0] === 3414) return 24;
							else if (arguments[0] === 35661) return config.random.items([128, 192, 256]);
							else if (arguments[0] === 3386) return config.random.array([8192, 16384, 32768]);
							else if (arguments[0] === 36349 || arguments[0] === 36347) return config.random.item([4096, 8192]);
							else if (arguments[0] === 34047 || arguments[0] === 34921) return config.random.items([2, 4, 8, 16]);
							else if (arguments[0] === 7937 || arguments[0] === 33901 || arguments[0] === 33902) return float32array;
							else if (arguments[0] === 34930 || arguments[0] === 36348 || arguments[0] === 35660) return config.random.item([16, 32, 64]);
							else if (arguments[0] === 34076 || arguments[0] === 34024 || arguments[0] === 3379) return config.random.item([16384, 32768]);
							else if (arguments[0] === 3413 || arguments[0] === 3412 || arguments[0] === 3411 || arguments[0] === 3410 || arguments[0] === 34852) return config.random.item([2, 4, 8, 16]);
							else return config.random.item([0, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096]);
							return getParameter.apply(this, arguments);
						},
					});
				},
			},
		},
	};
	config.spoof.webgl.buffer(WebGLRenderingContext);
	config.spoof.webgl.buffer(WebGL2RenderingContext);
	config.spoof.webgl.parameter(WebGLRenderingContext);
	config.spoof.webgl.parameter(WebGL2RenderingContext);
	document.documentElement.dataset.wgscriptallow = true;
})();

(function() {
	let rand = {
		noise: function() {
			let SIGN = Math.random() < Math.random() ? -1 : 1;
			return Math.floor(Math.random() + SIGN * Math.random());
		},
		sign: function() {
			const tmp = [-1, -1, -1, -1, -1, -1, +1, -1, -1, -1];
			const index = Math.floor(Math.random() * tmp.length);
			return tmp[index];
		},
	};

	Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
		get: new Proxy(Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight")
			.get, {
				apply(target, self, args) {
					const height = Math.floor(self.getBoundingClientRect()
						.height);
					const valid = height && rand.sign() === 1;
					const result = valid ? height + rand.noise() : height;
					return result;
				},
			}),
	});

	Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
		get: new Proxy(Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth")
			.get, {
				apply(target, self, args) {
					const width = Math.floor(self.getBoundingClientRect()
						.width);
					const valid = width && rand.sign() === 1;
					const result = valid ? width + rand.noise() : width;
					return result;
				},
			}),
	});

	document.documentElement.dataset.fbscriptallow = true;
})();
