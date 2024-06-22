import {InputListener, Intersector, InkBuilder, PipelineStage} from "digital-ink"

import repository from "../../drawing-with-pointing-devices/DataRepository.js"

import InkHistoryController from "../ink-history/index.js"

const intersectors = {
	WHOLE_STROKE: new Intersector(Intersector.Mode.WHOLE_STROKE),
	PARTIAL_STROKE: new Intersector(Intersector.Mode.PARTIAL_STROKE)
};

class EraseMainThreadSample extends InkHistoryController {
	#queue = Promise.resolve();
	#queueLength = 0;

	constructor(canvas) {
		super(canvas);

		this.builder.onComplete = this.erasePart.bind(this);
		this.builder.prediction = false;

		this.actions = {
			setMode: (e) => this.setMode(e.target.value),
			undo: this.history.undo.bind(this.history),
			redo: this.history.redo.bind(this.history)
		};

		this.setMode("WHOLE_STROKE");
	}

	setMode(mode) {
		this.tool = (mode == "WHOLE_STROKE") ? "app://ink-samples/toolkit/WholeStrokeEraser" : "app://ink-samples/toolkit/PartialStrokeEraser";

		this.intersector = intersectors[mode];
		this.intersector.reset(this.spatialContext);

		this.brush = repository.get(repository.get(this.tool).brush);
	}

	buildInkBuilderOptions(sample) {
		let options = super.buildInkBuilderOptions(sample);
		options.lastPipelineStage = PipelineStage.SPLINE_INTERPOLATOR;

		return options;
	}

	erasePart(pathPart) {
		this.#queueLength++;

		pathPart = {
			phase: pathPart.phase,
			added: pathPart.added?.clone()
		}

		this.#queue = this.#queue
			.then(this.erase.bind(this, pathPart))
			.then(() => {
				this.#queueLength--;

				if (this.#queueLength == 0)
					InputListener.enable(this);
			}
		);

		if (pathPart.phase == InkBuilder.Phase.END)
			InputListener.disable(this);
	}

	async erase(pathPart) {
		if (pathPart.phase == InkBuilder.Phase.BEGIN)
			this.transaction = true;

		if (pathPart.added) {
			let interpolatedSpline = pathPart.added;
			let intersection = await this.intersector.intersect(interpolatedSpline, this.brush);

			if (intersection.length > 0) {
				let dirtyArea = await this.update(intersection);

				this.redraw(dirtyArea);
			}
		}

		if (pathPart.phase == InkBuilder.Phase.END)
			this.transaction = false;
	}

	static renderActionBar() {
		return `
			<action-bar>
				<div>Intersection mode:</div>
				<div class="radio-group">
					<input type="radio" name="intersectionMode" id="WHOLE_STROKE" value="WHOLE_STROKE" data-action="setMode" data-trigger="change" checked>
					<label for="WHOLE_STROKE">Whole</label>

					<input type="radio" name="intersectionMode" id="PARTIAL_STROKE" value="PARTIAL_STROKE" data-action="setMode" data-trigger="change">
					<label for="PARTIAL_STROKE">Partial</label>
				</div>

				<a href="javascript:void(0)" class="disabled" data-action="undo">Undo</a>
				<a href="javascript:void(0)" class="disabled" data-action="redo">Redo</a>
			</action-bar>
		`;
	}
}

EraseMainThreadSample.settings = {
	section: "Ink Manipulations",
	title: "Erasing on the Main Thread"
};

export default EraseMainThreadSample
