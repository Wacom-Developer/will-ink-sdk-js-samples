import {InputListener, version as digitalInkVersion} from "digital-ink"

import "@wacom/web-components"

// import sheet from "/styles.css" assert {type: "css"}

const response = await fetch("styles.css");
const cssText = await response.text();
const sheet = new CSSStyleSheet();
await sheet.replace(cssText);

document.adoptedStyleSheets.push(sheet);

let app = {
	async init() {
		if (location.href == document.baseURI || location.href + "/" == document.baseURI) {
			document.querySelector(".welcome").style.display = "";
			document.querySelector(".ink-context").parentNode.style.display = "none";
			document.querySelector("nav.sample").style.display = "none";
			document.body.style.visibility = "";

			this.initLayout("", "");

			return;
		}

		let {default: Sample} = await import(`${location.pathname}/index.js`);
		let {section, title, disableInput, pageSize} = Sample.settings;

		this.initLayout(section, title);
		Array.from(document.querySelectorAll("nav.main a")).find(a => a.href.includes(location.pathname)).parentNode.classList.add("selected");

		this.inkContext = document.querySelector(".ink-context");

		if (pageSize) {
			let style = sheet.findRule(".ink-context").style;

			style.width = `${pageSize.width}px`;
			style.height = `${pageSize.height}px`;

			this.inkContext.classList.add("form");
			this.inkContext.parentNode.classList.add("form");
		}

		await this.initInkController(Sample);

		if (!disableInput)
			InputListener.attach(this.inkController);

		this.actionBar = document.querySelector("action-bar");

		this.actionBar.init({
			clear: () => this.inkController.clear()
		});

		if (this.inkController.actions) {
			let actionBar = HTMLCollection.fromHTML(Sample.renderActionBar())[0];

			document.querySelector("nav.sample").appendChild(actionBar);

			actionBar.init(this.inkController.actions);

			this.inkController.actionBar = actionBar;
		}

		document.body.style.visibility = "";
	},

	initLayout(section, title) {
		document.querySelector("header h2").textContent = section;
		document.querySelector("header p").textContent = title;

		document.getElementById("SDKVersion").textContent = digitalInkVersion;
		document.getElementById("ScreenSize").textContent = `${screen.width} x ${screen.height}`;
		document.getElementById("WindowSize").textContent = `${window.innerWidth} x ${window.innerHeight}`;

		addEventListener("resize", () => document.getElementById("WindowSize").textContent = `${window.innerWidth} x ${window.innerHeight}`);

		// prevents Scribble for iOS, scroll page for Windows
		window.addEventListener("touchmove", function(e) {
			e.preventDefault();
		}, {passive: false});
	},

	async initInkController(Sample) {
		let {pageSize} = Sample.settings;

		let canvas = document.querySelector("#canvas");
		let inkController = new Sample(canvas);

		this.inkController = inkController;

		this.resizeScene();

		if (!pageSize)
			addEventListener("resize", this.resizeScene.bind(this));

		await inkController.init();
	},

	resizeScene() {
		if (this.inkContext.offsetWidth > this.inkController.strokesLayer.width || this.inkContext.offsetHeight > this.inkController.strokesLayer.height) {
			this.inkController.strokesLayer.resize(this.inkContext.offsetWidth, this.inkContext.offsetHeight);
			this.inkController.strokeRenderer.resize(this.inkContext.offsetWidth, this.inkContext.offsetHeight);
		}
		
		this.inkController.canvas.resize(this.inkContext.offsetWidth, this.inkContext.offsetHeight);
		this.inkController.refresh();
	}
};

export default app
