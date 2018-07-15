let { RexjsImageSprite } = new function(spritesmith, imagemin, pngquant, jpegtran, fs, path){

this.Output = function(Promise, JSON_PATH_PFEFIX){
	return class Output {
		constructor(imagePathString, textPathString = `${JSON_PATH_PFEFIX}json`){
			let imagePath = path.parse(imagePathString), textPath = path.parse(textPathString);

			if(textPathString.indexOf(JSON_PATH_PFEFIX) === 0){
				textPath = path.parse(
					path.resolve(
						imagePathString,
						`../${imagePath.name}.${textPath.base.substring(JSON_PATH_PFEFIX.length)}`
					)
				);
			}
			
			this.imagePath = imagePath;
			this.textPath = textPath;
		};

		run(result, textContent, _callback){
			let minable = true, encoding = null, { imagePath, textPath } = this, { image } = result;

			new Promise((res) => {
				if(imagePath.ext !== ".js"){
					res();
					return;
				}

				encoding = "utf8";
				minable = false;

				switch(path.parse(imagePath.name).ext){
					case ".imagedata":
						require("get-pixels")(image, `image/png`, (err, pixels) => {
							let { data, shape: { 0: width, 1: height } } = pixels;

							image = `export default { width: ${width}, height: ${height}, data: [${data.join(",")}]};`

							res();
						})
						return;

					default:
						image = `export default "${image.toString("base64")}"`;
						break;
				}

				res();
			})
			.then(() => {
				fs.writeFileSync(
					path.format(imagePath),
					image,
					encoding
				);

				console.log(`output ${imagePath.ext} completed: ${path.format(imagePath)}`);

				if(textPath.ext === ".js"){
					switch(path.parse(textPath.name).ext){
						case ".require":
							textContent = `module.exports = ${textContent};`;
							return;

						default:
							textContent = `export default ${textContent};`;
							break;
					}
				}

				fs.writeFileSync(
					path.format(this.textPath),
					textContent,
					"utf8"
				);

				console.log(`output ${textPath.ext} completed: ${path.format(textPath)}`);
				_callback && _callback(minable);
			});
		};
	};
}(
	Promise,
	// JSON_PATH_PFEFIX
	"${imagePath}."
);

this.RexjsImageSprite = function(Output, defaultPlugins, fillImage, min){
	return class RexjsImageSprite {
		constructor(input, output, dir = "", plugins = defaultPlugins, _success){
			let src = [];

			if(typeof output === "string"){
				output = new Output(output);
			}
			
			fillImage(src, input, input, plugins, fillImage);

			spritesmith.run({ src }, (err, result) => {
				if(err){
					console.log(err);
					return;
				}

				let use = [], copy = {}, { coordinates } = result, { textPath, imagePath } = output;

				for(let key in plugins){
					use.push(plugins[key]);
				}

				for(let p in coordinates){
					copy[
						path.join(
							dir,
							path.relative(input, p)
						)
					] = coordinates[p];
				}

				output.run(
					result,
					JSON.stringify(copy),
					(minable) => {
						if(minable){
							min(
								path.format(imagePath),
								use,
								_success
							)
						}
					}
				);
			});
		};

		static get Output(){
			return Output;
		};
	};
}(
	this.Output,
	// defaultPlugins
	{
		".jpeg": jpegtran(),
		".jpg": jpegtran(),
		".png": pngquant({
			speed: 0
		})
	},
	// fillImage
	(src, input, dirname, plugins, callee) => {
		let files = fs.readdirSync(dirname);

		files.forEach((file) => {
			let filename = path.join(dirname, file), stats = fs.statSync(filename);

			if(stats.isDirectory()){
				callee(src, input, filename, plugins, callee);
			}
			else if(stats.isFile() && plugins.hasOwnProperty(path.parse(filename).ext)){
				src.push(filename);
			}
		});
	},
	// min
	(imagePathString, use, _success) => {
		imagemin(
			[ imagePathString ],
			path.join(imagePathString, "../"),
			{ use }
		)
		.then(() => {
			console.log(`imagemin completed: ${imagePathString}`);

			_success && _success();
		});
	}
);

}(
	require("spritesmith"),
	require("imagemin"),
	require("imagemin-pngquant"),
	require("imagemin-jpegtran"),
	require("fs"),
	require("path")
);

module.exports = RexjsImageSprite;