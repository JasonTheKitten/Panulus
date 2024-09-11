import { createService } from "./service.mjs";

export async function setup(plugin) {
  const service = createService(plugin);
  plugin.registerService(service);
}