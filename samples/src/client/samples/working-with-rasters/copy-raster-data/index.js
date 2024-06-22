import {Polygon, Color, BlendMode, Rect, InkBuilder, fsx} from "digital-ink"

import InkingWebGLBrush2DController from "/samples/drawing-with-pointing-devices/inking-webgl-2d/index.js"

class CopyPixelsSample extends InkingWebGLBrush2DController {
	tool = "app://ink-samples/toolkit/Selector";

	clipboard;
	actions = {};

	constructor(canvas) {
		super(canvas);

		this.builder.onComplete = this.select.bind(this);

		this.layer = this.canvas.createLayer();
		this.maskLayer = this.canvas.createLayer();

		addEventListener("contextmenu", this.paste.bind(this));
	}

	async init() {
		let response = await fetch("assets/image.png");

		let buffer = await response.arrayBuffer();
		let image = await fsx.loadImage(buffer);

		let layer = this.canvas.createLayer({width: image.width, height: image.height});
		layer.fillTexture(image);

		this.strokesLayer.blend(layer);
		this.refresh(layer.bounds);
	}

	async select(pathPart) {
		if (pathPart.phase == InkBuilder.Phase.END) {
			let stroke = this.strokeRenderer.toStroke(this.builder);

			this.cut(stroke);
			this.refresh(stroke.bounds);
		}
		else
			this.draw(pathPart);
	}

	cut(stroke) {
		let polygon = new Polygon(stroke.spline).simplify();
		if (polygon.length == 0) return;

		this.copy(polygon);

		// clear the selected texture
		this.delete();
	}

	copy(polygon) {
		this.clipboard = polygon.bounds.ceil();

		this.maskLayer.clear();
		this.maskLayer.fill(polygon, Color.WHITE, true);

		this.layer.clear();
		this.layer.blend(this.strokesLayer, {mode: BlendMode.NONE});
		this.layer.blend(this.maskLayer, {mode: BlendMode.DESTINATION_IN});
	}

	delete() {
		this.strokesLayer.blend(this.maskLayer, {mode: BlendMode.DESTINATION_OUT});
	}

	paste(e) {
		if (!this.clipboard) return;

		let sourceRect = this.clipboard;
		let destinationRect = new Rect(e.offsetX - sourceRect.width / 2, e.offsetY - sourceRect.height / 2, sourceRect.width, sourceRect.height);

		this.strokesLayer.blend(this.layer, {sourceRect: sourceRect, destinationRect: destinationRect.ceil()});
		this.refresh(destinationRect);
	}

	static renderActionBar() {
		return `
			<action-bar>
				<div>Cut - draw area over image</div>
				<div>Paste - right click</div>
			</action-bar>
		`;
	}
}

CopyPixelsSample.settings = {
	section: "Working with Rasters",
	title: "Copy Raster Data"
};

export default CopyPixelsSample
