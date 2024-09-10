export async function setup(plugin) {
  let workbench = await plugin.resourceLoader().resource("./workbench.html", "html")
  document.getElementById("app").appendChild(workbench);
}