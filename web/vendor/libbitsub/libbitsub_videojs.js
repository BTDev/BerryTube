var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// deno:https://jsr.io/@altq/libbitsub/1.12.1/pkg/libbitsub.js
var libbitsub_exports = {};
__export(libbitsub_exports, {
  DvbParser: () => DvbParser,
  PgsParser: () => PgsParser,
  RenderResult: () => RenderResult,
  SubtitleComposition: () => SubtitleComposition,
  SubtitleFormat: () => SubtitleFormat,
  SubtitleFrame: () => SubtitleFrame,
  SubtitleRenderer: () => SubtitleRenderer,
  VobSubFrame: () => VobSubFrame,
  VobSubParser: () => VobSubParser,
  default: () => __wbg_init,
  init: () => init,
  initSync: () => initSync
});
function init() {
  wasm.init();
}
function __wbg_get_imports() {
  const import0 = {
    __proto__: null,
    __wbg___wbindgen_throw_1506f2235d1bdba0: function(arg0, arg1) {
      throw new Error(getStringFromWasm0(arg0, arg1));
    },
    __wbg_error_a6fa202b58aa1cd3: function(arg0, arg1) {
      let deferred0_0;
      let deferred0_1;
      try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        console.error(getStringFromWasm0(arg0, arg1));
      } finally {
        wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
      }
    },
    __wbg_new_227d7c05414eb861: function() {
      const ret = new Error();
      return ret;
    },
    __wbg_new_from_slice_18fa1f71286d66b8: function(arg0, arg1) {
      const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
      return ret;
    },
    __wbg_new_with_length_36a4998e27b014c5: function(arg0) {
      const ret = new Uint8Array(arg0 >>> 0);
      return ret;
    },
    __wbg_new_with_length_b4a87ccced374381: function(arg0) {
      const ret = new Float64Array(arg0 >>> 0);
      return ret;
    },
    __wbg_set_index_c69336ea758c0507: function(arg0, arg1, arg2) {
      arg0[arg1 >>> 0] = arg2;
    },
    __wbg_stack_3b0d974bbf31e44f: function(arg0, arg1) {
      const ret = arg1.stack;
      const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    },
    __wbindgen_cast_0000000000000001: function(arg0, arg1) {
      const ret = getStringFromWasm0(arg0, arg1);
      return ret;
    },
    __wbindgen_init_externref_table: function() {
      const table = wasm.__wbindgen_externrefs;
      const offset = table.grow(4);
      table.set(0, void 0);
      table.set(offset + 0, void 0);
      table.set(offset + 1, null);
      table.set(offset + 2, true);
      table.set(offset + 3, false);
    }
  };
  return {
    __proto__: null,
    "./libbitsub_bg.js": import0
  };
}
function getArrayU8FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}
function getDataViewMemory0() {
  if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || cachedDataViewMemory0.buffer.detached === void 0 && cachedDataViewMemory0.buffer !== wasm.memory.buffer) {
    cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
  }
  return cachedDataViewMemory0;
}
function getStringFromWasm0(ptr, len) {
  return decodeText(ptr >>> 0, len);
}
function getUint8ArrayMemory0() {
  if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8ArrayMemory0;
}
function passArray8ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 1, 1) >>> 0;
  getUint8ArrayMemory0().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}
function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === void 0) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr2 = malloc(buf.length, 1) >>> 0;
    getUint8ArrayMemory0().subarray(ptr2, ptr2 + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr2;
  }
  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;
  const mem = getUint8ArrayMemory0();
  let offset = 0;
  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 127) break;
    mem[ptr + offset] = code;
  }
  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
    const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
    const ret = cachedTextEncoder.encodeInto(arg, view);
    offset += ret.written;
    ptr = realloc(ptr, len, offset, 1) >>> 0;
  }
  WASM_VECTOR_LEN = offset;
  return ptr;
}
function takeFromExternrefTable0(idx) {
  const value = wasm.__wbindgen_externrefs.get(idx);
  wasm.__externref_table_dealloc(idx);
  return value;
}
function decodeText(ptr, len) {
  numBytesDecoded += len;
  if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
    cachedTextDecoder = new TextDecoder("utf-8", {
      ignoreBOM: true,
      fatal: true
    });
    cachedTextDecoder.decode();
    numBytesDecoded = len;
  }
  return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}
