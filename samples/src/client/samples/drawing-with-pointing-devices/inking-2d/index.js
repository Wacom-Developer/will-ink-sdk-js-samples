import {InkCanvas2D} from "digital-ink"

import BasicInkController from "../BasicInkController.js"

class Inking2DSample extends BasicInkController {
	tool = "app://ink-samples/toolkit/Pen";

	constructor(canvas) {
		super(InkCanvas2D.createInstance(canvas));
	}
}

Inking2DSample.settings = {
	section: "Drawing with Pointing Devices",
	title: "Drawing with Brush2D (2D Inking) - InkCanvas2D"
};

export default Inking2DSample
