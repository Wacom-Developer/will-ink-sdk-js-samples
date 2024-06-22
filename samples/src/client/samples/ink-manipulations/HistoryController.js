class HistoryController extends EventTarget {
	step = -1;
	state = [];

	constructor() {
		super();
	}

	restore() {
		throw new Error("This method is abstract and should be implemented");
	}

	add() {
		throw new Error("This method is abstract and should be implemented");
	}

	undo() {
		if (!this.#canUndo()) return;

		let operation = this.restore("undo");
		this.step--;

		this.notify(operation);
	}

	redo() {
		if (!this.#canRedo()) return;

		this.step++;
		let operation = this.restore("redo");

		this.notify(operation);
	}

	notify(operation = {type: "RESTORE"}) {
		operation.history = {undo: this.#canUndo(), redo: this.#canRedo()};

		this.dispatchEvent(new CustomEvent("change", {detail: operation}));
	}

	#canUndo() {
		return this.step > -1;
	}

	#canRedo() {
		return this.step < this.state.length - 1;
	}

	reset() {
		this.step = -1;
		this.state.clear();

		this.notify({type: "RESET"});
	}
}

export default HistoryController
