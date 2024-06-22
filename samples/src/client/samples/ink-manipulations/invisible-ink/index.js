import InkHistoryController from "../ink-history/index.js"

class InvisibleInkSample extends InkHistoryController {
	tool = "app://ink-samples/toolkit/PartialStrokeEraser";

	constructor(canvas) {
		super(canvas);
	}
}

InvisibleInkSample.settings = {
	section: "Ink Manipulations",
	title: "Drawing with Invisible Ink"
};

export default InvisibleInkSample
