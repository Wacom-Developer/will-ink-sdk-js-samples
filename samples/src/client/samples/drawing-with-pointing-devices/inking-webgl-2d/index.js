import {InkCanvasGL} from "digital-ink"

import BasicInkController from "../BasicInkController.js"

class InkingWebGLBrush2DSample extends BasicInkController {
	tool = "app://ink-samples/toolkit/Pen";

	constructor(canvas) {
		super(InkCanvasGL.createInstance(canvas));
	}

	buildInkBuilderOptions(sample) {
		let options = super.buildInkBuilderOptions(sample);
		options.concatSegments = true;

		return options;
	}
}

InkingWebGLBrush2DSample.settings = {
	section: "Drawing with Pointing Devices",
	title: "Drawing with Brush2D on WebGL canvas - InkCanvasGL"
};

export default InkingWebGLBrush2DSample
