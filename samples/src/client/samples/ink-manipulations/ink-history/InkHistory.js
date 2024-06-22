import HistoryController from "../HistoryController.js"

class InkHistory extends HistoryController {
	constructor() {
		super();
	}

	add(operation, context) {
		if (Object.keys(operation.strokes).length == 0 && !operation.transition)
			return;

		if (this.state.length - 1 > this.step)
			this.state = this.state.slice(0, this.step+1);

		this.state.push({model: context, operation});
		this.step++;

		this.notify(operation.data);
	}

	restore(type) {
		let state = this.state[this.step];
		let operation = (type == "undo") ? state.operation.invert() : state.operation;

		state.model.restore(operation);

		return operation.data;
	}
}

export default InkHistory
