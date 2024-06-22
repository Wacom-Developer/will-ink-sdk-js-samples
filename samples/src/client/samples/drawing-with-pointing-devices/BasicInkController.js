import {InkController, InkBuilder, PathPointContext, InkCanvas2D, StrokeRenderer2D, StrokeRendererGL, BlendMode, Color} from "digital-ink"

import repository from "./DataRepository.js"

class BasicInkController extends InkController {
	#context = new PathPointContext();

	constructor(inkCanvas) {
		super();

		const StrokeRenderer = (inkCanvas instanceof InkCanvas2D) ? StrokeRenderer2D : StrokeRendererGL;

		this.canvas = inkCanvas;
		this.strokesLayer = inkCanvas.createLayer();

		this.strokeRenderer = new StrokeRenderer(this.canvas);

		this.builder = new InkBuilder();
		this.builder.onComplete = this.draw.bind(this);

		this.color = new Color(204, 204, 204);
	}

	init() {}

	registerInputProvider(pointerID, isPrimary) {
		if (Array.isArray(pointerID)) {
			// multi-touch should handle all changedTouches and to assign builders for each other
			if (isNaN(this.builder.pointerID))
				this.builder.pointerID = pointerID.first;
		}
		else {
			if (isPrimary)
				this.builder.pointerID = pointerID;
		}
	}

	getInkBuilder(pointerID) {
		if (Array.isArray(pointerID)) {
			if (pointerID.length > 0 && !pointerID.includes(this.builder.pointerID)) return undefined;
			return this.builder;
		}
		else
			return (this.builder.pointerID == pointerID) ? this.builder : undefined;
	}

	reset(sensorPoint) {
		let ibo = this.buildInkBuilderOptions(sensorPoint);
		let sro = this.buildStrokeRendererOptions();

		this.builder.configure(ibo);
		this.strokeRenderer.configure(sro);
	}

	buildInkBuilderOptions(sample) {
		let tool = repository.get(this.tool);
		let brush = repository.get(tool.brush);

		this.#context.reset(sample, brush, this.color, tool.dynamics, tool.statics);

		return {
			brush,
			layout: this.#context.layout,
			pathPointCalculator: this.#context.calculate.bind(this.#context),
			pathPointProps: this.#context.statics
		};
	}

	buildStrokeRendererOptions() {
		let tool = repository.get(this.tool);

		return {
			brush: repository.get(tool.brush),
			color: this.#context.color || this.color,
			blendMode: tool.blendMode || BlendMode.SOURCE_OVER
		};
	}

	begin(sensorPoint) {
		this.reset(sensorPoint);

		this.builder.add(sensorPoint);
		this.builder.build();
	}

	move(sensorPoint) {
		this.builder.add(sensorPoint);

		if (!this.requested) {
			this.requested = true;

			this.builder.build();

			requestAnimationFrame(() => (this.requested = false));
		}
	}

	end(sensorPoint) {
		this.builder.add(sensorPoint);
		this.builder.build();
	}

	draw(pathPart) {
		this.strokeRenderer.draw(pathPart.added, pathPart.phase == InkBuilder.Phase.END);

		if (pathPart.phase == InkBuilder.Phase.UPDATE) {
			this.strokeRenderer.drawPreliminary(pathPart.predicted);

			let dirtyArea = this.canvas.bounds.intersect(this.strokeRenderer.updatedArea);

			if (dirtyArea)
				this.present(dirtyArea, pathPart.phase);
		}
		else if (pathPart.phase == InkBuilder.Phase.END) {
			let affectedArea = this.strokeRenderer.strokeBounds.union(this.strokeRenderer.updatedArea);
			let dirtyArea = this.canvas.bounds.intersect(affectedArea);

			if (dirtyArea)
				this.present(dirtyArea, pathPart.phase);
		}
	}

	present(dirtyArea, phase) {
		if (phase == InkBuilder.Phase.END)
			this.strokeRenderer.blendStroke(this.strokesLayer);

		this.canvas.clear(dirtyArea);
		this.canvas.blend(this.strokesLayer, {rect: dirtyArea});

		if (phase == InkBuilder.Phase.UPDATE)
			this.strokeRenderer.blendUpdatedArea();
	}

	abort() {
		if (!this.builder.phase) return;

		let dirtyArea = this.strokeRenderer.affectedArea;

		this.strokeRenderer.abort();
		this.builder.abort();

		if (dirtyArea)
			this.refresh(dirtyArea);
	}

	refresh(dirtyArea = this.canvas.bounds) {
		this.canvas.clear(dirtyArea);
		this.canvas.blend(this.strokesLayer, {rect: dirtyArea});
	}

	clear() {
		this.strokesLayer.clear();
		this.canvas.clear();
	}
}

export default BasicInkController
