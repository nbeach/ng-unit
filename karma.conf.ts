const seconds = (time: number) => time * 1000

module.exports = (config: any) => {
    config.set({
        singleRun: true,
        concurrency: 5,
        browserDisconnectTolerance: 5,
        browserDisconnectTimeout: seconds(60),
        browserNoActivityTimeout: seconds(60),
        captureTimeout: seconds(60),
        files: ["./karma-init.ts"],
        frameworks: ["mocha"],
        reporters: ["dots", "saucelabs"],
        browsers: ["Chrome:HeadlessNoSandbox", "FirefoxHeadless", "SauceLabs:Edge", "SauceLabs:IE11", "SauceLabs:Safari"],
        preprocessors: {
            "./karma-init.ts": [ "webpack" ],
        },
        webpack:  {
            mode: "development",
            resolve: {
                extensions: [".js", ".ts"],
            },
            module: {
                rules: [{ test: /\.ts?$/, loader: "ts-loader" }],
            },
        },
        webpackMiddleware: {
            stats: "errors-only",
        },
        mime: {
            "text/x-typescript": ["ts"],
        },
        customLaunchers: {
            "Chrome:HeadlessNoSandbox": {
                base: "ChromeHeadless",
                    flags: ["--no-sandbox"],
            },
            "SauceLabs:IE11": {
                base: "SauceLabs",
                browserName: "internet explorer",
                platform: "Windows 8.1",
                version: "11",
            },
            "SauceLabs:Edge": {
                base: "SauceLabs",
                browserName: "MicrosoftEdge",
                version: "latest",
                platform: "Windows 10",
            },
            "SauceLabs:Safari": {
                base: "SauceLabs",
                browserName: "safari",
                version: "latest",
                platform: "macOS 10.12",
            },
        },
    })
}
