import "ts-helpers"

import "core-js/client/shim"
import "zone.js/dist/zone-node"

import * as testing from "@angular/core/testing"
import * as browser from "@angular/platform-browser-dynamic/testing"
testing.TestBed.initTestEnvironment(browser.BrowserDynamicTestingModule, browser.platformBrowserDynamicTesting())

const JSDOM = require("jsdom").JSDOM

const window = new JSDOM("<!doctype html><html><body></body></html>").window as any;
(global as any).window = window;
(global as any).document = window.document;
(global as any).Node = window.Node;
(global as any).Event = window.Event

import * as chai from "chai"
import * as sinonChai from "sinon-chai"
import * as chaiDom from "chai-dom"

chai.use(sinonChai)
chai.use(chaiDom)
