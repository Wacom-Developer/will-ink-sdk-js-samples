import path from "node:path"
import fs from "node:fs/promises"

import express  from "express"
import WebIntegrator from "digital-ink/web-integrator"

import "./utils/env.mjs"
import utils from "./utils/utils.mjs"
import {rewrite, siteIsolation} from "./utils/express-filters.mjs"

import license from "./digital-ink-license.mjs"
import importmap from "./importmap.mjs"

const app = express()
const port = process.argv.slice(2)[0] || 8080

const pkg = (await import(process.env.npm_package_json_url, {with: {type: "json"}})).default
const BASE_PATH = process.env.BASE_PATH || ""

const webIntegrator = new WebIntegrator(false, BASE_PATH);
webIntegrator.build()

const imports = Object.assign({}, webIntegrator.dependencies, importmap);

app.use(siteIsolation())
app.use(rewrite())

async function index(request, response) {
	let src = path.join(process.env.PWD, "src", "client", "index.html")

	let content = await fs.readFile(src)
	content = content.toString()

	if (BASE_PATH) content = content.replace(`<base href="/">`, `<base href="${BASE_PATH}/">`)
	content = content.replace("<script type=\"importmap\">{}</script>", `<script type=\"importmap\">${JSON.stringify({imports}, 0, 4)}</script>`)

	response.setHeader("Content-Type", "text/html")
	response.send(content)
}

app.get("/digital-ink-license", (request, response) => {
	response.setHeader("Content-type", "application/javascript; charset=utf-8")
	response.status(200).end(`export default "${license.jwt}"`)
})

app.get("/", index)

app.get("/meta", (request, response) => {
	let {api, demo, samples, componentSamples} = process.env;

	let content = `
		export const name = "${pkg.name}";
		export const version = "${pkg.version}";
		export const relatedTopicsURI = ${JSON.stringify({api, demo, samples, componentSamples}, 0, 2)};
	`;

	response.setHeader("Content-type", "application/javascript; charset=utf-8")
	response.status(200).end(content)
});

app.get("/node_modules/**", (request, response) => {
	let src = path.join(process.env.PWD, request.path)

	response.sendFile(src)
})

app.get(/\/(samples|textures|assets|fonts).+\.*/, async (request, response) => {
	let src = path.join(process.env.PWD, "src", "client", request.path)

	if (BASE_PATH && request.path.endsWith(".js")) {
		let content = await fs.readFile(src)
		content = content.toString()

		content = content.replace(/\/samples\//g, `${BASE_PATH}/samples/`)

		response.setHeader("Content-Type", "text/javascript")
		response.send(content)
	}
	else
		response.sendFile(src)
})

app.get("/samples/:section/:sample", index)

app.get("*", async (request, response) => {
	let src = path.join(process.env.PWD, "src", "client", request.path)

	if (src.endsWith(".html")) {
		let content = await fs.readFile(src)
		content = content.toString()

		if (BASE_PATH) content = content.replace(`<base href="/">`, `<base href="${BASE_PATH}/">`)
		content = content.replace("<script type=\"importmap\">{}</script>", `<script type=\"importmap\">${JSON.stringify({imports}, 0, 4)}</script>`)

		response.setHeader("Content-Type", "text/html")
		response.send(content)
	}
	else
		response.sendFile(src)
})

app.listen(port);
utils.printNetworkInterfaces(port)
