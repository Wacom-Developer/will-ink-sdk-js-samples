const DAY_OFFSET = 1000 * 60 * 60 * 24

export function rawBodySaver() {
	return (request, response, buffer, encoding) => {
		request.buffer = buffer
	}
}

export function cors(origin = "*") {
	return (request, response, next) => {
		response.setHeader("Access-Control-Allow-Origin", origin)
		response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE")
		response.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept")

		next()
	}
}

export function siteIsolation() {
	return (request, response, next) => {
		// response.setHeader("Cross-Origin-Resource-Policy", "cross-origin")

		response.setHeader("Cross-Origin-Embedder-Policy", "require-corp")
		response.setHeader("Cross-Origin-Opener-Policy", "same-origin")

		next()
	}
}

export function env() {
	return (request, response, next) => {
		response.cookie("env", process.env.BASE_PATH || "", {path: process.env.BASE_PATH, sameSite: "Strict", expires: new Date(Date.now() + ExpressUtils.DAY_OFFSET)})

		next()
	}
}

export function rewrite() {
	return (request, response, next) => {
		request.url = decodeURIComponent(request.url)

		if (process.env.BASE_PATH) {
			if (request.url.startsWith(process.env.BASE_PATH)) {
				request.url = request.url.substring(process.env.BASE_PATH.length) || "/"
				if (request.url.startsWith("?")) request.url = `/${request.url}`

				next()
			}
			else
				response.status(403).end()
		}
		else
			next()
	}
}
