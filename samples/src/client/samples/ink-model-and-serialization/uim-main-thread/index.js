import {InkCodec, BrushGL} from "digital-ink"

import InkModelController from "../ink-model/index.js"

class UIMMainThreadSample extends InkModelController {
	constructor(canvas) {
		super(canvas);

		this.codec = new InkCodec();

		this.actions = {
			decode: this.decode.bind(this),
			encode: this.encode.bind(this)
		};
	}

	// processing the pipeline on main thread is not recommended
	// for bigger files main thread could be blocked for awhile and UX will be affected
	// it is recommended to configure web workers or wasm for non-blocking behaviour
	pipeline(strokes) {
		for (let stroke of strokes)
			stroke.buildPath();
	}

	async decode(buffer) {
		this.clear(true);

		let inkModel = await this.codec.decodeInkModel(buffer);

		if (inkModel.brushes.find(brush => brush instanceof BrushGL)) {
			alert("Current sample targets vector content only, raster content found");
			return;
		}

		await this.pipeline(inkModel.strokes);

		this.inkModel = inkModel;

		this.redraw();
	}

	async encode() {
		let buffer = await this.codec.encodeInkModel(this.inkModel);

		return buffer;
	}

	static renderActionBar() {
		return `
			<action-bar>
				<file-opener type="uim" data-action="decode" data-trigger="buffer">
					<a href="javascript:void(0)">Open (.uim)</a>
				</file-opener>

				<file-saver type="uim" file-name="ink.uim" data-action="encode" data-trigger="content">
					<a href="javascript:void(0)">Save (.uim)</a>
				</file-saver>
			</action-bar>
		`;
	}
}

UIMMainThreadSample.settings = {
	section: "Ink Model and Serialization",
	title: "Import / Export UIM files on the Main Thread"
};

export default UIMMainThreadSample
