import {PluginsManager, InkBuilder, Intersector, InputListener, Rect} from "digital-ink"

import InvisibleInkController from "../invisible-ink/index.js"

class PartialEraseWebWorkersSample extends InvisibleInkController {
	constructor(canvas) {
		super(canvas);

		this.builder.onComplete = this.erase.bind(this);
		this.builder.prediction = false;

		this.intersector = new Intersector(Intersector.Mode.PARTIAL_STROKE);
		this.intersector.reset(this.spatialContext);
	}

	async init() {
		super.init();

		this.preloader = document.querySelector("ui-preloader");

		const {workers} = await PluginsManager.installWorkers(window.env);
		const {SplitPointsProducer} = workers;

		this.splitPointsProducer = SplitPointsProducer.getInstance();
		this.splitPointsProducer.updateProgress = this.preloader.setProgress.bind(this.preloader);

		await this.splitPointsProducer.open();

		this.intersector.splitPointsProducer = this.splitPointsProducer;
	}

	async erase(pathPart) {
		if (pathPart.phase == InkBuilder.Phase.END) {
			let stroke = this.strokeRenderer.toStroke(this.builder);

			InputListener.disable(this);

			this.preloader.open(stroke.bounds, "Erase in progress (intersect). Please wait...", 400);

			let intersection = await this.intersector.intersect(stroke);

			this.preloader.setMessage("Erase in progress (split). Please wait...");

			let dirtyArea = await this.update(intersection);

			if (dirtyArea)
				this.redraw(dirtyArea);

			this.preloader.close();
			InputListener.enable(this);
		}
		else
			this.draw(pathPart);
	}
}

PartialEraseWebWorkersSample.settings = {
	section: "Ink Manipulations",
	title: "Erasing Stroke Parts with Web Workers - SplitPointsProducer"
};

export default PartialEraseWebWorkersSample
