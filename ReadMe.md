```js
let RexjsImageSprite = require("rexjs-image-sprite");
let path = require("path");

new RexjsImageSprite(
	// 图片目录（必选）
	path.join(__dirname, "resource/image"),
	// 输出图片地址（必选，同时也会自动生成同名 json 文件，如：sprite.json）
	path.join(__dirname, "resource/sprite.png"),
	// 输出的 json 文件中的基本目录，即：地址前缀（可选参数）
	"/my-image",
	// 图片处理插件（可选参数，默认处理 png、jpeg、jpg）
	{
		".jpeg": require("imagemin-jpegtran")()
	}
);

```