function __wbg_finalize_init(instance, module) {
  wasmInstance = instance;
  wasm = instance.exports;
  wasmModule = module;
  cachedDataViewMemory0 = null;
  cachedUint8ArrayMemory0 = null;
  wasm.__wbindgen_start();
  return wasm;
}
async function __wbg_load(module, imports) {
  if (typeof Response === "function" && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module, imports);
      } catch (e) {
        const validResponse = module.ok && expectedResponseType(module.type);
        if (validResponse && module.headers.get("Content-Type") !== "application/wasm") {
          console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
        } else {
          throw e;
        }
      }
    }
    const bytes = await module.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module, imports);
    if (instance instanceof WebAssembly.Instance) {
      return {
        instance,
        module
      };
    } else {
      return instance;
    }
  }
  function expectedResponseType(type) {
    switch (type) {
      case "basic":
      case "cors":
      case "default":
        return true;
    }
    return false;
  }
}
function initSync(module) {
  if (wasm !== void 0) return wasm;
  if (module !== void 0) {
    if (Object.getPrototypeOf(module) === Object.prototype) {
      ({ module } = module);
    } else {
      console.warn("using deprecated parameters for `initSync()`; pass a single object instead");
    }
  }
  const imports = __wbg_get_imports();
  if (!(module instanceof WebAssembly.Module)) {
    module = new WebAssembly.Module(module);
  }
  const instance = new WebAssembly.Instance(module, imports);
  return __wbg_finalize_init(instance, module);
}
async function __wbg_init(module_or_path) {
  if (wasm !== void 0) return wasm;
  if (module_or_path !== void 0) {
    if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
      ({ module_or_path } = module_or_path);
    } else {
      console.warn("using deprecated parameters for the initialization function; pass a single object instead");
    }
  }
  if (module_or_path === void 0) {
    module_or_path = new URL("libbitsub_bg.wasm", import.meta.url);
  }
  const imports = __wbg_get_imports();
  if (typeof module_or_path === "string" || typeof Request === "function" && module_or_path instanceof Request || typeof URL === "function" && module_or_path instanceof URL) {
    module_or_path = fetch(module_or_path);
  }
  const { instance, module } = await __wbg_load(await module_or_path, imports);
  return __wbg_finalize_init(instance, module);
}
var DvbParser, PgsParser, RenderResult, SubtitleComposition, SubtitleFormat, SubtitleFrame, SubtitleRenderer, VobSubFrame, VobSubParser, DvbParserFinalization, PgsParserFinalization, RenderResultFinalization, SubtitleCompositionFinalization, SubtitleFrameFinalization, SubtitleRendererFinalization, VobSubFrameFinalization, VobSubParserFinalization, cachedDataViewMemory0, cachedUint8ArrayMemory0, cachedTextDecoder, MAX_SAFARI_DECODE_BYTES, numBytesDecoded, cachedTextEncoder, WASM_VECTOR_LEN, wasmModule, wasmInstance, wasm;
var init_libbitsub = __esm({
  "deno:https://jsr.io/@altq/libbitsub/1.12.1/pkg/libbitsub.js"() {
    DvbParser = class {
      __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DvbParserFinalization.unregister(this);
        return ptr;
      }
      free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_dvbparser_free(ptr, 0);
      }
      clearCache() {
        wasm.dvbparser_clearCache(this.__wbg_ptr);
      }
      /**
         * @returns {number}
         */
      get count() {
        const ret = wasm.dvbparser_count(this.__wbg_ptr);
        return ret >>> 0;
      }
      /**
         * @param {Uint8Array} data
         * @returns {number}
         */
      feed(data) {
        const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.dvbparser_feed(this.__wbg_ptr, ptr0, len0);
        return ret >>> 0;
      }
      /**
         * @param {number} time_ms
         * @returns {number}
         */
      findIndexAtTimestamp(time_ms) {
        const ret = wasm.dvbparser_findIndexAtTimestamp(this.__wbg_ptr, time_ms);
        return ret;
      }
      /**
         * @returns {number}
         */
      finishFeed() {
        const ret = wasm.dvbparser_finishFeed(this.__wbg_ptr);
        return ret >>> 0;
      }
      /**
         * @param {number} index
         * @returns {number}
         */
      getCueCompositionCount(index) {
        const ret = wasm.dvbparser_getCueCompositionCount(this.__wbg_ptr, index);
        return ret >>> 0;
      }
      /**
         * @param {number} index
         * @returns {number}
         */
      getCueEndTime(index) {
        const ret = wasm.dvbparser_getCueEndTime(this.__wbg_ptr, index);
        return ret;
      }
      /**
         * @param {number} index
         * @returns {number}
         */
      getCuePageState(index) {
        const ret = wasm.dvbparser_getCuePageState(this.__wbg_ptr, index);
        return ret;
      }
      /**
         * @param {number} index
         * @returns {number}
         */
      getCueStartTime(index) {
        const ret = wasm.dvbparser_getCueStartTime(this.__wbg_ptr, index);
        return ret;
      }
      /**
         * @returns {Float64Array}
         */
      getEndTimestamps() {
        const ret = wasm.dvbparser_getEndTimestamps(this.__wbg_ptr);
        return ret;
      }
      /**
         * @returns {Float64Array}
         */
      getTimestamps() {
        const ret = wasm.dvbparser_getTimestamps(this.__wbg_ptr);
        return ret;
      }
      /**
         * @returns {string}
         */
      get lastRenderIssue() {
        let deferred1_0;
        let deferred1_1;
        try {
          const ret = wasm.dvbparser_lastRenderIssue(this.__wbg_ptr);
          deferred1_0 = ret[0];
          deferred1_1 = ret[1];
          return getStringFromWasm0(ret[0], ret[1]);
        } finally {
          wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
      }
      constructor() {
        const ret = wasm.dvbparser_new();
        this.__wbg_ptr = ret;
        DvbParserFinalization.register(this, this.__wbg_ptr, this);
        return this;
      }
      /**
         * @param {Uint8Array} data
         * @returns {number}
         */
      parse(data) {
        const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.dvbparser_parse(this.__wbg_ptr, ptr0, len0);
        return ret >>> 0;
      }
      /**
         * @returns {number}
         */
      get pendingLen() {
        const ret = wasm.dvbparser_pendingLen(this.__wbg_ptr);
        return ret >>> 0;
      }
      /**
         * @param {number} index
         * @returns {SubtitleFrame | undefined}
         */
      renderAtIndex(index) {
        const ret = wasm.dvbparser_renderAtIndex(this.__wbg_ptr, index);
        return ret === 0 ? void 0 : SubtitleFrame.__wrap(ret);
      }
      reset() {
        wasm.dvbparser_reset(this.__wbg_ptr);
      }
      /**
         * @returns {number}
         */
      get screenHeight() {
        const ret = wasm.dvbparser_screenHeight(this.__wbg_ptr);
        return ret;
      }
      /**
         * @returns {number}
         */
      get screenWidth() {
        const ret = wasm.dvbparser_screenWidth(this.__wbg_ptr);
        return ret;
      }
    };
    if (Symbol.dispose) DvbParser.prototype[Symbol.dispose] = DvbParser.prototype.free;
    PgsParser = class {
      __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PgsParserFinalization.unregister(this);
        return ptr;
      }
      free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pgsparser_free(ptr, 0);
      }
      clearCache() {
        wasm.pgsparser_clearCache(this.__wbg_ptr);
      }
      /**
         * @returns {number}
         */
      get count() {
        const ret = wasm.pgsparser_count(this.__wbg_ptr);
        return ret >>> 0;
      }
      /**
         * @param {Uint8Array} data
         * @returns {number}
         */
      feed(data) {
        const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.pgsparser_feed(this.__wbg_ptr, ptr0, len0);
        return ret >>> 0;
      }
      /**
         * @param {number} time_ms
         * @returns {number}
         */
      findIndexAtTimestamp(time_ms) {
        const ret = wasm.pgsparser_findIndexAtTimestamp(this.__wbg_ptr, time_ms);
        return ret;
      }
      /**
         * @returns {number}
         */
      finishFeed() {
        const ret = wasm.pgsparser_finishFeed(this.__wbg_ptr);
        return ret >>> 0;
      }
      /**
         * @param {number} index
         * @returns {number}
         */
      getCueCompositionCount(index) {
        const ret = wasm.pgsparser_getCueCompositionCount(this.__wbg_ptr, index);
        return ret >>> 0;
      }
      /**
         * @param {number} index
         * @returns {number}
         */
      getCueCompositionState(index) {
        const ret = wasm.pgsparser_getCueCompositionState(this.__wbg_ptr, index);
        return ret;
      }
      /**
         * @param {number} index
         * @returns {number}
         */
      getCueEndTime(index) {
        const ret = wasm.pgsparser_getCueEndTime(this.__wbg_ptr, index);
        return ret;
      }
      /**
         * @param {number} index
         * @returns {number}
         */
      getCuePaletteId(index) {
        const ret = wasm.pgsparser_getCuePaletteId(this.__wbg_ptr, index);
        return ret;
      }
      /**
         * @param {number} index
         * @returns {number}
         */
      getCueStartTime(index) {
        const ret = wasm.pgsparser_getCueStartTime(this.__wbg_ptr, index);
        return ret;
      }
      /**
         * @returns {Float64Array}
         */
      getTimestamps() {
        const ret = wasm.pgsparser_getTimestamps(this.__wbg_ptr);
        return ret;
      }
      /**
         * @returns {string}
         */
      get lastRenderIssue() {
        let deferred1_0;
        let deferred1_1;
        try {
          const ret = wasm.pgsparser_lastRenderIssue(this.__wbg_ptr);
          deferred1_0 = ret[0];
          deferred1_1 = ret[1];
          return getStringFromWasm0(ret[0], ret[1]);
        } finally {
          wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
      }
      constructor() {
        const ret = wasm.pgsparser_new();
        this.__wbg_ptr = ret;
        PgsParserFinalization.register(this, this.__wbg_ptr, this);
        return this;
      }
      /**
         * @param {Uint8Array} data
         * @returns {number}
         */
      parse(data) {
        const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.pgsparser_parse(this.__wbg_ptr, ptr0, len0);
        return ret >>> 0;
      }
      /**
         * @returns {number}
         */
      get pendingLen() {
        const ret = wasm.pgsparser_pendingLen(this.__wbg_ptr);
        return ret >>> 0;
      }
      /**
         * @param {number} index
         * @returns {SubtitleFrame | undefined}
         */
      renderAtIndex(index) {
        const ret = wasm.pgsparser_renderAtIndex(this.__wbg_ptr, index);
        return ret === 0 ? void 0 : SubtitleFrame.__wrap(ret);
      }
      reset() {
        wasm.pgsparser_reset(this.__wbg_ptr);
      }
      /**
         * @returns {number}
         */
      get screenHeight() {
        const ret = wasm.pgsparser_screenHeight(this.__wbg_ptr);
        return ret;
      }
      /**
         * @returns {number}
         */
      get screenWidth() {
        const ret = wasm.pgsparser_screenWidth(this.__wbg_ptr);
        return ret;
      }
    };
    if (Symbol.dispose) PgsParser.prototype[Symbol.dispose] = PgsParser.prototype.free;
    RenderResult = class _RenderResult {
      static __wrap(ptr) {
        const obj = Object.create(_RenderResult.prototype);
        obj.__wbg_ptr = ptr;
        RenderResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
      }
      __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RenderResultFinalization.unregister(this);
        return ptr;
      }
      free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_renderresult_free(ptr, 0);
      }
      /**
         * @returns {number}
         */
      get compositionCount() {
        const ret = wasm.renderresult_compositionCount(this.__wbg_ptr);
        return ret >>> 0;
      }
      /**
         * @param {number} index
         * @returns {number}
         */
      getCompositionHeight(index) {
        const ret = wasm.renderresult_getCompositionHeight(this.__wbg_ptr, index);
        return ret;
      }
      /**
         * @param {number} index
         * @returns {Uint8Array}
         */
      getCompositionRgba(index) {
        const ret = wasm.renderresult_getCompositionRgba(this.__wbg_ptr, index);
        return ret;
      }
      /**
         * @param {number} index
         * @returns {number}
         */
      getCompositionWidth(index) {
        const ret = wasm.renderresult_getCompositionWidth(this.__wbg_ptr, index);
        return ret;
      }
      /**
         * @param {number} index
         * @returns {number}
         */
      getCompositionX(index) {
        const ret = wasm.renderresult_getCompositionX(this.__wbg_ptr, index);
        return ret;
      }
      /**
         * @param {number} index
         * @returns {number}
         */
      getCompositionY(index) {
        const ret = wasm.renderresult_getCompositionY(this.__wbg_ptr, index);
        return ret;
      }
      /**
         * @returns {number}
         */
      get screenHeight() {
        const ret = wasm.renderresult_screenHeight(this.__wbg_ptr);
        return ret;
      }
      /**
         * @returns {number}
         */
      get screenWidth() {
        const ret = wasm.renderresult_screenWidth(this.__wbg_ptr);
        return ret;
      }
    };
    if (Symbol.dispose) RenderResult.prototype[Symbol.dispose] = RenderResult.prototype.free;
    SubtitleComposition = class _SubtitleComposition {
      static __wrap(ptr) {
        const obj = Object.create(_SubtitleComposition.prototype);
        obj.__wbg_ptr = ptr;
        SubtitleCompositionFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
      }
      __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SubtitleCompositionFinalization.unregister(this);
        return ptr;
      }
      free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_subtitlecomposition_free(ptr, 0);
      }
      /**
         * @returns {Uint8Array}
         */
      getRgba() {
        const ret = wasm.subtitlecomposition_getRgba(this.__wbg_ptr);
        return ret;
      }
      /**
         * @returns {number}
         */
      get height() {
        const ret = wasm.subtitlecomposition_height(this.__wbg_ptr);
        return ret;
      }
      /**
         * @returns {number}
         */
      get width() {
        const ret = wasm.subtitlecomposition_width(this.__wbg_ptr);
        return ret;
      }
      /**
         * @returns {number}
         */
      get x() {
        const ret = wasm.subtitlecomposition_x(this.__wbg_ptr);
        return ret;
      }
      /**
         * @returns {number}
         */
      get y() {
        const ret = wasm.subtitlecomposition_y(this.__wbg_ptr);
        return ret;
      }
    };
    if (Symbol.dispose) SubtitleComposition.prototype[Symbol.dispose] = SubtitleComposition.prototype.free;
    SubtitleFormat = Object.freeze({
      Pgs: 0,
      "0": "Pgs",
      VobSub: 1,
      "1": "VobSub",
      Dvb: 2,
      "2": "Dvb"
    });
    SubtitleFrame = class _SubtitleFrame {
      static __wrap(ptr) {
        const obj = Object.create(_SubtitleFrame.prototype);
        obj.__wbg_ptr = ptr;
        SubtitleFrameFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
      }
      __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SubtitleFrameFinalization.unregister(this);
        return ptr;
      }
      free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_subtitleframe_free(ptr, 0);
      }
      /**
         * @returns {number}
         */
      get compositionCount() {
        const ret = wasm.subtitleframe_compositionCount(this.__wbg_ptr);
        return ret >>> 0;
      }
      /**
         * @param {number} index
         * @returns {SubtitleComposition | undefined}
         */
      getComposition(index) {
        const ret = wasm.subtitleframe_getComposition(this.__wbg_ptr, index);
        return ret === 0 ? void 0 : SubtitleComposition.__wrap(ret);
      }
      /**
         * @returns {number}
         */
      get height() {
        const ret = wasm.subtitleframe_height(this.__wbg_ptr);
        return ret;
      }
      /**
         * @returns {number}
         */
      get width() {
        const ret = wasm.subtitleframe_width(this.__wbg_ptr);
        return ret;
      }
    };
    if (Symbol.dispose) SubtitleFrame.prototype[Symbol.dispose] = SubtitleFrame.prototype.free;
    SubtitleRenderer = class {
      __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SubtitleRendererFinalization.unregister(this);
        return ptr;
      }
      free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_subtitlerenderer_free(ptr, 0);
      }
      clearCache() {
        wasm.subtitlerenderer_clearCache(this.__wbg_ptr);
      }
      /**
         * @returns {number}
         */
      get count() {
        const ret = wasm.subtitlerenderer_count(this.__wbg_ptr);
        return ret >>> 0;
      }
      dispose() {
        wasm.subtitlerenderer_dispose(this.__wbg_ptr);
      }
      /**
         * @param {number} time_ms
         * @returns {number}
         */
      findIndexAtTimestamp(time_ms) {
        const ret = wasm.subtitlerenderer_findIndexAtTimestamp(this.__wbg_ptr, time_ms);
        return ret;
      }
      /**
         * @returns {SubtitleFormat | undefined}
         */
      get format() {
        const ret = wasm.subtitlerenderer_format(this.__wbg_ptr);
        return ret === 3 ? void 0 : ret;
      }
      /**
         * @param {number} index
         * @returns {number}
         */
      getCueDuration(index) {
        const ret = wasm.subtitlerenderer_getCueDuration(this.__wbg_ptr, index);
        return ret;
      }
      /**
         * @param {number} index
         * @returns {number}
         */
      getCueEndTime(index) {
        const ret = wasm.subtitlerenderer_getCueEndTime(this.__wbg_ptr, index);
        return ret;
      }
      /**
         * @param {number} index
         * @returns {number}
         */
      getCueStartTime(index) {
        const ret = wasm.subtitlerenderer_getCueStartTime(this.__wbg_ptr, index);
        return ret;
      }
      /**
         * @returns {Float64Array}
         */
      getTimestamps() {
        const ret = wasm.subtitlerenderer_getTimestamps(this.__wbg_ptr);
        return ret;
      }
      /**
         * @returns {boolean}
         */
      get hasIdxMetadata() {
        const ret = wasm.subtitlerenderer_hasIdxMetadata(this.__wbg_ptr);
        return ret !== 0;
      }
      /**
         * @returns {string}
         */
      get language() {
        let deferred1_0;
        let deferred1_1;
        try {
          const ret = wasm.subtitlerenderer_language(this.__wbg_ptr);
          deferred1_0 = ret[0];
          deferred1_1 = ret[1];
          return getStringFromWasm0(ret[0], ret[1]);
        } finally {
          wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
      }
      /**
         * @returns {string}
         */
      get lastRenderIssue() {
        let deferred1_0;
        let deferred1_1;
        try {
          const ret = wasm.subtitlerenderer_lastRenderIssue(this.__wbg_ptr);
          deferred1_0 = ret[0];
          deferred1_1 = ret[1];
          return getStringFromWasm0(ret[0], ret[1]);
        } finally {
          wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
      }
      /**
         * @param {Uint8Array} data
         * @returns {number}
         */
      loadDvb(data) {
        const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.subtitlerenderer_loadDvb(this.__wbg_ptr, ptr0, len0);
        return ret >>> 0;
      }
      /**
         * @param {Uint8Array} data
         * @returns {number}
         */
      loadPgs(data) {
        const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.subtitlerenderer_loadPgs(this.__wbg_ptr, ptr0, len0);
        return ret >>> 0;
      }
      /**
         * @param {string} idx_content
         * @param {Uint8Array} sub_data
         */
      loadVobSub(idx_content, sub_data) {
        const ptr0 = passStringToWasm0(idx_content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(sub_data, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        wasm.subtitlerenderer_loadVobSub(this.__wbg_ptr, ptr0, len0, ptr1, len1);
      }
      /**
         * @param {Uint8Array} mks_data
         */
      loadVobSubMks(mks_data) {
        const ptr0 = passArray8ToWasm0(mks_data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.subtitlerenderer_loadVobSubMks(this.__wbg_ptr, ptr0, len0);
        if (ret[1]) {
          throw takeFromExternrefTable0(ret[0]);
        }
      }
      /**
         * @param {Uint8Array} sub_data
         */
      loadVobSubOnly(sub_data) {
        const ptr0 = passArray8ToWasm0(sub_data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.subtitlerenderer_loadVobSubOnly(this.__wbg_ptr, ptr0, len0);
      }
      constructor() {
        const ret = wasm.subtitlerenderer_new();
        this.__wbg_ptr = ret;
        SubtitleRendererFinalization.register(this, this.__wbg_ptr, this);
        return this;
      }
      /**
         * @param {number} index
         * @returns {RenderResult | undefined}
         */
      renderAtIndex(index) {
        const ret = wasm.subtitlerenderer_renderAtIndex(this.__wbg_ptr, index);
        return ret === 0 ? void 0 : RenderResult.__wrap(ret);
      }
      /**
         * @param {number} time_seconds
         * @returns {RenderResult | undefined}
         */
      renderAtTimestamp(time_seconds) {
        const ret = wasm.subtitlerenderer_renderAtTimestamp(this.__wbg_ptr, time_seconds);
        return ret === 0 ? void 0 : RenderResult.__wrap(ret);
      }
      /**
         * @returns {number}
         */
      get screenHeight() {
        const ret = wasm.subtitlerenderer_screenHeight(this.__wbg_ptr);
        return ret;
      }
      /**
         * @returns {number}
         */
      get screenWidth() {
        const ret = wasm.subtitlerenderer_screenWidth(this.__wbg_ptr);
        return ret;
      }
      /**
         * @returns {string}
         */
      get trackId() {
        let deferred1_0;
        let deferred1_1;
        try {
          const ret = wasm.subtitlerenderer_trackId(this.__wbg_ptr);
          deferred1_0 = ret[0];
          deferred1_1 = ret[1];
          return getStringFromWasm0(ret[0], ret[1]);
        } finally {
          wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
      }
    };
    if (Symbol.dispose) SubtitleRenderer.prototype[Symbol.dispose] = SubtitleRenderer.prototype.free;
    VobSubFrame = class _VobSubFrame {
      static __wrap(ptr) {
        const obj = Object.create(_VobSubFrame.prototype);
        obj.__wbg_ptr = ptr;
        VobSubFrameFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
      }
      __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        VobSubFrameFinalization.unregister(this);
        return ptr;
      }
      free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vobsubframe_free(ptr, 0);
      }
      /**
         * @returns {Uint8Array}
         */
      getRgba() {
        const ret = wasm.vobsubframe_getRgba(this.__wbg_ptr);
        return ret;
      }
      /**
         * @returns {number}
         */
      get height() {
        const ret = wasm.vobsubframe_height(this.__wbg_ptr);
        return ret;
      }
      /**
         * @returns {number}
         */
      get screenHeight() {
        const ret = wasm.vobsubframe_screenHeight(this.__wbg_ptr);
        return ret;
      }
      /**
         * @returns {number}
         */
      get screenWidth() {
        const ret = wasm.vobsubframe_screenWidth(this.__wbg_ptr);
        return ret;
      }
      /**
         * @returns {number}
         */
      get width() {
        const ret = wasm.vobsubframe_width(this.__wbg_ptr);
        return ret;
      }
      /**
         * @returns {number}
         */
      get x() {
        const ret = wasm.vobsubframe_x(this.__wbg_ptr);
        return ret;
      }
      /**
         * @returns {number}
         */
      get y() {
        const ret = wasm.vobsubframe_y(this.__wbg_ptr);
        return ret;
      }
    };
    if (Symbol.dispose) VobSubFrame.prototype[Symbol.dispose] = VobSubFrame.prototype.free;
    VobSubParser = class {
      __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        VobSubParserFinalization.unregister(this);
        return ptr;
      }
      free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vobsubparser_free(ptr, 0);
      }
      /**
         * @param {Uint8Array} sub_data
         */
      attachSubData(sub_data) {
        const ptr0 = passArray8ToWasm0(sub_data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.vobsubparser_attachSubData(this.__wbg_ptr, ptr0, len0);
      }
      clearCache() {
        wasm.vobsubparser_clearCache(this.__wbg_ptr);
      }
      /**
         * @returns {number}
         */
      get count() {
        const ret = wasm.vobsubparser_count(this.__wbg_ptr);
        return ret >>> 0;
      }
      /**
         * @returns {boolean}
         */
      get debandEnabled() {
        const ret = wasm.vobsubparser_debandEnabled(this.__wbg_ptr);
        return ret !== 0;
      }
      dispose() {
        wasm.vobsubparser_dispose(this.__wbg_ptr);
      }
      /**
         * @param {number} time_ms
         * @returns {number}
         */
      findIndexAtTimestamp(time_ms) {
        const ret = wasm.vobsubparser_findIndexAtTimestamp(this.__wbg_ptr, time_ms);
        return ret;
      }
      /**
         * @param {number} index
         * @returns {number}
         */
      getCueDuration(index) {
        const ret = wasm.vobsubparser_getCueDuration(this.__wbg_ptr, index);
        return ret;
      }
      /**
         * @param {number} index
         * @returns {number}
         */
      getCueEndTime(index) {
        const ret = wasm.vobsubparser_getCueEndTime(this.__wbg_ptr, index);
        return ret;
      }
      /**
         * @param {number} index
         * @returns {number}
         */
      getCueFilePosition(index) {
        const ret = wasm.vobsubparser_getCueFilePosition(this.__wbg_ptr, index);
        return ret;
      }
      /**
         * @param {number} index
         * @returns {number}
         */
      getCueStartTime(index) {
        const ret = wasm.vobsubparser_getCueStartTime(this.__wbg_ptr, index);
        return ret;
      }
      /**
         * @returns {Float64Array}
         */
      getTimestamps() {
        const ret = wasm.vobsubparser_getTimestamps(this.__wbg_ptr);
        return ret;
      }
      /**
         * @returns {boolean}
         */
      get hasIdxMetadata() {
        const ret = wasm.vobsubparser_hasIdxMetadata(this.__wbg_ptr);
        return ret !== 0;
      }
      /**
         * @returns {boolean}
         */
      get hasSubData() {
        const ret = wasm.vobsubparser_hasSubData(this.__wbg_ptr);
        return ret !== 0;
      }
      /**
         * @returns {string}
         */
      get language() {
        let deferred1_0;
        let deferred1_1;
        try {
          const ret = wasm.vobsubparser_language(this.__wbg_ptr);
          deferred1_0 = ret[0];
          deferred1_1 = ret[1];
          return getStringFromWasm0(ret[0], ret[1]);
        } finally {
          wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
      }
      /**
         * @returns {string}
         */
      get lastRenderIssue() {
        let deferred1_0;
        let deferred1_1;
        try {
          const ret = wasm.vobsubparser_lastRenderIssue(this.__wbg_ptr);
          deferred1_0 = ret[0];
          deferred1_1 = ret[1];
          return getStringFromWasm0(ret[0], ret[1]);
        } finally {
          wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
      }
      /**
         * @param {string} idx_content
         * @param {Uint8Array} sub_data
         */
      loadFromData(idx_content, sub_data) {
        const ptr0 = passStringToWasm0(idx_content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(sub_data, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        wasm.vobsubparser_loadFromData(this.__wbg_ptr, ptr0, len0, ptr1, len1);
      }
      /**
         * @param {string} idx_content
         */
      loadFromIdx(idx_content) {
        const ptr0 = passStringToWasm0(idx_content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.vobsubparser_loadFromIdx(this.__wbg_ptr, ptr0, len0);
      }
      /**
         * @param {Uint8Array} mks_data
         */
      loadFromMks(mks_data) {
        const ptr0 = passArray8ToWasm0(mks_data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.vobsubparser_loadFromMks(this.__wbg_ptr, ptr0, len0);
        if (ret[1]) {
          throw takeFromExternrefTable0(ret[0]);
        }
      }
      /**
         * @param {Uint8Array} sub_data
         */
      loadFromSubOnly(sub_data) {
        const ptr0 = passArray8ToWasm0(sub_data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.vobsubparser_loadFromSubOnly(this.__wbg_ptr, ptr0, len0);
      }
      constructor() {
        const ret = wasm.vobsubparser_new();
        this.__wbg_ptr = ret;
        VobSubParserFinalization.register(this, this.__wbg_ptr, this);
        return this;
      }
      /**
         * @param {number} index
         * @returns {VobSubFrame | undefined}
         */
      renderAtIndex(index) {
        const ret = wasm.vobsubparser_renderAtIndex(this.__wbg_ptr, index);
        return ret === 0 ? void 0 : VobSubFrame.__wrap(ret);
      }
      /**
         * @returns {number}
         */
      get screenHeight() {
        const ret = wasm.vobsubparser_screenHeight(this.__wbg_ptr);
        return ret;
      }
      /**
         * @returns {number}
         */
      get screenWidth() {
        const ret = wasm.vobsubparser_screenWidth(this.__wbg_ptr);
        return ret;
      }
      /**
         * @param {boolean} enabled
         */
      setDebandEnabled(enabled) {
        wasm.vobsubparser_setDebandEnabled(this.__wbg_ptr, enabled);
      }
      /**
         * @param {number} range
         */
      setDebandRange(range) {
        wasm.vobsubparser_setDebandRange(this.__wbg_ptr, range);
      }
      /**
         * @param {number} threshold
         */
      setDebandThreshold(threshold) {
        wasm.vobsubparser_setDebandThreshold(this.__wbg_ptr, threshold);
      }
      /**
         * @returns {string}
         */
      get trackId() {
        let deferred1_0;
        let deferred1_1;
        try {
          const ret = wasm.vobsubparser_trackId(this.__wbg_ptr);
          deferred1_0 = ret[0];
          deferred1_1 = ret[1];
          return getStringFromWasm0(ret[0], ret[1]);
        } finally {
          wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
      }
    };
    if (Symbol.dispose) VobSubParser.prototype[Symbol.dispose] = VobSubParser.prototype.free;
    DvbParserFinalization = typeof FinalizationRegistry === "undefined" ? {
      register: () => {
      },
      unregister: () => {
      }
    } : new FinalizationRegistry((ptr) => wasm.__wbg_dvbparser_free(ptr, 1));
    PgsParserFinalization = typeof FinalizationRegistry === "undefined" ? {
      register: () => {
      },
      unregister: () => {
      }
    } : new FinalizationRegistry((ptr) => wasm.__wbg_pgsparser_free(ptr, 1));
    RenderResultFinalization = typeof FinalizationRegistry === "undefined" ? {
      register: () => {
      },
      unregister: () => {
      }
    } : new FinalizationRegistry((ptr) => wasm.__wbg_renderresult_free(ptr, 1));
    SubtitleCompositionFinalization = typeof FinalizationRegistry === "undefined" ? {
      register: () => {
      },
      unregister: () => {
      }
    } : new FinalizationRegistry((ptr) => wasm.__wbg_subtitlecomposition_free(ptr, 1));
    SubtitleFrameFinalization = typeof FinalizationRegistry === "undefined" ? {
      register: () => {
      },
      unregister: () => {
      }
    } : new FinalizationRegistry((ptr) => wasm.__wbg_subtitleframe_free(ptr, 1));
    SubtitleRendererFinalization = typeof FinalizationRegistry === "undefined" ? {
      register: () => {
      },
      unregister: () => {
      }
    } : new FinalizationRegistry((ptr) => wasm.__wbg_subtitlerenderer_free(ptr, 1));
    VobSubFrameFinalization = typeof FinalizationRegistry === "undefined" ? {
      register: () => {
      },
      unregister: () => {
      }
    } : new FinalizationRegistry((ptr) => wasm.__wbg_vobsubframe_free(ptr, 1));
    VobSubParserFinalization = typeof FinalizationRegistry === "undefined" ? {
      register: () => {
      },
      unregister: () => {
      }
    } : new FinalizationRegistry((ptr) => wasm.__wbg_vobsubparser_free(ptr, 1));
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    cachedTextDecoder = new TextDecoder("utf-8", {
      ignoreBOM: true,
      fatal: true
    });
    cachedTextDecoder.decode();
    MAX_SAFARI_DECODE_BYTES = 2146435072;
    numBytesDecoded = 0;
    cachedTextEncoder = new TextEncoder();
    if (!("encodeInto" in cachedTextEncoder)) {
      cachedTextEncoder.encodeInto = function(arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
          read: arg.length,
          written: buf.length
        };
      };
    }
    WASM_VECTOR_LEN = 0;
  }
});

// deno:https://jsr.io/@altq/libbitsub/1.12.1/src/ts/diagnostics.ts
var SubtitleDiagnosticError = class extends Error {
  code;
  format;
  details;
  cause;
  constructor(code, message, options = {}) {
    super(message);
    this.name = "SubtitleDiagnosticError";
    this.code = code;
    this.format = options.format;
    this.details = options.details;
    this.cause = options.cause;
  }
};
function createSubtitleDiagnosticError(code, message, options = {}) {
  return new SubtitleDiagnosticError(code, message, options);
}
function normalizeSubtitleError(error, context = {}) {
  if (error instanceof SubtitleDiagnosticError) {
    return error;
  }
  const resolvedError = error instanceof Error ? error : new Error(String(error));
  const code = inferSubtitleDiagnosticErrorCode(resolvedError.message, context.fallbackCode);
  return new SubtitleDiagnosticError(code, resolvedError.message, {
    format: context.format,
    details: context.details,
    cause: error
  });
}
function createSubtitleWarning(code, message, options = {}) {
  return {
    code,
    message,
    format: options.format,
    cueIndex: options.cueIndex,
    details: options.details
  };
}
function warningFromRenderIssue(renderIssue, options = {}) {
  const normalizedIssue = renderIssue?.trim().toUpperCase();
  if (!normalizedIssue) return null;
  switch (normalizedIssue) {
    case "MISSING_PALETTE":
      return createSubtitleWarning("MISSING_PALETTE", "PGS cue references a palette that was not available at render time.", {
        format: options.format,
        cueIndex: options.cueIndex
      });
    case "INVALID_PACKET":
      return createSubtitleWarning("INVALID_SUBTITLE_DATA", "Subtitle packet could not be decoded for the requested cue.", {
        format: options.format,
        cueIndex: options.cueIndex
      });
    case "RENDER_CONTEXT_UNAVAILABLE":
      return createSubtitleWarning("INVALID_SUBTITLE_DATA", "Subtitle render context could not be assembled for the requested cue.", {
        format: options.format,
        cueIndex: options.cueIndex
      });
    case "EMPTY_RENDER":
      return createSubtitleWarning("INVALID_SUBTITLE_DATA", "Subtitle cue rendered without any visible bitmap data.", {
        format: options.format,
        cueIndex: options.cueIndex
      });
    default:
      return null;
  }
}
function formatSubtitleWarningForConsole(warning) {
  return `[libbitsub:${warning.code}] ${warning.message}`;
}
function inferSubtitleDiagnosticErrorCode(message, fallbackCode = "UNKNOWN") {
  const normalizedMessage = message.toLowerCase();
  if (normalizedMessage.includes("detect subtitle format") || normalizedMessage.includes("unsupported format")) {
    return "UNSUPPORTED_FORMAT";
  }
  if (normalizedMessage.includes("no s_vobsub track") || normalizedMessage.includes("track not found")) {
    return "TRACK_NOT_FOUND";
  }
  if (normalizedMessage.includes("idx") || normalizedMessage.includes("codecprivate") || normalizedMessage.includes("filepos")) {
    return "BAD_IDX";
  }
  if (normalizedMessage.includes("palette")) {
    return "MISSING_PALETTE";
  }
  if (normalizedMessage.includes("failed to fetch")) {
    return "FETCH_FAILED";
  }
  if (normalizedMessage.includes("no ") && normalizedMessage.includes("provided")) {
    return "MISSING_INPUT";
  }
  if (normalizedMessage.includes("invalid") || normalizedMessage.includes("truncated") || normalizedMessage.includes("malformed") || normalizedMessage.includes("subtitle block") || normalizedMessage.includes("payload")) {
    return "INVALID_SUBTITLE_DATA";
  }
  return fallbackCode;
}

// deno:https://jsr.io/@altq/libbitsub/1.12.1/src/ts/wasm.ts
var wasmModule2 = null;
var wasmInitPromise = null;
async function initWasm() {
  if (wasmModule2) return;
  if (wasmInitPromise) return wasmInitPromise;
  wasmInitPromise = (async () => {
    const mod = await Promise.resolve().then(() => (init_libbitsub(), libbitsub_exports));
    await mod.default();
    wasmModule2 = mod;
  })();
  return wasmInitPromise;
}
function getWasm() {
  if (!wasmModule2) {
    throw new Error("WASM module not initialized. Call initWasm() first.");
  }
  return wasmModule2;
}
function getWasmUrl() {
  try {
		//return new URL("../../pkg/libbitsub_bg.wasm", import.meta.url).href;
    return new URL("./libbitsub_bg.wasm", import.meta.url).href;
  } catch {
    if (typeof window !== "undefined") {
      return new URL("/vendor/libbitsub/libbitsub_bg.wasm", window.location.origin).href;
    }
    return "/vendor/libbitsub/libbitsub_bg.wasm";
  }
}
function getWasmGlueUrl() {
  try {
    return new URL("./libbitsub.js", import.meta.url).href;
  } catch {
    if (typeof window !== "undefined") {
      return new URL("/vendor/libbitsub/libbitsub.js", window.location.origin).href;
    }
    return "/vendor/libbitsub/libbitsub.js";
  }
}
if (typeof window !== "undefined") {
  setTimeout(() => {
    initWasm().catch((err) => console.warn("[libbitsub] WASM pre-init failed:", err));
  }, 100);
}

// deno:https://jsr.io/@altq/libbitsub/1.12.1/src/ts/worker.ts
var sharedWorker = null;
var workerInitPromise = null;
var messageId = 0;
var pendingCallbacks = /* @__PURE__ */ new Map();
function isWorkerAvailable() {
  return typeof Worker !== "undefined" && typeof window !== "undefined" && typeof Blob !== "undefined";
}
function createWorkerScript() {
  return `
let wasmModule = null;
const pgsParsers = new Map();
const dvbParsers = new Map();
const vobSubParsers = new Map();
const offscreenSurfaces = new Map();

function buildPgsMetadata(parser) {
    return {
        format: 'pgs',
        cueCount: parser.count,
        screenWidth: parser.screenWidth || 0,
        screenHeight: parser.screenHeight || 0
    };
}

function buildDvbMetadata(parser) {
    return {
        format: 'dvb',
        cueCount: parser.count,
        screenWidth: parser.screenWidth || 0,
        screenHeight: parser.screenHeight || 0
    };
}

function buildVobSubMetadata(parser) {
    return {
        format: 'vobsub',
        cueCount: parser.count,
        screenWidth: parser.screenWidth || 0,
        screenHeight: parser.screenHeight || 0,
        language: parser.language || '',
        trackId: parser.trackId || '',
        hasIdxMetadata: !!parser.hasIdxMetadata
    };
}

function detachOffscreenSurface(sessionId) {
    offscreenSurfaces.delete(sessionId);
}

function disposeSession(sessionId) {
    const pgsParser = pgsParsers.get(sessionId);
    if (pgsParser) {
        pgsParser.free();
        pgsParsers.delete(sessionId);
    }
    const dvbParser = dvbParsers.get(sessionId);
    if (dvbParser) {
        dvbParser.free();
        dvbParsers.delete(sessionId);
    }
    const vobSubParser = vobSubParsers.get(sessionId);
    if (vobSubParser) {
        vobSubParser.free();
        vobSubParsers.delete(sessionId);
    }
    detachOffscreenSurface(sessionId);
}

function getCompositionBounds(compositions) {
    if (!compositions || compositions.length === 0) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const comp of compositions) {
        minX = Math.min(minX, comp.x);
        minY = Math.min(minY, comp.y);
        maxX = Math.max(maxX, comp.x + comp.width);
        maxY = Math.max(maxY, comp.y + comp.height);
    }
    if (!Number.isFinite(minX) || !Number.isFinite(minY)) return null;
    return { x: minX, y: minY, width: Math.max(0, maxX - minX), height: Math.max(0, maxY - minY) };
}

function computeOffscreenLayout(frame, canvasWidth, canvasHeight, settings) {
    const safeDataWidth = frame.width > 0 ? frame.width : canvasWidth;
    const safeDataHeight = frame.height > 0 ? frame.height : canvasHeight;
    const stretchScaleX = canvasWidth / safeDataWidth;
    const stretchScaleY = canvasHeight / safeDataHeight;
    const bounds = getCompositionBounds(frame.compositions) || {
        x: 0, y: 0, width: safeDataWidth, height: safeDataHeight
    };

    const scale = settings.scale;
    const aspectMode = settings.aspectMode;
    const verticalOffset = settings.verticalOffset;
    const horizontalOffset = settings.horizontalOffset;
    const horizontalAlign = settings.horizontalAlign;
    const bottomPadding = settings.bottomPadding;
    const safeArea = settings.safeArea;
    const opacity = settings.opacity;

    let baseScaleX = stretchScaleX;
    let baseScaleY = stretchScaleY;
    let frameShiftX = 0;
    let frameShiftY = 0;

    if (aspectMode !== 'stretch') {
        const uniformScale = aspectMode === 'cover'
            ? Math.max(stretchScaleX, stretchScaleY)
            : Math.min(stretchScaleX, stretchScaleY);
        baseScaleX = uniformScale;
        baseScaleY = uniformScale;
        frameShiftX = (canvasWidth - safeDataWidth * uniformScale) / 2;
        frameShiftY = (canvasHeight - safeDataHeight * uniformScale) / 2;
    }

    const anchorX = horizontalAlign === 'left'
        ? bounds.x
        : horizontalAlign === 'right'
            ? bounds.x + bounds.width
            : bounds.x + bounds.width / 2;
    const anchorY = bounds.y + bounds.height;

    const scaleX = baseScaleX * scale;
    const scaleY = baseScaleY * scale;
    const anchorShiftX = frameShiftX + anchorX * baseScaleX * (1 - scale);
    const anchorShiftY = frameShiftY + anchorY * baseScaleY * (1 - scale);

    let shiftX = anchorShiftX + (horizontalOffset / 100) * canvasWidth;
    let shiftY = anchorShiftY + (verticalOffset / 100) * canvasHeight;
    shiftY -= (bottomPadding / 100) * canvasHeight;

    const safeX = (safeArea / 100) * canvasWidth;
    const safeY = (safeArea / 100) * canvasHeight;
    const finalMinX = bounds.x * scaleX + shiftX;
    const finalMinY = bounds.y * scaleY + shiftY;
    const finalMaxX = (bounds.x + bounds.width) * scaleX + shiftX;
    const finalMaxY = (bounds.y + bounds.height) * scaleY + shiftY;

    if (finalMinX < safeX) shiftX += safeX - finalMinX;
    if (finalMaxX > canvasWidth - safeX) shiftX -= finalMaxX - (canvasWidth - safeX);
    if (finalMinY < safeY) shiftY += safeY - finalMinY;
    if (finalMaxY > canvasHeight - safeY) shiftY -= finalMaxY - (canvasHeight - safeY);

    return { scaleX, scaleY, shiftX, shiftY, opacity };
}

function presentFrameToOffscreen(surface, frame, canvasWidth, canvasHeight, settings) {
    const ctx = surface.ctx;
    const canvas = surface.canvas;
    if (canvas.width !== canvasWidth) canvas.width = canvasWidth;
    if (canvas.height !== canvasHeight) canvas.height = canvasHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!frame || !frame.compositions || frame.compositions.length === 0) {
        return { status: frame ? 'empty' : 'cleared', width: frame?.width || 0, height: frame?.height || 0, compositionCount: 0 };
    }

    const layout = computeOffscreenLayout(frame, canvas.width, canvas.height, settings);
    ctx.save();
    ctx.globalAlpha = layout.opacity;

    for (const comp of frame.compositions) {
        if (!comp.width || !comp.height || !comp.rgba) continue;
        if (surface.buffer.width !== comp.width || surface.buffer.height !== comp.height) {
            surface.buffer.width = comp.width;
            surface.buffer.height = comp.height;
        }
        const pixels = comp.rgba instanceof Uint8ClampedArray
            ? comp.rgba
            : new Uint8ClampedArray(comp.rgba.buffer, comp.rgba.byteOffset, comp.rgba.byteLength);
        surface.bufferCtx.putImageData(new ImageData(pixels, comp.width, comp.height), 0, 0);
        const scaledWidth = comp.width * layout.scaleX;
        const scaledHeight = comp.height * layout.scaleY;
        const adjustedX = comp.x * layout.scaleX + layout.shiftX;
        const adjustedY = comp.y * layout.scaleY + layout.shiftY;
        ctx.drawImage(surface.buffer, adjustedX, adjustedY, scaledWidth, scaledHeight);
    }

    ctx.restore();
    return {
        status: 'rendered',
        width: frame.width,
        height: frame.height,
        compositionCount: frame.compositions.length,
        bounds: getCompositionBounds(frame.compositions)
    };
}

async function initWasm(wasmUrl, glueUrl) {
    if (wasmModule) return;

    let jsGlueUrl = glueUrl;
    if (!jsGlueUrl) {
        const derivedUrl = new URL(wasmUrl);
        derivedUrl.pathname = derivedUrl.pathname.replace(/_bg.wasm$/, '.js');
        jsGlueUrl = derivedUrl.href;
    }
    const mod = await import(jsGlueUrl);
    await mod.default({ module_or_path: wasmUrl });
    wasmModule = mod;
}

function convertFrame(frame, isVobSub) {
    const compositions = [];
    if (isVobSub) {
        const rgba = frame.getRgba();
        if (frame.width > 0 && frame.height > 0 && rgba.length === frame.width * frame.height * 4) {
            compositions.push({ rgba, x: frame.x, y: frame.y, width: frame.width, height: frame.height });
        }
        return { width: frame.screenWidth, height: frame.screenHeight, compositions };
    }

    for (let i = 0; i < frame.compositionCount; i++) {
        const comp = frame.getComposition(i);
        if (!comp) continue;
        const rgba = comp.getRgba();
        if (comp.width > 0 && comp.height > 0 && rgba.length === comp.width * comp.height * 4) {
            compositions.push({ rgba, x: comp.x, y: comp.y, width: comp.width, height: comp.height });
        }
    }

    return { width: frame.width, height: frame.height, compositions };
}

function postResponse(response, transfer, id) {
    if (id !== undefined) response._id = id;
    self.postMessage(response, transfer && transfer.length > 0 ? transfer : undefined);
}

self.onmessage = async function(event) {
    const { _id, ...request } = event.data;

    try {
        switch (request.type) {
            case 'init': {
                await initWasm(request.wasmUrl, request.glueUrl);
                postResponse({ type: 'initComplete', success: true }, [], _id);
                break;
            }
            case 'loadPgs': {
                disposeSession(request.sessionId);
                const parser = new wasmModule.PgsParser();
                const count = parser.parse(new Uint8Array(request.data));
                const timestamps = parser.getTimestamps();
                pgsParsers.set(request.sessionId, parser);
                postResponse(
                    { type: 'pgsLoaded', count, byteLength: request.data.byteLength, metadata: buildPgsMetadata(parser), timestamps },
                    [timestamps.buffer],
                    _id
                );
                break;
            }
            case 'beginPgs': {
                disposeSession(request.sessionId);
                const parser = new wasmModule.PgsParser();
                parser.reset();
                pgsParsers.set(request.sessionId, parser);
                const timestamps = parser.getTimestamps();
                postResponse(
                    { type: 'pgsProgress', count: 0, added: 0, partial: true, metadata: buildPgsMetadata(parser), timestamps },
                    [timestamps.buffer],
                    _id
                );
                break;
            }
            case 'appendPgs': {
                let parser = pgsParsers.get(request.sessionId);
                if (!parser) {
                    parser = new wasmModule.PgsParser();
                    parser.reset();
                    pgsParsers.set(request.sessionId, parser);
                }
                const added = parser.feed(new Uint8Array(request.data));
                const timestamps = parser.getTimestamps();
                postResponse(
                    { type: 'pgsProgress', count: parser.count, added, partial: true, metadata: buildPgsMetadata(parser), timestamps },
                    [timestamps.buffer],
                    _id
                );
                break;
            }
            case 'finishPgs': {
                const parser = pgsParsers.get(request.sessionId);
                if (!parser) {
                    postResponse({ type: 'error', message: 'PGS session not found for finishPgs' }, [], _id);
                    break;
                }
                const count = parser.finishFeed();
                const timestamps = parser.getTimestamps();
                postResponse(
                    { type: 'pgsProgress', count, added: 0, partial: false, metadata: buildPgsMetadata(parser), timestamps },
                    [timestamps.buffer],
                    _id
                );
                break;
            }
            case 'resetPgs': {
                let parser = pgsParsers.get(request.sessionId);
                if (!parser) {
                    parser = new wasmModule.PgsParser();
                    pgsParsers.set(request.sessionId, parser);
                }
                parser.reset();
                const timestamps = parser.getTimestamps();
                postResponse(
                    { type: 'pgsProgress', count: 0, added: 0, partial: true, metadata: buildPgsMetadata(parser), timestamps },
                    [timestamps.buffer],
                    _id
                );
                break;
            }
            case 'loadDvb': {
                disposeSession(request.sessionId);
                const parser = new wasmModule.DvbParser();
                const count = parser.parse(new Uint8Array(request.data));
                const timestamps = parser.getTimestamps();
                const endTimestamps = parser.getEndTimestamps();
                dvbParsers.set(request.sessionId, parser);
                postResponse(
                    { type: 'dvbLoaded', count, byteLength: request.data.byteLength, metadata: buildDvbMetadata(parser), timestamps, endTimestamps },
                    [timestamps.buffer, endTimestamps.buffer],
                    _id
                );
                break;
            }
            case 'beginDvb': {
                disposeSession(request.sessionId);
                const parser = new wasmModule.DvbParser();
                parser.reset();
                dvbParsers.set(request.sessionId, parser);
                const timestamps = parser.getTimestamps();
                const endTimestamps = parser.getEndTimestamps();
                postResponse(
                    { type: 'dvbProgress', count: 0, added: 0, partial: true, metadata: buildDvbMetadata(parser), timestamps, endTimestamps },
                    [timestamps.buffer, endTimestamps.buffer],
                    _id
                );
                break;
            }
            case 'appendDvb': {
                let parser = dvbParsers.get(request.sessionId);
                if (!parser) {
                    parser = new wasmModule.DvbParser();
                    parser.reset();
                    dvbParsers.set(request.sessionId, parser);
                }
                const added = parser.feed(new Uint8Array(request.data));
                const timestamps = parser.getTimestamps();
                const endTimestamps = parser.getEndTimestamps();
                postResponse(
                    { type: 'dvbProgress', count: parser.count, added, partial: true, metadata: buildDvbMetadata(parser), timestamps, endTimestamps },
                    [timestamps.buffer, endTimestamps.buffer],
                    _id
                );
                break;
            }
            case 'finishDvb': {
                const parser = dvbParsers.get(request.sessionId);
                if (!parser) {
                    postResponse({ type: 'error', message: 'DVB session not found for finishDvb' }, [], _id);
                    break;
                }
                const previousCount = parser.count;
                parser.finishFeed();
                const count = parser.count;
                const added = count - previousCount;
                const timestamps = parser.getTimestamps();
                const endTimestamps = parser.getEndTimestamps();
                postResponse(
                    { type: 'dvbProgress', count, added, partial: false, metadata: buildDvbMetadata(parser), timestamps, endTimestamps },
                    [timestamps.buffer, endTimestamps.buffer],
                    _id
                );
                break;
            }
            case 'resetDvb': {
                let parser = dvbParsers.get(request.sessionId);
                if (!parser) {
                    parser = new wasmModule.DvbParser();
                    dvbParsers.set(request.sessionId, parser);
                }
                parser.reset();
                const timestamps = parser.getTimestamps();
                const endTimestamps = parser.getEndTimestamps();
                postResponse(
                    { type: 'dvbProgress', count: 0, added: 0, partial: true, metadata: buildDvbMetadata(parser), timestamps, endTimestamps },
                    [timestamps.buffer, endTimestamps.buffer],
                    _id
                );
                break;
            }
            case 'loadVobSub': {
                disposeSession(request.sessionId);
                const parser = new wasmModule.VobSubParser();
                parser.loadFromData(request.idxContent, new Uint8Array(request.subData));
                const timestamps = parser.getTimestamps();
                vobSubParsers.set(request.sessionId, parser);
                postResponse(
                    { type: 'vobSubLoaded', count: parser.count, metadata: buildVobSubMetadata(parser), timestamps },
                    [timestamps.buffer],
                    _id
                );
                break;
            }
            case 'loadVobSubIdx': {
                disposeSession(request.sessionId);
                const parser = new wasmModule.VobSubParser();
                parser.loadFromIdx(request.idxContent);
                const timestamps = parser.getTimestamps();
                vobSubParsers.set(request.sessionId, parser);
                postResponse(
                    {
                        type: 'vobSubProgress',
                        count: parser.count,
                        partial: true,
                        hasSubData: !!parser.hasSubData,
                        metadata: buildVobSubMetadata(parser),
                        timestamps
                    },
                    [timestamps.buffer],
                    _id
                );
                break;
            }
            case 'attachVobSubData': {
                const parser = vobSubParsers.get(request.sessionId);
                if (!parser) {
                    postResponse({ type: 'error', message: 'VobSub session not found for attachVobSubData' }, [], _id);
                    break;
                }
                parser.attachSubData(new Uint8Array(request.subData));
                const timestamps = parser.getTimestamps();
                postResponse(
                    {
                        type: 'vobSubProgress',
                        count: parser.count,
                        partial: false,
                        hasSubData: !!parser.hasSubData,
                        metadata: buildVobSubMetadata(parser),
                        timestamps
                    },
                    [timestamps.buffer],
                    _id
                );
                break;
            }
            case 'loadVobSubMks': {
                disposeSession(request.sessionId);
                const parser = new wasmModule.VobSubParser();
                parser.loadFromMks(new Uint8Array(request.subData));
                const timestamps = parser.getTimestamps();
                vobSubParsers.set(request.sessionId, parser);
                postResponse(
                    { type: 'vobSubLoaded', count: parser.count, metadata: buildVobSubMetadata(parser), timestamps },
                    [timestamps.buffer],
                    _id
                );
                break;
            }
            case 'loadVobSubOnly': {
                disposeSession(request.sessionId);
                const parser = new wasmModule.VobSubParser();
                parser.loadFromSubOnly(new Uint8Array(request.subData));
                const timestamps = parser.getTimestamps();
                vobSubParsers.set(request.sessionId, parser);
                postResponse(
                    { type: 'vobSubLoaded', count: parser.count, metadata: buildVobSubMetadata(parser), timestamps },
                    [timestamps.buffer],
                    _id
                );
                break;
            }
            case 'renderPgsAtIndex': {
                const parser = pgsParsers.get(request.sessionId);
                if (!parser) { postResponse({ type: 'pgsFrame', frame: null }, [], _id); break; }
                const frame = parser.renderAtIndex(request.index);
                const renderIssue = parser.lastRenderIssue || '';
                if (!frame) { postResponse({ type: 'pgsFrame', frame: null, renderIssue }, [], _id); break; }
                const frameData = convertFrame(frame, false);
                postResponse({ type: 'pgsFrame', frame: frameData, renderIssue }, frameData.compositions.map((c) => c.rgba.buffer), _id);
                break;
            }
            case 'renderDvbAtIndex': {
                const parser = dvbParsers.get(request.sessionId);
                if (!parser) { postResponse({ type: 'dvbFrame', frame: null }, [], _id); break; }
                const frame = parser.renderAtIndex(request.index);
                const renderIssue = parser.lastRenderIssue || '';
                if (!frame) { postResponse({ type: 'dvbFrame', frame: null, renderIssue }, [], _id); break; }
                const frameData = convertFrame(frame, false);
                postResponse({ type: 'dvbFrame', frame: frameData, renderIssue }, frameData.compositions.map((c) => c.rgba.buffer), _id);
                break;
            }
            case 'renderVobSubAtIndex': {
                const parser = vobSubParsers.get(request.sessionId);
                if (!parser) { postResponse({ type: 'vobSubFrame', frame: null }, [], _id); break; }
                const frame = parser.renderAtIndex(request.index);
                const renderIssue = parser.lastRenderIssue || '';
                if (!frame) { postResponse({ type: 'vobSubFrame', frame: null, renderIssue }, [], _id); break; }
                const frameData = convertFrame(frame, true);
                postResponse({ type: 'vobSubFrame', frame: frameData, renderIssue }, frameData.compositions.map((c) => c.rgba.buffer), _id);
                break;
            }
            case 'findPgsIndex': {
                const parser = pgsParsers.get(request.sessionId);
                postResponse({ type: 'pgsIndex', index: parser ? parser.findIndexAtTimestamp(request.timeMs) : -1 }, [], _id);
                break;
            }
            case 'findDvbIndex': {
                const parser = dvbParsers.get(request.sessionId);
                postResponse({ type: 'dvbIndex', index: parser ? parser.findIndexAtTimestamp(request.timeMs) : -1 }, [], _id);
                break;
            }
            case 'findVobSubIndex': {
                const parser = vobSubParsers.get(request.sessionId);
                postResponse({ type: 'vobSubIndex', index: parser ? parser.findIndexAtTimestamp(request.timeMs) : -1 }, [], _id);
                break;
            }
            case 'getPgsTimestamps': {
                const parser = pgsParsers.get(request.sessionId);
                postResponse({ type: 'pgsTimestamps', timestamps: parser ? parser.getTimestamps() : new Float64Array(0) }, [], _id);
                break;
            }
            case 'getDvbTimestamps': {
                const parser = dvbParsers.get(request.sessionId);
                postResponse({ type: 'dvbTimestamps', timestamps: parser ? parser.getTimestamps() : new Float64Array(0) }, [], _id);
                break;
            }
            case 'getVobSubTimestamps': {
                const parser = vobSubParsers.get(request.sessionId);
                postResponse({ type: 'vobSubTimestamps', timestamps: parser ? parser.getTimestamps() : new Float64Array(0) }, [], _id);
                break;
            }
            case 'clearPgsCache': {
                pgsParsers.get(request.sessionId)?.clearCache();
                postResponse({ type: 'cleared' }, [], _id);
                break;
            }
            case 'clearDvbCache': {
                dvbParsers.get(request.sessionId)?.clearCache();
                postResponse({ type: 'cleared' }, [], _id);
                break;
            }
            case 'clearVobSubCache': {
                vobSubParsers.get(request.sessionId)?.clearCache();
                postResponse({ type: 'cleared' }, [], _id);
                break;
            }
            case 'disposePgs': {
                const parser = pgsParsers.get(request.sessionId);
                if (parser) {
                    parser.free();
                    pgsParsers.delete(request.sessionId);
                }
                postResponse({ type: 'disposed' }, [], _id);
                break;
            }
            case 'disposeDvb': {
                const parser = dvbParsers.get(request.sessionId);
                if (parser) {
                    parser.free();
                    dvbParsers.delete(request.sessionId);
                }
                postResponse({ type: 'disposed' }, [], _id);
                break;
            }
            case 'disposeVobSub': {
                const parser = vobSubParsers.get(request.sessionId);
                if (parser) {
                    parser.free();
                    vobSubParsers.delete(request.sessionId);
                }
                postResponse({ type: 'disposed' }, [], _id);
                break;
            }
            case 'setVobSubDebandEnabled': {
                vobSubParsers.get(request.sessionId)?.setDebandEnabled(request.enabled);
                postResponse({ type: 'debandSet' }, [], _id);
                break;
            }
            case 'setVobSubDebandThreshold': {
                vobSubParsers.get(request.sessionId)?.setDebandThreshold(request.threshold);
                postResponse({ type: 'debandSet' }, [], _id);
                break;
            }
            case 'setVobSubDebandRange': {
                vobSubParsers.get(request.sessionId)?.setDebandRange(request.range);
                postResponse({ type: 'debandSet' }, [], _id);
                break;
            }
            case 'attachOffscreenCanvas': {
                const canvas = request.canvas;
                if (!canvas || typeof canvas.getContext !== 'function') {
                    throw new Error('OffscreenCanvas attach requires a transferable OffscreenCanvas');
                }
                if (offscreenSurfaces.has(request.sessionId)) {
                    throw new Error('OffscreenCanvas already attached for this session');
                }
                const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
                if (!ctx) {
                    throw new Error('OffscreenCanvas 2D context unavailable');
                }
                const buffer = new OffscreenCanvas(1, 1);
                const bufferCtx = buffer.getContext('2d', { alpha: true, desynchronized: true });
                if (!bufferCtx) {
                    throw new Error('OffscreenCanvas buffer 2D context unavailable');
                }
                offscreenSurfaces.set(request.sessionId, { canvas, ctx, buffer, bufferCtx });
                postResponse({ type: 'offscreenAttached' }, [], _id);
                break;
            }
            case 'resizeOffscreenCanvas': {
                const surface = offscreenSurfaces.get(request.sessionId);
                if (surface) {
                    const width = Math.max(1, request.width | 0);
                    const height = Math.max(1, request.height | 0);
                    if (surface.canvas.width !== width) surface.canvas.width = width;
                    if (surface.canvas.height !== height) surface.canvas.height = height;
                }
                postResponse({ type: 'offscreenResized' }, [], _id);
                break;
            }
            case 'detachOffscreenCanvas': {
                detachOffscreenSurface(request.sessionId);
                postResponse({ type: 'offscreenDetached' }, [], _id);
                break;
            }
            case 'clearOffscreenCanvas': {
                const surface = offscreenSurfaces.get(request.sessionId);
                if (surface) {
                    surface.ctx.clearRect(0, 0, surface.canvas.width, surface.canvas.height);
                }
                postResponse({ type: 'offscreenCleared' }, [], _id);
                break;
            }
            case 'presentOffscreen': {
                const surface = offscreenSurfaces.get(request.sessionId);
                if (!surface) {
                    postResponse({ type: 'offscreenPresented', status: 'failed', fatal: true, renderIssue: 'OFFSCREEN_SURFACE_MISSING' }, [], _id);
                    break;
                }

                const canvasWidth = Math.max(1, request.canvasWidth | 0);
                const canvasHeight = Math.max(1, request.canvasHeight | 0);
                const settings = request.displaySettings || {
                    scale: 1, aspectMode: 'stretch', verticalOffset: 0, horizontalOffset: 0,
                    horizontalAlign: 'center', bottomPadding: 0, safeArea: 0, opacity: 1
                };

                if (request.index < 0) {
                    if (surface.canvas.width !== canvasWidth) surface.canvas.width = canvasWidth;
                    if (surface.canvas.height !== canvasHeight) surface.canvas.height = canvasHeight;
                    surface.ctx.clearRect(0, 0, surface.canvas.width, surface.canvas.height);
                    postResponse({ type: 'offscreenPresented', status: 'cleared', compositionCount: 0 }, [], _id);
                    break;
                }

                let frame = null;
                let renderIssue = '';
                if (request.format === 'pgs') {
                    const parser = pgsParsers.get(request.sessionId);
                    if (!parser) {
                        postResponse({ type: 'offscreenPresented', status: 'failed', fatal: true, renderIssue: 'PARSER_MISSING' }, [], _id);
                        break;
                    }
                    const rendered = parser.renderAtIndex(request.index);
                    renderIssue = parser.lastRenderIssue || '';
                    frame = rendered ? convertFrame(rendered, false) : null;
                } else if (request.format === 'dvb') {
                    const parser = dvbParsers.get(request.sessionId);
                    if (!parser) {
                        postResponse({ type: 'offscreenPresented', status: 'failed', fatal: true, renderIssue: 'PARSER_MISSING' }, [], _id);
                        break;
                    }
                    const rendered = parser.renderAtIndex(request.index);
                    renderIssue = parser.lastRenderIssue || '';
                    frame = rendered ? convertFrame(rendered, false) : null;
                } else {
                    const parser = vobSubParsers.get(request.sessionId);
                    if (!parser) {
                        postResponse({ type: 'offscreenPresented', status: 'failed', fatal: true, renderIssue: 'PARSER_MISSING' }, [], _id);
                        break;
                    }
                    const rendered = parser.renderAtIndex(request.index);
                    renderIssue = parser.lastRenderIssue || '';
                    frame = rendered ? convertFrame(rendered, true) : null;
                }

                if (!frame) {
                    if (surface.canvas.width !== canvasWidth) surface.canvas.width = canvasWidth;
                    if (surface.canvas.height !== canvasHeight) surface.canvas.height = canvasHeight;
                    surface.ctx.clearRect(0, 0, surface.canvas.width, surface.canvas.height);
                    postResponse({
                        type: 'offscreenPresented',
                        status: renderIssue ? 'failed' : 'empty',
                        renderIssue,
                        compositionCount: 0
                    }, [], _id);
                    break;
                }

                const presented = presentFrameToOffscreen(surface, frame, canvasWidth, canvasHeight, settings);
                postResponse({
                    type: 'offscreenPresented',
                    status: presented.status,
                    renderIssue,
                    width: presented.width,
                    height: presented.height,
                    compositionCount: presented.compositionCount,
                    bounds: presented.bounds || null
                }, [], _id);
                break;
            }
        }
    } catch (error) {
        postResponse({ type: 'error', message: error instanceof Error ? error.message : String(error) }, [], _id);
    }
};`;
}
function getOrCreateWorker() {
  if (sharedWorker) return Promise.resolve(sharedWorker);
  if (workerInitPromise) return workerInitPromise;
  const initPromise = initializeWorker();
  workerInitPromise = initPromise;
  void initPromise.then(() => {
    if (workerInitPromise === initPromise) workerInitPromise = null;
  }, () => {
    if (workerInitPromise === initPromise) workerInitPromise = null;
  });
  return initPromise;
}
async function initializeWorker() {
  const blob = new Blob([
    createWorkerScript()
  ], {
    type: "application/javascript"
  });
  const workerUrl = URL.createObjectURL(blob);
  let worker;
  try {
    worker = new Worker(workerUrl, {
      type: "module"
    });
  } catch (error) {
    URL.revokeObjectURL(workerUrl);
    throw error instanceof Error ? error : new Error(String(error));
  }
  worker.onmessage = (event) => {
    const { _id, ...response } = event.data;
    if (_id === void 0) return;
    const callback = pendingCallbacks.get(_id);
    if (!callback) return;
    pendingCallbacks.delete(_id);
    if (response.type === "error" && callback.requestType === "init") {
      callback.reject(new Error(response.message));
    } else {
      callback.resolve(response);
    }
  };
  worker.onerror = (event) => {
    const error = event instanceof ErrorEvent ? new Error(event.message) : new Error(String(event));
    rejectWorkerCallbacks(worker, error);
    if (sharedWorker === worker) sharedWorker = null;
    try {
      worker.terminate();
    } catch {
    }
  };
  try {
    const initResponse = await sendToWorkerInstance(worker, {
      type: "init",
      wasmUrl: getWasmUrl(),
      glueUrl: getWasmGlueUrl()
    });
    if (initResponse.type === "error") {
      throw new Error(initResponse.message);
    }
    if (initResponse.type !== "initComplete" || !initResponse.success) {
      throw new Error("Worker WASM initialization failed");
    }
    sharedWorker = worker;
    return worker;
  } catch (error) {
    const workerError = error instanceof Error ? error : new Error(String(error));
    rejectWorkerCallbacks(worker, workerError);
    if (sharedWorker === worker) sharedWorker = null;
    try {
      worker.terminate();
    } catch {
    }
    throw workerError;
  } finally {
    URL.revokeObjectURL(workerUrl);
  }
}
var WORKER_TIMEOUT = 3e4;
function sendToWorker(request, timeout = WORKER_TIMEOUT) {
  if (!sharedWorker) {
    return Promise.reject(new Error("Worker not initialized"));
  }
  return sendToWorkerInstance(sharedWorker, request, timeout);
}
function sendToWorkerInstance(worker, request, timeout = WORKER_TIMEOUT) {
  return new Promise((resolve, reject) => {
    const id = ++messageId;
    const timeoutId = setTimeout(() => {
      pendingCallbacks.delete(id);
      reject(new Error(`Worker operation timed out after ${timeout}ms`));
    }, timeout);
    pendingCallbacks.set(id, {
      worker,
      requestType: request.type,
      resolve: (response) => {
        clearTimeout(timeoutId);
        resolve(response);
      },
      reject: (error) => {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
    const transfers = [];
    if ("data" in request && request.data instanceof ArrayBuffer) transfers.push(request.data);
    if ("subData" in request && request.subData instanceof ArrayBuffer) transfers.push(request.subData);
    if ("canvas" in request && request.canvas) transfers.push(request.canvas);
    try {
      worker.postMessage({
        ...request,
        _id: id
      }, transfers);
    } catch (error) {
      pendingCallbacks.delete(id);
      clearTimeout(timeoutId);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}
function rejectWorkerCallbacks(worker, error) {
  for (const [id, callback] of pendingCallbacks) {
    if (callback.worker !== worker) continue;
    pendingCallbacks.delete(id);
    callback.reject(error);
  }
}

// deno:https://jsr.io/@altq/libbitsub/1.12.1/src/ts/webgpu-renderer.ts
var VERTEX_SHADER = (
  /* wgsl */
  `
struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) texCoord: vec2f,
}

struct Uniforms {
  resolution: vec2f,
  opacity: f32,
}

struct QuadData {
  destRect: vec4f,   // x, y, w, h in pixels
  texSize: vec4f,    // texW, texH, 0, 0
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<storage, read> quadData: QuadData;

// Quad vertices (two triangles)
const QUAD_POSITIONS = array<vec2f, 6>(
  vec2f(0.0, 0.0),
  vec2f(1.0, 0.0),
  vec2f(0.0, 1.0),
  vec2f(1.0, 0.0),
  vec2f(1.0, 1.0),
  vec2f(0.0, 1.0)
);

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  var output: VertexOutput;

  let quadPos = QUAD_POSITIONS[vertexIndex];
  let wh = quadData.destRect.zw;

  // Calculate pixel position
  let pixelPos = quadData.destRect.xy + quadPos * wh;

  // Convert to clip space (-1 to 1)
  var clipPos = (pixelPos / uniforms.resolution) * 2.0 - 1.0;
  clipPos.y = -clipPos.y;  // Flip Y for canvas coordinates

  output.position = vec4f(clipPos, 0.0, 1.0);
  output.texCoord = quadPos;

  return output;
}
`
);
var FRAGMENT_SHADER = (
  /* wgsl */
  `
struct Uniforms {
  resolution: vec2f,
  opacity: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(2) var texSampler: sampler;
@group(0) @binding(3) var tex: texture_2d<f32>;

struct FragmentInput {
  @location(0) texCoord: vec2f,
}

@fragment
fn fragmentMain(input: FragmentInput) -> @location(0) vec4f {
  // Sample pre-multiplied alpha texture (premultiplied on CPU upload)
  return textureSample(tex, texSampler, input.texCoord) * uniforms.opacity;
}
`
);
function isWebGPUSupported() {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}
var WebGPURenderer = class {
  device = null;
  context = null;
  pipeline = null;
  sampler = null;
  bindGroupLayout = null;
  // Uniform buffer for resolution
  uniformBuffer = null;
  // Quad data buffers (one per composition)
  quadDataBuffers = [];
  // Textures for compositions
  textures = [];
  pendingDestroyTextures = [];
  format = "bgra8unorm";
  _canvas = null;
  _initPromise = null;
  _initialized = false;
  _lastCanvasWidth = 0;
  _lastCanvasHeight = 0;
  /**
   * Initialize the WebGPU renderer.
   * Returns a promise that resolves when initialization is complete.
   */
  async init() {
    if (this._initPromise) return this._initPromise;
    this._initPromise = this._initDevice();
    return this._initPromise;
  }
  async assertShaderModuleValid(module, label) {
    const info = await module.getCompilationInfo();
    const errors = info.messages.filter((message) => message.type === "error");
    if (errors.length === 0) return;
    const formatted = errors.map((message) => {
      const line = message.lineNum > 0 ? `:${message.lineNum}:${message.linePos}` : "";
      return `${label}${line} ${message.message}`;
    }).join("\n");
    throw new Error(`WebGPU ${label} shader compilation failed:
${formatted}`);
  }
  async _initDevice() {
    if (!navigator.gpu) {
      throw new Error("WebGPU not supported");
    }
    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: "high-performance"
    });
    if (!adapter) {
      throw new Error("No WebGPU adapter found");
    }
    this.device = await adapter.requestDevice();
    this.format = navigator.gpu.getPreferredCanvasFormat();
    const vertexModule = this.device.createShaderModule({
      code: VERTEX_SHADER
    });
    const fragmentModule = this.device.createShaderModule({
      code: FRAGMENT_SHADER
    });
    await this.assertShaderModuleValid(vertexModule, "vertex");
    await this.assertShaderModuleValid(fragmentModule, "fragment");
    this.sampler = this.device.createSampler({
      magFilter: "linear",
      minFilter: "linear",
      addressModeU: "clamp-to-edge",
      addressModeV: "clamp-to-edge"
    });
    this.uniformBuffer = this.device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    this.bindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: {
            type: "uniform"
          }
        },
        {
          binding: 1,
          visibility: GPUShaderStage.VERTEX,
          buffer: {
            type: "read-only-storage"
          }
        },
        {
          binding: 2,
          visibility: GPUShaderStage.FRAGMENT,
          sampler: {
            type: "filtering"
          }
        },
        {
          binding: 3,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {
            sampleType: "float"
          }
        }
      ]
    });
    const pipelineLayout = this.device.createPipelineLayout({
      bindGroupLayouts: [
        this.bindGroupLayout
      ]
    });
    this.pipeline = await this.device.createRenderPipelineAsync({
      layout: pipelineLayout,
      vertex: {
        module: vertexModule,
        entryPoint: "vertexMain"
      },
      fragment: {
        module: fragmentModule,
        entryPoint: "fragmentMain",
        targets: [
          {
            format: this.format,
            blend: {
              color: {
                srcFactor: "one",
                dstFactor: "one-minus-src-alpha",
                operation: "add"
              },
              alpha: {
                srcFactor: "one",
                dstFactor: "one-minus-src-alpha",
                operation: "add"
              }
            }
          }
        ]
      },
      primitive: {
        topology: "triangle-list"
      }
    });
    this._initialized = true;
  }
  /**
   * Configure the canvas for WebGPU rendering.
   */
  async setCanvas(canvas, width, height) {
    await this.init();
    if (!this.device) {
      throw new Error("WebGPU device not initialized");
    }
    if (width <= 0 || height <= 0) {
      return;
    }
    this._canvas = canvas;
    canvas.width = width;
    canvas.height = height;
    this._lastCanvasWidth = width;
    this._lastCanvasHeight = height;
    if (!this.context) {
      this.context = canvas.getContext("webgpu");
      if (!this.context) {
        throw new Error("Could not get WebGPU context");
      }
      this.context.configure({
        device: this.device,
        format: this.format,
        alphaMode: "premultiplied"
      });
    }
    this.device.queue.writeBuffer(this.uniformBuffer, 0, new Float32Array([
      width,
      height,
      1,
      0
    ]));
  }
  /**
   * Update canvas dimensions.
   */
  updateSize(width, height) {
    if (!this.device || !this._canvas || width <= 0 || height <= 0) return;
    if (width === this._lastCanvasWidth && height === this._lastCanvasHeight) return;
    this._canvas.width = width;
    this._canvas.height = height;
    this._lastCanvasWidth = width;
    this._lastCanvasHeight = height;
    this.device.queue.writeBuffer(this.uniformBuffer, 0, new Float32Array([
      width,
      height,
      1,
      0
    ]));
  }
  createTextureInfo(width, height) {
    const texture = this.device.createTexture({
      size: [
        width,
        height
      ],
      format: this.format,
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
    });
    return {
      texture,
      view: texture.createView(),
      width,
      height,
      sourceData: null,
      bindGroup: null
    };
  }
  /**
   * Render subtitle compositions to the canvas.
   */
  render(compositions, screenWidth, screenHeight, scaleX, scaleY, shiftX, shiftY, opacity) {
    if (!this.device || !this.context || !this.pipeline || !this._canvas) return;
    let textureView;
    try {
      const currentTexture = this.context.getCurrentTexture();
      if (currentTexture.width === 0 || currentTexture.height === 0) return;
      textureView = currentTexture.createView();
    } catch {
      return;
    }
    this.device.queue.writeBuffer(this.uniformBuffer, 0, new Float32Array([
      this._canvas.width,
      this._canvas.height,
      opacity,
      0
    ]));
    const commandEncoder = this.device.createCommandEncoder();
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          clearValue: {
            r: 0,
            g: 0,
            b: 0,
            a: 0
          },
          loadOp: "clear",
          storeOp: "store"
        }
      ]
    });
    renderPass.setPipeline(this.pipeline);
    while (this.textures.length < compositions.length) {
      this.textures.push(this.createTextureInfo(64, 64));
    }
    while (this.quadDataBuffers.length < compositions.length) {
      this.quadDataBuffers.push(this.device.createBuffer({
        size: 32,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
      }));
    }
    for (let i = 0; i < compositions.length; i++) {
      const comp = compositions[i];
      const { pixelData, x, y } = comp;
      const { width, height, data } = pixelData;
      if (width <= 0 || height <= 0) continue;
      let texInfo = this.textures[i];
      if (texInfo.width !== width || texInfo.height !== height) {
        this.pendingDestroyTextures.push(texInfo.texture);
        texInfo = this.createTextureInfo(width, height);
        this.textures[i] = texInfo;
      }
      if (texInfo.sourceData !== data) {
        const uploadData = new Uint8Array(data.length);
        if (this.format === "bgra8unorm") {
          for (let j = 0; j < data.length; j += 4) {
            const a = data[j + 3];
            const af = a / 255;
            uploadData[j] = data[j + 2] * af + 0.5 | 0;
            uploadData[j + 1] = data[j + 1] * af + 0.5 | 0;
            uploadData[j + 2] = data[j] * af + 0.5 | 0;
            uploadData[j + 3] = a;
          }
        } else {
          for (let j = 0; j < data.length; j += 4) {
            const a = data[j + 3];
            const af = a / 255;
            uploadData[j] = data[j] * af + 0.5 | 0;
            uploadData[j + 1] = data[j + 1] * af + 0.5 | 0;
            uploadData[j + 2] = data[j + 2] * af + 0.5 | 0;
            uploadData[j + 3] = a;
          }
        }
        this.device.queue.writeTexture({
          texture: texInfo.texture
        }, uploadData, {
          bytesPerRow: width * 4
        }, {
          width,
          height
        });
        texInfo.sourceData = data;
      }
      const scaledWidth = width * scaleX;
      const scaledHeight = height * scaleY;
      const adjustedX = x * scaleX + shiftX;
      const adjustedY = y * scaleY + shiftY;
      const quadData = new Float32Array([
        // destRect
        adjustedX,
        adjustedY,
        scaledWidth,
        scaledHeight,
        // texSize
        width,
        height,
        0,
        0
      ]);
      const quadBuffer = this.quadDataBuffers[i];
      this.device.queue.writeBuffer(quadBuffer, 0, quadData);
      if (!texInfo.bindGroup) {
        texInfo.bindGroup = this.device.createBindGroup({
          layout: this.bindGroupLayout,
          entries: [
            {
              binding: 0,
              resource: {
                buffer: this.uniformBuffer
              }
            },
            {
              binding: 1,
              resource: {
                buffer: quadBuffer
              }
            },
            {
              binding: 2,
              resource: this.sampler
            },
            {
              binding: 3,
              resource: texInfo.view
            }
          ]
        });
      }
      renderPass.setBindGroup(0, texInfo.bindGroup);
      renderPass.draw(6);
    }
    renderPass.end();
    this.device.queue.submit([
      commandEncoder.finish()
    ]);
    for (const tex of this.pendingDestroyTextures) {
      tex.destroy();
    }
    this.pendingDestroyTextures = [];
    if (this.textures.length > compositions.length) {
      for (let i = compositions.length; i < this.textures.length; i++) {
        this.textures[i].texture.destroy();
      }
      this.textures.length = compositions.length;
    }
    if (this.quadDataBuffers.length > compositions.length) {
      for (let i = compositions.length; i < this.quadDataBuffers.length; i++) {
        this.quadDataBuffers[i].destroy();
      }
      this.quadDataBuffers.length = compositions.length;
    }
  }
  /**
   * Clear the canvas.
   */
  clear() {
    if (!this.device || !this.context) return;
    try {
      const currentTexture = this.context.getCurrentTexture();
      if (currentTexture.width === 0 || currentTexture.height === 0) return;
      const commandEncoder = this.device.createCommandEncoder();
      const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [
          {
            view: currentTexture.createView(),
            clearValue: {
              r: 0,
              g: 0,
              b: 0,
              a: 0
            },
            loadOp: "clear",
            storeOp: "store"
          }
        ]
      });
      renderPass.end();
      this.device.queue.submit([
        commandEncoder.finish()
      ]);
    } catch {
      return;
    }
  }
  /**
   * Read back the current swap-chain texture as straight (non-premultiplied) RGBA.
   * Intended for visual-regression / golden-image tests.
   */
  async readPixels() {
    if (!this.device || !this.context || !this._canvas) {
      return {
        data: new Uint8ClampedArray(0),
        width: 0,
        height: 0
      };
    }
    const width = this._canvas.width;
    const height = this._canvas.height;
    if (width <= 0 || height <= 0) {
      return {
        data: new Uint8ClampedArray(0),
        width: 0,
        height: 0
      };
    }
    const bytesPerRow = Math.ceil(width * 4 / 256) * 256;
    const bufferSize = bytesPerRow * height;
    const readBuffer = this.device.createBuffer({
      size: bufferSize,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
    });
    try {
      const sourceTexture = this.context.getCurrentTexture();
      const encoder = this.device.createCommandEncoder();
      encoder.copyTextureToBuffer({
        texture: sourceTexture
      }, {
        buffer: readBuffer,
        bytesPerRow
      }, {
        width,
        height
      });
      this.device.queue.submit([
        encoder.finish()
      ]);
      await readBuffer.mapAsync(GPUMapMode.READ);
      const packed = new Uint8Array(readBuffer.getMappedRange());
      const data = new Uint8ClampedArray(width * height * 4);
      const isBgra = this.format === "bgra8unorm";
      for (let y = 0; y < height; y += 1) {
        const srcRow = y * bytesPerRow;
        for (let x = 0; x < width; x += 1) {
          const src = srcRow + x * 4;
          const dst = (y * width + x) * 4;
          let r = packed[src];
          let g = packed[src + 1];
          let b = packed[src + 2];
          const a = packed[src + 3];
          if (isBgra) {
            const tmp = r;
            r = b;
            b = tmp;
          }
          if (a > 0 && a < 255) {
            const inv = 255 / a;
            r = Math.min(255, Math.round(r * inv));
            g = Math.min(255, Math.round(g * inv));
            b = Math.min(255, Math.round(b * inv));
          }
          data[dst] = r;
          data[dst + 1] = g;
          data[dst + 2] = b;
          data[dst + 3] = a;
        }
      }
      return {
        data,
        width,
        height
      };
    } finally {
      try {
        readBuffer.unmap();
      } catch {
      }
      readBuffer.destroy();
    }
  }
  /**
   * Check if renderer is initialized.
   */
  get initialized() {
    return this._initialized;
  }
  /**
   * Destroy all resources.
   */
  destroy() {
    for (const tex of this.textures) {
      tex.texture.destroy();
    }
    this.textures = [];
    for (const tex of this.pendingDestroyTextures) {
      tex.destroy();
    }
    this.pendingDestroyTextures = [];
    this.uniformBuffer?.destroy();
    for (const buf of this.quadDataBuffers) {
      buf.destroy();
    }
    this.quadDataBuffers = [];
    this.device?.destroy();
    this.device = null;
    this.context = null;
    this._canvas = null;
    this._initialized = false;
    this._initPromise = null;
    this._lastCanvasWidth = 0;
    this._lastCanvasHeight = 0;
  }
};

// deno:https://jsr.io/@altq/libbitsub/1.12.1/src/ts/webgl2-renderer.ts
var VERTEX_SHADER_SRC = (
  /* glsl */
  `#version 300 es

uniform vec2 u_resolution;
uniform vec4 u_destRect; // x, y, w, h in pixels

out vec2 v_texCoord;

void main() {
  // Generate unit-square positions for two-triangle quad (CCW)
  vec2 unitPos;
  if (gl_VertexID == 0) unitPos = vec2(0.0, 0.0);
  else if (gl_VertexID == 1) unitPos = vec2(1.0, 0.0);
  else if (gl_VertexID == 2) unitPos = vec2(0.0, 1.0);
  else if (gl_VertexID == 3) unitPos = vec2(1.0, 0.0);
  else if (gl_VertexID == 4) unitPos = vec2(1.0, 1.0);
  else                       unitPos = vec2(0.0, 1.0);

  v_texCoord = unitPos;

  // Convert pixel position to clip space
  vec2 pixelPos = u_destRect.xy + unitPos * u_destRect.zw;
  vec2 clipPos = (pixelPos / u_resolution) * 2.0 - 1.0;
  clipPos.y = -clipPos.y; // Flip Y for canvas coordinates

  gl_Position = vec4(clipPos, 0.0, 1.0);
}
`
);
var FRAGMENT_SHADER_SRC = (
  /* glsl */
  `#version 300 es
precision mediump float;

uniform sampler2D u_texture;
uniform float u_opacity;

in vec2 v_texCoord;
out vec4 outColor;

void main() {
  // Texture is pre-multiplied alpha; output as-is for premultiplied blending
  outColor = texture(u_texture, v_texCoord) * u_opacity;
}
`
);
var _webgl2Supported = null;
function isWebGL2Supported() {
  if (_webgl2Supported !== null) return _webgl2Supported;
  if (typeof document === "undefined") return _webgl2Supported = false;
  try {
    const canvas = document.createElement("canvas");
    _webgl2Supported = !!canvas.getContext("webgl2");
  } catch {
    _webgl2Supported = false;
  }
  return _webgl2Supported;
}
var WebGL2Renderer = class {
  gl = null;
  program = null;
  vao = null;
  // Cached uniform locations
  uResolution = null;
  uDestRect = null;
  uTexture = null;
  uOpacity = null;
  // Texture pool for compositions (indexed by slot)
  textures = [];
  _canvas = null;
  _initialized = false;
  _width = 0;
  _height = 0;
  /**
   * Initialize the WebGL2 renderer.
   * Kept async for API parity with WebGPURenderer, but WebGL2 init is synchronous.
   */
  async init() {
  }
  /**
   * Configure the canvas for WebGL2 rendering.
   */
  async setCanvas(canvas, width, height) {
    this._canvas = canvas;
    canvas.width = width;
    canvas.height = height;
    this._width = width;
    this._height = height;
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false
    });
    if (!gl) {
      throw new Error("Could not get WebGL2 context");
    }
    this.gl = gl;
    const vertShader = this._compileShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fragShader = this._compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    const program = gl.createProgram();
    if (!program) throw new Error("Failed to create WebGL2 program");
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error("WebGL2 program link failed: " + log);
    }
    this.program = program;
    gl.useProgram(program);
    this.uResolution = gl.getUniformLocation(program, "u_resolution");
    this.uDestRect = gl.getUniformLocation(program, "u_destRect");
    this.uTexture = gl.getUniformLocation(program, "u_texture");
    this.uOpacity = gl.getUniformLocation(program, "u_opacity");
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    gl.uniform2f(this.uResolution, width, height);
    gl.uniform1i(this.uTexture, 0);
    gl.uniform1f(this.uOpacity, 1);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.viewport(0, 0, width, height);
    this._initialized = true;
    console.log("[libbitsub] WebGL2 renderer initialized");
  }
  _compileShader(type, src) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    if (!shader) throw new Error("Failed to create shader");
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error("Shader compile error: " + log);
    }
    return shader;
  }
  /**
   * Update canvas dimensions.
   */
  updateSize(width, height) {
    if (!this.gl || !this._canvas) return;
    this._canvas.width = width;
    this._canvas.height = height;
    this._width = width;
    this._height = height;
    this.gl.viewport(0, 0, width, height);
    this.gl.useProgram(this.program);
    this.gl.uniform2f(this.uResolution, width, height);
  }
  _ensureTexture(index, width, height) {
    const gl = this.gl;
    const existing = this.textures[index];
    if (existing && existing.width === width && existing.height === height) {
      return existing;
    }
    if (existing) {
      gl.deleteTexture(existing.texture);
    }
    const texture = gl.createTexture();
    if (!texture) throw new Error("Failed to create WebGL2 texture");
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    const info = {
      texture,
      width,
      height,
      sourceData: null
    };
    this.textures[index] = info;
    return info;
  }
  /**
   * Render subtitle compositions to the canvas.
   */
  render(compositions, screenWidth, screenHeight, scaleX, scaleY, shiftX, shiftY, opacity) {
    if (!this.gl || !this.program || !this._canvas) return;
    const gl = this.gl;
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1f(this.uOpacity, opacity);
    for (let i = 0; i < compositions.length; i++) {
      const comp = compositions[i];
      const { pixelData, x, y } = comp;
      const { width, height, data } = pixelData;
      if (width <= 0 || height <= 0) continue;
      const info = this._ensureTexture(i, width, height);
      gl.bindTexture(gl.TEXTURE_2D, info.texture);
      if (info.sourceData !== data) {
        const uploadData = new Uint8Array(data.length);
        for (let j = 0; j < data.length; j += 4) {
          const a = data[j + 3];
          const af = a / 255;
          uploadData[j] = data[j] * af + 0.5 | 0;
          uploadData[j + 1] = data[j + 1] * af + 0.5 | 0;
          uploadData[j + 2] = data[j + 2] * af + 0.5 | 0;
          uploadData[j + 3] = a;
        }
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, uploadData);
        info.sourceData = data;
      }
      const scaledWidth = width * scaleX;
      const scaledHeight = height * scaleY;
      const adjustedX = x * scaleX + shiftX;
      const adjustedY = y * scaleY + shiftY;
      gl.uniform4f(this.uDestRect, adjustedX, adjustedY, scaledWidth, scaledHeight);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    if (this.textures.length > compositions.length) {
      for (let i = compositions.length; i < this.textures.length; i++) {
        const stale = this.textures[i];
        if (stale) gl.deleteTexture(stale.texture);
      }
      this.textures.length = compositions.length;
    }
  }
  /**
   * Clear the canvas.
   */
  clear() {
    if (!this.gl) return;
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }
  /**
   * Read back the current framebuffer as straight (non-premultiplied) RGBA.
   * Intended for visual-regression / golden-image tests.
   */
  readPixels() {
    if (!this.gl || !this._canvas) {
      return {
        data: new Uint8ClampedArray(0),
        width: 0,
        height: 0
      };
    }
    const width = this._canvas.width;
    const height = this._canvas.height;
    const gl = this.gl;
    const raw = new Uint8Array(width * height * 4);
    gl.pixelStorei(gl.PACK_ALIGNMENT, 1);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, raw);
    const data = new Uint8ClampedArray(raw.length);
    const rowBytes = width * 4;
    for (let y = 0; y < height; y += 1) {
      const srcOffset = (height - 1 - y) * rowBytes;
      const dstOffset = y * rowBytes;
      data.set(raw.subarray(srcOffset, srcOffset + rowBytes), dstOffset);
    }
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a > 0 && a < 255) {
        const inv = 255 / a;
        data[i] = Math.min(255, Math.round(data[i] * inv));
        data[i + 1] = Math.min(255, Math.round(data[i + 1] * inv));
        data[i + 2] = Math.min(255, Math.round(data[i + 2] * inv));
      }
    }
    return {
      data,
      width,
      height
    };
  }
  /**
   * Check if renderer is initialized.
   */
  get initialized() {
    return this._initialized;
  }
  /**
   * Destroy all GPU resources.
   */
  destroy() {
    const gl = this.gl;
    if (gl) {
      for (const info of this.textures) {
        if (info) gl.deleteTexture(info.texture);
      }
      if (this.program) gl.deleteProgram(this.program);
      if (this.vao) gl.deleteVertexArray(this.vao);
    }
    this.textures = [];
    this.program = null;
    this.vao = null;
    this.gl = null;
    this._canvas = null;
    this._initialized = false;
  }
};

