import InkModelController from "../ink-model/index.js"

class ExportSVGSample extends InkModelController {
	constructor(canvas) {
		super(canvas);

		this.actions = {
			export: this.export.bind(this)
		};
	}

	export() {
		let bounds = this.bounds;
		let strokes = this.inkModel.strokes;

		let paths = [];

		for (let stroke of strokes) {
			let poly = (stroke.path.length == 1) ? stroke.path.first : stroke.path.union();

			paths.push(`<path fill="${stroke.color.hex}" d="${poly.toSVGPath()}" />`);
		}

		let data = `
			<?xml version="1.0" encoding="utf-8"?>

			<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bounds.left} ${bounds.top} ${bounds.width} ${bounds.height}">
				${paths.join("\n\t").trim()}
			</svg>
		`;

		return data.trim();
	}

	static renderActionBar() {
		return `
			<action-bar>
				<file-saver type="svg" file-name="ink.svg" data-action="export" data-trigger="content">
					<a href="javascript:void(0)">Export (.svg)</a>
				</file-saver>
			</action-bar>
		`;
	}
}

ExportSVGSample.settings = {
	section: "Ink Model and Serialization",
	title: "Export to SVG"
};

export default ExportSVGSample
