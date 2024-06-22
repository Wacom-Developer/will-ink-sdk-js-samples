import InkModelController from "../ink-model/index.js"

class ExportPNGSample extends InkModelController {
	constructor(canvas) {
		super(canvas);

		this.actions = {
			export: this.export.bind(this)
		};
	}

	async export() {
		return await this.strokesLayer.toBlob(this.bounds);
	}

	static renderActionBar() {
		return `
			<action-bar>
				<file-saver type="png" file-name="ink.png" data-action="export" data-trigger="content">
					<a href="javascript:void(0)">Export (.png)</a>
				</file-saver>
			</action-bar>
		`;
	}
}

ExportPNGSample.settings = {
	section: "Ink Model and Serialization",
	title: "Export to PNG"
};

export default ExportPNGSample
