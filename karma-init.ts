import "./test-shim"
import "zone.js/dist/zone"
import "zone.js/dist/long-stack-trace-zone"
import "zone.js/dist/proxy.js"
import "zone.js/dist/sync-test"
import "zone.js/dist/mocha-patch"
import "zone.js/dist/async-test"
import "zone.js/dist/fake-async-test"
import { getTestBed } from "@angular/core/testing"
import {BrowserDynamicTestingModule, platformBrowserDynamicTesting} from "@angular/platform-browser-dynamic/testing"

getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting())


const testsContext = require.context("./src", true, /spec\.ts$/)
testsContext.keys().forEach(testsContext)

