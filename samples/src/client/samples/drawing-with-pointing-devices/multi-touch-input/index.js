import MultiTouchInkController from "./MultiTouchInkController.js"

class MultiTouchInputSample extends MultiTouchInkController {
	constructor(canvas) {
		super(canvas);
	}
}

MultiTouchInputSample.settings = {
	section: "Drawing with Pointing Devices",
	title: "Multi-touch input"
};

export default MultiTouchInputSample
