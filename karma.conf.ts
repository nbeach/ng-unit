module.exports = (config: any) => {
    config.set({
        singleRun: true,
        files: ["./karma-init.ts"],
        frameworks: ["mocha"],
        reporters: ["dots"],
        browsers: ["ChromeHeadlessNoSandbox", "FirefoxHeadless", "Edge", "IE"],
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
            ChromeHeadlessNoSandbox: {
                base: "ChromeHeadless",
                    flags: ["--no-sandbox"],
            },
        },
    })
}