// deno:https://jsr.io/@altq/libbitsub/1.12.1/src/ts/capabilities.ts
function isOffscreenCanvasSupported() {
  return typeof OffscreenCanvas !== "undefined";
}
function isTransferControlToOffscreenSupported() {
  return typeof HTMLCanvasElement !== "undefined" && typeof HTMLCanvasElement.prototype === "object" && typeof HTMLCanvasElement.prototype.transferControlToOffscreen === "function";
}
function isOffscreenCanvas2DSupported() {
  if (typeof OffscreenCanvas !== "undefined") {
    try {
      const canvas = new OffscreenCanvas(1, 1);
      return !!canvas.getContext("2d");
    } catch {
      return false;
    }
  }
  return false;
}
function canUseWorkerOffscreenRender() {
  return isWorkerAvailable() && isOffscreenCanvasSupported() && isTransferControlToOffscreenSupported() && isOffscreenCanvas2DSupported();
}

// deno:https://jsr.io/@altq/libbitsub/1.12.1/src/ts/utils.ts
function toBinaryView(binary) {
  if (binary instanceof Uint8Array) return binary;
  if (binary instanceof ArrayBuffer) return new Uint8Array(binary);
  return null;
}
function toClampedView(pixels) {
  if (pixels.buffer instanceof ArrayBuffer) {
    if (pixels instanceof Uint8ClampedArray) return pixels;
    return new Uint8ClampedArray(pixels.buffer, pixels.byteOffset, pixels.byteLength);
  }
  const ownedPixels = new Uint8ClampedArray(pixels.byteLength);
  ownedPixels.set(pixels);
  return ownedPixels;
}
function looksLikePgsBinary(binary) {
  return binary.length >= 2 && binary[0] === 80 && binary[1] === 71;
}
var DVB_SYNC_BYTE = 15;
var DVB_PAGE_COMPOSITION = 16;
var DVB_REGION_COMPOSITION = 17;
var DVB_CLUT_DEFINITION = 18;
var DVB_OBJECT_DATA = 19;
var DVB_DISPLAY_DEFINITION = 20;
var DVB_END_OF_DISPLAY_SET = 128;
var DVB_STUFFING = 255;
function isKnownDvbSegmentType(segmentType) {
  return segmentType === DVB_PAGE_COMPOSITION || segmentType === DVB_REGION_COMPOSITION || segmentType === DVB_CLUT_DEFINITION || segmentType === DVB_OBJECT_DATA || segmentType === DVB_DISPLAY_DEFINITION || segmentType === DVB_END_OF_DISPLAY_SET || segmentType === DVB_STUFFING;
}
function looksLikeDvbPayload(binary, start = 0) {
  let offset = start;
  if (binary.length - offset >= 3 && binary[offset] === 32 && binary[offset + 1] === 0 && binary[offset + 2] === DVB_SYNC_BYTE) {
    offset += 2;
  }
  if (offset >= binary.length || binary[offset] !== DVB_SYNC_BYTE) {
    return false;
  }
  let known = 0;
  while (offset + 6 <= binary.length) {
    if (binary[offset] === DVB_STUFFING) break;
    if (binary[offset] !== DVB_SYNC_BYTE) break;
    const segmentType = binary[offset + 1];
    const length = binary[offset + 4] << 8 | binary[offset + 5];
    const total = 6 + length;
    if (offset + total > binary.length) break;
    if (isKnownDvbSegmentType(segmentType)) {
      known += 1;
      if (known >= 2 || segmentType === DVB_PAGE_COMPOSITION) {
        return true;
      }
    }
    offset += total;
  }
  return known > 0;
}
function looksLikeMpegPesDvb(binary) {
  const limit = Math.min(binary.length - 9, 65536);
  for (let index = 0; index <= limit; index += 1) {
    if (binary[index] !== 0 || binary[index + 1] !== 0 || binary[index + 2] !== 1 || binary[index + 3] !== 189) {
      continue;
    }
    const packetLength = binary[index + 4] << 8 | binary[index + 5];
    const total = 6 + packetLength;
    if (index + total > binary.length || total < 9) continue;
    const headerDataLength = binary[index + 8];
    const payloadStart = index + 9 + headerDataLength;
    if (payloadStart >= index + total) continue;
    if (looksLikeDvbPayload(binary.subarray(payloadStart, index + total))) {
      return true;
    }
  }
  return false;
}
function looksLikeDvbBinary(binary) {
  if (binary.length >= 10 && binary[0] === 68 && binary[1] === 86) {
    const payloadLen = (binary[6] << 24 | binary[7] << 16 | binary[8] << 8 | binary[9]) >>> 0;
    if (payloadLen > 0 && binary.length >= 10 + Math.min(payloadLen, 64)) {
      if (looksLikeDvbPayload(binary.subarray(10))) return true;
    }
  }
  if (looksLikeMpegPesDvb(binary)) return true;
  return looksLikeDvbPayload(binary);
}
var EBML_HEADER_ID = 440786851;
var EBML_DOC_TYPE_ID = 17026;
var EBML_SEGMENT_ID = 408125543;
var EBML_TRACKS_ID = 374648427;
var EBML_TRACK_ENTRY_ID = 174;
var EBML_TRACK_TYPE_ID = 131;
var EBML_CODEC_ID = 134;
var MATROSKA_SUBTITLE_TRACK_TYPE = 17;
var MATROSKA_VOBSUB_CODEC_ID = "S_VOBSUB";
var MAX_MKS_PROBE_BYTES = 1 << 20;
function readEbmlVint(binary, offset, keepMarker) {
  if (offset >= binary.length) return null;
  const firstByte = binary[offset];
  if (firstByte === 0) return null;
  let mask = 128;
  let length = 1;
  while ((firstByte & mask) === 0) {
    mask >>= 1;
    length += 1;
    if (mask === 0 || length > 8) return null;
  }
  if (offset + length > binary.length) return null;
  let isUnknownSize = !keepMarker;
  let value = keepMarker ? firstByte : firstByte & mask - 1;
  for (let index = 1; index < length; index += 1) {
    value = value * 256 + binary[offset + index];
    if (!keepMarker && binary[offset + index] !== 255) {
      isUnknownSize = false;
    }
  }
  if (!keepMarker && (firstByte & mask - 1) !== mask - 1) {
    isUnknownSize = false;
  }
  return {
    value,
    length,
    isUnknownSize
  };
}
function readEbmlElementBounds(binary, offset, limit) {
  const id = readEbmlVint(binary, offset, true);
  if (!id) return null;
  const size = readEbmlVint(binary, offset + id.length, false);
  if (!size) return null;
  const dataStart = offset + id.length + size.length;
  if (dataStart > limit) return null;
  const dataEnd = size.isUnknownSize ? limit : Math.min(dataStart + size.value, limit);
  return {
    id: id.value,
    dataStart,
    dataEnd
  };
}
function readMatroskaDocType(binary, limit) {
  const header = readEbmlElementBounds(binary, 0, limit);
  if (!header || header.id !== EBML_HEADER_ID) return null;
  let offset = header.dataStart;
  while (offset < header.dataEnd) {
    const element = readEbmlElementBounds(binary, offset, header.dataEnd);
    if (!element) return null;
    if (element.id === EBML_DOC_TYPE_ID) {
      return new TextDecoder("ascii").decode(binary.subarray(element.dataStart, element.dataEnd)).toLowerCase();
    }
    offset = element.dataEnd;
  }
  return null;
}
function readAscii(binary, start, end) {
  return new TextDecoder("ascii").decode(binary.subarray(start, end));
}
function hasVobSubTrack(binary, headerEnd, limit) {
  let offset = headerEnd;
  while (offset < limit) {
    const element = readEbmlElementBounds(binary, offset, limit);
    if (!element) return false;
    if (element.id === EBML_SEGMENT_ID) {
      return segmentHasVobSubTrack(binary, element.dataStart, element.dataEnd);
    }
    offset = element.dataEnd;
  }
  return false;
}
function segmentHasVobSubTrack(binary, start, end) {
  let offset = start;
  while (offset < end) {
    const element = readEbmlElementBounds(binary, offset, end);
    if (!element) return false;
    if (element.id === EBML_TRACKS_ID) {
      return tracksContainVobSubTrack(binary, element.dataStart, element.dataEnd);
    }
    offset = element.dataEnd;
  }
  return false;
}
function tracksContainVobSubTrack(binary, start, end) {
  let offset = start;
  while (offset < end) {
    const element = readEbmlElementBounds(binary, offset, end);
    if (!element) return false;
    if (element.id === EBML_TRACK_ENTRY_ID && trackEntryIsVobSub(binary, element.dataStart, element.dataEnd)) {
      return true;
    }
    offset = element.dataEnd;
  }
  return false;
}
function trackEntryIsVobSub(binary, start, end) {
  let offset = start;
  let trackType = null;
  let codecId = null;
  while (offset < end) {
    const element = readEbmlElementBounds(binary, offset, end);
    if (!element) return false;
    if (element.id === EBML_TRACK_TYPE_ID) {
      trackType = 0;
      for (let index = element.dataStart; index < element.dataEnd; index += 1) {
        trackType = trackType * 256 + binary[index];
      }
    } else if (element.id === EBML_CODEC_ID) {
      codecId = readAscii(binary, element.dataStart, element.dataEnd);
    }
    offset = element.dataEnd;
  }
  return trackType === MATROSKA_SUBTITLE_TRACK_TYPE && codecId === MATROSKA_VOBSUB_CODEC_ID;
}
function looksLikeMksBinary(binary) {
  const probeLength = Math.min(binary.length, MAX_MKS_PROBE_BYTES);
  if (probeLength < 4) return false;
  const docType = readMatroskaDocType(binary, probeLength);
  if (docType !== "matroska") return false;
  const header = readEbmlElementBounds(binary, 0, probeLength);
  if (!header || header.id !== EBML_HEADER_ID) return false;
  return hasVobSubTrack(binary, header.dataEnd, probeLength);
}
function looksLikeVobSubBinary(binary) {
  const limit = Math.min(binary.length - 3, 65536);
  for (let index = 0; index <= limit; index++) {
    if (binary[index] !== 0 || binary[index + 1] !== 0 || binary[index + 2] !== 1) {
      continue;
    }
    const streamId = binary[index + 3];
    if (streamId === 186 || streamId === 189 || streamId === 190) {
      return true;
    }
  }
  return false;
}
function isMksSource(source) {
  const fileHint = [
    source.fileName,
    source.subUrl
  ].find(Boolean)?.toLowerCase();
  if (fileHint?.endsWith(".mks")) return true;
  const binary = toBinaryView(source.data ?? source.subData);
  return binary ? looksLikeMksBinary(binary) : false;
}
function binarySearchTimestamp(timestamps, timeMs) {
  const len = timestamps.length;
  if (len === 0) return -1;
  let left = 0;
  let right = len - 1;
  let result = -1;
  while (left <= right) {
    const mid = left + right >>> 1;
    if (timestamps[mid] <= timeMs) {
      result = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return result;
}
function convertFrameData(frame) {
  const compositionData = frame.compositions.flatMap((comp) => {
    const trimmed = trimTransparentImageData(comp.rgba, comp.width, comp.height);
    if (!trimmed) return [];
    return {
      pixelData: trimmed.pixelData,
      x: comp.x + trimmed.offsetX,
      y: comp.y + trimmed.offsetY
    };
  });
  return {
    width: frame.width,
    height: frame.height,
    compositionData
  };
}
function trimTransparentImageData(pixels, width, height) {
  const clampedPixels = toClampedView(pixels);
  if (width <= 0 || height <= 0 || clampedPixels.length !== width * height * 4) {
    return null;
  }
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let index = 3; index < clampedPixels.length; index += 4) {
    if (clampedPixels[index] === 0) continue;
    const pixelIndex = index - 3 >> 2;
    const y = Math.floor(pixelIndex / width);
    const x = pixelIndex - y * width;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  if (maxX < minX || maxY < minY) {
    return null;
  }
  if (minX === 0 && minY === 0 && maxX === width - 1 && maxY === height - 1) {
    const imageDataPixels = clampedPixels;
    return {
      pixelData: new ImageData(imageDataPixels, width, height),
      offsetX: 0,
      offsetY: 0
    };
  }
  const trimmedWidth = maxX - minX + 1;
  const trimmedHeight = maxY - minY + 1;
  const trimmedPixels = new Uint8ClampedArray(trimmedWidth * trimmedHeight * 4);
  for (let y = 0; y < trimmedHeight; y++) {
    const sourceStart = ((minY + y) * width + minX) * 4;
    const sourceEnd = sourceStart + trimmedWidth * 4;
    trimmedPixels.set(clampedPixels.subarray(sourceStart, sourceEnd), y * trimmedWidth * 4);
  }
  return {
    pixelData: new ImageData(trimmedPixels, trimmedWidth, trimmedHeight),
    offsetX: minX,
    offsetY: minY
  };
}
function getSubtitleBounds(data) {
  if (data.compositionData.length === 0) return null;
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const comp of data.compositionData) {
    minX = Math.min(minX, comp.x);
    minY = Math.min(minY, comp.y);
    maxX = Math.max(maxX, comp.x + comp.pixelData.width);
    maxY = Math.max(maxY, comp.y + comp.pixelData.height);
  }
  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return null;
  }
  return {
    x: minX,
    y: minY,
    width: Math.max(0, maxX - minX),
    height: Math.max(0, maxY - minY)
  };
}
function setCachedFrame(state, index, frame, renderIssue = null) {
  if (state.frameCache.has(index)) {
    state.frameCache.delete(index);
  }
  if (state.renderIssues.has(index)) {
    state.renderIssues.delete(index);
  }
  state.frameCache.set(index, frame);
  state.renderIssues.set(index, renderIssue);
  while (state.frameCache.size > state.cacheLimit) {
    const oldestKey = state.frameCache.keys().next().value;
    if (oldestKey === void 0) break;
    state.frameCache.delete(oldestKey);
    state.renderIssues.delete(oldestKey);
  }
}
function setCacheLimit(state, cacheLimit) {
  state.cacheLimit = Math.max(0, Math.floor(cacheLimit));
  while (state.frameCache.size > state.cacheLimit) {
    const oldestKey = state.frameCache.keys().next().value;
    if (oldestKey === void 0) break;
    state.frameCache.delete(oldestKey);
    state.renderIssues.delete(oldestKey);
  }
  return state.cacheLimit;
}
function createWorkerSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `libbitsub-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
function detectSubtitleFormat(source) {
  if (source.idxContent || source.idxUrl) return "vobsub";
  const fileHint = [
    source.fileName,
    source.subUrl
  ].find(Boolean)?.toLowerCase();
  if (fileHint?.endsWith(".idx")) return "vobsub";
  if (fileHint?.endsWith(".mks")) return "vobsub";
  if (fileHint?.endsWith(".sup") || fileHint?.endsWith(".pgs")) return "pgs";
  if (fileHint?.endsWith(".dvb")) return "dvb";
  const binary = toBinaryView(source.data ?? source.subData);
  if (!binary) {
    if (fileHint?.endsWith(".sub")) return "vobsub";
    return null;
  }
  if (looksLikePgsBinary(binary)) return "pgs";
  if (looksLikeDvbBinary(binary)) return "dvb";
  if (looksLikeMksBinary(binary)) return "vobsub";
  if (looksLikeVobSubBinary(binary)) return "vobsub";
  if (fileHint?.endsWith(".sub")) return "vobsub";
  return null;
}
function createWorkerState() {
  return {
    useWorker: isWorkerAvailable(),
    workerReady: false,
    sessionId: null,
    timestamps: new Float64Array(0),
    frameCache: /* @__PURE__ */ new Map(),
    renderIssues: /* @__PURE__ */ new Map(),
    pendingRenders: /* @__PURE__ */ new Map(),
    cacheLimit: 24,
    metadata: null
  };
}

// deno:https://jsr.io/@altq/libbitsub/1.12.1/src/ts/frame-export.ts
function blendSourceOver(dst, dstIndex, src, srcIndex) {
  const srcAlpha = src[srcIndex + 3];
  if (srcAlpha === 0) return;
  if (srcAlpha === 255) {
    dst[dstIndex] = src[srcIndex];
    dst[dstIndex + 1] = src[srcIndex + 1];
    dst[dstIndex + 2] = src[srcIndex + 2];
    dst[dstIndex + 3] = 255;
    return;
  }
  const dstAlpha = dst[dstIndex + 3];
  if (dstAlpha === 0) {
    dst[dstIndex] = src[srcIndex];
    dst[dstIndex + 1] = src[srcIndex + 1];
    dst[dstIndex + 2] = src[srcIndex + 2];
    dst[dstIndex + 3] = srcAlpha;
    return;
  }
  const srcAlphaNorm = srcAlpha / 255;
  const dstAlphaNorm = dstAlpha / 255;
  const outAlphaNorm = srcAlphaNorm + dstAlphaNorm * (1 - srcAlphaNorm);
  if (outAlphaNorm <= 0) {
    dst[dstIndex] = 0;
    dst[dstIndex + 1] = 0;
    dst[dstIndex + 2] = 0;
    dst[dstIndex + 3] = 0;
    return;
  }
  const srcRed = src[srcIndex] * srcAlphaNorm;
  const srcGreen = src[srcIndex + 1] * srcAlphaNorm;
  const srcBlue = src[srcIndex + 2] * srcAlphaNorm;
  const dstRed = dst[dstIndex] * dstAlphaNorm;
  const dstGreen = dst[dstIndex + 1] * dstAlphaNorm;
  const dstBlue = dst[dstIndex + 2] * dstAlphaNorm;
  dst[dstIndex] = Math.round((srcRed + dstRed * (1 - srcAlphaNorm)) / outAlphaNorm);
  dst[dstIndex + 1] = Math.round((srcGreen + dstGreen * (1 - srcAlphaNorm)) / outAlphaNorm);
  dst[dstIndex + 2] = Math.round((srcBlue + dstBlue * (1 - srcAlphaNorm)) / outAlphaNorm);
  dst[dstIndex + 3] = Math.round(outAlphaNorm * 255);
}
function renderFrameData(frame, options = {}) {
  const crop = options.crop ?? "bounds";
  const bounds = getSubtitleBounds(frame);
  if (!bounds && crop === "bounds") {
    return null;
  }
  const offsetX = crop === "screen" ? 0 : bounds?.x ?? 0;
  const offsetY = crop === "screen" ? 0 : bounds?.y ?? 0;
  const targetWidth = Math.max(1, crop === "screen" ? frame.width : bounds?.width ?? 1);
  const targetHeight = Math.max(1, crop === "screen" ? frame.height : bounds?.height ?? 1);
  const output = new Uint8ClampedArray(targetWidth * targetHeight * 4);
  for (const composition of frame.compositionData) {
    const src = composition.pixelData.data;
    const srcWidth = composition.pixelData.width;
    const srcHeight = composition.pixelData.height;
    if (srcWidth <= 0 || srcHeight <= 0) continue;
    const dstX = composition.x - offsetX;
    const dstY = composition.y - offsetY;
    const startX = Math.max(0, dstX);
    const startY = Math.max(0, dstY);
    const endX = Math.min(targetWidth, dstX + srcWidth);
    const endY = Math.min(targetHeight, dstY + srcHeight);
    if (startX >= endX || startY >= endY) continue;
    for (let y = startY; y < endY; y += 1) {
      const srcY = y - dstY;
      for (let x = startX; x < endX; x += 1) {
        const srcX = x - dstX;
        const srcIndex = (srcY * srcWidth + srcX) * 4;
        const dstIndex = (y * targetWidth + x) * 4;
        blendSourceOver(output, dstIndex, src, srcIndex);
      }
    }
  }
  return {
    imageData: new ImageData(output, targetWidth, targetHeight),
    bounds,
    offsetX,
    offsetY,
    screenWidth: frame.width,
    screenHeight: frame.height,
    crop,
    compositionCount: frame.compositionData.length
  };
}

// deno:https://jsr.io/@altq/libbitsub/1.12.1/src/ts/parsers.ts
var PgsParser2 = class {
  parser = null;
  timestamps = new Float64Array(0);
  cueMetadataCache = /* @__PURE__ */ new Map();
  debug;
  onWarning;
  constructor(options = {}) {
    const wasm2 = getWasm();
    this.parser = new wasm2.PgsParser();
    this.debug = Boolean(options.debug);
    this.onWarning = options.onWarning;
  }
  load(data) {
    try {
      if (!this.parser) throw new Error("Parser not initialized");
      const count = this.parser.parse(data);
      this.timestamps = this.parser.getTimestamps();
      this.cueMetadataCache.clear();
      return count;
    } catch (error) {
      throw normalizeSubtitleError(error, {
        format: "pgs"
      });
    }
  }
  reset() {
    this.parser?.reset();
    this.timestamps = new Float64Array(0);
    this.cueMetadataCache.clear();
  }
  feed(data) {
    try {
      if (!this.parser) throw new Error("Parser not initialized");
      const added = this.parser.feed(data);
      if (added > 0 || this.timestamps.length !== this.parser.count) {
        this.timestamps = this.parser.getTimestamps();
        this.cueMetadataCache.clear();
      }
      return added;
    } catch (error) {
      throw normalizeSubtitleError(error, {
        format: "pgs"
      });
    }
  }
  finishFeed() {
    try {
      if (!this.parser) throw new Error("Parser not initialized");
      const count = this.parser.finishFeed();
      this.timestamps = this.parser.getTimestamps();
      return count;
    } catch (error) {
      throw normalizeSubtitleError(error, {
        format: "pgs"
      });
    }
  }
  get pendingLen() {
    return this.parser?.pendingLen ?? 0;
  }
  /**
   * Get all timestamps in milliseconds.
   */
  getTimestamps() {
    return this.timestamps;
  }
  /**
   * Get the number of display sets.
   */
  get count() {
    return this.parser?.count ?? 0;
  }
  /**
   * Find the display set index for a given timestamp in seconds.
   */
  findIndexAtTimestamp(timeSeconds) {
    if (!this.parser) return -1;
    return this.parser.findIndexAtTimestamp(timeSeconds * 1e3);
  }
  /**
   * Render subtitle at the given index.
   */
  renderAtIndex(index) {
    if (!this.parser) return void 0;
    const frame = this.parser.renderAtIndex(index);
    if (!frame) {
      const warning = warningFromRenderIssue(this.getLastRenderIssue(), {
        format: "pgs",
        cueIndex: index
      });
      if (warning) this.emitWarning(warning);
      return void 0;
    }
    return this.convertFrame(frame);
  }
  getLastRenderIssue() {
    const issue = this.parser?.lastRenderIssue?.trim();
    return issue ? issue : null;
  }
  /** Get parser-level metadata. */
  getMetadata() {
    return {
      format: "pgs",
      cueCount: this.count,
      screenWidth: this.parser?.screenWidth ?? 0,
      screenHeight: this.parser?.screenHeight ?? 0
    };
  }
  /** Get cue metadata for the given index. */
  getCueMetadata(index) {
    if (!this.parser || index < 0 || index >= this.count) return null;
    if (this.cueMetadataCache.has(index)) return this.cueMetadataCache.get(index) ?? null;
    const startTime = this.parser.getCueStartTime(index);
    const endTime = this.parser.getCueEndTime(index);
    const frame = this.renderAtIndex(index);
    const cueMetadata = {
      index,
      format: "pgs",
      startTime,
      endTime,
      duration: Math.max(0, endTime - startTime),
      screenWidth: this.parser.screenWidth,
      screenHeight: this.parser.screenHeight,
      bounds: frame ? getSubtitleBounds(frame) : null,
      compositionCount: this.parser.getCueCompositionCount(index),
      paletteId: this.parser.getCuePaletteId(index),
      compositionState: this.parser.getCueCompositionState(index)
    };
    this.cueMetadataCache.set(index, cueMetadata);
    return cueMetadata;
  }
  /**
   * Render subtitle at the given timestamp in seconds.
   */
  renderAtTimestamp(timeSeconds) {
    const index = this.findIndexAtTimestamp(timeSeconds);
    if (index < 0) return void 0;
    return this.renderAtIndex(index);
  }
  /**
   * Render flattened frame pixels at the given index.
   */
  renderFrameDataAtIndex(index, options = {}) {
    const frame = this.renderAtIndex(index);
    return frame ? renderFrameData(frame, options) ?? void 0 : void 0;
  }
  /**
   * Render flattened frame pixels at the given timestamp in seconds.
   */
  renderFrameDataAtTimestamp(timeSeconds, options = {}) {
    const frame = this.renderAtTimestamp(timeSeconds);
    return frame ? renderFrameData(frame, options) ?? void 0 : void 0;
  }
  /**
   * Convert WASM frame to SubtitleData.
   */
  convertFrame(frame) {
    const compositionData = [];
    for (let i = 0; i < frame.compositionCount; i++) {
      const comp = frame.getComposition(i);
      if (!comp) continue;
      const rgba = comp.getRgba();
      const expectedLength = comp.width * comp.height * 4;
      if (rgba.length !== expectedLength || comp.width === 0 || comp.height === 0) {
        this.emitWarning(createSubtitleWarning("INVALID_FRAME_DATA", "Invalid PGS composition buffer dimensions during frame conversion.", {
          format: "pgs",
          details: {
            expectedLength,
            actualLength: rgba.length,
            width: comp.width,
            height: comp.height
          }
        }));
        continue;
      }
      const trimmed = trimTransparentImageData(rgba, comp.width, comp.height);
      if (!trimmed) {
        continue;
      }
      compositionData.push({
        pixelData: trimmed.pixelData,
        x: comp.x + trimmed.offsetX,
        y: comp.y + trimmed.offsetY
      });
    }
    return {
      width: frame.width,
      height: frame.height,
      compositionData
    };
  }
  /**
   * Clear internal caches.
   */
  clearCache() {
    this.parser?.clearCache();
    this.cueMetadataCache.clear();
  }
  /**
   * Dispose of resources.
   */
  dispose() {
    this.parser?.free();
    this.parser = null;
    this.timestamps = new Float64Array(0);
    this.cueMetadataCache.clear();
  }
  emitWarning(warning) {
    this.onWarning?.(warning);
    if (this.debug && !this.onWarning) {
      console.warn(formatSubtitleWarningForConsole(warning), warning.details ?? {});
    }
  }
};
var DvbParser2 = class {
  parser = null;
  timestamps = new Float64Array(0);
  endTimestamps = new Float64Array(0);
  cueMetadataCache = /* @__PURE__ */ new Map();
  debug;
  onWarning;
  constructor(options = {}) {
    const wasm2 = getWasm();
    this.parser = new wasm2.DvbParser();
    this.debug = Boolean(options.debug);
    this.onWarning = options.onWarning;
  }
  load(data) {
    try {
      if (!this.parser) throw new Error("Parser not initialized");
      const count = this.parser.parse(data);
      this.timestamps = this.parser.getTimestamps();
      this.endTimestamps = this.parser.getEndTimestamps();
      this.cueMetadataCache.clear();
      return count;
    } catch (error) {
      throw normalizeSubtitleError(error, {
        format: "dvb"
      });
    }
  }
  reset() {
    this.parser?.reset();
    this.timestamps = new Float64Array(0);
    this.endTimestamps = new Float64Array(0);
    this.cueMetadataCache.clear();
  }
  feed(data) {
    try {
      if (!this.parser) throw new Error("Parser not initialized");
      const added = this.parser.feed(data);
      if (added > 0 || this.timestamps.length !== this.parser.count) {
        this.timestamps = this.parser.getTimestamps();
        this.endTimestamps = this.parser.getEndTimestamps();
        this.cueMetadataCache.clear();
      }
      return added;
    } catch (error) {
      throw normalizeSubtitleError(error, {
        format: "dvb"
      });
    }
  }
  finishFeed() {
    try {
      if (!this.parser) throw new Error("Parser not initialized");
      const previousCount = this.parser.count;
      const count = this.parser.finishFeed();
      this.timestamps = this.parser.getTimestamps();
      this.endTimestamps = this.parser.getEndTimestamps();
      if (count !== previousCount) this.cueMetadataCache.clear();
      return count;
    } catch (error) {
      throw normalizeSubtitleError(error, {
        format: "dvb"
      });
    }
  }
  get pendingLen() {
    return this.parser?.pendingLen ?? 0;
  }
  getTimestamps() {
    return this.timestamps;
  }
  getEndTimestamps() {
    return this.endTimestamps;
  }
  get count() {
    return this.parser?.count ?? 0;
  }
  findIndexAtTimestamp(timeSeconds) {
    if (!this.parser) return -1;
    return this.parser.findIndexAtTimestamp(timeSeconds * 1e3);
  }
  renderAtIndex(index) {
    if (!this.parser) return void 0;
    const frame = this.parser.renderAtIndex(index);
    if (!frame) {
      const warning = warningFromRenderIssue(this.getLastRenderIssue(), {
        format: "dvb",
        cueIndex: index
      });
      if (warning) this.emitWarning(warning);
      return void 0;
    }
    return this.convertFrame(frame);
  }
  getLastRenderIssue() {
    const issue = this.parser?.lastRenderIssue?.trim();
    return issue ? issue : null;
  }
  getMetadata() {
    return {
      format: "dvb",
      cueCount: this.count,
      screenWidth: this.parser?.screenWidth ?? 0,
      screenHeight: this.parser?.screenHeight ?? 0
    };
  }
  getCueMetadata(index) {
    if (!this.parser || index < 0 || index >= this.count) return null;
    if (this.cueMetadataCache.has(index)) return this.cueMetadataCache.get(index) ?? null;
    const startTime = this.parser.getCueStartTime(index);
    const endTime = this.parser.getCueEndTime(index);
    const frame = this.renderAtIndex(index);
    const cueMetadata = {
      index,
      format: "dvb",
      startTime,
      endTime,
      duration: Math.max(0, endTime - startTime),
      screenWidth: this.parser.screenWidth,
      screenHeight: this.parser.screenHeight,
      bounds: frame ? getSubtitleBounds(frame) : null,
      compositionCount: this.parser.getCueCompositionCount(index),
      compositionState: this.parser.getCuePageState(index)
    };
    this.cueMetadataCache.set(index, cueMetadata);
    return cueMetadata;
  }
  renderAtTimestamp(timeSeconds) {
    const index = this.findIndexAtTimestamp(timeSeconds);
    if (index < 0) return void 0;
    return this.renderAtIndex(index);
  }
  renderFrameDataAtIndex(index, options = {}) {
    const frame = this.renderAtIndex(index);
    return frame ? renderFrameData(frame, options) ?? void 0 : void 0;
  }
  renderFrameDataAtTimestamp(timeSeconds, options = {}) {
    const frame = this.renderAtTimestamp(timeSeconds);
    return frame ? renderFrameData(frame, options) ?? void 0 : void 0;
  }
  convertFrame(frame) {
    const compositionData = [];
    for (let i = 0; i < frame.compositionCount; i++) {
      const comp = frame.getComposition(i);
      if (!comp) continue;
      const rgba = comp.getRgba();
      const expectedLength = comp.width * comp.height * 4;
      if (rgba.length !== expectedLength || comp.width === 0 || comp.height === 0) {
        this.emitWarning(createSubtitleWarning("INVALID_FRAME_DATA", "Invalid DVB composition buffer dimensions during frame conversion.", {
          format: "dvb",
          details: {
            expectedLength,
            actualLength: rgba.length,
            width: comp.width,
            height: comp.height
          }
        }));
        continue;
      }
      const trimmed = trimTransparentImageData(rgba, comp.width, comp.height);
      if (!trimmed) continue;
      compositionData.push({
        pixelData: trimmed.pixelData,
        x: comp.x + trimmed.offsetX,
        y: comp.y + trimmed.offsetY
      });
    }
    return {
      width: frame.width,
      height: frame.height,
      compositionData
    };
  }
  clearCache() {
    this.parser?.clearCache();
    this.cueMetadataCache.clear();
  }
  dispose() {
    this.parser?.free();
    this.parser = null;
    this.timestamps = new Float64Array(0);
    this.endTimestamps = new Float64Array(0);
    this.cueMetadataCache.clear();
  }
  emitWarning(warning) {
    this.onWarning?.(warning);
    if (this.debug && !this.onWarning) {
      console.warn(formatSubtitleWarningForConsole(warning), warning.details ?? {});
    }
  }
};
var VobSubParserLowLevel = class {
  parser = null;
  timestamps = new Float64Array(0);
  cueMetadataCache = /* @__PURE__ */ new Map();
  debug;
  onWarning;
  constructor(options = {}) {
    const wasm2 = getWasm();
    this.parser = new wasm2.VobSubParser();
    this.debug = Boolean(options.debug);
    this.onWarning = options.onWarning;
  }
  loadFromData(idxContent, subData) {
    try {
      if (!this.parser) throw new Error("Parser not initialized");
      this.parser.loadFromData(idxContent, subData);
      this.timestamps = this.parser.getTimestamps();
      this.cueMetadataCache.clear();
      if (this.timestamps.length === 0 && idxContent.trim().length > 0) {
        throw createSubtitleDiagnosticError("BAD_IDX", "IDX metadata did not yield any subtitle timestamps.", {
          format: "vobsub"
        });
      }
    } catch (error) {
      throw normalizeSubtitleError(error, {
        format: "vobsub",
        fallbackCode: "BAD_IDX"
      });
    }
  }
  loadFromIdx(idxContent) {
    try {
      if (!this.parser) throw new Error("Parser not initialized");
      this.parser.loadFromIdx(idxContent);
      this.timestamps = this.parser.getTimestamps();
      this.cueMetadataCache.clear();
      if (this.timestamps.length === 0 && idxContent.trim().length > 0) {
        throw createSubtitleDiagnosticError("BAD_IDX", "IDX metadata did not yield any subtitle timestamps.", {
          format: "vobsub"
        });
      }
    } catch (error) {
      throw normalizeSubtitleError(error, {
        format: "vobsub",
        fallbackCode: "BAD_IDX"
      });
    }
  }
  attachSubData(subData) {
    try {
      if (!this.parser) throw new Error("Parser not initialized");
      this.parser.attachSubData(subData);
      this.cueMetadataCache.clear();
    } catch (error) {
      throw normalizeSubtitleError(error, {
        format: "vobsub"
      });
    }
  }
  get hasSubData() {
    return this.parser?.hasSubData ?? false;
  }
  /**
   * Load VobSub from SUB file only.
   */
  loadFromSubOnly(subData) {
    try {
      if (!this.parser) throw new Error("Parser not initialized");
      this.parser.loadFromSubOnly(subData);
      this.timestamps = this.parser.getTimestamps();
      this.cueMetadataCache.clear();
    } catch (error) {
      throw normalizeSubtitleError(error, {
        format: "vobsub"
      });
    }
  }
  /**
   * Load VobSub from an .mks Matroska subtitle container.
   */
  loadFromMks(mksData) {
    try {
      if (!this.parser) throw new Error("Parser not initialized");
      this.parser.loadFromMks(mksData);
      this.timestamps = this.parser.getTimestamps();
      this.cueMetadataCache.clear();
    } catch (error) {
      throw normalizeSubtitleError(error, {
        format: "vobsub"
      });
    }
  }
  /**
   * Get all timestamps in milliseconds.
   */
  getTimestamps() {
    return this.timestamps;
  }
  /**
   * Get the number of subtitle entries.
   */
  get count() {
    return this.parser?.count ?? 0;
  }
  /**
   * Find the subtitle index for a given timestamp in seconds.
   */
  findIndexAtTimestamp(timeSeconds) {
    if (!this.parser) return -1;
    return this.parser.findIndexAtTimestamp(timeSeconds * 1e3);
  }
  /**
   * Render subtitle at the given index.
   */
  renderAtIndex(index) {
    if (!this.parser) return void 0;
    const frame = this.parser.renderAtIndex(index);
    if (!frame) {
      const warning = warningFromRenderIssue(this.getLastRenderIssue(), {
        format: "vobsub",
        cueIndex: index
      });
      if (warning) this.emitWarning(warning);
      return void 0;
    }
    return this.convertFrame(frame);
  }
  getLastRenderIssue() {
    const issue = this.parser?.lastRenderIssue?.trim();
    return issue ? issue : null;
  }
  /** Get parser-level metadata. */
  getMetadata() {
    return {
      format: "vobsub",
      cueCount: this.count,
      screenWidth: this.parser?.screenWidth ?? 0,
      screenHeight: this.parser?.screenHeight ?? 0,
      language: this.parser?.language || null,
      trackId: this.parser?.trackId || null,
      hasIdxMetadata: this.parser?.hasIdxMetadata ?? false
    };
  }
  /** Get cue metadata for the given index. */
  getCueMetadata(index) {
    if (!this.parser || index < 0 || index >= this.count) return null;
    if (this.cueMetadataCache.has(index)) return this.cueMetadataCache.get(index) ?? null;
    const startTime = this.parser.getCueStartTime(index);
    const endTime = this.parser.getCueEndTime(index);
    const frame = this.renderAtIndex(index);
    const cueMetadata = {
      index,
      format: "vobsub",
      startTime,
      endTime,
      duration: this.parser.getCueDuration(index),
      screenWidth: this.parser.screenWidth,
      screenHeight: this.parser.screenHeight,
      bounds: frame ? getSubtitleBounds(frame) : null,
      compositionCount: frame?.compositionData.length ?? 0,
      language: this.parser.language || null,
      trackId: this.parser.trackId || null,
      filePosition: this.parser.getCueFilePosition(index)
    };
    this.cueMetadataCache.set(index, cueMetadata);
    return cueMetadata;
  }
  /**
   * Render subtitle at the given timestamp in seconds.
   */
  renderAtTimestamp(timeSeconds) {
    const index = this.findIndexAtTimestamp(timeSeconds);
    if (index < 0) return void 0;
    return this.renderAtIndex(index);
  }
  /**
   * Render flattened frame pixels at the given index.
   */
  renderFrameDataAtIndex(index, options = {}) {
    const frame = this.renderAtIndex(index);
    return frame ? renderFrameData(frame, options) ?? void 0 : void 0;
  }
  /**
   * Render flattened frame pixels at the given timestamp in seconds.
   */
  renderFrameDataAtTimestamp(timeSeconds, options = {}) {
    const frame = this.renderAtTimestamp(timeSeconds);
    return frame ? renderFrameData(frame, options) ?? void 0 : void 0;
  }
  /**
   * Convert WASM frame to SubtitleData.
   */
  convertFrame(frame) {
    const rgba = frame.getRgba();
    const expectedLength = frame.width * frame.height * 4;
    if (rgba.length !== expectedLength || frame.width === 0 || frame.height === 0) {
      this.emitWarning(createSubtitleWarning("INVALID_FRAME_DATA", "Invalid VobSub frame buffer dimensions during frame conversion.", {
        format: "vobsub",
        details: {
          expectedLength,
          actualLength: rgba.length,
          width: frame.width,
          height: frame.height
        }
      }));
      return {
        width: frame.screenWidth,
        height: frame.screenHeight,
        compositionData: []
      };
    }
    const trimmed = trimTransparentImageData(rgba, frame.width, frame.height);
    if (!trimmed) {
      return {
        width: frame.screenWidth,
        height: frame.screenHeight,
        compositionData: []
      };
    }
    return {
      width: frame.screenWidth,
      height: frame.screenHeight,
      compositionData: [
        {
          pixelData: trimmed.pixelData,
          x: frame.x + trimmed.offsetX,
          y: frame.y + trimmed.offsetY
        }
      ]
    };
  }
  /**
   * Clear internal caches.
   */
  clearCache() {
    this.parser?.clearCache();
    this.cueMetadataCache.clear();
  }
  /**
   * Enable or disable debanding filter.
   */
  setDebandEnabled(enabled) {
    this.parser?.setDebandEnabled(enabled);
  }
  /**
   * Set debanding threshold (0-255, default: 64).
   */
  setDebandThreshold(threshold) {
    this.parser?.setDebandThreshold(threshold);
  }
  /**
   * Set debanding sample range in pixels (1-64, default: 15).
   */
  setDebandRange(range) {
    this.parser?.setDebandRange(range);
  }
  /**
   * Check if debanding is enabled.
   */
  get debandEnabled() {
    return this.parser?.debandEnabled ?? true;
  }
  /**
   * Dispose of resources.
   */
  dispose() {
    this.parser?.free();
    this.parser = null;
    this.timestamps = new Float64Array(0);
    this.cueMetadataCache.clear();
  }
  emitWarning(warning) {
    this.onWarning?.(warning);
    if (this.debug && !this.onWarning) {
      console.warn(formatSubtitleWarningForConsole(warning), warning.details ?? {});
    }
  }
};

// deno:https://jsr.io/@altq/libbitsub/1.12.1/src/ts/range-loader.ts
var DEFAULT_RANGE_CHUNK_THRESHOLD = 2 * 1024 * 1024;
var DEFAULT_RANGE_CHUNK_SIZE = 512 * 1024;
function emitProgress(onProgress, loaded, total, rangeSupported, strategy) {
  if (!onProgress) return;
  onProgress({
    loaded,
    total,
    ratio: total && total > 0 ? Math.min(1, loaded / total) : null,
    rangeSupported,
    strategy
  });
}
function parseContentLength(header) {
  if (!header) return null;
  const value = Number(header);
  return Number.isFinite(value) && value >= 0 ? value : null;
}
function parseContentRangeTotal(header) {
  if (!header) return null;
  const match = /bytes\s+(?:\d+-\d+|\*)\/(\d+|\*)/i.exec(header);
  if (!match) return null;
  if (match[1] === "*") return null;
  return parseContentLength(match[1]);
}
function mergeHeaders(base, extra) {
  const headers = new Headers(base);
  if (extra) {
    const more = new Headers(extra);
    more.forEach((value, key) => headers.set(key, value));
  }
  return headers;
}
async function probeRangeSupport(url, options = {}) {
  const headers = mergeHeaders(options.headers, {
    Range: "bytes=0-0"
  });
  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
      signal: options.signal
    });
    if (response.status === 206) {
      const size = parseContentRangeTotal(response.headers.get("content-range")) ?? parseContentLength(response.headers.get("content-length"));
      try {
        await response.body?.cancel();
      } catch {
      }
      return {
        supportsRange: true,
        size,
        acceptRanges: response.headers.get("accept-ranges")
      };
    }
    if (response.ok) {
      const accept = response.headers.get("accept-ranges");
      const size = parseContentLength(response.headers.get("content-length"));
      try {
        await response.body?.cancel();
      } catch {
      }
      return {
        supportsRange: Boolean(accept && accept.toLowerCase() !== "none"),
        size,
        acceptRanges: accept
      };
    }
  } catch {
  }
  try {
    const head = await fetch(url, {
      method: "HEAD",
      headers: mergeHeaders(options.headers),
      signal: options.signal
    });
    if (!head.ok) {
      return {
        supportsRange: false,
        size: null,
        acceptRanges: null
      };
    }
    const accept = head.headers.get("accept-ranges");
    return {
      supportsRange: Boolean(accept && accept.toLowerCase() !== "none"),
      size: parseContentLength(head.headers.get("content-length")),
      acceptRanges: accept
    };
  } catch {
    return {
      supportsRange: false,
      size: null,
      acceptRanges: null
    };
  }
}
async function readResponseStream(response, totalHint, rangeSupported, strategy, onProgress, onChunk) {
  const total = totalHint ?? parseContentLength(response.headers.get("content-length"));
  if (!response.body || typeof response.body.getReader !== "function") {
    const buffer = new Uint8Array(await response.arrayBuffer());
    const progress = {
      loaded: buffer.byteLength,
      total: total ?? buffer.byteLength,
      ratio: 1,
      rangeSupported,
      strategy: strategy === "stream" ? "basic" : strategy
    };
    await onChunk?.(buffer, progress);
    onProgress?.(progress);
    return buffer;
  }
  const reader = response.body.getReader();
  const chunks = [];
  let loaded = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value || value.byteLength === 0) continue;
    const chunk = value instanceof Uint8Array ? value : new Uint8Array(value);
    chunks.push(chunk);
    loaded += chunk.byteLength;
    const progress = {
      loaded,
      total,
      ratio: total && total > 0 ? Math.min(1, loaded / total) : null,
      rangeSupported,
      strategy
    };
    await onChunk?.(chunk, progress);
    onProgress?.(progress);
  }
  const assembled = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    assembled.set(chunk, offset);
    offset += chunk.byteLength;
  }
  emitProgress(onProgress, assembled.byteLength, total ?? assembled.byteLength, rangeSupported, strategy);
  return assembled;
}
async function fetchByRangeChunks(url, size, options, onChunk) {
  const chunkSize = Math.max(1, Math.floor(options.rangeChunkSize ?? DEFAULT_RANGE_CHUNK_SIZE));
  const assembled = new Uint8Array(size);
  let loaded = 0;
  for (let start = 0; start < size; start += chunkSize) {
    const end = Math.min(size - 1, start + chunkSize - 1);
    const response = await fetch(url, {
      method: "GET",
      headers: mergeHeaders(options.headers, {
        Range: `bytes=${start}-${end}`
      }),
      signal: options.signal
    });
    if (response.status !== 206 && !(response.ok && start === 0 && end >= size - 1)) {
      throw new Error(`Failed to fetch subtitle range ${start}-${end}: ${response.status}`);
    }
    const buffer = new Uint8Array(await response.arrayBuffer());
    if (buffer.byteLength === 0) {
      throw new Error(`Empty subtitle range response for bytes=${start}-${end}`);
    }
    if (start + buffer.byteLength > size) {
      assembled.set(buffer.subarray(0, size - start), start);
      loaded = size;
    } else {
      assembled.set(buffer, start);
      loaded = start + buffer.byteLength;
    }
    const slice = assembled.subarray(start, loaded);
    const progress = {
      loaded,
      total: size,
      ratio: size > 0 ? Math.min(1, loaded / size) : null,
      rangeSupported: true,
      strategy: "range-chunks"
    };
    await onChunk?.(slice, progress);
    options.onProgress?.(progress);
  }
  return assembled;
}
async function fetchSubtitleAsset(url, options = {}, onChunk) {
  const preferRange = options.preferRange !== false;
  const threshold = options.rangeChunkThreshold ?? DEFAULT_RANGE_CHUNK_THRESHOLD;
  let rangeSupported = false;
  let knownSize = null;
  if (preferRange) {
    const probe = await probeRangeSupport(url, options);
    rangeSupported = probe.supportsRange;
    knownSize = probe.size;
    if (rangeSupported && knownSize != null && knownSize >= threshold) {
      const data2 = await fetchByRangeChunks(url, knownSize, options, onChunk);
      return {
        data: data2,
        strategy: "range-chunks",
        rangeSupported: true,
        total: knownSize
      };
    }
  }
  const response = await fetch(url, {
    method: "GET",
    headers: mergeHeaders(options.headers),
    signal: options.signal
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch subtitle: ${response.status}`);
  }
  const total = knownSize ?? parseContentLength(response.headers.get("content-length"));
  const strategy = response.body ? "stream" : "basic";
  const data = await readResponseStream(response, total, rangeSupported, strategy, options.onProgress, onChunk);
  return {
    data,
    strategy,
    rangeSupported,
    total: total ?? data.byteLength
  };
}
async function fetchSubtitleText(url, options = {}) {
  const { data } = await fetchSubtitleAsset(url, {
    ...options,
    rangeChunkThreshold: Number.POSITIVE_INFINITY,
    preferRange: false
  });
  return new TextDecoder("utf-8").decode(data);
}

