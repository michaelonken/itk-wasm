# Web Browser Processing Pipelines

These processing pipeline execution functions can be used from within a web browser. Processing pipeline TypeScript interfaces internally use the `runPipeline` function, documented below.

The processing pipeline functions generated with `itk-wasm bindgen` return a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that resolves an object.  The object there functions return includes a a `webWorker` property with the [`WebWorker`](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) used for computation. They also optionally accept a web worker from a previous execution as a `webWorker` property on their last argument. A per-package default web worker is reused throughout the session if no option is set. Alternatively, a web worker   can be manually created with `createWebWorker` and passed. Or, if `null` is passed, the worker will be created internally. If the worker is created explicitly, either through `createWebWorker` or passing `null`, it must `terminate()`'d manually once it is no longer needed to avoid resource leaks. Passing the value `false` for `webWorker` will run the computation in the current thread.

---

## `runPipeline`

```ts
runPipeline(webWorker: Worker | null | boolean,
  pipelinePath: string | URL,
  args: string[],
  outputs: PipelineOutput[] | null,
  inputs: PipelineInput[] | null
  pipelineBaseUrl: string | URL = 'pipelinesUrl',
  pipelineWorkerUrl?: string | URL | null,
  ):
  Promise<{
    returnValue: number,
    stdout: string,
    stderr: string,
    outputs: PipelineOutput[],
    webWorker: Worker,
  }>
```

*Run an itk-wasm Emscripten module in a web browser.*

### `webWorker`

Re-use a WebWorker generated by a previous call to `runPipeline`. Usually, `null` is passed here instead, which will result in generation of a new WebWorker. If `false` is passed, the pipeline will be instead executed in the current context.

### `pipelinePath`

Pipeline module path, without `.js` or `.wasm` extensions. Can be the basename of the pipeline or a full URL to the pipeline.

### `args`

A JavaScript Array of strings to pass to the execution of the `main` function, i.e. arguments that would be passed on the command line to a native executable.

### `outputs`

A JavaScript Array of desired [`PipelineOutput`](https://github.com/InsightSoftwareConsortium/itk-wasm/blob/main/src/pipeline/PipelineOutput.ts)'s that provide an interface `type` and an optional `path` when required by an interface type.

- `type` is one of the [`InterfaceTypes`](/typescript/interface-types/index.html).
- `path` is the optional file path on the filesystem to write after execution has completed.

### `inputs`

A JavaScript Array of [`PipelineInput`](https://github.com/InsightSoftwareConsortium/itk-wasm/blob/main/src/pipeline/PipelineInput.ts)'s or `null` that provide an interface `type`, an optional `path` when required by an interface type, and the input `data`.

- `type` is one of the [`InterfaceTypes`](/typescript/interface-types/index.html).
- `data` contains the corresponding data for the interface type.
- `path` is the optional file path on the filesystem to read after execution has completed.

### `pipelineBaseUrl`

When `pipelinePath` is a basename, this is the base URL for the pipeline module.

### `pipelineWorkerUrl`

Optional path or URL to the itk-wasm pipeline worker script. Fetched from JsDelivr by default. Set to `null` to use a version vendored by bundlers by Vite or WebPack.

### Result

Promise resolving a JavaScript object with the properties:

- `returnValue`: Integer return code from the pipeline.
- `stdout`: Text sent to stdout
- `stderr`: Text sent to stderr
-  `outputs`: An Array of [`PipelineOutput`](https://github.com/InsightSoftwareConsortium/itk-wasm/blob/main/src/pipeline/PipelineOutput.ts)'s with the `data` property populated.
- `webWorker`: WebWorker used for computation. Pass to another `runPipeline` call for re-use or call `terminate()` to clean up used resources.
