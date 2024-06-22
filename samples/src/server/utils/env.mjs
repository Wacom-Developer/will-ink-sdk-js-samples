import url from "node:url"

if (!process.env.BASE_PATH && process.env.WEB_ENV) process.env.BASE_PATH = process.env.WEB_ENV
if (!process.env.NODE_ENV) process.env.NODE_ENV = "production"
if (!process.env.PWD) process.env.PWD = process.cwd()

process.env.npm_package_json_url = url.pathToFileURL(process.env.npm_package_json)

process.on("unhandledRejection", (reason, promise) => console.error(`[rejected]: ${reason}`))