// deno:https://jsr.io/@altq/libbitsub/1.12.1/src/ts/video-frame-scheduler.ts
var defaultAnimationFrameScheduler = {
  request: (callback) => requestAnimationFrame(callback),
  cancel: (handle) => cancelAnimationFrame(handle)
};
function supportsFrameAwareSync(video, enabled = true) {
  return enabled && typeof video.requestVideoFrameCallback === "function";
}
var VideoFrameScheduler = class {
  video;
  onFrame;
  animationFrames;
  animationFrameHandle;
  videoFrameHandle;
  generation;
  useVideoFrames;
  constructor(video, frameAware, onFrame, animationFrames = defaultAnimationFrameScheduler) {
    this.video = video;
    this.onFrame = onFrame;
    this.animationFrames = animationFrames;
    this.animationFrameHandle = null;
    this.videoFrameHandle = null;
    this.generation = 0;
    this.useVideoFrames = supportsFrameAwareSync(video, frameAware);
  }
  get mode() {
    return this.useVideoFrames ? "video-frame" : "animation-frame";
  }
  start() {
    this.stop();
    const generation = this.generation;
    this.schedule(generation);
  }
  stop() {
    this.generation++;
    if (this.videoFrameHandle !== null) {
      const cancelVideoFrameCallback = this.video.cancelVideoFrameCallback;
      if (typeof cancelVideoFrameCallback === "function") {
        try {
          cancelVideoFrameCallback.call(this.video, this.videoFrameHandle);
        } catch {
        }
      }
      this.videoFrameHandle = null;
    }
    if (this.animationFrameHandle !== null) {
      this.animationFrames.cancel(this.animationFrameHandle);
      this.animationFrameHandle = null;
    }
  }
  schedule(generation) {
    if (generation !== this.generation) return;
    if (this.useVideoFrames) {
      const requestVideoFrameCallback = this.video.requestVideoFrameCallback;
      if (typeof requestVideoFrameCallback === "function") {
        try {
          this.videoFrameHandle = requestVideoFrameCallback.call(this.video, (_now, metadata) => {
            this.videoFrameHandle = null;
            if (generation !== this.generation) return;
            const mediaTime = Number.isFinite(metadata.mediaTime) ? metadata.mediaTime : this.video.currentTime;
            try {
              this.onFrame({
                mediaTime,
                presentedFrames: Number.isFinite(metadata.presentedFrames) ? metadata.presentedFrames : null
              });
            } finally {
              this.schedule(generation);
            }
          });
          return;
        } catch {
          this.useVideoFrames = false;
        }
      } else {
        this.useVideoFrames = false;
      }
    }
    this.animationFrameHandle = this.animationFrames.request(() => {
      this.animationFrameHandle = null;
      if (generation !== this.generation) return;
      try {
        this.onFrame({
          mediaTime: this.video.currentTime,
          presentedFrames: null
        });
      } finally {
        this.schedule(generation);
      }
    });
  }
};

