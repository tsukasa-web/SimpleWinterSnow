#SimpleWinterSnow

##使う前に
画面上に表示されていない時はdrawLoopStopでアニメーションを停止させ、負荷を下げることをおすすめします。

##概要

canvasを用いて単純に垂直に落下する雪を降らせるプラグインです。それぞれの雪は画像としてキャッシュするため、描画コストが抑えられています。雪の大きさの種類や数、ぼかしや雪自体の色をも変更可能です。

##UPDATE

- **2015.01.14** 配布用に調整、サンプル追加

##記述

第一引数でオプションを設定します。

###例

	var targetCanvas = $('#snow-canvas-parent');
	targetCanvas.SimpleWinterSnow({
		snowNum: 100,
		snowRadius: 3,
		snowSpeed: 3,
		scaleArray: [1.0,0.8,0.6],
		liquid: true,
		blurColor: '#FFFFFF',
		blurRadius: 3,
		color: '#FFFFFF',
		fps: 30
	});
	WinterSnow = targetCanvas.data('SimpleWinterSnow');

- **snowNum**：canvasに描画する雪の数です。
- **snowRadius**：最大サイズの雪の大きさ（半径）です。
- **snowSpeed**：最大サイズの雪の落下スピードです。
- **scaleArray**：雪の大きさの種類です。1.0を最大サイズとして、配列で倍率を記入します。例の場合だと1.0倍、0.8倍、0.6倍の3サイズの雪が描画されます。また、落下スピードもこの倍率と同じになります。
- **liquid**：windowのリサイズ時にcanvasの包括要素に合わせてリサイズするかを決めます。default値はtrueです。
- **blurColor**：雪のぼかしの色になります。
- **blurRadius**：雪のぼかしのサイズになります。
- **color**：雪の色です。
- **fps**：1秒あたりのコマ数になります。default値は30です。

##メソッド

###上記の記述例に合わせた形で書いています。

	WinterSnow.init();

雪の初期配置を行います。

	WinterSnow.drawLoopStart();

雪のアニメーションを開始します。

	WinterSnow.drawLoopStop();

雪のアニメーションを停止します。

	WinterSnow.spriteClear();

canvasを初期化します。

	WinterSnow.changeFps(60);

動的にfpsを変更します。