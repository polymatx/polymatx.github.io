.PHONY: dev cp-wasmjs

dev: cp-wasmjs
	@echo "Starting HTTP server on port 8000"
	@python3 -m http.server 8000

cp-wasmjs:
ifeq ($(wildcard ./app/wasm/wasm_exec.js),)
	@echo "Copying wasm_exec.js"
	@cp "$(shell go env GOROOT)/misc/wasm/wasm_exec.js" ./wasm/
endif