// deno:https://jsr.io/@altq/libbitsub/1.12.1/src/ts/renderers.ts
var DEFAULT_DISPLAY_SETTINGS = {
  scale: 1,
  aspectMode: "stretch",
  verticalOffset: 0,
  horizontalOffset: 0,
  horizontalAlign: "center",
  bottomPadding: 0,
  safeArea: 0,
  opacity: 1
};
function createTransferableBuffer(data, preserveSource) {
  if (!preserveSource && data.buffer instanceof ArrayBuffer && data.byteOffset === 0 && data.byteLength === data.buffer.byteLength) {
    return data.buffer;
  }
  return data.slice().buffer;
}
var BaseVideoSubtitleRenderer = class {
  video;
  format;
  subUrl;
  subContent;
  canvas = null;
  providedCanvas;
  requestedContainer;
  overlayContainer = null;
  ownsCanvas = false;
  devicePixelRatioCap;
  backendOption;
  ctx = null;
  frameScheduler = null;
  isLoaded = false;
  lastRenderedIndex = -1;
  lastRenderedTime = -1;
  disposed = false;
  resizeObserver = null;
  tempCanvas = null;
  tempCtx = null;
  lastRenderedData = null;
  lastCueIndex = null;
  currentCueMetadata = null;
  parserMetadata = null;
  /** Display settings for subtitle rendering */
  displaySettings = {
    ...DEFAULT_DISPLAY_SETTINGS
  };
  _timeOffset = 0;
  cacheLimit = 24;
  prefetchBefore = 0;
  prefetchAfter = 0;
  streamingLoad = true;
  rangeRequests = true;
  onEvent;
  onWarning;
  currentRendererBackend = null;
  debug;
  lastRenderInfo = null;
  loadedMetadataHandler = null;
  seekedHandler = null;
  initPromise = null;
  // WebGPU renderer (optional, falls back to WebGL2 then Canvas2D)
  webgpuRenderer = null;
  useWebGPU = false;
  onWebGPUFallback;
  // WebGL2 renderer (optional, falls back to Canvas2D)
  webgl2Renderer = null;
  useWebGL2 = false;
  onWebGL2Fallback;
  offscreenRenderOption;
  frameAwareSync;
  pendingWorkerOffscreen = false;
  useWorkerOffscreen = false;
  canvasPixelWidth = 1;
  canvasPixelHeight = 1;
  presentationToken = 0;
  offscreenAttachPromise = null;
  offscreenTransferPending = false;
  offscreenFrameMetadata = /* @__PURE__ */ new Map();
  lastSynchronizedTime = null;
  lastPresentedFrames = null;
  // Performance tracking
  perfStats = {
    framesRendered: 0,
    framesDropped: 0,
    renderTimes: [],
    lastRenderTime: 0,
    fpsTimestamps: [],
    lastFrameTime: 0
  };
  constructor(options, format) {
    this.video = options.video;
    this.format = format;
    this.subUrl = options.subUrl;
    this.subContent = options.subContent;
    this.providedCanvas = options.canvas ?? null;
    this.requestedContainer = options.container ?? null;
    this.devicePixelRatioCap = options.devicePixelRatioCap !== void 0 && Number.isFinite(options.devicePixelRatioCap) && options.devicePixelRatioCap > 0 ? options.devicePixelRatioCap : null;
    this.backendOption = options.backend ?? "auto";
    this.onWebGPUFallback = options.onWebGPUFallback;
    this.onWebGL2Fallback = options.onWebGL2Fallback;
    this.offscreenRenderOption = options.offscreenRender !== false;
    this.frameAwareSync = options.frameAwareSync !== false;
    this.onEvent = options.onEvent;
    this.onWarning = options.onWarning;
    this.debug = Boolean(options.debug);
    this.displaySettings = {
      ...DEFAULT_DISPLAY_SETTINGS,
      ...options.displaySettings
    };
    this.timeOffset = options.timeOffset ?? 0;
    this.cacheLimit = Math.max(0, Math.floor(options.cacheLimit ?? 24));
    this.prefetchBefore = Math.max(0, Math.floor(options.prefetchWindow?.before ?? 0));
    this.prefetchAfter = Math.max(0, Math.floor(options.prefetchWindow?.after ?? 0));
    this.streamingLoad = options.streamingLoad !== false;
    this.rangeRequests = options.rangeRequests !== false;
  }
  emitLoadProgress(format, progress, indexedCues) {
    this.emitEvent({
      type: "load-progress",
      format,
      loadedBytes: progress.loaded,
      totalBytes: progress.total,
      ratio: progress.ratio,
      strategy: progress.strategy,
      rangeSupported: progress.rangeSupported,
      indexedCues
    });
  }
  emitIndexed(format, metadata, partial) {
    this.emitEvent({
      type: "indexed",
      format,
      metadata,
      partial
    });
  }
  memoryProgress(byteLength) {
    return {
      loaded: byteLength,
      total: byteLength,
      ratio: 1,
      rangeSupported: false,
      strategy: "memory"
    };
  }
  /** Get current display settings */
  getDisplaySettings() {
    return {
      ...this.displaySettings
    };
  }
  /** Time offset in seconds added to the active video clock for subtitle lookup. */
  get timeOffset() {
    return this._timeOffset;
  }
  set timeOffset(value) {
    if (value === this._timeOffset) return;
    this._timeOffset = value;
    this.invalidatePresentation();
    this.lastSynchronizedTime = null;
    this.lastRenderedIndex = -1;
    this.lastRenderedTime = -1;
    this.renderPausedFrame();
  }
  /** Get cache-related diagnostics for the active renderer session. */
  getCacheStats() {
    const state = this.getWorkerRendererState();
    return {
      cacheLimit: this.cacheLimit,
      cachedFrames: state.frameCache.size,
      pendingRenders: state.pendingRenders.size,
      totalEntries: state.timestamps.length,
      usingWorker: state.useWorker && state.workerReady,
      workerReady: state.workerReady,
      sessionId: state.sessionId
    };
  }
  /** Get the most recent render attempt when debug mode is enabled. */
  getLastRenderInfo() {
    if (!this.lastRenderInfo) return null;
    return {
      ...this.lastRenderInfo,
      cache: {
        ...this.lastRenderInfo.cache
      },
      cue: this.lastRenderInfo.cue ? {
        ...this.lastRenderInfo.cue
      } : null
    };
  }
  /** Get parser metadata for the active subtitle track. */
  getMetadata() {
    return this.parserMetadata;
  }
  /** Get the most recently displayed cue metadata. */
  getCurrentCueMetadata() {
    return this.currentCueMetadata;
  }
  /** Get cue metadata for the specified index. */
  getCueMetadata(index) {
    return this.buildCueMetadata(index);
  }
  /** Get the configured frame-cache limit. */
  getCacheLimit() {
    return this.cacheLimit;
  }
  /** Get base stats common to all renderers */
  getBaseStats() {
    const now = performance.now();
    this.perfStats.fpsTimestamps = this.perfStats.fpsTimestamps.filter((t) => now - t < 1e3);
    const renderTimes = this.perfStats.renderTimes;
    const avgRenderTime = renderTimes.length > 0 ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length : 0;
    const maxRenderTime = renderTimes.length > 0 ? Math.max(...renderTimes) : 0;
    const minRenderTime = renderTimes.length > 0 ? Math.min(...renderTimes) : 0;
    return {
      framesRendered: this.perfStats.framesRendered,
      framesDropped: this.perfStats.framesDropped,
      avgRenderTime: Math.round(avgRenderTime * 100) / 100,
      maxRenderTime: Math.round(maxRenderTime * 100) / 100,
      minRenderTime: Math.round(minRenderTime * 100) / 100,
      lastRenderTime: Math.round(this.perfStats.lastRenderTime * 100) / 100,
      renderFps: this.perfStats.fpsTimestamps.length,
      currentIndex: this.lastRenderedIndex,
      syncMode: this.getSynchronizationMode()
    };
  }
  /** Get the active video synchronization clock. */
  getSynchronizationMode() {
    if (this.frameScheduler) return this.frameScheduler.mode;
    return supportsFrameAwareSync(this.video, this.frameAwareSync) ? "video-frame" : "animation-frame";
  }
  /** Set display settings and force re-render */
  setDisplaySettings(settings) {
    const nextSettings = {
      ...this.displaySettings,
      ...settings
    };
    nextSettings.scale = Math.max(0.1, Math.min(3, nextSettings.scale));
    if (![
      "stretch",
      "contain",
      "cover"
    ].includes(nextSettings.aspectMode)) {
      nextSettings.aspectMode = DEFAULT_DISPLAY_SETTINGS.aspectMode;
    }
    nextSettings.verticalOffset = Math.max(-50, Math.min(50, nextSettings.verticalOffset));
    nextSettings.horizontalOffset = Math.max(-50, Math.min(50, nextSettings.horizontalOffset));
    nextSettings.bottomPadding = Math.max(0, Math.min(50, nextSettings.bottomPadding));
    nextSettings.safeArea = Math.max(0, Math.min(25, nextSettings.safeArea));
    nextSettings.opacity = Math.max(0, Math.min(1, nextSettings.opacity));
    const changed = JSON.stringify(nextSettings) !== JSON.stringify(this.displaySettings);
    this.displaySettings = nextSettings;
    if (changed) {
      this.invalidatePresentation();
      this.lastRenderedIndex = -1;
      this.lastRenderedTime = -1;
      this.renderPausedFrame();
    }
  }
  /** Reset display settings to defaults */
  resetDisplaySettings() {
    this.displaySettings = {
      ...DEFAULT_DISPLAY_SETTINGS
    };
    this.invalidatePresentation();
    this.lastRenderedIndex = -1;
    this.lastRenderedTime = -1;
    this.renderPausedFrame();
  }
  /** Start initialization. */
  startInit() {
    this.initPromise = this.init();
    this.initPromise.catch((error) => {
      this.emitEvent({
        type: "error",
        format: this.format,
        error: normalizeSubtitleError(error, {
          format: this.format
        })
      });
    });
  }
  /** Wait for canvas, parser, and worker initialization before accepting pushed data. */
  async waitUntilInitialized() {
    await this.initPromise;
    if (this.disposed) {
      throw new Error(`${this.format.toUpperCase()} renderer has been disposed`);
    }
  }
  /** Re-run cue selection after a live stream mutation. */
  refreshStreamPresentation() {
    this.invalidatePresentation();
    this.lastRenderedIndex = -1;
    this.lastRenderedTime = -1;
    this.renderPausedFrame();
  }
  /** Clear the currently presented cue after a live stream reset. */
  clearStreamPresentation() {
    this.invalidatePresentation();
    this.lastSynchronizedTime = null;
    this.lastRenderedIndex = -1;
    this.lastRenderedTime = -1;
    this.lastRenderedData = null;
    this.lastCueIndex = null;
    this.currentCueMetadata = null;
    this.lastRenderInfo = null;
    this.offscreenFrameMetadata.clear();
    const state = this.getWorkerRendererState();
    if (this.useWorkerOffscreen && state.workerReady && state.sessionId) {
      sendToWorker({
        type: "clearOffscreenCanvas",
        sessionId: state.sessionId
      }).catch(() => {
      });
    } else if (this.useWebGPU && this.webgpuRenderer) {
      this.webgpuRenderer.clear();
    } else if (this.useWebGL2 && this.webgl2Renderer) {
      this.webgl2Renderer.clear();
    } else if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    this.emitEvent({
      type: "cue-change",
      cue: null
    });
  }
  /** Initialize the renderer. */
  async init() {
    await initWasm();
    this.createCanvas();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await this.loadSubtitles();
    await this.ensureWorkerOffscreenAttached();
    this.startRenderLoop();
  }
  shouldPreferWorkerOffscreen() {
    return !this.providedCanvas && this.offscreenRenderOption && canUseWorkerOffscreenRender();
  }
  isWorkerOffscreenPresent() {
    return this.useWorkerOffscreen;
  }
  getDefaultContainer() {
    if (this.video.parentElement) return this.video.parentElement;
    const parent = this.video.parentNode;
    if (parent && "appendChild" in parent && "host" in parent) {
      return parent;
    }
    return null;
  }
  getContainerElement(container) {
    return "host" in container ? container.host : container;
  }
  getCanvasParent(canvas) {
    return canvas.parentNode ?? canvas.parentElement;
  }
  removeOwnedCanvas() {
    if (!this.ownsCanvas || !this.canvas) return;
    this.getCanvasParent(this.canvas)?.removeChild(this.canvas);
  }
  mountOverlayCanvas(canvas) {
    if (!canvas.style.position) canvas.style.position = "absolute";
    if (!canvas.style.pointerEvents) canvas.style.pointerEvents = "none";
    if (!canvas.style.zIndex) canvas.style.zIndex = "10";
    const existingContainer = this.getCanvasParent(canvas);
    const container = this.requestedContainer ?? (existingContainer && "appendChild" in existingContainer && ("style" in existingContainer || "host" in existingContainer) ? existingContainer : this.getDefaultContainer());
    this.overlayContainer = container;
    if (!container) return;
    const containerElement = this.getContainerElement(container);
    if (window.getComputedStyle(containerElement).position === "static") {
      containerElement.style.position = "relative";
    }
    if (this.getCanvasParent(canvas) !== container) {
      container.appendChild(canvas);
    }
  }
  selectBackend() {
    if (this.backendOption === "webgpu") {
      void this.initWebGPU(false);
      return;
    }
    if (this.backendOption === "webgl2") {
      void this.initWebGL2(false);
      return;
    }
    if (this.backendOption === "worker-offscreen") {
      this.pendingWorkerOffscreen = true;
      return;
    }
    if (this.backendOption === "canvas2d") {
      this.initCanvas2D();
      return;
    }
    if (isWebGPUSupported()) {
      void this.initWebGPU();
    } else if (isWebGL2Supported()) {
      void this.initWebGL2();
    } else if (this.shouldPreferWorkerOffscreen()) {
      this.pendingWorkerOffscreen = true;
    } else {
      this.initCanvas2D();
    }
  }
  /** Create the canvas overlay positioned over the video. */
  createCanvas() {
    this.canvas = this.providedCanvas ?? document.createElement("canvas");
    this.ownsCanvas = !this.providedCanvas;
    this.mountOverlayCanvas(this.canvas);
    this.selectBackend();
    this.updateCanvasSize();
    this.resizeObserver = new ResizeObserver(() => this.updateCanvasSize());
    this.resizeObserver.observe(this.video);
    this.loadedMetadataHandler = () => this.updateCanvasSize();
    this.seekedHandler = () => {
      this.invalidatePresentation();
      this.lastRenderedIndex = -1;
      this.lastRenderedTime = -1;
      this.lastSynchronizedTime = null;
      this.offscreenFrameMetadata.clear();
      this.onSeek();
      this.renderPausedFrame();
    };
    this.video.addEventListener("loadedmetadata", this.loadedMetadataHandler);
    this.video.addEventListener("seeked", this.seekedHandler);
  }
  preferWorkerOffscreenOrCanvas2D() {
    if (this.backendOption === "auto" && this.shouldPreferWorkerOffscreen()) {
      this.pendingWorkerOffscreen = true;
      const state = this.getWorkerRendererState();
      if (state.useWorker && state.workerReady && state.sessionId) {
        void this.ensureWorkerOffscreenAttached();
      }
      return;
    }
    this.initCanvas2D();
  }
  ensureWorkerOffscreenAttached() {
    if (this.disposed) return Promise.resolve();
    if (this.offscreenAttachPromise) return this.offscreenAttachPromise;
    if (!this.pendingWorkerOffscreen || !this.canvas) return Promise.resolve();
    const state = this.getWorkerRendererState();
    if (!state.useWorker || !state.workerReady || !state.sessionId) {
      this.pendingWorkerOffscreen = false;
      this.initCanvas2D();
      this.updateCanvasSize();
      return Promise.resolve();
    }
    const sessionId = state.sessionId;
    this.pendingWorkerOffscreen = false;
    this.offscreenTransferPending = true;
    let attachPromise;
    attachPromise = this.attachWorkerOffscreen(sessionId).finally(() => {
      this.offscreenTransferPending = false;
      if (this.offscreenAttachPromise === attachPromise) {
        this.offscreenAttachPromise = null;
      }
    });
    this.offscreenAttachPromise = attachPromise;
    return attachPromise;
  }
  async attachWorkerOffscreen(sessionId) {
    try {
      const transferableCanvas = this.canvas;
      const offscreen = transferableCanvas.transferControlToOffscreen();
      const attachResponse = await sendToWorker({
        type: "attachOffscreenCanvas",
        sessionId,
        canvas: offscreen
      });
      if (attachResponse.type === "error") {
        throw new Error(attachResponse.message);
      }
      if (attachResponse.type !== "offscreenAttached") {
        throw new Error("Worker OffscreenCanvas attach failed");
      }
      if (this.disposed) {
        await sendToWorker({
          type: "detachOffscreenCanvas",
          sessionId
        });
        return;
      }
      this.useWorkerOffscreen = true;
      this.emitRendererBackend("worker-offscreen");
      this.lastRenderedIndex = -1;
      this.lastRenderedTime = -1;
      await sendToWorker({
        type: "resizeOffscreenCanvas",
        sessionId,
        width: this.canvasPixelWidth,
        height: this.canvasPixelHeight
      });
    } catch (error) {
      this.offscreenTransferPending = false;
      this.useWorkerOffscreen = false;
      if (this.disposed) return;
      this.recreateCanvasForMainThreadFallback();
      this.emitWarning(createSubtitleWarning("WORKER_FALLBACK", "Worker OffscreenCanvas present unavailable; falling back to main-thread Canvas2D.", {
        format: this.format,
        details: {
          reason: error instanceof Error ? error.message : String(error)
        }
      }));
    }
  }
  recreateCanvasForMainThreadFallback() {
    this.removeOwnedCanvas();
    this.canvas = document.createElement("canvas");
    this.ownsCanvas = true;
    this.mountOverlayCanvas(this.canvas);
    this.initCanvas2D();
    this.updateCanvasSize();
    if (!this.tempCanvas) {
      this.tempCanvas = document.createElement("canvas");
      this.tempCtx = this.tempCanvas.getContext("2d");
    }
  }
  fallbackFromWorkerOffscreen(reason) {
    if (!this.useWorkerOffscreen || this.disposed) return;
    const state = this.getWorkerRendererState();
    this.invalidatePresentation();
    this.useWorkerOffscreen = false;
    this.pendingWorkerOffscreen = false;
    this.offscreenFrameMetadata.clear();
    if (state.sessionId) {
      sendToWorker({
        type: "detachOffscreenCanvas",
        sessionId: state.sessionId
      }).catch(() => {
      });
    }
    this.recreateCanvasForMainThreadFallback();
    this.lastRenderedIndex = -2;
    this.lastRenderedTime = -1;
    this.emitWarning(createSubtitleWarning("WORKER_FALLBACK", "Worker OffscreenCanvas present failed; falling back to main-thread Canvas2D.", {
      format: this.format,
      details: {
        reason
      }
    }));
  }
  getOffscreenFrameMetadata(index) {
    return this.offscreenFrameMetadata.get(index) ?? null;
  }
  clearOffscreenFrameMetadata() {
    this.offscreenFrameMetadata.clear();
  }
  emitEvent(event) {
    this.onEvent?.(event);
  }
  emitWarning(warning) {
    this.onWarning?.(warning);
    this.emitEvent({
      type: "warning",
      warning
    });
    if (this.debug && !this.onWarning) {
      console.warn(formatSubtitleWarningForConsole(warning), warning.details ?? {});
    }
  }
  setParserMetadata(metadata) {
    this.parserMetadata = metadata;
    if (metadata) {
      this.emitEvent({
        type: "loaded",
        format: this.format,
        metadata
      });
    }
  }
  emitWorkerState(enabled, ready2, sessionId, fallback = false) {
    this.emitEvent({
      type: "worker-state",
      enabled,
      ready: ready2,
      sessionId,
      fallback
    });
  }
  emitCacheChange(cachedFrames, pendingRenders) {
    this.emitEvent({
      type: "cache-change",
      cachedFrames,
      pendingRenders,
      cacheLimit: this.cacheLimit
    });
  }
  emitCueChange(cue) {
    if (this.lastCueIndex === cue?.index && cue?.index !== void 0) {
      this.currentCueMetadata = cue;
      return;
    }
    this.lastCueIndex = cue?.index ?? null;
    this.currentCueMetadata = cue;
    this.emitEvent({
      type: "cue-change",
      cue
    });
  }
  emitRendererBackend(renderer) {
    if (this.currentRendererBackend === renderer) return;
    this.currentRendererBackend = renderer;
    this.emitEvent({
      type: "renderer-change",
      renderer
    });
  }
  recordLastRenderInfo(info) {
    if (!this.debug) return;
    this.lastRenderInfo = info;
  }
  /** Initialize WebGPU renderer. */
  async initWebGPU(allowBackendFallback = true) {
    try {
      this.webgpuRenderer = new WebGPURenderer();
      await this.webgpuRenderer.init();
      if (!this.canvas) return;
      const bounds = this.getVideoContentBounds();
      const pixelRatio = this.getDevicePixelRatio();
      const width = Math.max(1, bounds.width * pixelRatio);
      const height = Math.max(1, bounds.height * pixelRatio);
      await this.webgpuRenderer.setCanvas(this.canvas, width, height);
      this.useWebGPU = true;
      this.emitRendererBackend("webgpu");
    } catch (error) {
      this.webgpuRenderer?.destroy();
      this.webgpuRenderer = null;
      this.useWebGPU = false;
      this.onWebGPUFallback?.();
      if (allowBackendFallback && isWebGL2Supported()) {
        void this.initWebGL2();
      } else {
        this.preferWorkerOffscreenOrCanvas2D();
      }
    }
  }
  /** Initialize WebGL2 renderer. */
  async initWebGL2(allowBackendFallback = true) {
    try {
      this.webgl2Renderer = new WebGL2Renderer();
      await this.webgl2Renderer.init();
      if (!this.canvas) return;
      const bounds = this.getVideoContentBounds();
      const pixelRatio = this.getDevicePixelRatio();
      const width = Math.max(1, bounds.width * pixelRatio);
      const height = Math.max(1, bounds.height * pixelRatio);
      await this.webgl2Renderer.setCanvas(this.canvas, width, height);
      this.useWebGL2 = true;
      this.emitRendererBackend("webgl2");
    } catch (error) {
      this.webgl2Renderer?.destroy();
      this.webgl2Renderer = null;
      this.useWebGL2 = false;
      this.onWebGL2Fallback?.();
      if (allowBackendFallback) {
        this.preferWorkerOffscreenOrCanvas2D();
      } else {
        this.initCanvas2D();
      }
    }
  }
  /** Initialize Canvas2D renderer. */
  initCanvas2D() {
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.useWebGPU = false;
    this.useWebGL2 = false;
    this.emitRendererBackend("canvas2d");
  }
  /** Called when video seeks. */
  onSeek() {
  }
  getDevicePixelRatio() {
    const devicePixelRatio = Number.isFinite(window.devicePixelRatio) && window.devicePixelRatio > 0 ? window.devicePixelRatio : 1;
    return this.devicePixelRatioCap === null ? devicePixelRatio : Math.min(devicePixelRatio, this.devicePixelRatioCap);
  }
  getCanvasMountOffset() {
    if (!this.overlayContainer) return {
      x: 0,
      y: 0
    };
    const containerElement = this.getContainerElement(this.overlayContainer);
    if (typeof containerElement.getBoundingClientRect !== "function") return {
      x: 0,
      y: 0
    };
    const videoRect = this.video.getBoundingClientRect();
    const containerRect = containerElement.getBoundingClientRect();
    return {
      x: (videoRect.left ?? videoRect.x) - (containerRect.left ?? containerRect.x),
      y: (videoRect.top ?? videoRect.y) - (containerRect.top ?? containerRect.y)
    };
  }
  /** Calculate the actual video content bounds, accounting for letterboxing/pillarboxing */
  getVideoContentBounds() {
    const rect = this.video.getBoundingClientRect();
    const videoWidth = this.video.videoWidth || rect.width;
    const videoHeight = this.video.videoHeight || rect.height;
    const elementAspect = rect.width / rect.height;
    const videoAspect = videoWidth / videoHeight;
    let contentWidth;
    let contentHeight;
    let contentX;
    let contentY;
    if (Math.abs(elementAspect - videoAspect) < 0.01) {
      contentWidth = rect.width;
      contentHeight = rect.height;
      contentX = 0;
      contentY = 0;
    } else if (elementAspect > videoAspect) {
      contentHeight = rect.height;
      contentWidth = rect.height * videoAspect;
      contentX = (rect.width - contentWidth) / 2;
      contentY = 0;
    } else {
      contentWidth = rect.width;
      contentHeight = rect.width / videoAspect;
      contentX = 0;
      contentY = (rect.height - contentHeight) / 2;
    }
    return {
      x: contentX,
      y: contentY,
      width: contentWidth,
      height: contentHeight
    };
  }
  /** Update canvas size to match video content area. */
  updateCanvasSize() {
    if (!this.canvas) return;
    const bounds = this.getVideoContentBounds();
    const width = bounds.width > 0 ? bounds.width : this.video.videoWidth || 1920;
    const height = bounds.height > 0 ? bounds.height : this.video.videoHeight || 1080;
    const pixelRatio = this.getDevicePixelRatio();
    const pixelWidth = Math.max(1, width * pixelRatio);
    const pixelHeight = Math.max(1, height * pixelRatio);
    this.canvasPixelWidth = pixelWidth;
    this.canvasPixelHeight = pixelHeight;
    const mountOffset = this.getCanvasMountOffset();
    this.canvas.style.left = `${mountOffset.x + bounds.x}px`;
    this.canvas.style.top = `${mountOffset.y + bounds.y}px`;
    this.canvas.style.width = `${bounds.width}px`;
    this.canvas.style.height = `${bounds.height}px`;
    if (this.useWorkerOffscreen || this.pendingWorkerOffscreen || this.offscreenTransferPending) {
      const state = this.getWorkerRendererState();
      if (this.useWorkerOffscreen && state.sessionId && state.workerReady) {
        sendToWorker({
          type: "resizeOffscreenCanvas",
          sessionId: state.sessionId,
          width: pixelWidth,
          height: pixelHeight
        }).catch(() => {
        });
      }
    } else {
      this.canvas.width = pixelWidth;
      this.canvas.height = pixelHeight;
      if (this.useWebGPU && this.webgpuRenderer) {
        this.webgpuRenderer.updateSize(pixelWidth, pixelHeight);
      } else if (this.useWebGL2 && this.webgl2Renderer) {
        this.webgl2Renderer.updateSize(pixelWidth, pixelHeight);
      }
    }
    this.lastRenderedIndex = -1;
    this.lastRenderedTime = -1;
    this.invalidatePresentation();
    if (this.frameScheduler) {
      this.renderPausedFrame();
    }
  }
  /** Start the render loop. */
  startRenderLoop() {
    if (!this.useWorkerOffscreen) {
      this.tempCanvas = document.createElement("canvas");
      this.tempCtx = this.tempCanvas.getContext("2d");
    }
    this.frameScheduler = new VideoFrameScheduler(this.video, this.frameAwareSync, (tick) => this.renderSynchronizedFrame(tick));
    this.renderPausedFrame();
    this.frameScheduler.start();
  }
  renderPausedFrame() {
    if (!this.video.paused && !this.video.ended) return;
    this.renderSynchronizedFrame({
      mediaTime: this.video.currentTime,
      presentedFrames: null
    });
  }
  renderSynchronizedFrame(tick) {
    if (this.disposed || !this.isLoaded) return;
    const currentTime = tick.mediaTime + this.timeOffset;
    this.lastSynchronizedTime = currentTime;
    if (tick.presentedFrames !== null) {
      if (this.lastPresentedFrames !== null && tick.presentedFrames > this.lastPresentedFrames + 1) {
        this.perfStats.framesDropped += tick.presentedFrames - this.lastPresentedFrames - 1;
      }
      this.lastPresentedFrames = tick.presentedFrames;
    }
    const currentIndex = this.findCurrentIndex(currentTime);
    if (currentIndex === this.lastRenderedIndex) return;
    const cacheHit = !this.useWorkerOffscreen && currentIndex >= 0 && this.getWorkerRendererState().frameCache.has(currentIndex);
    const workerOffscreenPresent = this.useWorkerOffscreen;
    const startTime = performance.now();
    this.presentationToken++;
    const outcome = this.renderFrame(currentTime, currentIndex);
    const endTime = performance.now();
    this.lastRenderedIndex = currentIndex;
    this.lastRenderedTime = currentTime;
    if (workerOffscreenPresent) return;
    const renderTime = endTime - startTime;
    this.recordRenderPerformance(renderTime, endTime);
    if (outcome.warning) {
      this.emitWarning(outcome.warning);
    }
    const cue = currentIndex >= 0 ? this.buildCueMetadata(currentIndex) : null;
    this.emitCueChange(cue);
    this.recordLastRenderInfo({
      time: currentTime,
      index: currentIndex,
      status: outcome.status,
      backend: this.currentRendererBackend,
      usingWorker: this.getCacheStats().usingWorker,
      cacheHit,
      renderDuration: Math.round(renderTime * 100) / 100,
      frameWidth: outcome.data?.width ?? null,
      frameHeight: outcome.data?.height ?? null,
      compositionCount: outcome.data?.compositionData.length ?? 0,
      cue,
      cache: this.getCacheStats(),
      capturedAt: endTime
    });
    this.emitEvent({
      type: "stats",
      stats: this.getStats()
    });
    if (currentIndex >= 0 && (this.prefetchBefore > 0 || this.prefetchAfter > 0)) {
      const prefetch = this.prefetchAroundTime;
      prefetch?.call(this, currentTime).catch(() => {
      });
    }
  }
  getCurrentSynchronizationTime() {
    return this.lastSynchronizedTime ?? this.video.currentTime + this.timeOffset;
  }
  getPresentationToken() {
    return this.presentationToken;
  }
  isCurrentPresentation(token) {
    return !this.disposed && token === this.presentationToken;
  }
  invalidatePresentation() {
    this.presentationToken++;
  }
  watchPendingRender(index, pending) {
    const token = this.getPresentationToken();
    void pending.then(() => {
      if (!this.isCurrentPresentation(token)) return;
      if (this.findCurrentIndex(this.getCurrentSynchronizationTime()) !== index) return;
      this.lastRenderedIndex = -1;
      this.renderPausedFrame();
    }, () => {
    });
  }
  recordRenderPerformance(renderTime, capturedAt, countAsDropped = true) {
    this.perfStats.lastRenderTime = renderTime;
    this.perfStats.renderTimes.push(renderTime);
    if (this.perfStats.renderTimes.length > 60) {
      this.perfStats.renderTimes.shift();
    }
    this.perfStats.framesRendered++;
    this.perfStats.fpsTimestamps.push(capturedAt);
    if (countAsDropped && renderTime > 16.67) {
      this.perfStats.framesDropped++;
    }
  }
  recordOffscreenRenderCompletion(time, index, status, width, height, compositionCount, startedAt) {
    const completedAt = performance.now();
    const renderTime = completedAt - startedAt;
    this.recordRenderPerformance(renderTime, completedAt, false);
    const cue = index >= 0 ? this.buildCueMetadata(index) : null;
    this.emitCueChange(cue);
    this.recordLastRenderInfo({
      time,
      index,
      status,
      backend: this.currentRendererBackend,
      usingWorker: this.getCacheStats().usingWorker,
      cacheHit: false,
      renderDuration: Math.round(renderTime * 100) / 100,
      frameWidth: width,
      frameHeight: height,
      compositionCount,
      cue,
      cache: this.getCacheStats(),
      capturedAt: completedAt
    });
    this.emitEvent({
      type: "stats",
      stats: this.getStats()
    });
  }
  /** Render a subtitle frame to the canvas. */
  renderFrame(time, index) {
    if (!this.canvas) {
      return {
        status: "failed",
        data: null,
        warning: null
      };
    }
    if (this.useWorkerOffscreen) {
      return this.renderFrameWorkerOffscreen(time, index);
    }
    const data = index >= 0 ? this.renderAtIndex(index) : void 0;
    if (data === void 0 && this.lastRenderedData !== null && index >= 0) {
      if (this.isPendingRender(index)) {
        return {
          status: "pending",
          data: null,
          warning: null
        };
      }
    }
    const renderIssue = index >= 0 ? this.getWorkerRendererState().renderIssues.get(index) ?? null : null;
    const warning = warningFromRenderIssue(renderIssue, {
      format: this.format,
      cueIndex: index
    });
    if (this.useWebGPU && this.webgpuRenderer) {
      this.renderFrameWebGPU(data, index);
    } else if (this.useWebGL2 && this.webgl2Renderer) {
      this.renderFrameWebGL2(data, index);
    } else {
      this.renderFrameCanvas2D(data, index);
    }
    if (index < 0) {
      return {
        status: "cleared",
        data: null,
        warning: null
      };
    }
    if (warning) {
      return {
        status: "failed",
        data: data ?? null,
        warning
      };
    }
    if (!data || data.compositionData.length === 0) {
      return {
        status: "empty",
        data: data ?? null,
        warning: null
      };
    }
    return {
      status: "rendered",
      data,
      warning: null
    };
  }
  renderFrameWorkerOffscreen(time, index) {
    const state = this.getWorkerRendererState();
    if (!state.sessionId || !state.workerReady) {
      queueMicrotask(() => this.fallbackFromWorkerOffscreen("Worker session is not ready."));
      return {
        status: "pending",
        data: null,
        warning: null
      };
    }
    const token = this.getPresentationToken();
    const sessionId = state.sessionId;
    const startedAt = performance.now();
    void sendToWorker({
      type: "presentOffscreen",
      sessionId,
      format: this.format,
      index,
      canvasWidth: this.canvasPixelWidth,
      canvasHeight: this.canvasPixelHeight,
      displaySettings: {
        ...this.displaySettings
      }
    }).then((response) => {
      if (!this.isCurrentPresentation(token)) return;
      if (response.type === "error") {
        this.recordOffscreenRenderCompletion(time, index, "failed", null, null, 0, startedAt);
        this.fallbackFromWorkerOffscreen(response.message);
        return;
      }
      if (response.type !== "offscreenPresented") {
        this.recordOffscreenRenderCompletion(time, index, "failed", null, null, 0, startedAt);
        this.fallbackFromWorkerOffscreen(`Unexpected worker response: ${response.type}`);
        return;
      }
      if (response.status === "failed") {
        const warning2 = warningFromRenderIssue(response.renderIssue?.trim() || null, {
          format: this.format,
          cueIndex: index
        });
        if (warning2) {
          this.emitWarning(warning2);
        }
        this.recordOffscreenRenderCompletion(time, index, "failed", response.width ?? null, response.height ?? null, response.compositionCount ?? 0, startedAt);
        if (response.fatal) {
          this.fallbackFromWorkerOffscreen(response.renderIssue || "Offscreen presentation failed.");
        }
        return;
      }
      if (response.status === "cleared" || response.status === "empty" || response.compositionCount === 0) {
        this.lastRenderedData = null;
      }
      if (index >= 0) {
        this.offscreenFrameMetadata.set(index, {
          width: response.width ?? null,
          height: response.height ?? null,
          bounds: response.bounds ?? null,
          compositionCount: response.compositionCount ?? 0
        });
      }
      const warning = warningFromRenderIssue(response.renderIssue?.trim() || null, {
        format: this.format,
        cueIndex: index
      });
      if (warning) {
        this.emitWarning(warning);
      }
      this.recordOffscreenRenderCompletion(time, index, response.status, response.width ?? null, response.height ?? null, response.compositionCount ?? 0, startedAt);
    }).catch((error) => {
      if (!this.isCurrentPresentation(token)) return;
      this.recordOffscreenRenderCompletion(time, index, "failed", null, null, 0, startedAt);
      this.fallbackFromWorkerOffscreen(error instanceof Error ? error.message : String(error));
    });
    if (index < 0) {
      this.lastRenderedData = null;
      return {
        status: "cleared",
        data: null,
        warning: null
      };
    }
    return {
      status: "pending",
      data: null,
      warning: null
    };
  }
  computeLayout(data) {
    if (!this.canvas) {
      return {
        scaleX: 1,
        scaleY: 1,
        shiftX: 0,
        shiftY: 0,
        opacity: this.displaySettings.opacity
      };
    }
    const safeDataWidth = data.width > 0 ? data.width : this.canvas.width;
    const safeDataHeight = data.height > 0 ? data.height : this.canvas.height;
    const stretchScaleX = this.canvas.width / safeDataWidth;
    const stretchScaleY = this.canvas.height / safeDataHeight;
    const bounds = getSubtitleBounds(data) ?? {
      x: 0,
      y: 0,
      width: safeDataWidth,
      height: safeDataHeight
    };
    const { scale, aspectMode, verticalOffset, horizontalOffset, horizontalAlign, bottomPadding, safeArea, opacity } = this.displaySettings;
    let baseScaleX = stretchScaleX;
    let baseScaleY = stretchScaleY;
    let frameShiftX = 0;
    let frameShiftY = 0;
    if (aspectMode !== "stretch") {
      const uniformScale = aspectMode === "cover" ? Math.max(stretchScaleX, stretchScaleY) : Math.min(stretchScaleX, stretchScaleY);
      baseScaleX = uniformScale;
      baseScaleY = uniformScale;
      frameShiftX = (this.canvas.width - safeDataWidth * uniformScale) / 2;
      frameShiftY = (this.canvas.height - safeDataHeight * uniformScale) / 2;
    }
    const anchorX = horizontalAlign === "left" ? bounds.x : horizontalAlign === "right" ? bounds.x + bounds.width : bounds.x + bounds.width / 2;
    const anchorY = bounds.y + bounds.height;
    const scaleX = baseScaleX * scale;
    const scaleY = baseScaleY * scale;
    const anchorShiftX = frameShiftX + anchorX * baseScaleX * (1 - scale);
    const anchorShiftY = frameShiftY + anchorY * baseScaleY * (1 - scale);
    let shiftX = anchorShiftX + horizontalOffset / 100 * this.canvas.width;
    let shiftY = anchorShiftY + verticalOffset / 100 * this.canvas.height;
    shiftY -= bottomPadding / 100 * this.canvas.height;
    const safeX = safeArea / 100 * this.canvas.width;
    const safeY = safeArea / 100 * this.canvas.height;
    const finalMinX = bounds.x * scaleX + shiftX;
    const finalMinY = bounds.y * scaleY + shiftY;
    const finalMaxX = (bounds.x + bounds.width) * scaleX + shiftX;
    const finalMaxY = (bounds.y + bounds.height) * scaleY + shiftY;
    if (finalMinX < safeX) shiftX += safeX - finalMinX;
    if (finalMaxX > this.canvas.width - safeX) shiftX -= finalMaxX - (this.canvas.width - safeX);
    if (finalMinY < safeY) shiftY += safeY - finalMinY;
    if (finalMaxY > this.canvas.height - safeY) shiftY -= finalMaxY - (this.canvas.height - safeY);
    return {
      scaleX,
      scaleY,
      shiftX,
      shiftY,
      opacity
    };
  }
  /** Render using WebGPU. */
  renderFrameWebGPU(data, index) {
    if (!this.webgpuRenderer || !this.canvas) return;
    if (index < 0 || !data || data.compositionData.length === 0) {
      this.webgpuRenderer.clear();
      this.lastRenderedData = null;
      return;
    }
    this.lastRenderedData = data;
    const layout = this.computeLayout(data);
    this.webgpuRenderer.render(data.compositionData, data.width, data.height, layout.scaleX, layout.scaleY, layout.shiftX, layout.shiftY, layout.opacity);
  }
  /** Render using WebGL2. */
  renderFrameWebGL2(data, index) {
    if (!this.webgl2Renderer || !this.canvas) return;
    if (index < 0 || !data || data.compositionData.length === 0) {
      this.webgl2Renderer.clear();
      this.lastRenderedData = null;
      return;
    }
    this.lastRenderedData = data;
    const layout = this.computeLayout(data);
    this.webgl2Renderer.render(data.compositionData, data.width, data.height, layout.scaleX, layout.scaleY, layout.shiftX, layout.shiftY, layout.opacity);
  }
  /** Render using Canvas2D. */
  renderFrameCanvas2D(data, index) {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (index < 0 || !data || data.compositionData.length === 0) {
      this.lastRenderedData = null;
      return;
    }
    this.lastRenderedData = data;
    const layout = this.computeLayout(data);
    this.ctx.save();
    this.ctx.globalAlpha = layout.opacity;
    for (const comp of data.compositionData) {
      if (!this.tempCanvas || !this.tempCtx) continue;
      if (this.tempCanvas.width !== comp.pixelData.width || this.tempCanvas.height !== comp.pixelData.height) {
        this.tempCanvas.width = comp.pixelData.width;
        this.tempCanvas.height = comp.pixelData.height;
      }
      this.tempCtx.putImageData(comp.pixelData, 0, 0);
      const scaledWidth = comp.pixelData.width * layout.scaleX;
      const scaledHeight = comp.pixelData.height * layout.scaleY;
      const adjustedX = comp.x * layout.scaleX + layout.shiftX;
      const adjustedY = comp.y * layout.scaleY + layout.shiftY;
      this.ctx.drawImage(this.tempCanvas, adjustedX, adjustedY, scaledWidth, scaledHeight);
    }
    this.ctx.restore();
  }
  /** Dispose of all resources. */
  dispose() {
    this.disposed = true;
    this.invalidatePresentation();
    this.frameScheduler?.stop();
    this.frameScheduler = null;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    if (this.loadedMetadataHandler) {
      this.video.removeEventListener("loadedmetadata", this.loadedMetadataHandler);
      this.loadedMetadataHandler = null;
    }
    if (this.seekedHandler) {
      this.video.removeEventListener("seeked", this.seekedHandler);
      this.seekedHandler = null;
    }
    if (this.webgpuRenderer) {
      this.webgpuRenderer.destroy();
      this.webgpuRenderer = null;
    }
    if (this.webgl2Renderer) {
      this.webgl2Renderer.destroy();
      this.webgl2Renderer = null;
    }
    const state = this.getWorkerRendererState();
    if (this.useWorkerOffscreen && state.sessionId) {
      sendToWorker({
        type: "detachOffscreenCanvas",
        sessionId: state.sessionId
      }).catch(() => {
      });
    }
    this.removeOwnedCanvas();
    this.canvas = null;
    this.ctx = null;
    this.tempCanvas = null;
    this.tempCtx = null;
    this.lastRenderedData = null;
    this.currentCueMetadata = null;
    this.parserMetadata = null;
    this.lastRenderInfo = null;
    this.offscreenFrameMetadata.clear();
    this.useWebGPU = false;
    this.useWebGL2 = false;
    this.useWorkerOffscreen = false;
    this.pendingWorkerOffscreen = false;
    this.offscreenTransferPending = false;
    this.offscreenAttachPromise = null;
  }
};
var PgsRenderer = class extends BaseVideoSubtitleRenderer {
  pgsParser = null;
  state = createWorkerState();
  streamOperationQueue = Promise.resolve();
  streamGeneration = 0;
  onLoading;
  onLoaded;
  onError;
  constructor(options) {
    super(options, "pgs");
    this.onLoading = options.onLoading;
    this.onLoaded = options.onLoaded;
    this.onError = options.onError;
    setCacheLimit(this.state, this.cacheLimit);
    this.startInit();
  }
  async loadSubtitles() {
    try {
      this.emitEvent({
        type: "loading",
        format: "pgs"
      });
      this.onLoading?.();
      if (this.subContent) {
        const data = new Uint8Array(this.subContent);
        this.emitLoadProgress("pgs", this.memoryProgress(data.byteLength), 0);
        await this.loadPgsBuffer(data, true);
        this.onLoaded?.();
        return;
      }
      if (!this.subUrl) {
        await this.beginPgsPushSession();
        this.onLoaded?.();
        return;
      }
      if (!this.streamingLoad) {
        const { data, strategy, rangeSupported, total } = await fetchSubtitleAsset(this.subUrl, {
          preferRange: this.rangeRequests,
          onProgress: (progress) => this.emitLoadProgress("pgs", progress, this.state.timestamps.length)
        });
        this.emitLoadProgress("pgs", {
          loaded: data.byteLength,
          total: total ?? data.byteLength,
          ratio: 1,
          rangeSupported,
          strategy
        }, 0);
        await this.loadPgsBuffer(data, false);
        this.onLoaded?.();
        return;
      }
      await this.loadPgsStreaming(this.subUrl);
      this.onLoaded?.();
    } catch (error) {
      const resolvedError = normalizeSubtitleError(error, {
        format: "pgs"
      });
      this.emitEvent({
        type: "error",
        format: "pgs",
        error: resolvedError
      });
      this.onError?.(resolvedError);
    }
  }
  applyPgsIndexState(metadata, timestamps, partial, usingWorker) {
    this.state.metadata = metadata;
    this.state.timestamps = timestamps;
    this.setParserMetadata(metadata);
    this.emitIndexed("pgs", metadata, partial);
    if (!this.isLoaded && timestamps.length > 0) {
      this.isLoaded = true;
      if (usingWorker) {
        this.state.workerReady = true;
        this.emitWorkerState(true, true, this.state.sessionId);
      }
    }
  }
  async beginPgsPushSession() {
    if (this.state.useWorker) {
      try {
        this.state.sessionId = createWorkerSessionId();
        await getOrCreateWorker();
        this.emitWorkerState(true, false, this.state.sessionId);
        const response = await sendToWorker({
          type: "beginPgs",
          sessionId: this.state.sessionId
        });
        if (response.type === "error") throw new Error(response.message);
        if (response.type !== "pgsProgress") throw new Error("Unexpected PGS worker response");
        this.applyPgsIndexState(response.metadata, response.timestamps, true, true);
        this.state.workerReady = true;
        this.isLoaded = true;
        this.emitWorkerState(true, true, this.state.sessionId);
        return;
      } catch (workerError) {
        this.state.useWorker = false;
        this.state.workerReady = false;
        this.state.sessionId = null;
        this.emitWorkerState(false, false, null, true);
        this.emitWarning(createSubtitleWarning("WORKER_FALLBACK", "PGS worker initialization failed, falling back to main-thread rendering.", {
          format: "pgs",
          details: {
            reason: workerError instanceof Error ? workerError.message : String(workerError)
          }
        }));
      }
    }
    await this.yieldToMain();
    this.pgsParser = new PgsParser2({
      debug: this.debug,
      onWarning: (warning) => this.emitWarning(warning)
    });
    this.pgsParser.reset();
    const metadata = this.pgsParser.getMetadata();
    this.applyPgsIndexState(metadata, this.pgsParser.getTimestamps(), true, false);
    this.isLoaded = true;
  }
  enqueueStreamOperation(operation) {
    const run = async () => {
      try {
        await this.waitUntilInitialized();
        return await operation();
      } catch (error) {
        const resolvedError = normalizeSubtitleError(error, {
          format: "pgs"
        });
        this.emitEvent({
          type: "error",
          format: "pgs",
          error: resolvedError
        });
        this.onError?.(resolvedError);
        throw resolvedError;
      }
    };
    const result = this.streamOperationQueue.then(run, run);
    this.streamOperationQueue = result.then(() => void 0, () => void 0);
    return result;
  }
  /** Append a chunk to the active PGS stream and return the number of newly indexed cues. */
  append(data) {
    return this.enqueueStreamOperation(async () => {
      const chunk = data instanceof Uint8Array ? data : new Uint8Array(data);
      if (chunk.byteLength === 0) return 0;
      let added;
      if (this.state.useWorker && this.state.workerReady && this.state.sessionId) {
        const response = await sendToWorker({
          type: "appendPgs",
          sessionId: this.state.sessionId,
          data: createTransferableBuffer(chunk, true)
        });
        if (response.type === "error") throw new Error(response.message);
        if (response.type !== "pgsProgress") throw new Error("Unexpected PGS worker response");
        added = response.added;
        if (added > 0) {
          this.applyPgsIndexState(response.metadata, response.timestamps, true, true);
        } else {
          this.state.metadata = response.metadata;
          this.state.timestamps = response.timestamps;
        }
      } else {
        if (!this.pgsParser) throw new Error("PGS parser is not initialized");
        added = this.pgsParser.feed(chunk);
        if (added > 0) {
          this.applyPgsIndexState(this.pgsParser.getMetadata(), this.pgsParser.getTimestamps(), true, false);
        }
      }
      if (added > 0) this.refreshStreamPresentation();
      return added;
    });
  }
  /** Flush incomplete trailing PGS input and return the total indexed cue count. */
  flush() {
    return this.enqueueStreamOperation(async () => {
      let count;
      if (this.state.useWorker && this.state.workerReady && this.state.sessionId) {
        const response = await sendToWorker({
          type: "finishPgs",
          sessionId: this.state.sessionId
        });
        if (response.type === "error") throw new Error(response.message);
        if (response.type !== "pgsProgress") throw new Error("Unexpected PGS worker response");
        count = response.count;
        this.applyPgsIndexState(response.metadata, response.timestamps, false, true);
      } else {
        if (!this.pgsParser) throw new Error("PGS parser is not initialized");
        count = this.pgsParser.finishFeed();
        this.applyPgsIndexState(this.pgsParser.getMetadata(), this.pgsParser.getTimestamps(), false, false);
      }
      this.refreshStreamPresentation();
      return count;
    });
  }
  /** Reset the PGS stream while keeping the renderer and canvas ready for more chunks. */
  reset() {
    return this.enqueueStreamOperation(async () => {
      this.streamGeneration++;
      try {
        if (this.state.useWorker && this.state.workerReady && this.state.sessionId) {
          const response = await sendToWorker({
            type: "resetPgs",
            sessionId: this.state.sessionId
          });
          if (response.type === "error") throw new Error(response.message);
          if (response.type !== "pgsProgress") throw new Error("Unexpected PGS worker response");
          this.applyPgsIndexState(response.metadata, response.timestamps, true, true);
        } else {
          if (!this.pgsParser) throw new Error("PGS parser is not initialized");
          this.pgsParser.reset();
          this.applyPgsIndexState(this.pgsParser.getMetadata(), this.pgsParser.getTimestamps(), true, false);
        }
        this.state.frameCache.clear();
        this.state.renderIssues.clear();
        this.state.pendingRenders.clear();
        this.clearStreamPresentation();
        this.emitCacheChange(0, 0);
      } finally {
        this.streamGeneration++;
      }
    });
  }
  async loadPgsBuffer(data, preserveSource) {
    if (this.state.useWorker) {
      try {
        this.state.sessionId = createWorkerSessionId();
        await getOrCreateWorker();
        this.emitWorkerState(true, false, this.state.sessionId);
        const transferableData = createTransferableBuffer(data, preserveSource);
        const loadResponse = await sendToWorker({
          type: "loadPgs",
          sessionId: this.state.sessionId,
          data: transferableData
        });
        if (loadResponse.type === "pgsLoaded") {
          this.state.workerReady = true;
          this.state.metadata = loadResponse.metadata;
          this.state.timestamps = loadResponse.timestamps;
          this.isLoaded = true;
          this.setParserMetadata(loadResponse.metadata);
          this.emitIndexed("pgs", loadResponse.metadata, false);
          this.emitWorkerState(true, true, this.state.sessionId);
          return;
        } else if (loadResponse.type === "error") {
          throw new Error(loadResponse.message);
        }
      } catch (workerError) {
        this.state.useWorker = false;
        this.emitWorkerState(false, false, this.state.sessionId, true);
        this.emitWarning(createSubtitleWarning("WORKER_FALLBACK", "PGS worker initialization failed, falling back to main-thread rendering.", {
          format: "pgs",
          details: {
            reason: workerError instanceof Error ? workerError.message : String(workerError)
          }
        }));
      }
    }
    await this.loadOnMainThread(data);
  }
  async loadPgsStreaming(url) {
    let usedWorker = false;
    let indexedOnce = false;
    if (this.state.useWorker) {
      try {
        this.state.sessionId = createWorkerSessionId();
        await getOrCreateWorker();
        this.emitWorkerState(true, false, this.state.sessionId);
        const begin = await sendToWorker({
          type: "beginPgs",
          sessionId: this.state.sessionId
        });
        if (begin.type === "error") throw new Error(begin.message);
        usedWorker = true;
      } catch (workerError) {
        this.state.useWorker = false;
        usedWorker = false;
        this.emitWorkerState(false, false, this.state.sessionId, true);
        this.emitWarning(createSubtitleWarning("WORKER_FALLBACK", "PGS worker initialization failed, falling back to main-thread rendering.", {
          format: "pgs",
          details: {
            reason: workerError instanceof Error ? workerError.message : String(workerError)
          }
        }));
      }
    }
    if (!usedWorker) {
      await this.yieldToMain();
      this.pgsParser = new PgsParser2({
        debug: this.debug,
        onWarning: (warning) => this.emitWarning(warning)
      });
      this.pgsParser.reset();
    }
    try {
      const { data, strategy, rangeSupported, total } = await fetchSubtitleAsset(url, {
        preferRange: this.rangeRequests,
        onProgress: (progress) => this.emitLoadProgress("pgs", progress, this.state.timestamps.length)
      }, async (chunk, progress) => {
        if (chunk.byteLength === 0) return;
        if (usedWorker && this.state.sessionId) {
          const transferable = createTransferableBuffer(chunk, true);
          const response = await sendToWorker({
            type: "appendPgs",
            sessionId: this.state.sessionId,
            data: transferable
          });
          if (response.type === "pgsProgress") {
            if (response.added > 0 || !indexedOnce) {
              this.applyPgsIndexState(response.metadata, response.timestamps, true, true);
              indexedOnce = true;
            } else {
              this.state.timestamps = response.timestamps;
              this.state.metadata = response.metadata;
            }
          } else if (response.type === "error") {
            throw new Error(response.message);
          }
        } else if (this.pgsParser) {
          const added = this.pgsParser.feed(chunk);
          if (added > 0 || !indexedOnce) {
            const metadata = this.pgsParser.getMetadata();
            this.applyPgsIndexState(metadata, this.pgsParser.getTimestamps(), true, false);
            indexedOnce = true;
          }
        }
        this.emitLoadProgress("pgs", progress, this.state.timestamps.length);
      });
      if (usedWorker && this.state.sessionId) {
        const finish = await sendToWorker({
          type: "finishPgs",
          sessionId: this.state.sessionId
        });
        if (finish.type === "pgsProgress") {
          this.applyPgsIndexState(finish.metadata, finish.timestamps, false, true);
          this.state.workerReady = true;
          this.isLoaded = true;
          this.emitWorkerState(true, true, this.state.sessionId);
        } else if (finish.type === "error") {
          throw new Error(finish.message);
        }
      } else if (this.pgsParser) {
        this.pgsParser.finishFeed();
        const metadata = this.pgsParser.getMetadata();
        this.state.timestamps = this.pgsParser.getTimestamps();
        this.state.metadata = metadata;
        this.isLoaded = true;
        this.setParserMetadata(metadata);
        this.emitIndexed("pgs", metadata, false);
        if (metadata.cueCount === 0) {
          this.state.renderIssues.set(-1, "INVALID_SUBTITLE_DATA");
        }
      }
      this.emitLoadProgress("pgs", {
        loaded: data.byteLength,
        total: total ?? data.byteLength,
        ratio: 1,
        rangeSupported,
        strategy
      }, this.state.timestamps.length);
    } catch (error) {
      if (usedWorker) {
        this.state.useWorker = false;
        this.emitWorkerState(false, false, this.state.sessionId, true);
      }
      this.emitWarning(createSubtitleWarning("RANGE_FALLBACK", "Progressive PGS load failed; retrying with a full buffer fetch.", {
        format: "pgs",
        details: {
          reason: error instanceof Error ? error.message : String(error)
        }
      }));
      const { data } = await fetchSubtitleAsset(url, {
        preferRange: this.rangeRequests
      });
      await this.loadPgsBuffer(data, false);
    }
  }
  async loadOnMainThread(data) {
    await this.yieldToMain();
    this.pgsParser = new PgsParser2({
      debug: this.debug,
      onWarning: (warning) => this.emitWarning(warning)
    });
    await new Promise((resolve) => {
      const scheduleTask = typeof requestIdleCallback !== "undefined" ? (cb) => requestIdleCallback(() => cb(), {
        timeout: 1e3
      }) : (cb) => setTimeout(cb, 0);
      scheduleTask(() => {
        const count = this.pgsParser.load(data);
        this.state.timestamps = this.pgsParser.getTimestamps();
        this.state.metadata = this.pgsParser.getMetadata();
        this.isLoaded = true;
        this.setParserMetadata(this.state.metadata);
        this.emitIndexed("pgs", this.state.metadata, false);
        if (count === 0) {
          this.state.renderIssues.set(-1, "INVALID_SUBTITLE_DATA");
        }
        resolve();
      });
    });
  }
  getWorkerRendererState() {
    return this.state;
  }
  /** Yield to main thread to prevent UI blocking */
  yieldToMain() {
    const globalScheduler = globalThis.scheduler;
    if (globalScheduler && typeof globalScheduler.yield === "function") {
      return globalScheduler.yield();
    }
    return new Promise((resolve) => setTimeout(resolve, 0));
  }
  renderAtTime(time) {
    const index = this.findCurrentIndex(time);
    return index < 0 ? void 0 : this.renderAtIndex(index);
  }
  findCurrentIndex(time) {
    if (this.state.useWorker && this.state.workerReady) {
      return binarySearchTimestamp(this.state.timestamps, time * 1e3);
    }
    return this.pgsParser?.findIndexAtTimestamp(time) ?? -1;
  }
  renderAtIndex(index) {
    if (this.state.frameCache.has(index)) {
      return this.state.frameCache.get(index) ?? void 0;
    }
    if (this.state.useWorker && this.state.workerReady) {
      if (!this.state.pendingRenders.has(index)) {
        const generation = this.streamGeneration;
        const renderTask = sendToWorker({
          type: "renderPgsAtIndex",
          sessionId: this.state.sessionId,
          index
        }).then((response) => {
          if (response.type === "pgsFrame") {
            return {
              frame: response.frame ? convertFrameData(response.frame) : null,
              renderIssue: response.renderIssue?.trim() || null
            };
          }
          return {
            frame: null,
            renderIssue: null
          };
        });
        const renderPromise = renderTask.then(({ frame }) => frame);
        this.state.pendingRenders.set(index, renderPromise);
        this.emitCacheChange(this.state.frameCache.size, this.state.pendingRenders.size);
        renderTask.then(({ frame, renderIssue }) => {
          if (generation !== this.streamGeneration || this.disposed) return;
          setCachedFrame(this.state, index, frame, renderIssue);
          this.state.pendingRenders.delete(index);
          this.emitCacheChange(this.state.frameCache.size, this.state.pendingRenders.size);
        });
      }
      this.watchPendingRender(index, this.state.pendingRenders.get(index));
      return void 0;
    }
    const rendered = this.pgsParser?.renderAtIndex(index) ?? null;
    setCachedFrame(this.state, index, rendered, this.pgsParser?.getLastRenderIssue() ?? null);
    this.emitCacheChange(this.state.frameCache.size, this.state.pendingRenders.size);
    return rendered ?? void 0;
  }
  buildCueMetadata(index) {
    if (this.pgsParser) {
      return this.pgsParser.getCueMetadata(index);
    }
    const metadata = this.state.metadata;
    if (!metadata || index < 0 || index >= this.state.timestamps.length) return null;
    const startTime = this.state.timestamps[index];
    const endTime = this.state.timestamps[index + 1] ?? startTime + 5e3;
    const frame = this.state.frameCache.get(index) ?? null;
    const offscreenFrame = this.getOffscreenFrameMetadata(index);
    return {
      index,
      format: "pgs",
      startTime,
      endTime,
      duration: Math.max(0, endTime - startTime),
      screenWidth: metadata.screenWidth,
      screenHeight: metadata.screenHeight,
      bounds: frame ? getSubtitleBounds(frame) : offscreenFrame?.bounds ?? null,
      compositionCount: frame?.compositionData.length ?? offscreenFrame?.compositionCount ?? 0
    };
  }
  isPendingRender(index) {
    return this.state.pendingRenders.has(index);
  }
  onSeek() {
    this.state.frameCache.clear();
    this.state.renderIssues.clear();
    this.state.pendingRenders.clear();
    this.emitCacheChange(this.state.frameCache.size, this.state.pendingRenders.size);
    if (this.state.useWorker && this.state.workerReady) {
      sendToWorker({
        type: "clearPgsCache",
        sessionId: this.state.sessionId
      }).catch(() => {
      });
    }
    this.pgsParser?.clearCache();
  }
  setCacheLimit(limit) {
    this.cacheLimit = setCacheLimit(this.state, limit);
    this.emitCacheChange(this.state.frameCache.size, this.state.pendingRenders.size);
  }
  clearFrameCache() {
    this.invalidatePresentation();
    this.state.frameCache.clear();
    this.state.renderIssues.clear();
    this.state.pendingRenders.clear();
    this.clearOffscreenFrameMetadata();
    this.lastRenderedIndex = -1;
    if (this.state.useWorker && this.state.workerReady) {
      sendToWorker({
        type: "clearPgsCache",
        sessionId: this.state.sessionId
      }).catch(() => {
      });
    }
    this.pgsParser?.clearCache();
    this.emitCacheChange(this.state.frameCache.size, this.state.pendingRenders.size);
    this.renderPausedFrame();
  }
  async prefetchRange(startIndex, endIndex) {
    const safeStart = Math.max(0, Math.min(startIndex, endIndex));
    const safeEnd = Math.min(Math.max(startIndex, endIndex), this.state.timestamps.length - 1);
    for (let index = safeStart; index <= safeEnd; index++) {
      if (this.state.frameCache.has(index)) continue;
      const result = this.renderAtIndex(index);
      if (result === void 0 && this.state.pendingRenders.has(index)) {
        await this.state.pendingRenders.get(index);
      }
    }
  }
  async prefetchAroundTime(time, before = this.prefetchBefore, after = this.prefetchAfter) {
    const currentIndex = this.findCurrentIndex(time);
    if (currentIndex < 0) return;
    await this.prefetchRange(currentIndex - before, currentIndex + after);
  }
  /** Get performance statistics for PGS renderer */
  getStats() {
    const baseStats = this.getBaseStats();
    return {
      ...baseStats,
      usingWorker: this.state.useWorker && this.state.workerReady,
      cachedFrames: this.state.frameCache.size,
      pendingRenders: this.state.pendingRenders.size,
      totalEntries: this.state.timestamps.length || (this.pgsParser?.getTimestamps().length ?? 0)
    };
  }
  dispose() {
    this.streamGeneration++;
    super.dispose();
    this.state.frameCache.clear();
    this.state.renderIssues.clear();
    this.state.pendingRenders.clear();
    if (this.state.useWorker && this.state.workerReady) {
      sendToWorker({
        type: "disposePgs",
        sessionId: this.state.sessionId
      }).catch(() => {
      });
    }
    this.pgsParser?.dispose();
    this.pgsParser = null;
    this.state.sessionId = null;
  }
};
var VobSubRenderer = class extends BaseVideoSubtitleRenderer {
  vobsubParser = null;
  idxUrl;
  idxContent;
  fileName;
  state = createWorkerState();
  onLoading;
  onLoaded;
  onError;
  // Async index lookup state
  cachedIndex = -1;
  cachedIndexTime = -1;
  pendingIndexLookup = null;
  constructor(options) {
    super(options, "vobsub");
    this.idxUrl = options.idxUrl || (options.subUrl && /\.sub$/i.test(options.subUrl) ? options.subUrl.replace(/\.sub$/i, ".idx") : void 0);
    this.idxContent = options.idxContent;
    this.fileName = options.fileName;
    this.onLoading = options.onLoading;
    this.onLoaded = options.onLoaded;
    this.onError = options.onError;
    setCacheLimit(this.state, this.cacheLimit);
    this.startInit();
  }
  async loadSubtitles() {
    try {
      this.emitEvent({
        type: "loading",
        format: "vobsub"
      });
      this.onLoading?.();
      const useMksSource = !this.idxContent && !this.idxUrl && isMksSource({
        subData: this.subContent,
        fileName: this.fileName,
        subUrl: this.subUrl
      });
      if (this.subContent && (useMksSource || this.idxContent)) {
        const subData = new Uint8Array(this.subContent);
        this.emitLoadProgress("vobsub", this.memoryProgress(subData.byteLength), 0);
        await this.loadVobSubBuffer(subData, this.idxContent, useMksSource, true);
        this.onLoaded?.();
        return;
      }
      if (useMksSource) {
        await this.loadVobSubMksStreaming();
        this.onLoaded?.();
        return;
      }
      await this.loadVobSubIdxSubStreaming();
      this.onLoaded?.();
    } catch (error) {
      const resolvedError = normalizeSubtitleError(error, {
        format: "vobsub"
      });
      this.emitEvent({
        type: "error",
        format: "vobsub",
        error: resolvedError
      });
      this.onError?.(resolvedError);
    }
  }
  applyVobSubIndexState(metadata, timestamps, partial, renderable, usingWorker) {
    this.state.metadata = metadata;
    this.state.timestamps = timestamps;
    this.setParserMetadata(metadata);
    this.emitIndexed("vobsub", metadata, partial);
    if (renderable && !this.isLoaded && timestamps.length > 0) {
      this.isLoaded = true;
      if (usingWorker) {
        this.state.workerReady = true;
        this.emitWorkerState(true, true, this.state.sessionId);
      }
    }
  }
  async ensureVobSubWorkerSession() {
    if (!this.state.useWorker) return false;
    try {
      this.state.sessionId = createWorkerSessionId();
      await getOrCreateWorker();
      this.emitWorkerState(true, false, this.state.sessionId);
      return true;
    } catch (workerError) {
      this.state.useWorker = false;
      this.emitWorkerState(false, false, this.state.sessionId, true);
      this.emitWarning(createSubtitleWarning("WORKER_FALLBACK", "VobSub worker initialization failed, falling back to main-thread rendering.", {
        format: "vobsub",
        details: {
          reason: workerError instanceof Error ? workerError.message : String(workerError)
        }
      }));
      return false;
    }
  }
  async loadVobSubBuffer(subData, idxData, useMksSource, preserveSource) {
    if (await this.ensureVobSubWorkerSession()) {
      try {
        const transferableSubData = createTransferableBuffer(subData, preserveSource);
        const loadResponse = await sendToWorker(useMksSource ? {
          type: "loadVobSubMks",
          sessionId: this.state.sessionId,
          subData: transferableSubData
        } : {
          type: "loadVobSub",
          sessionId: this.state.sessionId,
          idxContent: idxData,
          subData: transferableSubData
        });
        if (loadResponse.type === "vobSubLoaded") {
          if (!useMksSource && idxData && loadResponse.count === 0) {
            throw createSubtitleDiagnosticError("BAD_IDX", "IDX metadata did not yield any subtitle timestamps.", {
              format: "vobsub"
            });
          }
          this.state.workerReady = true;
          this.state.metadata = loadResponse.metadata;
          this.state.timestamps = loadResponse.timestamps;
          this.isLoaded = true;
          this.setParserMetadata(loadResponse.metadata);
          this.emitIndexed("vobsub", loadResponse.metadata, false);
          this.emitWorkerState(true, true, this.state.sessionId);
          return;
        } else if (loadResponse.type === "error") {
          throw new Error(loadResponse.message);
        }
      } catch (workerError) {
        if (workerError instanceof SubtitleDiagnosticError && workerError.code === "BAD_IDX") {
          throw workerError;
        }
        this.state.useWorker = false;
        this.emitWorkerState(false, false, this.state.sessionId, true);
        this.emitWarning(createSubtitleWarning("WORKER_FALLBACK", "VobSub worker load failed, falling back to main-thread rendering.", {
          format: "vobsub",
          details: {
            reason: workerError instanceof Error ? workerError.message : String(workerError)
          }
        }));
      }
    }
    await this.loadOnMainThread(subData, idxData, useMksSource);
  }
  async loadVobSubMksStreaming() {
    if (this.subContent) {
      await this.loadVobSubBuffer(new Uint8Array(this.subContent), void 0, true, true);
      return;
    }
    if (!this.subUrl) {
      throw createSubtitleDiagnosticError("MISSING_INPUT", "No SUB content or URL provided.", {
        format: "vobsub"
      });
    }
    const { data, strategy, rangeSupported, total } = await fetchSubtitleAsset(this.subUrl, {
      preferRange: this.rangeRequests && this.streamingLoad,
      onProgress: (progress) => this.emitLoadProgress("vobsub", progress, this.state.timestamps.length)
    });
    this.emitLoadProgress("vobsub", {
      loaded: data.byteLength,
      total: total ?? data.byteLength,
      ratio: 1,
      rangeSupported,
      strategy
    }, 0);
    await this.loadVobSubBuffer(data, void 0, true, false);
  }
  async loadVobSubIdxSubStreaming() {
    let idxData = this.idxContent;
    if (!idxData) {
      if (!this.idxUrl) {
        throw createSubtitleDiagnosticError("MISSING_INPUT", "No IDX content or URL provided.", {
          format: "vobsub"
        });
      }
      idxData = await fetchSubtitleText(this.idxUrl, {
        onProgress: (progress) => this.emitLoadProgress("vobsub", progress, 0)
      });
    }
    let usedWorker = await this.ensureVobSubWorkerSession();
    if (usedWorker && this.state.sessionId) {
      try {
        const idxResponse = await sendToWorker({
          type: "loadVobSubIdx",
          sessionId: this.state.sessionId,
          idxContent: idxData
        });
        if (idxResponse.type === "vobSubProgress") {
          if (idxResponse.count === 0) {
            throw createSubtitleDiagnosticError("BAD_IDX", "IDX metadata did not yield any subtitle timestamps.", {
              format: "vobsub"
            });
          }
          this.applyVobSubIndexState(idxResponse.metadata, idxResponse.timestamps, true, false, true);
          this.state.workerReady = true;
          this.emitWorkerState(true, true, this.state.sessionId);
        } else if (idxResponse.type === "error") {
          throw new Error(idxResponse.message);
        }
      } catch (error) {
        if (error instanceof SubtitleDiagnosticError && error.code === "BAD_IDX") {
          throw error;
        }
        usedWorker = false;
        this.state.useWorker = false;
        this.emitWorkerState(false, false, this.state.sessionId, true);
        this.emitWarning(createSubtitleWarning("WORKER_FALLBACK", "VobSub worker IDX load failed, falling back to main-thread rendering.", {
          format: "vobsub",
          details: {
            reason: error instanceof Error ? error.message : String(error)
          }
        }));
      }
    }
    if (!usedWorker) {
      await this.yieldToMain();
      this.vobsubParser = new VobSubParserLowLevel({
        debug: this.debug,
        onWarning: (warning) => this.emitWarning(warning)
      });
      this.vobsubParser.loadFromIdx(idxData);
      this.applyVobSubIndexState(this.vobsubParser.getMetadata(), this.vobsubParser.getTimestamps(), true, false, false);
    }
    let subData;
    if (this.subContent) {
      subData = new Uint8Array(this.subContent);
      this.emitLoadProgress("vobsub", this.memoryProgress(subData.byteLength), this.state.timestamps.length);
    } else {
      if (!this.subUrl) {
        throw createSubtitleDiagnosticError("MISSING_INPUT", "No SUB content or URL provided.", {
          format: "vobsub"
        });
      }
      const fetched = await fetchSubtitleAsset(this.subUrl, {
        preferRange: this.rangeRequests && this.streamingLoad,
        onProgress: (progress) => this.emitLoadProgress("vobsub", progress, this.state.timestamps.length)
      });
      subData = fetched.data;
      this.emitLoadProgress("vobsub", {
        loaded: subData.byteLength,
        total: fetched.total ?? subData.byteLength,
        ratio: 1,
        rangeSupported: fetched.rangeSupported,
        strategy: fetched.strategy
      }, this.state.timestamps.length);
    }
    if (usedWorker && this.state.sessionId) {
      const transferable = createTransferableBuffer(subData, Boolean(this.subContent));
      const attachResponse = await sendToWorker({
        type: "attachVobSubData",
        sessionId: this.state.sessionId,
        subData: transferable
      });
      if (attachResponse.type === "vobSubProgress") {
        this.applyVobSubIndexState(attachResponse.metadata, attachResponse.timestamps, false, true, true);
        this.state.workerReady = true;
        this.isLoaded = true;
        this.emitWorkerState(true, true, this.state.sessionId);
        return;
      } else if (attachResponse.type === "error") {
        throw new Error(attachResponse.message);
      }
    }
    if (!this.vobsubParser) {
      this.vobsubParser = new VobSubParserLowLevel({
        debug: this.debug,
        onWarning: (warning) => this.emitWarning(warning)
      });
      this.vobsubParser.loadFromIdx(idxData);
    }
    this.vobsubParser.attachSubData(subData);
    const metadata = this.vobsubParser.getMetadata();
    this.state.timestamps = this.vobsubParser.getTimestamps();
    this.state.metadata = metadata;
    this.isLoaded = true;
    this.setParserMetadata(metadata);
    this.emitIndexed("vobsub", metadata, false);
  }
  async loadOnMainThread(subData, idxData, useMksSource = false) {
    await this.yieldToMain();
    this.vobsubParser = new VobSubParserLowLevel({
      debug: this.debug,
      onWarning: (warning) => this.emitWarning(warning)
    });
    await new Promise((resolve) => {
      const scheduleTask = typeof requestIdleCallback !== "undefined" ? (cb) => requestIdleCallback(() => cb(), {
        timeout: 1e3
      }) : (cb) => setTimeout(cb, 0);
      scheduleTask(() => {
        if (useMksSource) {
          this.vobsubParser.loadFromMks(subData);
        } else if (idxData) {
          this.vobsubParser.loadFromData(idxData, subData);
        } else {
          this.vobsubParser.loadFromSubOnly(subData);
        }
        this.state.timestamps = this.vobsubParser.getTimestamps();
        this.state.metadata = this.vobsubParser.getMetadata();
        this.isLoaded = true;
        this.setParserMetadata(this.state.metadata);
        this.emitIndexed("vobsub", this.state.metadata, false);
        resolve();
      });
    });
  }
  getWorkerRendererState() {
    return this.state;
  }
  /** Yield to main thread to prevent UI blocking */
  yieldToMain() {
    const globalScheduler = globalThis.scheduler;
    if (globalScheduler && typeof globalScheduler.yield === "function") {
      return globalScheduler.yield();
    }
    return new Promise((resolve) => setTimeout(resolve, 0));
  }
  renderAtTime(time) {
    const index = this.findCurrentIndex(time);
    return index < 0 ? void 0 : this.renderAtIndex(index);
  }
  findCurrentIndex(time) {
    if (this.state.useWorker && this.state.workerReady) {
      const timeMs = time * 1e3;
      const timeDelta = timeMs - this.cachedIndexTime;
      const cacheValid = this.cachedIndexTime >= 0 && Math.abs(timeDelta) < 17;
      if (cacheValid) {
        return this.cachedIndex;
      }
      if (!this.pendingIndexLookup) {
        const presentationToken = this.getPresentationToken();
        const lookup = sendToWorker({
          type: "findVobSubIndex",
          sessionId: this.state.sessionId,
          timeMs
        }).then((response) => {
          if (!this.isCurrentPresentation(presentationToken)) return this.cachedIndex;
          if (response.type === "vobSubIndex") {
            const newIndex = response.index;
            const oldIndex = this.cachedIndex;
            this.cachedIndex = newIndex;
            this.cachedIndexTime = timeMs;
            if (oldIndex !== newIndex) {
              this.lastRenderedIndex = -2;
            }
          }
          return this.cachedIndex;
        });
        this.pendingIndexLookup = lookup;
        void lookup.then(() => {
          if (this.pendingIndexLookup !== lookup) return;
          this.pendingIndexLookup = null;
          this.renderPausedFrame();
        }, () => {
          if (this.pendingIndexLookup === lookup) this.pendingIndexLookup = null;
        });
      }
      return this.cachedIndex;
    }
    return this.vobsubParser?.findIndexAtTimestamp(time) ?? -1;
  }
  renderAtIndex(index) {
    if (this.state.frameCache.has(index)) {
      return this.state.frameCache.get(index) ?? void 0;
    }
    if (this.state.useWorker && this.state.workerReady) {
      if (!this.state.pendingRenders.has(index)) {
        const renderTask = sendToWorker({
          type: "renderVobSubAtIndex",
          sessionId: this.state.sessionId,
          index
        }).then((response) => {
          if (response.type === "vobSubFrame") {
            return {
              frame: response.frame ? convertFrameData(response.frame) : null,
              renderIssue: response.renderIssue?.trim() || null
            };
          }
          return {
            frame: null,
            renderIssue: null
          };
        });
        const renderPromise = renderTask.then(({ frame }) => frame);
        this.state.pendingRenders.set(index, renderPromise);
        this.emitCacheChange(this.state.frameCache.size, this.state.pendingRenders.size);
        renderTask.then(({ frame, renderIssue }) => {
          setCachedFrame(this.state, index, frame, renderIssue);
          this.state.pendingRenders.delete(index);
          this.emitCacheChange(this.state.frameCache.size, this.state.pendingRenders.size);
        });
      }
      this.watchPendingRender(index, this.state.pendingRenders.get(index));
      return void 0;
    }
    const rendered = this.vobsubParser?.renderAtIndex(index) ?? null;
    setCachedFrame(this.state, index, rendered, this.vobsubParser?.getLastRenderIssue() ?? null);
    this.emitCacheChange(this.state.frameCache.size, this.state.pendingRenders.size);
    return rendered ?? void 0;
  }
  buildCueMetadata(index) {
    if (this.vobsubParser) {
      return this.vobsubParser.getCueMetadata(index);
    }
    const metadata = this.state.metadata;
    if (!metadata || index < 0 || index >= this.state.timestamps.length) return null;
    const startTime = this.state.timestamps[index];
    const endTime = this.state.timestamps[index + 1] ?? startTime + 5e3;
    const frame = this.state.frameCache.get(index) ?? null;
    const offscreenFrame = this.getOffscreenFrameMetadata(index);
    return {
      index,
      format: "vobsub",
      startTime,
      endTime,
      duration: Math.max(0, endTime - startTime),
      screenWidth: metadata.screenWidth,
      screenHeight: metadata.screenHeight,
      bounds: frame ? getSubtitleBounds(frame) : offscreenFrame?.bounds ?? null,
      compositionCount: frame?.compositionData.length ?? offscreenFrame?.compositionCount ?? 0,
      language: metadata.language ?? null,
      trackId: metadata.trackId ?? null
    };
  }
  isPendingRender(index) {
    return this.state.pendingRenders.has(index);
  }
  onSeek() {
    this.state.frameCache.clear();
    this.state.renderIssues.clear();
    this.state.pendingRenders.clear();
    this.cachedIndex = -1;
    this.cachedIndexTime = -1;
    this.pendingIndexLookup = null;
    if (this.state.useWorker && this.state.workerReady) {
      sendToWorker({
        type: "clearVobSubCache",
        sessionId: this.state.sessionId
      }).catch(() => {
      });
    }
    this.vobsubParser?.clearCache();
    this.emitCacheChange(this.state.frameCache.size, this.state.pendingRenders.size);
  }
  setCacheLimit(limit) {
    this.cacheLimit = setCacheLimit(this.state, limit);
    this.emitCacheChange(this.state.frameCache.size, this.state.pendingRenders.size);
  }
  clearFrameCache() {
    this.invalidatePresentation();
    this.state.frameCache.clear();
    this.state.renderIssues.clear();
    this.state.pendingRenders.clear();
    this.clearOffscreenFrameMetadata();
    this.cachedIndex = -1;
    this.cachedIndexTime = -1;
    this.pendingIndexLookup = null;
    this.lastRenderedIndex = -1;
    if (this.state.useWorker && this.state.workerReady) {
      sendToWorker({
        type: "clearVobSubCache",
        sessionId: this.state.sessionId
      }).catch(() => {
      });
    }
    this.vobsubParser?.clearCache();
    this.emitCacheChange(this.state.frameCache.size, this.state.pendingRenders.size);
    this.renderPausedFrame();
  }
  async prefetchRange(startIndex, endIndex) {
    const safeStart = Math.max(0, Math.min(startIndex, endIndex));
    const safeEnd = Math.min(Math.max(startIndex, endIndex), this.state.timestamps.length - 1);
    for (let index = safeStart; index <= safeEnd; index++) {
      if (this.state.frameCache.has(index)) continue;
      const result = this.renderAtIndex(index);
      if (result === void 0 && this.state.pendingRenders.has(index)) {
        await this.state.pendingRenders.get(index);
      }
    }
  }
  async prefetchAroundTime(time, before = this.prefetchBefore, after = this.prefetchAfter) {
    const currentIndex = this.findCurrentIndex(time);
    if (currentIndex < 0) return;
    await this.prefetchRange(currentIndex - before, currentIndex + after);
  }
  /** Get performance statistics for VobSub renderer */
  getStats() {
    const baseStats = this.getBaseStats();
    return {
      ...baseStats,
      usingWorker: this.state.useWorker && this.state.workerReady,
      cachedFrames: this.state.frameCache.size,
      pendingRenders: this.state.pendingRenders.size,
      totalEntries: this.state.timestamps.length || (this.vobsubParser?.getTimestamps().length ?? 0)
    };
  }
  /** Enable or disable debanding filter */
  setDebandEnabled(enabled) {
    if (this.state.useWorker && this.state.workerReady) {
      sendToWorker({
        type: "setVobSubDebandEnabled",
        sessionId: this.state.sessionId,
        enabled
      }).catch(() => {
      });
    }
    this.vobsubParser?.setDebandEnabled(enabled);
    this.invalidatePresentation();
    this.state.frameCache.clear();
    this.clearOffscreenFrameMetadata();
    this.lastRenderedIndex = -1;
    this.emitCacheChange(this.state.frameCache.size, this.state.pendingRenders.size);
    this.renderPausedFrame();
  }
  /** Set debanding threshold (0-255, default: 64) */
  setDebandThreshold(threshold) {
    if (this.state.useWorker && this.state.workerReady) {
      sendToWorker({
        type: "setVobSubDebandThreshold",
        sessionId: this.state.sessionId,
        threshold
      }).catch(() => {
      });
    }
    this.vobsubParser?.setDebandThreshold(threshold);
    this.invalidatePresentation();
    this.state.frameCache.clear();
    this.clearOffscreenFrameMetadata();
    this.lastRenderedIndex = -1;
    this.emitCacheChange(this.state.frameCache.size, this.state.pendingRenders.size);
    this.renderPausedFrame();
  }
  /** Set debanding sample range in pixels (1-64, default: 15) */
  setDebandRange(range) {
    if (this.state.useWorker && this.state.workerReady) {
      sendToWorker({
        type: "setVobSubDebandRange",
        sessionId: this.state.sessionId,
        range
      }).catch(() => {
      });
    }
    this.vobsubParser?.setDebandRange(range);
    this.invalidatePresentation();
    this.state.frameCache.clear();
    this.clearOffscreenFrameMetadata();
    this.lastRenderedIndex = -1;
    this.emitCacheChange(this.state.frameCache.size, this.state.pendingRenders.size);
    this.renderPausedFrame();
  }
  /** Check if debanding is enabled */
  get debandEnabled() {
    return this.vobsubParser?.debandEnabled ?? true;
  }
  dispose() {
    super.dispose();
    this.state.frameCache.clear();
    this.state.renderIssues.clear();
    this.state.pendingRenders.clear();
    if (this.state.useWorker && this.state.workerReady) {
      sendToWorker({
        type: "disposeVobSub",
        sessionId: this.state.sessionId
      }).catch(() => {
      });
    }
    this.vobsubParser?.dispose();
    this.vobsubParser = null;
    this.state.sessionId = null;
  }
};
var DvbRenderer = class extends BaseVideoSubtitleRenderer {
  dvbParser = null;
  endTimestamps = new Float64Array(0);
  state = createWorkerState();
  streamOperationQueue = Promise.resolve();
  streamGeneration = 0;
  onLoading;
  onLoaded;
  onError;
  constructor(options) {
    super(options, "dvb");
    this.onLoading = options.onLoading;
    this.onLoaded = options.onLoaded;
    this.onError = options.onError;
    setCacheLimit(this.state, this.cacheLimit);
    this.startInit();
  }
  async loadSubtitles() {
    try {
      this.emitEvent({
        type: "loading",
        format: "dvb"
      });
      this.onLoading?.();
      if (this.subContent) {
        const data = new Uint8Array(this.subContent);
        this.emitLoadProgress("dvb", this.memoryProgress(data.byteLength), 0);
        await this.loadDvbBuffer(data, true);
        this.onLoaded?.();
        return;
      }
      if (!this.subUrl) {
        await this.beginDvbPushSession();
        this.onLoaded?.();
        return;
      }
      if (!this.streamingLoad) {
        const { data, strategy, rangeSupported, total } = await fetchSubtitleAsset(this.subUrl, {
          preferRange: this.rangeRequests,
          onProgress: (progress) => this.emitLoadProgress("dvb", progress, this.state.timestamps.length)
        });
        this.emitLoadProgress("dvb", {
          loaded: data.byteLength,
          total: total ?? data.byteLength,
          ratio: 1,
          rangeSupported,
          strategy
        }, 0);
        await this.loadDvbBuffer(data, false);
        this.onLoaded?.();
        return;
      }
      await this.loadDvbStreaming(this.subUrl);
      this.onLoaded?.();
    } catch (error) {
      const resolvedError = normalizeSubtitleError(error, {
        format: "dvb"
      });
      this.emitEvent({
        type: "error",
        format: "dvb",
        error: resolvedError
      });
      this.onError?.(resolvedError);
    }
  }
  applyDvbIndexState(metadata, timestamps, endTimestamps, partial, usingWorker) {
    this.state.metadata = metadata;
    this.state.timestamps = timestamps;
    this.endTimestamps = endTimestamps;
    this.setParserMetadata(metadata);
    this.emitIndexed("dvb", metadata, partial);
    if (!this.isLoaded && timestamps.length > 0) {
      this.isLoaded = true;
      if (usingWorker) {
        this.state.workerReady = true;
        this.emitWorkerState(true, true, this.state.sessionId);
      }
    }
  }
  async beginDvbPushSession() {
    if (this.state.useWorker) {
      try {
        this.state.sessionId = createWorkerSessionId();
        await getOrCreateWorker();
        this.emitWorkerState(true, false, this.state.sessionId);
        const response = await sendToWorker({
          type: "beginDvb",
          sessionId: this.state.sessionId
        });
        if (response.type === "error") throw new Error(response.message);
        if (response.type !== "dvbProgress") throw new Error("Unexpected DVB worker response");
        this.applyDvbIndexState(response.metadata, response.timestamps, response.endTimestamps, true, true);
        this.state.workerReady = true;
        this.isLoaded = true;
        this.emitWorkerState(true, true, this.state.sessionId);
        return;
      } catch (workerError) {
        this.state.useWorker = false;
        this.state.workerReady = false;
        this.state.sessionId = null;
        this.emitWorkerState(false, false, null, true);
        this.emitWarning(createSubtitleWarning("WORKER_FALLBACK", "DVB worker initialization failed, falling back to main-thread rendering.", {
          format: "dvb",
          details: {
            reason: workerError instanceof Error ? workerError.message : String(workerError)
          }
        }));
      }
    }
    await this.yieldToMain();
    this.dvbParser = new DvbParser2({
      debug: this.debug,
      onWarning: (warning) => this.emitWarning(warning)
    });
    this.dvbParser.reset();
    const metadata = this.dvbParser.getMetadata();
    this.applyDvbIndexState(metadata, this.dvbParser.getTimestamps(), this.dvbParser.getEndTimestamps(), true, false);
    this.isLoaded = true;
  }
  enqueueStreamOperation(operation) {
    const run = async () => {
      try {
        await this.waitUntilInitialized();
        return await operation();
      } catch (error) {
        const resolvedError = normalizeSubtitleError(error, {
          format: "dvb"
        });
        this.emitEvent({
          type: "error",
          format: "dvb",
          error: resolvedError
        });
        this.onError?.(resolvedError);
        throw resolvedError;
      }
    };
    const result = this.streamOperationQueue.then(run, run);
    this.streamOperationQueue = result.then(() => void 0, () => void 0);
    return result;
  }
  /** Append a chunk to the active DVB stream and return the number of newly indexed cues. */
  append(data) {
    return this.enqueueStreamOperation(async () => {
      const chunk = data instanceof Uint8Array ? data : new Uint8Array(data);
      if (chunk.byteLength === 0) return 0;
      let added;
      if (this.state.useWorker && this.state.workerReady && this.state.sessionId) {
        const response = await sendToWorker({
          type: "appendDvb",
          sessionId: this.state.sessionId,
          data: createTransferableBuffer(chunk, true)
        });
        if (response.type === "error") throw new Error(response.message);
        if (response.type !== "dvbProgress") throw new Error("Unexpected DVB worker response");
        added = response.added;
        if (added > 0) {
          this.applyDvbIndexState(response.metadata, response.timestamps, response.endTimestamps, true, true);
        } else {
          this.state.metadata = response.metadata;
          this.state.timestamps = response.timestamps;
          this.endTimestamps = response.endTimestamps;
        }
      } else {
        if (!this.dvbParser) throw new Error("DVB parser is not initialized");
        added = this.dvbParser.feed(chunk);
        if (added > 0) {
          this.applyDvbIndexState(this.dvbParser.getMetadata(), this.dvbParser.getTimestamps(), this.dvbParser.getEndTimestamps(), true, false);
        }
      }
      if (added > 0) this.refreshStreamPresentation();
      return added;
    });
  }
  /** Flush incomplete trailing DVB input and return the total indexed cue count. */
  flush() {
    return this.enqueueStreamOperation(async () => {
      let count;
      if (this.state.useWorker && this.state.workerReady && this.state.sessionId) {
        const response = await sendToWorker({
          type: "finishDvb",
          sessionId: this.state.sessionId
        });
        if (response.type === "error") throw new Error(response.message);
        if (response.type !== "dvbProgress") throw new Error("Unexpected DVB worker response");
        count = response.count;
        this.applyDvbIndexState(response.metadata, response.timestamps, response.endTimestamps, false, true);
      } else {
        if (!this.dvbParser) throw new Error("DVB parser is not initialized");
        count = this.dvbParser.finishFeed();
        this.applyDvbIndexState(this.dvbParser.getMetadata(), this.dvbParser.getTimestamps(), this.dvbParser.getEndTimestamps(), false, false);
      }
      this.refreshStreamPresentation();
      return count;
    });
  }
  /** Reset the DVB stream while keeping the renderer and canvas ready for more chunks. */
  reset() {
    return this.enqueueStreamOperation(async () => {
      this.streamGeneration++;
      try {
        if (this.state.useWorker && this.state.workerReady && this.state.sessionId) {
          const response = await sendToWorker({
            type: "resetDvb",
            sessionId: this.state.sessionId
          });
          if (response.type === "error") throw new Error(response.message);
          if (response.type !== "dvbProgress") throw new Error("Unexpected DVB worker response");
          this.applyDvbIndexState(response.metadata, response.timestamps, response.endTimestamps, true, true);
        } else {
          if (!this.dvbParser) throw new Error("DVB parser is not initialized");
          this.dvbParser.reset();
          this.applyDvbIndexState(this.dvbParser.getMetadata(), this.dvbParser.getTimestamps(), this.dvbParser.getEndTimestamps(), true, false);
        }
        this.state.frameCache.clear();
        this.state.renderIssues.clear();
        this.state.pendingRenders.clear();
        this.clearStreamPresentation();
        this.emitCacheChange(0, 0);
      } finally {
        this.streamGeneration++;
      }
    });
  }
  async loadDvbBuffer(data, preserveSource) {
    if (this.state.useWorker) {
      try {
        this.state.sessionId = createWorkerSessionId();
        await getOrCreateWorker();
        this.emitWorkerState(true, false, this.state.sessionId);
        const transferableData = createTransferableBuffer(data, preserveSource);
        const loadResponse = await sendToWorker({
          type: "loadDvb",
          sessionId: this.state.sessionId,
          data: transferableData
        });
        if (loadResponse.type === "dvbLoaded") {
          this.state.workerReady = true;
          this.state.metadata = loadResponse.metadata;
          this.state.timestamps = loadResponse.timestamps;
          this.endTimestamps = loadResponse.endTimestamps;
          this.isLoaded = true;
          this.setParserMetadata(loadResponse.metadata);
          this.emitIndexed("dvb", loadResponse.metadata, false);
          this.emitWorkerState(true, true, this.state.sessionId);
          return;
        } else if (loadResponse.type === "error") {
          throw new Error(loadResponse.message);
        }
      } catch (workerError) {
        this.state.useWorker = false;
        this.emitWorkerState(false, false, this.state.sessionId, true);
        this.emitWarning(createSubtitleWarning("WORKER_FALLBACK", "DVB worker initialization failed, falling back to main-thread rendering.", {
          format: "dvb",
          details: {
            reason: workerError instanceof Error ? workerError.message : String(workerError)
          }
        }));
      }
    }
    await this.loadOnMainThread(data);
  }
  async loadDvbStreaming(url) {
    let usedWorker = false;
    let indexedOnce = false;
    if (this.state.useWorker) {
      try {
        this.state.sessionId = createWorkerSessionId();
        await getOrCreateWorker();
        this.emitWorkerState(true, false, this.state.sessionId);
        const begin = await sendToWorker({
          type: "beginDvb",
          sessionId: this.state.sessionId
        });
        if (begin.type === "error") throw new Error(begin.message);
        usedWorker = true;
      } catch (workerError) {
        this.state.useWorker = false;
        usedWorker = false;
        this.emitWorkerState(false, false, this.state.sessionId, true);
        this.emitWarning(createSubtitleWarning("WORKER_FALLBACK", "DVB worker initialization failed, falling back to main-thread rendering.", {
          format: "dvb",
          details: {
            reason: workerError instanceof Error ? workerError.message : String(workerError)
          }
        }));
      }
    }
    if (!usedWorker) {
      await this.yieldToMain();
      this.dvbParser = new DvbParser2({
        debug: this.debug,
        onWarning: (warning) => this.emitWarning(warning)
      });
      this.dvbParser.reset();
    }
    try {
      const { data, strategy, rangeSupported, total } = await fetchSubtitleAsset(url, {
        preferRange: this.rangeRequests,
        onProgress: (progress) => this.emitLoadProgress("dvb", progress, this.state.timestamps.length)
      }, async (chunk, progress) => {
        if (chunk.byteLength === 0) return;
        if (usedWorker && this.state.sessionId) {
          const transferable = createTransferableBuffer(chunk, true);
          const response = await sendToWorker({
            type: "appendDvb",
            sessionId: this.state.sessionId,
            data: transferable
          });
          if (response.type === "dvbProgress") {
            if (response.added > 0 || !indexedOnce) {
              this.applyDvbIndexState(response.metadata, response.timestamps, response.endTimestamps, true, true);
              indexedOnce = true;
            } else {
              this.state.timestamps = response.timestamps;
              this.endTimestamps = response.endTimestamps;
              this.state.metadata = response.metadata;
            }
          } else if (response.type === "error") {
            throw new Error(response.message);
          }
        } else if (this.dvbParser) {
          const added = this.dvbParser.feed(chunk);
          if (added > 0 || !indexedOnce) {
            const metadata = this.dvbParser.getMetadata();
            this.applyDvbIndexState(metadata, this.dvbParser.getTimestamps(), this.dvbParser.getEndTimestamps(), true, false);
            indexedOnce = true;
          }
        }
        this.emitLoadProgress("dvb", progress, this.state.timestamps.length);
      });
      if (usedWorker && this.state.sessionId) {
        const finish = await sendToWorker({
          type: "finishDvb",
          sessionId: this.state.sessionId
        });
        if (finish.type === "dvbProgress") {
          this.applyDvbIndexState(finish.metadata, finish.timestamps, finish.endTimestamps, false, true);
          this.state.workerReady = true;
          this.isLoaded = true;
          this.emitWorkerState(true, true, this.state.sessionId);
        } else if (finish.type === "error") {
          throw new Error(finish.message);
        }
      } else if (this.dvbParser) {
        this.dvbParser.finishFeed();
        const metadata = this.dvbParser.getMetadata();
        this.state.timestamps = this.dvbParser.getTimestamps();
        this.endTimestamps = this.dvbParser.getEndTimestamps();
        this.state.metadata = metadata;
        this.isLoaded = true;
        this.setParserMetadata(metadata);
        this.emitIndexed("dvb", metadata, false);
        if (metadata.cueCount === 0) {
          this.state.renderIssues.set(-1, "INVALID_SUBTITLE_DATA");
        }
      }
      this.emitLoadProgress("dvb", {
        loaded: data.byteLength,
        total: total ?? data.byteLength,
        ratio: 1,
        rangeSupported,
        strategy
      }, this.state.timestamps.length);
    } catch (error) {
      if (usedWorker) {
        this.state.useWorker = false;
        this.emitWorkerState(false, false, this.state.sessionId, true);
      }
      this.emitWarning(createSubtitleWarning("RANGE_FALLBACK", "Progressive DVB load failed; retrying with a full buffer fetch.", {
        format: "dvb",
        details: {
          reason: error instanceof Error ? error.message : String(error)
        }
      }));
      const { data } = await fetchSubtitleAsset(url, {
        preferRange: this.rangeRequests
      });
      await this.loadDvbBuffer(data, false);
    }
  }
  async loadOnMainThread(data) {
    await this.yieldToMain();
    this.dvbParser = new DvbParser2({
      debug: this.debug,
      onWarning: (warning) => this.emitWarning(warning)
    });
    await new Promise((resolve) => {
      const scheduleTask = typeof requestIdleCallback !== "undefined" ? (cb) => requestIdleCallback(() => cb(), {
        timeout: 1e3
      }) : (cb) => setTimeout(cb, 0);
      scheduleTask(() => {
        const count = this.dvbParser.load(data);
        this.state.timestamps = this.dvbParser.getTimestamps();
        this.endTimestamps = this.dvbParser.getEndTimestamps();
        this.state.metadata = this.dvbParser.getMetadata();
        this.isLoaded = true;
        this.setParserMetadata(this.state.metadata);
        this.emitIndexed("dvb", this.state.metadata, false);
        if (count === 0) {
          this.state.renderIssues.set(-1, "INVALID_SUBTITLE_DATA");
        }
        resolve();
      });
    });
  }
  getWorkerRendererState() {
    return this.state;
  }
  /** Yield to main thread to prevent UI blocking */
  yieldToMain() {
    const globalScheduler = globalThis.scheduler;
    if (globalScheduler && typeof globalScheduler.yield === "function") {
      return globalScheduler.yield();
    }
    return new Promise((resolve) => setTimeout(resolve, 0));
  }
  renderAtTime(time) {
    const index = this.findCurrentIndex(time);
    return index < 0 ? void 0 : this.renderAtIndex(index);
  }
  findCurrentIndex(time) {
    if (this.state.useWorker && this.state.workerReady) {
      const timeMs = time * 1e3;
      const index = binarySearchTimestamp(this.state.timestamps, timeMs);
      return index >= 0 && timeMs < (this.endTimestamps[index] ?? this.state.timestamps[index]) ? index : -1;
    }
    return this.dvbParser?.findIndexAtTimestamp(time) ?? -1;
  }
  renderAtIndex(index) {
    if (this.state.frameCache.has(index)) {
      return this.state.frameCache.get(index) ?? void 0;
    }
    if (this.state.useWorker && this.state.workerReady) {
      if (!this.state.pendingRenders.has(index)) {
        const generation = this.streamGeneration;
        const renderTask = sendToWorker({
          type: "renderDvbAtIndex",
          sessionId: this.state.sessionId,
          index
        }).then((response) => {
          if (response.type === "dvbFrame") {
            return {
              frame: response.frame ? convertFrameData(response.frame) : null,
              renderIssue: response.renderIssue?.trim() || null
            };
          }
          return {
            frame: null,
            renderIssue: null
          };
        });
        const renderPromise = renderTask.then(({ frame }) => frame);
        this.state.pendingRenders.set(index, renderPromise);
        this.emitCacheChange(this.state.frameCache.size, this.state.pendingRenders.size);
        renderTask.then(({ frame, renderIssue }) => {
          if (generation !== this.streamGeneration || this.disposed) return;
          setCachedFrame(this.state, index, frame, renderIssue);
          this.state.pendingRenders.delete(index);
          this.emitCacheChange(this.state.frameCache.size, this.state.pendingRenders.size);
        });
      }
      this.watchPendingRender(index, this.state.pendingRenders.get(index));
      return void 0;
    }
    const rendered = this.dvbParser?.renderAtIndex(index) ?? null;
    setCachedFrame(this.state, index, rendered, this.dvbParser?.getLastRenderIssue() ?? null);
    this.emitCacheChange(this.state.frameCache.size, this.state.pendingRenders.size);
    return rendered ?? void 0;
  }
  buildCueMetadata(index) {
    if (this.dvbParser) {
      return this.dvbParser.getCueMetadata(index);
    }
    const metadata = this.state.metadata;
    if (!metadata || index < 0 || index >= this.state.timestamps.length) return null;
    const startTime = this.state.timestamps[index];
    const endTime = this.endTimestamps[index] ?? startTime;
    const frame = this.state.frameCache.get(index) ?? null;
    const offscreenFrame = this.getOffscreenFrameMetadata(index);
    return {
      index,
      format: "dvb",
      startTime,
      endTime,
      duration: Math.max(0, endTime - startTime),
      screenWidth: metadata.screenWidth,
      screenHeight: metadata.screenHeight,
      bounds: frame ? getSubtitleBounds(frame) : offscreenFrame?.bounds ?? null,
      compositionCount: frame?.compositionData.length ?? offscreenFrame?.compositionCount ?? 0
    };
  }
  isPendingRender(index) {
    return this.state.pendingRenders.has(index);
  }
  onSeek() {
    this.state.frameCache.clear();
    this.state.renderIssues.clear();
    this.state.pendingRenders.clear();
    this.emitCacheChange(this.state.frameCache.size, this.state.pendingRenders.size);
    if (this.state.useWorker && this.state.workerReady) {
      sendToWorker({
        type: "clearDvbCache",
        sessionId: this.state.sessionId
      }).catch(() => {
      });
    }
    this.dvbParser?.clearCache();
  }
  setCacheLimit(limit) {
    this.cacheLimit = setCacheLimit(this.state, limit);
    this.emitCacheChange(this.state.frameCache.size, this.state.pendingRenders.size);
  }
  clearFrameCache() {
    this.invalidatePresentation();
    this.state.frameCache.clear();
    this.state.renderIssues.clear();
    this.state.pendingRenders.clear();
    this.clearOffscreenFrameMetadata();
    this.lastRenderedIndex = -1;
    if (this.state.useWorker && this.state.workerReady) {
      sendToWorker({
        type: "clearDvbCache",
        sessionId: this.state.sessionId
      }).catch(() => {
      });
    }
    this.dvbParser?.clearCache();
    this.emitCacheChange(this.state.frameCache.size, this.state.pendingRenders.size);
    this.renderPausedFrame();
  }
  async prefetchRange(startIndex, endIndex) {
    const safeStart = Math.max(0, Math.min(startIndex, endIndex));
    const safeEnd = Math.min(Math.max(startIndex, endIndex), this.state.timestamps.length - 1);
    for (let index = safeStart; index <= safeEnd; index++) {
      if (this.state.frameCache.has(index)) continue;
      const result = this.renderAtIndex(index);
      if (result === void 0 && this.state.pendingRenders.has(index)) {
        await this.state.pendingRenders.get(index);
      }
    }
  }
  async prefetchAroundTime(time, before = this.prefetchBefore, after = this.prefetchAfter) {
    const currentIndex = this.findCurrentIndex(time);
    if (currentIndex < 0) return;
    await this.prefetchRange(currentIndex - before, currentIndex + after);
  }
  /** Get performance statistics for DVB renderer */
  getStats() {
    const baseStats = this.getBaseStats();
    return {
      ...baseStats,
      usingWorker: this.state.useWorker && this.state.workerReady,
      cachedFrames: this.state.frameCache.size,
      pendingRenders: this.state.pendingRenders.size,
      totalEntries: this.state.timestamps.length || (this.dvbParser?.getTimestamps().length ?? 0)
    };
  }
  dispose() {
    this.streamGeneration++;
    super.dispose();
    this.state.frameCache.clear();
    this.state.renderIssues.clear();
    this.state.pendingRenders.clear();
    if (this.state.useWorker && this.state.workerReady) {
      sendToWorker({
        type: "disposeDvb",
        sessionId: this.state.sessionId
      }).catch(() => {
      });
    }
    this.dvbParser?.dispose();
    this.dvbParser = null;
    this.endTimestamps = new Float64Array(0);
    this.state.sessionId = null;
  }
};
function createAutoSubtitleRenderer(options) {
  const format = detectSubtitleFormat({
    data: options.subContent,
    idxContent: options.idxContent,
    fileName: options.fileName,
    subUrl: options.subUrl,
    idxUrl: options.idxUrl
  });
  if (format === "pgs") {
    return new PgsRenderer(options);
  }
  if (format === "dvb") {
    return new DvbRenderer(options);
  }
  if (format === "vobsub") {
    return new VobSubRenderer(options);
  }
  throw new Error("Unable to detect subtitle format for video renderer");
}

