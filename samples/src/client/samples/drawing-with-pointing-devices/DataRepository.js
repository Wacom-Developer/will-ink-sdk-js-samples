import {URIResolver, Brush2D, BrushPrototype, ShapeFactory, BrushGL, BlendMode} from "digital-ink"

/* **************************** VECTOR BRUSHES **************************** */

const triangle = new Brush2D("app://ink-samples/vector-brush/Triangle", ShapeFactory.createCircle(3));
const rhombus = new Brush2D("app://ink-samples/vector-brush/Rhombus", ShapeFactory.createCircle(4));

const circle = new Brush2D("app://ink-samples/vector-brush/Circle", [
	BrushPrototype.create(BrushPrototype.Type.CIRCLE, 0, 4),
	BrushPrototype.create(BrushPrototype.Type.CIRCLE, 2, 8),
	BrushPrototype.create(BrushPrototype.Type.CIRCLE, 6, 16),
	BrushPrototype.create(BrushPrototype.Type.CIRCLE, 18, 32)
]);

/* **************************** RASTER BRUSHES **************************** */

const pencilBrush = new BrushGL("app://ink-samples/raster-brush/Pencil", "textures/shape.png", "textures/fill.png", {spacing: 0.15, scattering: 0.15})

/* **************************** VECTOR TOOLS **************************** */

const pen = {
	name: "app://ink-samples/toolkit/Pen",
	brush: circle.name,

	dynamics: {
		size: {
			value: {
				min: 1,
				max: 2.1
			},

			velocity: {
				min: 100,
				max: 4000
			},

			pressure: {
				min: 0.2,
				max: 0.8
			}
		}
	},

	statics: {
		// alpha: 0.3
	}
};

/* **************************** RASTER TOOLS **************************** */

const pencilTool = {
	name: "app://ink-samples/toolkit/Pencil",
	brush: pencilBrush.name,

	dynamics: {
		size: {
			value: {
				min: 4,
				max: 12
			},

			velocity: {
				min: 100,
				max: 4000
			}
		},

		alpha: {
			value: {
				min: 0.1,
				max: 0.2
			},

			velocity: {
				min: 100,
				max: 4000
			}
		}
	}
};

/* **************************** ERASER TOOLS **************************** */

const eraserWholeStroke = {
	name: "app://ink-samples/toolkit/WholeStrokeEraser",
	brush: triangle.name,

	statics: {
		size: 10,
		red: 0,
		green: 0,
		blue: 0,
		alpha: 0
	}
};

const eraserPartialStroke = {
	name: "app://ink-samples/toolkit/PartialStrokeEraser",
	brush: rhombus.name,
	blendMode: BlendMode.DESTINATION_OUT,

	dynamics: {
		size: {
			value: {
				min: 16,
				max: 64
			},

			velocity: {
				min: 720,
				max: 3900
			}
		}
	},

	statics: {
		red: 255,
		green: 255,
		blue: 255,
		alpha: 1
	}
};

/* **************************** SELECTOR TOOLS **************************** */

const selectorTool = {
	name: "app://ink-samples/toolkit/Selector",
	brush: circle.name,

	statics: {
		size: 2,
		red: 0,
		green: 151,
		blue: 212,
		alpha: 1
	}
}

/* **************************** ************ **************************** */

let instance;

class DataRepository extends URIResolver {
	init() {
		this.register(circle.name, circle);
		this.register(triangle.name, triangle);
		this.register(rhombus.name, rhombus);
		this.register(pencilBrush.name, pencilBrush);

		this.register(pen.name, pen);
		this.register(pencilTool.name, pencilTool);

		this.register(eraserWholeStroke.name, eraserWholeStroke);
		this.register(eraserPartialStroke.name, eraserPartialStroke);

		this.register(selectorTool.name, selectorTool);
	}

	getItems(Type) {
		return this.items.filter(value => value instanceof Type);
	}

	static {
		instance = new DataRepository();
	}
}

export default instance
