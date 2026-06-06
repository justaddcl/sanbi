import { TransformStream } from "node:stream/web";

import "@testing-library/jest-dom";

if (!globalThis.TransformStream) {
  Object.defineProperty(globalThis, "TransformStream", {
    configurable: true,
    value: TransformStream,
    writable: true,
  });
}

const fetchMock = jest.fn(() =>
  Promise.reject(new Error("Unexpected fetch call in test")),
);

Object.defineProperty(globalThis, "fetch", {
  configurable: true,
  value: fetchMock,
  writable: true,
});
