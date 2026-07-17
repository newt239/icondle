declare module "*.wasm" {
  const wasmModule: WebAssembly.Module;
  export default wasmModule;
}

// このファイルを module として扱わせるための空 export のため例外的に許容する
// oxlint-disable-next-line unicorn/require-module-specifiers
export {};
