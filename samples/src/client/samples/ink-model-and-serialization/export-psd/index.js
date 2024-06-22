import "ag-psd"

import InkModelController from "../ink-model/index.js"

const {writePsd} = agPsd;

class ExportPSDSample extends InkModelController {
	constructor(canvas) {
		super(canvas);

		this.actions = {
			export: this.export.bind(this)
		};
	}

	export() {
		const scene = this.canvas.surface;

		// background canvas
		let canvas = document.createElement("canvas");
		let ctx = canvas.getContext("2d");

		canvas.width = scene.width;
		canvas.height = scene.height;

		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, scene.width, scene.height);

		const psdConfiguration = {
			width: scene.width,
			height: scene.height,
			children: [
				{name: "Background Layer", canvas},
				{name: "Ink Layer", canvas: scene}
			]
		};

		let buffer = writePsd(psdConfiguration);

		return buffer;
	}

	static renderActionBar() {
		return `
			<action-bar>
				<file-saver type="psd" file-name="ink.psd" data-action="export" data-trigger="content">
					<a href="javascript:void(0)">Export (.psd)</a>
				</file-saver>
			</action-bar>
		`;
	}
}

ExportPSDSample.settings = {
	section: "Ink Model and Serialization",
	title: "Export to PSD"
};

export default ExportPSDSample