// deno:https://jsr.io/@altq/libbitsub/1.12.1/src/integrations/shared.ts
function hasSubtitleSource(source) {
  if (!source) return false;
  return Boolean(source.subUrl || source.subContent || source.idxUrl || source.idxContent || source.fileName);
}
function assertVideo(video) {
  if (!video) {
    throw new Error("libbitsub integration requires an HTMLVideoElement");
  }
  return video;
}
function attachBitSub(video, options = {}) {
  const { autoLoad = true, ...initialSource } = options;
  let disposed = false;
  let boundVideo = video;
  let renderer = null;
  let lastSource = hasSubtitleSource(initialSource) ? {
    ...initialSource
  } : null;
  const clearRenderer = () => {
    if (!renderer) return;
    renderer.dispose();
    renderer = null;
  };
  const controller = {
    get renderer() {
      return renderer;
    },
    get video() {
      return boundVideo;
    },
    get disposed() {
      return disposed;
    },
    load(source) {
      if (disposed) {
        throw new Error("BitSubController has been disposed");
      }
      const activeVideo = assertVideo(boundVideo);
      if (!hasSubtitleSource(source)) {
        throw new Error("BitSubController.load requires subUrl, subContent, or a detectable fileName");
      }
      clearRenderer();
      lastSource = {
        ...source
      };
      renderer = createAutoSubtitleRenderer({
        ...source,
        video: activeVideo
      });
      return renderer;
    },
    clear() {
      if (disposed) return;
      clearRenderer();
      lastSource = null;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      clearRenderer();
      lastSource = null;
      boundVideo = null;
    },
    getDisplaySettings() {
      return renderer?.getDisplaySettings() ?? null;
    },
    setDisplaySettings(settings) {
      renderer?.setDisplaySettings(settings);
    },
    resetDisplaySettings() {
      renderer?.resetDisplaySettings();
    },
    getStats() {
      return renderer?.getStats() ?? null;
    },
    setVideo(nextVideo) {
      if (disposed) {
        throw new Error("BitSubController has been disposed");
      }
      if (nextVideo === boundVideo) {
        if (nextVideo && !renderer && lastSource) {
          renderer = createAutoSubtitleRenderer({
            ...lastSource,
            video: nextVideo
          });
        }
        return;
      }
      const previousSource = lastSource;
      clearRenderer();
      boundVideo = nextVideo;
      if (nextVideo && previousSource) {
        lastSource = previousSource;
        renderer = createAutoSubtitleRenderer({
          ...previousSource,
          video: nextVideo
        });
      }
    }
  };
  if (autoLoad && lastSource) {
    controller.load(lastSource);
  }
  return controller;
}

