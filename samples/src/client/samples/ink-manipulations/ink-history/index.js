import {InkModelOperation, InkBuilder} from "digital-ink"

import ManipulationsInkController from "../ManipulationsInkController.js"

import InkHistory from "./InkHistory.js"

class InkHistorySample extends ManipulationsInkController {
	#transaction;

	actionBar;

	constructor(canvas) {
		super(canvas);

		this.history = new InkHistory(this);

		this.history.addEventListener("change", (e) => {
			let {undo, redo} = this.actionBar.buttons;

			if (e.detail.history.undo)
				undo.classList.remove("disabled");
			else
				undo.classList.add("disabled");

			if (e.detail.history.redo)
				redo.classList.remove("disabled");
			else
				redo.classList.add("disabled");
		});

		Object.defineProperty(this, "transaction", {
			get: () => this.#transaction,
			set: (value) => {
				if (value == this.#transaction)
					return;

				if (value) {
					this.operation = new InkModelOperation();
					this.operation.open(this.inkModel);
				}
				else {
					this.operation.close();
					this.history.add(this.operation, this);
					this.operation = null;
				}

				this.#transaction = value;
			},
			enumerable: true
		});

		this.actions = {
			undo: this.history.undo.bind(this.history),
			redo: this.history.redo.bind(this.history)
		};
	}

	async init() {
		if (this.constructor.name == "InkHistorySample")
			return;

		await super.init();
	}

	add(stroke) {
		if (stroke instanceof Array) {
			let dirtyArea;

			let strokes = stroke;
			let transaction = this.transaction;

			this.transaction = true;

			for (let stroke of strokes) {
				this.add(stroke);

				dirtyArea = stroke.bounds.union(dirtyArea);
			}

			this.transaction = transaction;

			return dirtyArea;
		}

		let operation = this.operation || new InkModelOperation();
		operation.add(stroke, this.inkModel.content.last);

		if (!this.#transaction)
			this.history.add(operation, this);

		return super.add(stroke);
	}

	remove(stroke) {
		if (stroke instanceof Array) {
			let dirtyArea;

			let strokes = stroke;
			let transaction = this.transaction;

			this.transaction = true;

			for (let i = strokes.length - 1; i >= 0; i--) {
				let stroke = strokes[i];

				this.remove(stroke);
				dirtyArea = stroke.bounds.union(dirtyArea);
			}

			this.transaction = transaction;

			return dirtyArea;
		}

		let operation = this.operation || new InkModelOperation();
		operation.remove(stroke, this.#transaction ? undefined : this.inkModel.content.indexOf(stroke));

		if (!this.#transaction)
			this.history.add(operation, this);

		return super.remove(stroke);
	}

	clear(importInk = false) {
		if (!importInk)
			this.remove(this.inkModel.content);

		super.clear();
	}

	restore(operation) {
		let strokes = operation.strokes;

		let updates = operation.updates;
		let transformation = operation.transformation;

		let dirtyArea = this.computeBounds(Object.values(strokes));

		for (let strokeID of operation.removal) {
			let stroke = strokes[strokeID];

			this.spatialContext.remove(stroke);
			this.inkModel.removePath(stroke);
		}

		for (let strokeID of operation.addition) {
			let stroke = strokes[strokeID];
			let index = operation.index[strokeID];

			this.inkModel.addPath(stroke, undefined, index);
			this.spatialContext.add(stroke);
		}

		for (let split of operation.splits) {
			let stroke = strokes[split.stroke];
			let slices = split.strokes.map(strokeID => strokes[strokeID]);

			this.inkModel.replacePath(stroke, slices);

			this.spatialContext.remove(stroke);

			for (let stroke of slices)
				this.spatialContext.add(stroke);
		}

		for (let union of operation.unions) {
			let stroke = strokes[union.stroke];
			let slices = union.strokes.map(strokeID => strokes[strokeID]);

			for (let stroke of slices)
				this.spatialContext.remove(stroke);

			this.spatialContext.add(stroke);

			this.inkModel.replacePath(slices[0], [stroke]);

			for (let i = 1; i < slices.length; i++)
				this.inkModel.removePath(slices[i]);
		}

		for (let update of updates) {
			let stroke = strokes[update.stroke];
			let props = Object.keys(update.descriptor);

			for (let name of props) {
				if (name == "color")
					stroke.color = update.descriptor.color;
				else
					throw new Error(`resotre ${name} NYI`);
			}
		}

		if (transformation) {
			dirtyArea = transformation.bounds.union(dirtyArea);

			for (let strokeID of transformation.strokes)
				strokes[strokeID].ink = transformation.pipelinePaths[strokeID];
		}

		this.redraw(dirtyArea);
	}

	static renderActionBar() {
		return `
			<action-bar>
				<a href="javascript:void(0)" class="disabled" data-action="undo">Undo</a>
				<a href="javascript:void(0)" class="disabled" data-action="redo">Redo</a>
			</action-bar>
		`;
	}
}

InkHistorySample.settings = {
	section: "Ink Manipulations",
	title: "Ink History"
};

export default InkHistorySample
