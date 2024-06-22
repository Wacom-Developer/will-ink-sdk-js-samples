import {PluginsManager, InkCodec, SpatialContext, PipelineStage} from "digital-ink"

import repository from "../drawing-with-pointing-devices/DataRepository.js"

import InkModelController from "../ink-model-and-serialization/ink-model/index.js"

class ManipulationsInkController extends InkModelController {
	operation;

	constructor(canvas) {
		super(canvas);

		this.spatialContext = new SpatialContext();
	}

	async init() {
		let codec = new InkCodec();
		let {workers} = await PluginsManager.installWASM(window.env);

		this.inkPathProducer = workers.InkPathProducer.getInstance();
		await this.inkPathProducer.open();

		let response = await fetch("assets/ship.uim");
		let buffer = await response.arrayBuffer();

		this.inkModel = await codec.decodeInkModel(buffer);

		for (let brush of this.inkModel.brushes)
			repository.register(brush.name, brush);

		let strokes = this.inkModel.strokes;

		await this.pipeline(strokes);

		for (let stroke of strokes)
			this.spatialContext.add(stroke);

		this.redraw();
	}

	async pipeline(strokes) {
		let settings = {
			keepSplineParameters: true,
			keepAllData: [PipelineStage.SPLINE_INTERPOLATOR, PipelineStage.BRUSH_APPLIER]
		};

		await this.inkPathProducer.build(strokes, settings);
	}

	add(stroke) {
		this.spatialContext.add(stroke);

		return super.add(stroke);
	}

	remove(stroke) {
		if (stroke instanceof Array) {
			let dirtyArea;
			let strokes = stroke;

			for (let stroke of strokes) {
				let stroke = strokes[i];

				this.remove(stroke);
				dirtyArea = stroke.bounds.union(dirtyArea);
			}

			return dirtyArea;
		}

		this.spatialContext.remove(stroke);

		return super.remove(stroke);
	}

	async update(manipulation) {
		let {type, intersected, selected} = manipulation;

		let transaction = this.transaction;

		this.transaction = true;

		let dirtyArea;
		let rebuild = [];

		for (let strokeID in intersected) {
			let stroke = this.inkModel.getStroke(strokeID);

			if (intersected[strokeID].length == 0)
				this.remove(stroke);
			else {
				let strokes = stroke.split(intersected[strokeID]);

				rebuild.push(...strokes);

				this.inkModel.replacePath(stroke, strokes);
				this.spatialContext.remove(stroke);

				this.operation?.split(stroke, strokes);
			}

			dirtyArea = stroke.bounds.union(dirtyArea);
		}

		if (rebuild.length > 0) {
			await this.pipeline(rebuild);

			for (let stroke of rebuild)
				this.spatialContext.add(stroke);
		}

		for (let strokeID of selected) {
			let stroke = this.inkModel.getStroke(strokeID);

			dirtyArea = stroke.bounds.union(dirtyArea);

			if (type == "INTERSECTION")
				this.remove(stroke);
		}

		this.transaction = transaction;

		return dirtyArea;
	}

	clear() {
		super.clear();

		this.spatialContext.reset();
	}
}

export default ManipulationsInkController
