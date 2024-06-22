import {PDFDocument, rgb} from "pdf-lib"
import {Color} from "digital-ink"

import InkModelController from "../ink-model/index.js"

const pageSize = {width: 794, height: 1142};

class ExportPDFSample extends InkModelController {
	constructor(canvas) {
		super(canvas);

		this.color = Color.fromColor("rgb(4, 0, 230)");

		this.actions = {
			export: this.export.bind(this)
		};
	}

	async init() {
		let response = await fetch("assets/form.pdf");

		this.pdfBytes = await response.arrayBuffer();
	}

	async export() {
		let doc = await PDFDocument.load(this.pdfBytes);
		let pages = doc.getPages();
		let page = pages[0];
		let size = page.getSize();
		let scale = Math.min(size.width / pageSize.width, size.height / pageSize.height);

		let strokes = this.inkModel.strokes;

		for (let stroke of strokes) {
			let path = stroke.ink.union().toSVGPath();
			let color = rgb(stroke.color.red / 255, stroke.color.green / 255, stroke.color.blue / 255);

			page.moveTo(0, size.height);

			page.drawSvgPath(path, {
				color,
				scale,
				opacity: color.alpha,
				borderWidth: 0
			})
		}

		let bytes = await doc.save();

		return bytes.buffer;
	}

	static renderActionBar() {
		return `
			<action-bar>
				<file-saver type="pdf" file-name="ink.pdf" data-action="export" data-trigger="content">
					<a href="javascript:void(0)">Export (.pdf)</a>
				</file-saver>
			</action-bar>
		`;
	}
}

ExportPDFSample.settings = {
	section: "Ink Model and Serialization",
	title: "Export to PDF",
	pageSize: pageSize
};

export default ExportPDFSample
