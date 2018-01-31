import 'reflect-metadata';
import 'ts-helpers';

import 'core-js/client/shim';
import 'zone.js/dist/zone-node';
import 'zone.js/dist/long-stack-trace-zone';
import 'zone.js/dist/proxy';
import 'zone.js/dist/sync-test';
import 'zone.js/dist/async-test';
import 'zone.js/dist/fake-async-test';

import * as testing from '@angular/core/testing';
import * as browser from '@angular/platform-browser-dynamic/testing';
testing.TestBed.initTestEnvironment(browser.BrowserDynamicTestingModule, browser.platformBrowserDynamicTesting());

const JSDOM = require("jsdom").JSDOM;
const window = (new JSDOM('<!doctype html><html><body></body></html>')).window;
(global as any).window = window;
(global as any).document = window.document;
(global as any).HTMLElement = window.HTMLElement;
(global as any).XMLHttpRequest = window.XMLHttpRequest;
(global as any).Node = window.Node;
(global as any).Event = window.Event;
(global as any).FormData = window.FormData;
(global as any).Blob = window.Blob;

import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as chaiDom from 'chai-dom';

chai.use(sinonChai);
chai.use(chaiDom);