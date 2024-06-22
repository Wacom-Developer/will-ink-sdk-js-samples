const BASE_PATH = process.env.BASE_PATH || ""

export default {
	"meta": `${BASE_PATH}/meta`,
	"digital-ink-license": `${BASE_PATH}/digital-ink-license`,
	"@wacom/web-components": `${BASE_PATH}/node_modules/@wacom/web-components/web-components-min.js`,

	// safari polyfill - is attribute
	"@wacom/web-components/custom-element-registry-ext": `${BASE_PATH}/node_modules/@wacom/web-components/custom-element-registry-ext-min.js`,
	"@ungap/custom-elements": `${BASE_PATH}/node_modules/@ungap/custom-elements/index.js`,

	"ag-psd": `${BASE_PATH}/node_modules/ag-psd/dist/bundle.js`,
	"pdf-lib": `${BASE_PATH}/node_modules/pdf-lib/dist/pdf-lib.esm.js`
}
