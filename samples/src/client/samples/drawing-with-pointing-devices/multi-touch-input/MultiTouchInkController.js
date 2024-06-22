import {InkController, InkBuilder, PathPointContext, InkCanvas2D, StrokeRenderer2D, BlendMode, Stroke, Color} from "digital-ink"

import repository from "../DataRepository.js"
import InkProcessorsPool from "./InkProcessorsPool.js"

class MultiTouchInkController extends InkController {
	#context = new PathPointContext();
	strokes = [];

	#tool = "app://ink-samples/toolkit/Pen";

	constructor(canvas) {
		super();

		this.canvas = InkCanvas2D.createInstance(canvas);
		this.strokesLayer = this.canvas.createLayer();
		this.composeLayer = this.canvas.createLayer();

		// for redraw purposses only
		this.strokeRenderer = new StrokeRenderer2D(this.canvas);

		this.pool = new InkProcessorsPool(this.canvas, this.draw.bind(this));
	}

	init() {}

	registerInputProvider(pointerID, isPrimary) {
		if (Array.isArray(pointerID))
			pointerID.forEach(touchID => this.pool.allocate(touchID));
		else
			this.pool.allocate(pointerID);
	}

	getInkBuilder(pointerID) {
		return this.pool.getInkBuilder(pointerID);
	}

	getStrokeRenderer(pointerID) {
		return this.pool.getStrokeRenderer(pointerID);
	}

	reset(sensorPoint) {
		let ibo = this.buildInkBuilderOptions(sensorPoint);
		let sro = this.buildStrokeRendererOptions();

		this.getInkBuilder(sensorPoint.pointer.id).configure(ibo);
		this.getStrokeRenderer(sensorPoint.pointer.id).configure(sro);
	}

	buildInkBuilderOptions(sample) {
		let tool = repository.get(this.#tool);
		let brush = repository.get(tool.brush);
		let color = Color.random();

		this.#context.reset(sample, brush, color, tool.dynamics, tool.statics);

		return {
			brush,
			layout: this.#context.layout,
			pathPointCalculator: this.#context.calculate.bind(this.#context),
			pathPointProps: this.#context.statics
		};
	}

	buildStrokeRendererOptions() {
		let tool = repository.get(this.#tool);

		return {
			brush: repository.get(tool.brush),
			color: this.#context.color,
			blendMode: tool.blendMode || BlendMode.SOURCE_OVER
		};
	}

	begin(sensorPoint) {
		let builder = this.getInkBuilder(sensorPoint.pointer.id);

		this.reset(sensorPoint);

		builder.add(sensorPoint);
		builder.build();
	}

	move(sensorPoint) {
		this.pool.add(sensorPoint)

		if (!this.requested) {
			this.requested = true;

			this.pool.build();

			requestAnimationFrame(() => (this.requested = false));
		}
	}

	end(sensorPoint) {
		let builder = this.getInkBuilder(sensorPoint.pointer.id);

		builder.add(sensorPoint);
		builder.build();

		this.pool.deallocateInkBuilder(sensorPoint.pointer.id);
	}

	draw(pointerID, pathPart) {
		let builder = this.getInkBuilder(pointerID);
		let strokeRenderer = this.getStrokeRenderer(pointerID);

		strokeRenderer.phase = pathPart.phase;

		strokeRenderer.draw(pathPart.added, pathPart.phase == InkBuilder.Phase.END);

		if (pathPart.phase == InkBuilder.Phase.UPDATE) {
			strokeRenderer.drawPreliminary(pathPart.predicted);

			let dirtyArea = this.canvas.bounds.intersect(strokeRenderer.updatedArea);

			if (dirtyArea)
				this.refresh(dirtyArea);
		}
		else if (pathPart.phase == InkBuilder.Phase.END) {
			let affectedArea = strokeRenderer.strokeBounds.union(strokeRenderer.updatedArea);
			let dirtyArea = this.canvas.bounds.intersect(affectedArea);

			if (dirtyArea) {
				strokeRenderer.blendStroke(this.strokesLayer);

				this.refresh(dirtyArea);
			}

			let stroke = strokeRenderer.toStroke(builder);
			this.strokes.push(stroke);
		}
	}

	abort(pointerID) {
		let builder = this.getInkBuilder(pointerID);

		if (!builder) return;

		if (!builder.phase) {
			console.warn("no phase found");
			return
		}

		let strokeRenderer = this.getStrokeRenderer(pointerID);
		let dirtyArea = strokeRenderer.affectedArea;

		strokeRenderer.abort();
		builder.abort();

		if (dirtyArea)
			this.refresh(dirtyArea);

		this.pool.deallocate(pointerID);
	}

	redraw(dirtyArea = this.canvas.bounds, excludedStrokes = []) {
		let visibleArea = this.transform ? dirtyArea.transform(this.transform.invert()) : dirtyArea;

		this.strokesLayer.clear(dirtyArea);

		for (let stroke of this.strokes) {
			if (excludedStrokes.includes(stroke)) continue;

			if (stroke.bounds.intersect(visibleArea)) {
				this.strokeRenderer.draw(stroke);
				this.strokeRenderer.blendStroke(this.strokesLayer, dirtyArea);
			}
		}

		this.refresh(dirtyArea);
	}

	refresh(dirtyArea = this.canvas.bounds) {
		if (this.activeArea)
			this.activeArea = this.activeArea.union(dirtyArea);
		else {
			this.activeArea = dirtyArea;

			requestAnimationFrame(this.completeRefresh.bind(this));
		}
	}

	completeRefresh() {
		let renderers = [this.strokeRenderer].concat(this.pool.getAllocatedRenderers());
		let dirtyArea = this.activeArea;

		this.activeArea = null;

		this.composeLayer.blend(this.strokesLayer, {mode: BlendMode.COPY, rect: dirtyArea});

		renderers.forEach(strokeRenderer => {
			if (strokeRenderer.phase) {
				strokeRenderer.updatedArea = dirtyArea;

				if (strokeRenderer.phase == InkBuilder.Phase.UPDATE)
					strokeRenderer.blendUpdatedArea(this.composeLayer);
				else if (strokeRenderer.phase == InkBuilder.Phase.END)
					this.pool.deallocateStrokeRenderer(strokeRenderer);
			}
		});

		this.pool.next();

		this.canvas.clear(dirtyArea);
		this.canvas.blend(this.composeLayer, {rect: dirtyArea});
	}

	clear() {
		this.strokesLayer.clear();
		this.canvas.clear();

		this.strokes.clear();
	}
}

export default MultiTouchInkController
