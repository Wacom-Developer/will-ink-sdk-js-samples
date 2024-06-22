import {InkModelOperation, Selector, InkBuilder, Color} from "digital-ink"

import InkHistoryController from "../ink-history/index.js";

class SelectingStrokesSample extends InkHistoryController {
	tool = "app://ink-samples/toolkit/Selector";
	
	constructor(canvas) {
		super(canvas);

		this.selector = new Selector(Selector.Mode.WHOLE_STROKE)
		this.selector.reset(this.spatialContext);

		this.builder.onComplete = this.select.bind(this);
	}

	select(pathPart) {
		if (pathPart.phase == InkBuilder.Phase.END) {
			let stroke = this.strokeRenderer.toStroke(this.builder);
			let selection = this.selector.select(stroke);

			if (selection.length > 0) {
				let strokes = selection.selected.map(strokeID => this.inkModel.getStroke(strokeID));
				let color = Color.random();

				let dirtyArea = this.updateColor(color, strokes);
				dirtyArea = stroke.bounds.union(dirtyArea);

				this.redraw(dirtyArea);
			}

			this.refresh(stroke.bounds);
		}
		else
			this.draw(pathPart);
	}

	updateColor(color, strokes) {
		let dirtyArea;
		let operation = this.operation || new InkModelOperation();

		for (let stroke of strokes) {
			operation.update(stroke, {
				color: {before: stroke.color, after: color}
			});

			stroke.color = color;
			dirtyArea = stroke.bounds.union(dirtyArea);
		}

		if (!this.transaction)
			this.history.add(operation, this);

		return dirtyArea;
	}
}

SelectingStrokesSample.settings = {
	section: "Ink Manipulations",
	title: "Selecting Strokes"
};

export default SelectingStrokesSample
