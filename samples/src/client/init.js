import factory from "@wacom/license-manager"
import DIGITAL_INK_LICENSE from "digital-ink-license"

const licenseManager = await factory();
await licenseManager.setLicense(DIGITAL_INK_LICENSE);
