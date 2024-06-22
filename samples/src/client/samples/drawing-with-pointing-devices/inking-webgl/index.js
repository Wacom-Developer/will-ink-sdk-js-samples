import {InkCanvasGL} from "digital-ink"

import repository from "../DataRepository.js"
import BasicInkController from "../BasicInkController.js"

class InkingWebGLSample extends BasicInkController {
	tool = "app://ink-samples/toolkit/Pencil";

	constructor(canvas) {
		super(InkCanvasGL.createInstance(canvas));
	}

	async init() {
		let tool = repository.get(this.tool);
		let brush = repository.get(tool.brush);

		await brush.configure(this.canvas.ctx);
	}
}

InkingWebGLSample.settings = {
	section: "Drawing with Pointing Devices",
	title: "Drawing with BrushGL (WebGL Inking) - InkCanvasGL"
};

export default InkingWebGLSample
