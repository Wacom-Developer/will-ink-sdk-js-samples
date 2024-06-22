import {InkCodec, Matrix} from "digital-ink"

import InkModelController from "/samples/ink-model-and-serialization/ink-model/index.js"

class PanningSample extends InkModelController {
	#events;
	#lastPoint;

	constructor(canvas) {
		super(canvas);

		this.transform = new Matrix();

		this.#events = {
			onPanStart: this.#onPanStart.bind(this),
			onPan: this.#onPan.bind(this),
			onPanEnd: this.#onPanEnd.bind(this)
		};

		this.actions = {
			reset: this.reset.bind(this)
		};
	}

	async init() {
		let codec = new InkCodec();

		let response = await fetch("assets/ship.uim");
		let buffer = await response.arrayBuffer();

		this.inkModel = await codec.decodeInkModel(buffer);

		this.redraw();

		this.enablePan();
	}

	enablePan() {
		this.canvas.surface.addEventListener("pointerdown", this.#events.onPanStart);
		addEventListener("pointermove", this.#events.onPan);
		addEventListener("pointerup", this.#events.onPanEnd);
	}

	#onPanStart(e) {
		this.#lastPoint = {x: e.clientX, y: e.clientY};
	}

	#onPan(e) {
		// pen hover before pan end
		if (!this.#lastPoint) return;

		let delta = {x: e.clientX - this.#lastPoint.x, y: e.clientY - this.#lastPoint.y};
		this.#lastPoint = {x: e.clientX, y: e.clientY};

		this.translate(delta);
	}

	#onPanEnd(e) {
		this.#lastPoint = null;
	}

	translate(delta) {
		this.transform = this.transform.translate(delta);
		this.#redraw();
	}

	reset() {
		this.transform = new Matrix();
		this.#redraw();
	}

	#redraw() {
		this.strokeRenderer.setTransform(this.transform);
		this.redraw();
	}

	static renderActionBar() {
		return `
			<action-bar>
				<a href="javascript:void(0)" data-action="reset">Reset view</a>
			</action-bar>
		`;
	}
}

PanningSample.settings = {
	section: "Ink Manipulations",
	title: "Panning - Matrices and Graphics",
	disableInput: true
};

export default PanningSample
