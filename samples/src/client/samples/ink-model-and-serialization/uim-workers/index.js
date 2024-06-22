import {InkCodec, PluginsManager, BrushGL} from "digital-ink"

import repository from "../../drawing-with-pointing-devices/DataRepository.js"

import InkModelController from "../ink-model/index.js"

class UIMWebWorkersSample extends InkModelController {
	constructor(canvas) {
		super(canvas);

		this.codec = new InkCodec();

		this.actions = {
			decode: this.decode.bind(this),
			encode: this.encode.bind(this)
		};
	}

	async init() {
		this.preloader = document.querySelector("ui-preloader");

		const plugin = await PluginsManager.installWorkers(window.env);
		
		this.inkPathProducer = plugin.workers.InkPathProducer.getInstance();
		this.inkPathProducer.updateProgress = this.preloader.setProgress.bind(this.preloader);

		await this.inkPathProducer.open();
	}

	async pipeline(strokes) {
		await this.inkPathProducer.build(strokes);
	}

	async decode(buffer) {
		this.preloader.open("Open file in progress. Please wait...");

		this.clear(true);

		let inkModel = await this.codec.decodeInkModel(buffer);

		if (inkModel.brushes.find(brush => brush instanceof BrushGL)) {
			this.preloader.close();
			alert("Current sample targets vector content only, raster content found");
			return;
		}

		for (let brush of inkModel.brushes)
			repository.register(brush.name, brush);
		
		await this.inkPathProducer.importBrushes(inkModel.brushes);
		
		await this.pipeline(inkModel.strokes);

		this.inkModel = inkModel;

		this.redraw();

		this.preloader.close();
	}

	async encode() {
		let buffer = await this.codec.encodeInkModel(this.inkModel);

		return buffer;
	}

	static renderActionBar() {
		return `
			<action-bar>
				<file-opener type="uim" data-action="decode" data-trigger="buffer">
					<a href="javascript:void(0)">Open (.uim)</a>
				</file-opener>

				<file-saver type="uim" file-name="ink.uim" data-action="encode" data-trigger="content">
					<a href="javascript:void(0)">Save (.uim)</a>
				</file-saver>
			</action-bar>
		`;
	}
}

UIMWebWorkersSample.settings = {
	section: "Ink Model and Serialization",
	title: "Import / Export UIM files with Web Workers - InkPathProducer"
};

export default UIMWebWorkersSample
