import {fsx} from "digital-ink"

import InkingWebGLBrush2DController from "/samples/drawing-with-pointing-devices/inking-webgl-2d/index.js"

class TextureFromImageSample extends InkingWebGLBrush2DController {
	constructor(canvas) {
		super(canvas);

		this.actions = {
			import: this.import.bind(this)
		};
	}

	async import(buffer) {
		let image = await fsx.loadImage(buffer);

		let layer = this.canvas.createLayer({width: image.width, height: image.height});
		layer.fillTexture(image);

		this.strokesLayer.blend(layer)

		this.refresh(layer.bounds)
	}

	static renderActionBar() {
		return `
			<action-bar>
				<file-opener type="images" data-action="import" data-trigger="buffer">
					<a href="javascript:void(0)">Import (image)</a>
				</file-opener>
			</action-bar>
		`;
	}
}

TextureFromImageSample.settings = {
	section: "Working with Rasters",
	title: "Texture from Image"
};

export default TextureFromImageSample
