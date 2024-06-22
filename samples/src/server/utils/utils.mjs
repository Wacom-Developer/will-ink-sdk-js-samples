import os from "node:os"

class Utils {
	static printNetworkInterfaces(port) {
		let networkAddresses = []
		let interfaces = os.networkInterfaces()

		for (let name in interfaces) {
			interfaces[name].forEach(address => {
				if (address.family === "IPv4" && !address.internal)
					networkAddresses.push(address.address)
			})
		}

		console.log(`Server has started on port ${port}. IPs: ${networkAddresses.join(", ")}`)
	}

	static isIP(hostname) {
		return /^(?:(?:^|\.)(?:2(?:5[0-5]|[0-4]\d)|1?\d?\d)){4}$/.test(hostname);
	}
}

export default Utils
