let RexjsImageSprite = require("../index");
let path = require("path");

new RexjsImageSprite(
	// 图片目录（必选）
	path.join(__dirname, "./image"),
	new RexjsImageSprite.Output(
		// 输出图片地址（必选，同时也会自动生成同名 json 文件，如：sprite.json）
		path.join(__dirname,"./sprite.png"),
		"${imagePath}.require.js"
	),
	"./hello/",
	void 0,
	() => {
		let json = require("./sprite");

		try {
			if(json["hello/add.png"].width !== 70){
				throw "";
			}
		}
		catch(e){
			throw "压缩、合并图片失败！";
		}

		console.log("基本测试通过..");
	}
);