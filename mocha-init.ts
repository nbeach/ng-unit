import "./test-shim"
import "zone.js/dist/zone-node"

import { getTestBed } from "@angular/core/testing"
import {BrowserDynamicTestingModule, platformBrowserDynamicTesting} from "@angular/platform-browser-dynamic/testing"

getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting())

const JSDOM = require("jsdom").JSDOM
const window = new JSDOM("<!doctype html><html><body></body></html>").window as any;
(global as any).window = window;
(global as any).document = window.document;
(global as any).HTMLElement = window.HTMLElement;
(global as any).Node = window.Node;
(global as any).Event = window.Event
