import {InkBuilder, StrokeRenderer2D, StrokeRendererGL} from "digital-ink"

class InkProcessorsPool {
	#builders = [];
	#renderers = [];

	#connected;

	#activeBuilders = {};
	#lastBuilds = [];

	constructor(canvas, draw) {
		this.canvas = canvas;
		this.draw = draw;

		this.#connected = {
			builders: {},
			renderers: {}
		};
	}

	allocate(pointerID) {
		let builder = this.#builders.shift();
		let strokeRenderer = this.#renderers.shift();

		if (!builder)
			builder = new InkBuilder();

		if (!strokeRenderer)
			strokeRenderer = new StrokeRenderer2D(this.canvas);

		builder.pointerID = pointerID;
		builder.onComplete = (pathPart) => this.draw(pointerID, pathPart);

		strokeRenderer.pointerID = pointerID;

		this.#connected.builders[pointerID] = builder;
		this.#connected.renderers[pointerID] = strokeRenderer;
	}

	getInkBuilder(pointerID) {
		return this.#connected.builders[pointerID];
	}

	getStrokeRenderer(pointerID) {
		return this.#connected.renderers[pointerID];
	}

	getAllocatedRenderers() {
		return Object.values(this.#connected.renderers);
	}

	add(sensorPoint) {
		let pointerID = sensorPoint.pointer.id;
		let builder = this.#connected.builders[pointerID];
		let strokeRenderer = this.#connected.renderers[pointerID];

		builder.add(sensorPoint);

		this.#activeBuilders[pointerID] = builder;
	}

	build() {
		Object.values(this.#activeBuilders).forEach(builder => builder.build());

		for (let pointerID in this.#activeBuilders) {
			this.#activeBuilders[pointerID].build();
			this.#lastBuilds.push(pointerID);
		}
	}

	next() {
		for (let pointerID of this.#lastBuilds)
			delete this.#activeBuilders[pointerID];

		this.#lastBuilds.clear();
	}

	deallocate(pointerID) {
		this.deallocateInkBuilder(pointerID);
		this.deallocateStrokeRenderer(this.#connected.renderers[pointerID]);
	}

	deallocateInkBuilder(pointerID) {
		let builder = this.#connected.builders[pointerID];

		this.#builders.push(builder);
		delete this.#connected.builders[pointerID];
		delete this.#activeBuilders[pointerID];
	}

	deallocateStrokeRenderer(strokeRenderer) {
		let pointerID = strokeRenderer.pointerID;

		delete strokeRenderer.phase;
		delete strokeRenderer.pointerID;
		delete this.#connected.renderers[pointerID];

		this.#renderers.push(strokeRenderer);
	}
}

export default InkProcessorsPool
