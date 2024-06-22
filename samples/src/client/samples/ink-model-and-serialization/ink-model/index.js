import {InkBuilder, InkModel} from "digital-ink"

import InkController2D from "/samples/drawing-with-pointing-devices/inking-2d/index.js"

class InkModelSample extends InkController2D {
	constructor(canvas) {
		super(canvas);

		this.inkModel = new InkModel();

		Object.defineProperty(this, "bounds", {
			get: () => this.computeBounds(this.inkModel.strokes),
			enumerable: true
		});
	}

	computeBounds(strokes) {
		let bounds;

		for (let stroke of strokes)
			bounds = stroke.bounds.union(bounds);

		return bounds;
	}

	async pipeline(strokes) {
		if (strokes.length == 0) return;

		console.error("pipeline is abstract and should be implemented");
	}

	draw(pathPart) {
		super.draw(pathPart);

		if (pathPart.phase == InkBuilder.Phase.END && !this.intersector && !this.selector) {
			let stroke = this.strokeRenderer.toStroke(this.builder);

			this.add(stroke);
		}
	}

	add(stroke) {
		this.inkModel.addPath(stroke);

		return stroke.bounds;
	}

	remove(stroke) {
		this.inkModel.removePath(stroke);

		return stroke.bounds;
	}

	redraw(modelArea, excludedStrokes = []) {
		let viewArea;

		if (modelArea) {
			viewArea = this.#modelToView(modelArea);
			viewArea = viewArea.intersect(this.canvas.bounds);
		}
		else {
			viewArea = this.canvas.bounds;
			modelArea = this.#viewToModel(viewArea);
		}

		if (!viewArea)
			return;

		let strokes = this.inkModel.strokes.filter(stroke => !excludedStrokes.includes(stroke) && stroke.style.visibility && stroke.bounds.intersects(modelArea));

		this.strokesLayer.clear(viewArea);
		this.strokeRenderer.blendStrokes(strokes, this.strokesLayer, {rect: viewArea});

		this.refresh(viewArea);
	}

	#modelToView(modelRect) {
		if (!this.transform || this.transform.isIdentity)
			return modelRect;
		else
			return modelRect.transform(this.transform).ceil();
	}

	#viewToModel(viewRect) {
		if (!this.transform || this.transform.isIdentity)
			return viewRect;
		else
			return viewRect.transform(this.transform.invert()).ceil();
	}

	clear() {
		super.clear();

		this.inkModel.clear();
	}
}

InkModelSample.settings = {
	section: "Ink Model and Serialization",
	title: "Data persitence - InkModel"
};

export default InkModelSample
