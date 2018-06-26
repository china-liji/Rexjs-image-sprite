let { RexjsImageSprite } = new function(spritesmith, imagemin, pngquant, jpegtran, fs, path){

this.RexjsImageSprite = function(defaultPlugins, fillImage){
	return class RexjsImageSprite {
		constructor(input, output, dir = "", plugins = defaultPlugins){
			let src = [];
			
			fillImage(src, input, input, plugins, fillImage);

			spritesmith.run({ src }, (err, result) => {
				if(err){
					console.log(err);
					return;
				}

				let use = [], oPath = { ...path.parse(output) }, { coordinates } = result, copy = {};

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

				oPath.ext = ".json";
				oPath.base = `${oPath.name}.json`;

				fs.writeFileSync(output, result.image);

				fs.writeFileSync(
					path.format(oPath),
					JSON.stringify(copy),
					"utf8"
				);

				imagemin(
					[ output ],
					path.join(output, "../"),
					{ use }
				)
				.then(() => {
					console.log(`output completed: ${output}`);
				});
			});
		};
	};
}(
	// defaultPlugins
	{
		".jpeg": jpegtran(),
		".jpg": jpegtran(),
		".png": pngquant()
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