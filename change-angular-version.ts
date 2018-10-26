const {readFileSync, writeFileSync} = require("fs")

const version =  process.argv[2]
const packageJson = JSON.parse(readFileSync("package.json"))

Object.keys(packageJson.devDependencies)
    .filter(key => key.startsWith("@angular"))
    .forEach(key => packageJson.devDependencies[key] = version)


if (Number(version.charAt(1)) < 6) {
    packageJson.devDependencies.rxjs = "^5.5.10"
}

writeFileSync("package.json", JSON.stringify(packageJson))
