/*
  SimpleWinterSnow
  Copyright(c) 2015 SHIFTBRAIN - Tsukasa Tokura
  This software is released under the MIT License.
  http://opensource.org/licenses/mit-license.php
 */
var SimpleWinterSnow,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __slice = [].slice;

SimpleWinterSnow = (function() {
  SimpleWinterSnow.prototype.defaults = {
    snowNum: 100,
    snowRadius: 3,
    snowSpeed: 3,
    scaleArray: [1.0, 0.8, 0.6],
    liquid: true,
    blurColor: '#FFFFFF',
    blurRadius: 3,
    color: '#FFFFFF',
    fps: 30
  };

  function SimpleWinterSnow(_$targetParent, options) {
    this.changeFps = __bind(this.changeFps, this);
    this.spriteClear = __bind(this.spriteClear, this);
    this._drawLoop = __bind(this._drawLoop, this);
    this.drawLoopStop = __bind(this.drawLoopStop, this);
    this.drawLoopStart = __bind(this.drawLoopStart, this);
    this._canvasResize = __bind(this._canvasResize, this);
    this.options = $.extend({}, this.defaults, options);
    this.$targetParent = _$targetParent;
    this.requestId = null;
    this.setTimerId = null;
    this.fpsInterval = 1000 / this.options.fps;
    this.timeLog = Date.now();
    this.isFull = this.options.isfull;
    this.cacheArray = [];
    this.snowArray = [];
    this.requestAnimationFrame = (window.requestAnimationFrame && window.requestAnimationFrame.bind(window)) || (window.webkitRequestAnimationFrame && window.webkitRequestAnimationFrame.bind(window)) || (window.mozRequestAnimationFrame && window.mozRequestAnimationFrame.bind(window)) || (window.oRequestAnimationFrame && window.oRequestAnimationFrame.bind(window)) || (window.msRequestAnimationFrame && window.msRequestAnimationFrame.bind(window)) || function(callback, element) {
      return this.setTimerId = window.setTimeout(callback, 1000 / 60);
    };
    this.cancelAnimationFrame = (window.cancelAnimationFrame && window.cancelAnimationFrame.bind(window)) || (window.webkitCancelAnimationFrame && window.webkitCancelAnimationFrame.bind(window)) || (window.mozCancelAnimationFrame && window.mozCancelAnimationFrame.bind(window)) || (window.oCancelAnimationFrame && window.oCancelAnimationFrame.bind(window)) || (window.msCancelAnimationFrame && window.msCancelAnimationFrame.bind(window)) || function(callback, element) {
      return window.clearTimeout(this.setTimerId);
    };
  }

  SimpleWinterSnow.prototype.init = function() {
    this.$targetParent.append('<canvas class="canvas-snow"></canvas>');
    this.canvas = this.$targetParent.find('.canvas-snow')[0];
    this.ctx = this.canvas.getContext("2d");
    this._cacheSnow();
    this._canvasResize();
    if (this.options.liquid) {
      return $(window).on('resize', this._debounce((function(_this) {
        return function() {
          return _this._canvasResize();
        };
      })(this), 300));
    }
  };

  SimpleWinterSnow.prototype._canvasResize = function() {
    var parentHeight, parentWidth;
    parentWidth = this.$targetParent.width();
    parentHeight = this.$targetParent.height();
    $(this.canvas).attr({
      'width': parentWidth,
      'height': parentHeight
    });
    return this._addSnow();
  };

  SimpleWinterSnow.prototype._debounce = function(func, threshold, execAsap) {
    var timeout;
    timeout = null;
    return function() {
      var args, delayed, obj;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      obj = this;
      delayed = function() {
        if (!execAsap) {
          func.apply(obj, args);
        }
        return timeout = null;
      };
      if (timeout) {
        clearTimeout(timeout);
      } else if (execAsap) {
        func.apply(obj, args);
      }
      return timeout = setTimeout(delayed, threshold || 100);
    };
  };

  SimpleWinterSnow.prototype._cacheSnow = function() {
    var $mycanvas, cache, cacheObj, i, mycanvas, myctx, scaledRadius, _i, _ref, _results;
    _results = [];
    for (i = _i = 0, _ref = this.options.scaleArray.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      $mycanvas = $('<canvas>');
      mycanvas = $mycanvas[0];
      myctx = mycanvas.getContext("2d");
      scaledRadius = this.options.snowRadius * this.options.scaleArray[i];
      $mycanvas.attr({
        width: (scaledRadius + this.options.blurRadius) * 2,
        height: (scaledRadius + this.options.blurRadius) * 2
      });
      myctx.save();
      myctx.shadowColor = this.options.blurColor;
      myctx.shadowBlur = this.options.blurRadius;
      myctx.beginPath();
      myctx.arc(scaledRadius + this.options.blurRadius, scaledRadius + this.options.blurRadius, scaledRadius, 0, 2 * Math.PI, false);
      myctx.fillStyle = this.options.color;
      myctx.fill();
      myctx.restore();
      cache = new Image();
      cache.src = mycanvas.toDataURL();
      cacheObj = {
        cache: cache,
        large: scaledRadius + this.options.blurRadius,
        speed: this.options.snowSpeed * this.options.scaleArray[i]
      };
      this.cacheArray.push(cacheObj);
      mycanvas = null;
      myctx = null;
      _results.push(cache = null);
    }
    return _results;
  };

  SimpleWinterSnow.prototype._addSnow = function() {
    var i, randomCache, randomX, randomY, snowObj, _i, _ref, _results;
    this.snowArray = [];
    _results = [];
    for (i = _i = 0, _ref = this.options.snowNum; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      randomX = Math.random() * this.canvas.width;
      randomY = Math.random() * this.canvas.height;
      randomCache = Math.floor(Math.random() * this.options.scaleArray.length);
      snowObj = {
        cache: this.cacheArray[randomCache].cache,
        x: randomX,
        y: randomY,
        speed: this.cacheArray[randomCache].speed,
        large: this.cacheArray[randomCache].large
      };
      this.ctx.drawImage(snowObj.cache, snowObj.x, snowObj.y);
      _results.push(this.snowArray.push(snowObj));
    }
    return _results;
  };

  SimpleWinterSnow.prototype._drawSnow = function() {
    var elapsed, i, now, _i, _ref, _results;
    now = Date.now();
    elapsed = now - this.timeLog;
    if (elapsed > this.fpsInterval) {
      this.timeLog = now - (elapsed % this.fpsInterval);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      _results = [];
      for (i = _i = 0, _ref = this.options.snowNum; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        this.snowArray[i].y += this.snowArray[i].speed;
        if (this.snowArray[i].y > this.canvas.height) {
          this.snowArray[i].y = -(this.snowArray[i].large * 2);
          this.snowArray[i].x = Math.random() * this.canvas.width;
        }
        _results.push(this.ctx.drawImage(this.snowArray[i].cache, this.snowArray[i].x, this.snowArray[i].y));
      }
      return _results;
    }
  };

  SimpleWinterSnow.prototype.drawLoopStart = function() {
    if (!this.requestId) {
      return this._drawLoop();
    }
  };

  SimpleWinterSnow.prototype.drawLoopStop = function() {
    if (this.requestId) {
      this.cancelAnimationFrame(this.requestId);
      return this.requestId = null;
    }
  };

  SimpleWinterSnow.prototype._drawLoop = function() {
    this.requestId = this.requestAnimationFrame(this._drawLoop);
    return this._drawSnow();
  };

  SimpleWinterSnow.prototype.spriteClear = function() {
    this.isFull = true;
    return this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  SimpleWinterSnow.prototype.changeFps = function(_changeFps) {
    if (_changeFps !== this.options.fps) {
      this.options.fps = _changeFps;
      return this.fpsInterval = 1000 / this.options.fps;
    }
  };

  SimpleWinterSnow.prototype.liquidOn = function() {
    this.options.liquid = true;
    this._canvasResize();
    return $(window).on('resize', this._canvasResize);
  };

  SimpleWinterSnow.prototype.liquidOff = function() {
    this.options.liquid = false;
    return $(window).off('resize', this._canvasResize);
  };

  return SimpleWinterSnow;

})();

$.fn.SimpleWinterSnow = function(options) {
  return this.each(function(i, el) {
    var $el, SimpleSnow;
    $el = $(el);
    SimpleSnow = new SimpleWinterSnow($el, options);
    return $el.data('SimpleWinterSnow', SimpleSnow);
  });
};