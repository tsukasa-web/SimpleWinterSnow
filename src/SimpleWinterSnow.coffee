###
  SimpleWinterSnow
  Copyright(c) 2015 SHIFTBRAIN - Tsukasa Tokura
  This software is released under the MIT License.
  http://opensource.org/licenses/mit-license.php
###

class SimpleWinterSnow
  defaults:
    snowNum: 100 #一画面に入る雪の数
    snowRadius: 3
    snowSpeed: 3
    scaleArray: [1.0,0.8,0.6]
    liquid: true #resize時に親要素の大きさに合わせて拡縮
    blurColor: '#FFFFFF'
    blurRadius: 3
    color: '#FFFFFF' #読み込んだ画像の1シーンの縦幅
    fps: 30 #1秒あたりのコマ数

  constructor: (_$targetParent, options) ->
    #optionのマージ
    @options = $.extend {}, @defaults, options
    @$targetParent = _$targetParent
    @requestId = null #RAFに使用するID
    @setTimerId = null #Timeoutに使用するID
    @fpsInterval = 1000 / @options.fps #RAFのfps調整に使用するフレーム間隔の変数
    @timeLog = Date.now() #RAFのfps調整に使用する変数
    @isFull = @options.isfull
    @cacheArray = []
    @snowArray = []

    #RAFの宣言（fallback付）
    @requestAnimationFrame =
      (window.requestAnimationFrame and window.requestAnimationFrame.bind(window)) or
      (window.webkitRequestAnimationFrame and window.webkitRequestAnimationFrame.bind(window)) or
      (window.mozRequestAnimationFrame and window.mozRequestAnimationFrame.bind(window)) or
      (window.oRequestAnimationFrame and window.oRequestAnimationFrame.bind(window)) or
      (window.msRequestAnimationFrame and window.msRequestAnimationFrame.bind(window)) or
      (callback,element) ->
        @setTimerId = window.setTimeout(callback, 1000 / 60)
    #キャンセル用RAFの宣言（fallback付）
    @cancelAnimationFrame =
      (window.cancelAnimationFrame and window.cancelAnimationFrame.bind(window)) or
      (window.webkitCancelAnimationFrame and window.webkitCancelAnimationFrame.bind(window)) or
      (window.mozCancelAnimationFrame and window.mozCancelAnimationFrame.bind(window)) or
      (window.oCancelAnimationFrame and window.oCancelAnimationFrame.bind(window)) or
      (window.msCancelAnimationFrame and window.msCancelAnimationFrame.bind(window)) or
      (callback,element) ->
        window.clearTimeout(@setTimerId)

  init: ->
    #canvasの生成、contextの宣言
    @$targetParent.append('<canvas class="canvas-snow"></canvas>')
    @canvas = @$targetParent.find('.canvas-snow')[0]
    @ctx = @canvas.getContext("2d")

    @_cacheSnow()
    @_canvasResize()

    #liquid対応のリサイズイベント登録
    if @options.liquid
      $(window).on('resize', @_debounce(
        ()=> @_canvasResize()
      ,300))

  #canvasのリサイズ関数
  _canvasResize: =>
    parentWidth = @$targetParent.width()
    parentHeight = @$targetParent.height()
    $(@canvas).attr({'width':parentWidth,'height':parentHeight})
    @_addSnow()

  #実行回数の間引き
  _debounce: (func, threshold, execAsap) ->
    timeout = null
    (args...) ->
      obj = this
      delayed = ->
        func.apply(obj, args) unless execAsap
        timeout = null
      if timeout
        clearTimeout(timeout)
      else if (execAsap)
        func.apply(obj, args)
      timeout = setTimeout delayed, threshold || 100

  _cacheSnow: ->
    for i in [0...@options.scaleArray.length]
      $mycanvas = $('<canvas>')
      mycanvas = $mycanvas[0]
      myctx = mycanvas.getContext("2d")

      scaledRadius = @options.snowRadius * @options.scaleArray[i]
      $mycanvas.attr(width: (scaledRadius + @options.blurRadius)*2, height: (scaledRadius + @options.blurRadius)*2)

      myctx.save()
      myctx.shadowColor = @options.blurColor
      myctx.shadowBlur = @options.blurRadius

      myctx.beginPath()
      myctx.arc(scaledRadius + @options.blurRadius, scaledRadius + @options.blurRadius, scaledRadius, 0, 2 * Math.PI, false)
      myctx.fillStyle = @options.color
      myctx.fill()
      myctx.restore()

      cache = new Image()
      cache.src = mycanvas.toDataURL()
      cacheObj =
        cache: cache
        large: scaledRadius + @options.blurRadius
        speed: @options.snowSpeed * @options.scaleArray[i]
      @cacheArray.push(cacheObj)

      mycanvas = null
      myctx = null
      cache = null

  _addSnow: ->
    @snowArray = []
    for i in [0...@options.snowNum]
      randomX = Math.random() * @canvas.width
      randomY = Math.random() * @canvas.height
      randomCache = Math.floor(Math.random() * @options.scaleArray.length)

      snowObj =
        cache: @cacheArray[randomCache].cache
        x: randomX
        y: randomY
        speed: @cacheArray[randomCache].speed
        large: @cacheArray[randomCache].large

      @ctx.drawImage(snowObj.cache, snowObj.x, snowObj.y)
      @snowArray.push(snowObj)


  #スプライトの描画関数
  _drawSnow: ->
    #RAFのフレーム調整
    now = Date.now()
    elapsed = now - @timeLog

    if elapsed > @fpsInterval
      @timeLog = now - (elapsed % @fpsInterval)

      #canvasの初期化
      @ctx.clearRect(0, 0, @canvas.width, @canvas.height)

      #雪の更新描画
      for i in [0...@options.snowNum]
        @snowArray[i].y += @snowArray[i].speed

        if @snowArray[i].y > @canvas.height
          @snowArray[i].y = -(@snowArray[i].large * 2)
          @snowArray[i].x = Math.random() * @canvas.width

        @ctx.drawImage(@snowArray[i].cache, @snowArray[i].x, @snowArray[i].y)

  #描画ループをスタート
  drawLoopStart: =>
    #console.log('loop start')
    if !@requestId
      @_drawLoop()

  #描画ループをストップ
  drawLoopStop: =>
    #console.log('loop stop')
    if @requestId
      @cancelAnimationFrame(@requestId)
      @requestId = null

  #ループ関数
  _drawLoop: =>
    @requestId = @requestAnimationFrame(@_drawLoop)
    @_drawSnow()

  #canvasの初期化
  spriteClear: => 
    #console.log('sprite clear')
    @isFull = true
    @ctx.clearRect(0, 0, @canvas.width, @canvas.height)

  #fpsの変更
  changeFps: (_changeFps) =>
    if _changeFps isnt @options.fps
      #console.log('change Fps = ' + _changeFps)
      @options.fps = _changeFps
      @fpsInterval = 1000 / @options.fps

  #リサイズ対応の追加
  liquidOn: ->
    @options.liquid = true
    @_canvasResize()
    $(window).on('resize', @_canvasResize)

  #リサイズ対応の削除
  liquidOff: ->
    @options.liquid = false
    $(window).off('resize', @_canvasResize)

$.fn.SimpleWinterSnow = (options) ->
  @each (i, el) ->
    $el = $(el)
    SimpleSnow = new SimpleWinterSnow $el, options
    $el.data 'SimpleWinterSnow', SimpleSnow