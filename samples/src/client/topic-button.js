import {relatedTopicsURI} from "meta"

let sheet = new CSSStyleSheet();

sheet.replaceSync(`
	:host {display: inline-block; line-height: 1.5; text-align: center; cursor: pointer;}
	:host {padding: 37px 70px; margin: 32px; color: #0A96FF; border: 1px solid #0A96FF; border-radius: 16px;}
	.sdk {font-size: 18px;}
	.title {font-size: 28px;}
`);

class TopicButton extends HTMLElement {
	#name;
	#title;

	constructor() {
		super();

		this.attachShadow({mode: "open"});
		this.shadowRoot.adoptedStyleSheets.push(sheet);
	}

	connectedCallback() {
		this.#name = this.getAttribute("name");

		if (!relatedTopicsURI[this.#name]) {
			if (this.previousElementSibling.tagName == "H2")
				this.previousElementSibling.style.display = "none";

			this.remove();
			return;
		}

		this.#title = this.getAttribute("title");

		this.shadowRoot.innerHTML = this.#renderHTML();
		this.onclick = this.#redirect.bind(this);
	}

	#renderHTML() {
		return `
			<div class="sdk">Digital Ink</div>
			<div class="title">${this.#title}</div>
		`;
	}

	#redirect() {
		window.open(relatedTopicsURI[this.#name], "_top");
	}
}

customElements.define("topic-button", TopicButton);
