const {readFileSync, writeFileSync} = require("fs")

const version =  process.argv[2]
const packageJson = JSON.parse(readFileSync("package.json"))

Object.keys(packageJson.devDependencies)
    .filter(key => key.startsWith("@angular"))
    .forEach(key => packageJson.devDependencies[key] = version)


writeFileSync("package.json", JSON.stringify(packageJson))
