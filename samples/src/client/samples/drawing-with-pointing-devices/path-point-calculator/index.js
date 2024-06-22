import {PathPoint, BlendMode, Color} from "digital-ink"

import InkController2D from "../inking-2d/index.js"

import repository from "../DataRepository.js"

class PathPointCalculatorSample extends InkController2D {
	#step = 15;
	#length = 0;
	#offsetMax = 25;

	#lastOffsetX = 0;
	#lastOffsetY = 0;

	#pointsStack = [];

	constructor(canvas) {
		super(canvas);
	}

	buildInkBuilderOptions() {
		let tool = repository.get(this.tool);

		return {
			brush: repository.get(tool.brush),
			layout: [PathPoint.Property.X, PathPoint.Property.Y],
			pathPointCalculator: this.pathPointCalculator.bind(this),
			pathPointProps: {
				red: this.color.red,
				green: this.color.green,
				blue: this.color.blue,
				alpha: this.color.alpha,
				size: 7
			}
		};
	}

	pathPointCalculator(previous, current, next) {
		let point = current.createPathPoint();
		if (!previous) return point;

		let delta = {
			x: current.x - previous.x,
			y: current.y - previous.y
		};

		this.#length += Math.sqrt(delta.x ** 2 + delta.y ** 2);
		let offsetRatio = Math.sin(this.#length / this.#step);

		this.#pointsStack.push(previous);
		if (this.#pointsStack.length > 15) this.#pointsStack.shift();

		previous = this.#pointsStack[0];

		// calc perpendicular vector
		let perpendX = current.y - previous.y;
		let perpendY = previous.x - current.x;

		let d = Math.sqrt(perpendX ** 2 + perpendY ** 2);
		let dmax = this.#offsetMax;

		let alpha = d / dmax; // d and alpha be be 0

		// calc max offset point
		let maxOffsetX = perpendX / alpha; // could be 0 or NaN
		let maxOffsetY = perpendY / alpha; // could be 0 or NaN

		// calc curr offset point
		let offsetX = maxOffsetX * offsetRatio;
		let offsetY = maxOffsetY * offsetRatio;

		if (next) {
			if (offsetX) this.#lastOffsetX = offsetX;
			if (offsetY) this.#lastOffsetY = offsetY;
		}
		// if last point
		else if (!isNaN(this.#lastOffsetX) && !isNaN(this.#lastOffsetY)) {
			offsetX = this.#lastOffsetX;
			offsetY = this.#lastOffsetY;

			this.#lastOffsetX = 0;
			this.#lastOffsetY = 0;
		}

		if (!offsetX) offsetX = this.#lastOffsetX;
		if (!offsetY) offsetY = this.#lastOffsetY;

		point.x += offsetX;
		point.y += offsetY;

		return point;
	}
}

PathPointCalculatorSample.settings = {
	section: "Drawing with Pointing Devices",
	title: "PathPointCalculator - Control to the point"
};

export default PathPointCalculatorSample
