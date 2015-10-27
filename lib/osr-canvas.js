(function(window) {

    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
        var ctime = Date.now();
        var timetoCall = Math.max(0, 16 - (ctime - ltime));
        var id = window.setTimeout(function() {
            callback(ctime + timetoCall);
        }, timetoCall);
        ltime = ctime + timetoCall;
        return id
    };

    var OsrCanvas = Class.extends({
        elements: [],
        sid: 0,
        $: function(element) {
            this.root = element;
			this.height = this.root.height;
			this.width = this.root.width;
            this.context = this.root.getContext("2d");
            Object.defineProperty(this, "vector", {
                set: function(value) {
                    if (value > 0) {
                        this._vector = value;
                    }
                },
                get: function() {
                    return this._vector ? this._vector : 1;
                }
            })
        },
        /**
        	画线
        */
        dline: function(from, to, style) {
            from = from || {
                x: 0,
                y: 0
            };
            to = to || {
                x: 1,
                y: 1
            };
            style = style || {
                color: "#fff",
                weight: 1
            };
            var line = new Line(from, to, style);
            // line.draw(this.context,this.vector);
            this.elements.push(line);
            return line;
        },
        /**
        	画矩形
        */
        drect: function(position, size, style) {
            position = position || {
                x: 0,
                y: 0
            };
            size = size || {
                w: 10,
                h: 10
            };
            style = style || {
                weight: 1,
                fill: false,
                color: "#fff"
            };
            var rect = new Rect(position, size, style);
            // rect.draw(this.context,this.vector);
            this.elements.push(rect);
            return rect;
        },
        dbitmap: function(uri, style) {
            var bitmap = new Bitmap(uri, style);
            this.elements.push(bitmap);
            // bitmap.draw(this.context,this.vector);
            return bitmap;
        },
        update: function() {
            var _this = this;
            this.context.clearRect(0,0,this.width,this.height);
            this.elements.forEach(function(item, index) {
                item.draw(_this.context, _this.vector);
            });
        },

        start: function() {
            var _this = this;
            this.sid = window.requestAnimationFrame(function() {
                _this.update();
                window.requestAnimationFrame(arguments.callee);
            });
        },

        stop: function() {
            if (!window.cancelAnimationFrame) {
                clearTimeout(this.sid);
            } else {
                window.cancelAnimationFrame(this.sid);
            }
        }
    });

	/**
		摄像机
	*/
	var Camera = Class.extends({
		
	});
	
    /**
    	位置偏移
    */
    var offposition = function(number) {
            return number * 10 % 10 == 5 ? number : number += 0.5;
        }
        /**
        	元素
        */
    var Element = Class.extends({
        _default: {
            color: "#fff",
            weight: 1,
            fill: false
        },
        show: {},
        real: {},
        $: function() {

        },
        calculation: function(vector) {
            vector = vector || 1;
            if (this.real.position) {
                this.show.position = {
                    x: offposition(this.real.position.x * vector),
                    y: offposition(this.real.position.y * vector)
                };
            }
            if (this.real.size) {
                this.show.size = {
                    h: this.real.size.h * vector,
                    w: this.real.size.w * vector
                };
            }
            if (this.real.from) {
                this.show.from = {
                    x: offposition(this.real.from.x * vector),
                    y: offposition(this.real.from.y * vector)
                };
            }
            if (this.real.to) {
                this.show.to = {
                    x: offposition(this.real.to.x * vector),
                    y: offposition(this.real.to.y * vector)
                };
            }
        },
        draw: function(context, vector) {
            this.calculation(vector);
        }
    });

    /**
    	画线
    */
    var Line = Element.extends({
        $: function(from, to, style) {
            this.real = {
                from: from,
                to: to
            };
            this.show = {};
            // this.real.from = from ;
            // this.real.to = to ;
            this.style = style || this._default;
        },
        draw: function(context, vector) {
            this.super("draw", arguments);
            this.context = context;
            context.beginPath();
            context.strokeStyle = this.style.color || this._default.color;
            context.lineWidth = this.style.weight || this._default.weight;
            context.moveTo(this.show.from.x, this.show.from.y);
            context.lineTo(this.show.to.x, this.show.to.y);
            context.stroke();
            context.closePath();
        }
    });

    /**
    	画矩形
    */
    var Rect = Element.extends({
        $: function(position, size, style) {
            this.real = {
                position: position,
                size: size
            };
            this.show = {};
            // this.position = position;
            // this.size = size;
            this.style = style || this._default;
        },
        draw: function(context, vector) {
            this.super("draw", arguments);
            this.context = context;
            context.beginPath();
            if (this.style.fill) {
                context.fillStyle = this.style.color || this._default.color;
                context.fillRect(this.show.position.x, this.show.position.y, this.show.size.w, this.show.size.h);
            } else {
                context.fillStyle = this.style.color || this._default.color;
                context.lineWidth = this.style.weight || this._default.weight;
                context.strokeRect(this.show.position.x, this.show.position.y, this.show.size.w, this.show.size.h);
            }
            context.closePath();
        }
    });

    var Bitmap = Element.extends({
        $: function(uri, style) {
            this.uri = uri;
            this.real = {
                position: style.position,
                size: style.size
            };
            this.img = new Image();
            this.img.src = this.uri;
            var _this = this;
            this.img.onload = function() {
                _this.isLoaded = true;
            }
        },
        draw: function(context, vector) {
            this.super("draw", arguments);
            this.context = context;
            if (this.isLoaded) {
                context.beginPath();
                context.drawImage(this.img, this.show.position.x, this.show.position.y, this.show.size.w, this.show.size.h);
                context.closePath();
            } else {

            }
        }
    })

    this.OsrCanvas = OsrCanvas;
})(this);
