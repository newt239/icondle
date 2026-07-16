declare module "*.wasm" {
  const wasmModule: WebAssembly.Module;
  export default wasmModule;
}

declare global {
  // 宣言マージによる Cloudflare Workers ランタイムの caches.default 型拡張には interface が必須のため例外的に使用する
  // oxlint-disable-next-line typescript/consistent-type-definitions
  interface CacheStorage {
    readonly default: Cache;
  }
}

// このファイルを module として扱わせるための空 export のため例外的に許容する
// oxlint-disable-next-line unicorn/require-module-specifiers
export {};