// deno:https://jsr.io/@altq/libbitsub/1.12.1/src/integrations/videojs.ts
function resolveVideoElement(player) {
  const tech = typeof player.tech === "function" ? player.tech(true) : void 0;
  const techEl = tech && typeof tech.el === "function" ? tech.el() : tech;
  if (techEl instanceof HTMLVideoElement) return techEl;
  const root = player.el();
  if (!root) return null;
  return root.querySelector("video");
}
function registerBitSubPlugin(videojs, pluginName = "bitsub") {
  const existing = typeof videojs.getPlugin === "function" ? videojs.getPlugin(pluginName) : void 0;
  if (existing && existing.__libbitsubPlugin) {
    return;
  }
  const Plugin = videojs.getPlugin("plugin");
  class BitSubPlugin extends Plugin {
    controllerRef = null;
    onDispose;
    onLoadedData;
    initialOptions;
    constructor(player, options = {}) {
      super(player, options);
      this.initialOptions = options;
      this.onDispose = () => this.disposeController();
      this.onLoadedData = () => this.ensureController(this.initialOptions, false);
      player.ready(() => {
        this.ensureController(options, true);
        player.on("loadeddata", this.onLoadedData);
        player.on("dispose", this.onDispose);
        player.addClass?.("vjs-bitsub");
      });
    }
    controller() {
      return this.controllerRef;
    }
    load(source) {
      const controller = this.ensureController({}, false);
      controller.load(source);
      this.player.trigger?.("bitsubload", source);
    }
    clear() {
      this.controllerRef?.clear();
      this.player.trigger?.("bitsubclear");
    }
    setDisplaySettings(settings) {
      this.controllerRef?.setDisplaySettings(settings);
    }
    getDisplaySettings() {
      return this.controllerRef?.getDisplaySettings() ?? null;
    }
    getStats() {
      return this.controllerRef?.getStats() ?? null;
    }
    dispose() {
      this.player.off?.("loadeddata", this.onLoadedData);
      this.player.off?.("dispose", this.onDispose);
      this.player.removeClass?.("vjs-bitsub");
      this.disposeController();
      super.dispose();
    }
    disposeController() {
      this.controllerRef?.dispose();
      this.controllerRef = null;
    }
    ensureController(options, allowAutoload) {
      const video = resolveVideoElement(this.player);
      if (!video) {
        throw new Error("libbitsub Video.js plugin could not resolve an HTMLVideoElement");
      }
      if (this.controllerRef && !this.controllerRef.disposed) {
        if (this.controllerRef.video !== video) {
          this.controllerRef.setVideo(video);
        }
        return this.controllerRef;
      }
      const { autoLoad = true, ...source } = options;
      this.controllerRef = attachBitSub(video, {
        ...source,
        autoLoad: allowAutoload ? autoLoad : false
      });
      return this.controllerRef;
    }
  }
  ;
  BitSubPlugin.__libbitsubPlugin = true;
  videojs.registerPlugin(pluginName, BitSubPlugin);
}

// main.js
window.registerBitSubPlugin = registerBitSubPlugin;
