// Compiles a dart2wasm-generated main module from `source` which can then
// be instantiated via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(
      await WebAssembly.compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm module from `bytes` which is then
// instantiable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredModules` is a JS function that takes an array of module names
  //   matching wasm files produced by the dart2wasm compiler. It also takes a
  //   callback that should be invoked for each loaded module with 2 arguments:
  //   (1) the module name, (2) the loaded module in a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`. The callback
  //   returns a Promise that resolves when the module is instantiated.
  //   loadDeferredModules should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  // `loadDeferredId` is a JS function that takes load ID produced by the
  //   compiler when the `use-load-ids` option is passed. Each load ID maps to
  //   one or more wasm files as specified in the emitted JSON file. It also
  //   takes a callback that should be invoked for each loaded module with 2
  //   arguments: (1) the module name, (2) the loaded module in a format
  //   supported by `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  //   The callback returns a Promise that resolves when the module is
  //   instantiated.
  //   loadDeferredId should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  async instantiate(additionalImports, {loadDeferredModules, loadDeferredId} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + value;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {
            AB: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      AC: Function.prototype.call.bind(DataView.prototype.setInt16),
      AD: x0 => x0.height,
      AE: x0 => x0.languages,
      AF: x0 => x0.deltaX,
      AG: x0 => x0.first(),
      AH: (x0,x1) => x0.removeProperty(x1),
      AI: (a, i) => a.splice(i, 1)[0],
      AJ: x0 => x0.readyState,
      AK: x0 => x0.style,
      AL: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      AM: x0 => x0.content,
      AN: x0 => x0.load(),
      AO: x0 => x0.body,
      AP: (x0,x1) => globalThis.firebase_auth.initializeAuth(x0,x1),
      AQ: x0 => x0.creationTime,
      B: s => printToConsole(s),
      BB: b => !!b,
      BC: Function.prototype.call.bind(DataView.prototype.setUint16),
      BD: x0 => x0.width,
      BE: (x0,x1) => x0.observe(x1),
      BF: x0 => x0.wheelDeltaY,
      BG: x0 => x0.next(),
      BH: (x0,x1) => x0.add(x1),
      BI: x0 => new WeakRef(x0),
      BJ: x0 => x0.responseURL,
      BK: (x0,x1) => { x0.src = x1 },
      BL: x0 => x0.type,
      BM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      BN: (x0,x1) => { x0.loop = x1 },
      BO: (x0,x1) => x0.getRandomValues(x1),
      BP: () => globalThis.firebase_auth.browserPopupRedirectResolver,
      BQ: x0 => x0.metadata,
      C: Function.prototype.call.bind(Number.prototype.toString),
      CB: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CC: Function.prototype.call.bind(DataView.prototype.setUint8),
      CD: x0 => x0.screen,
      CE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      CF: x0 => x0.wheelDeltaX,
      CG: x0 => x0.current(),
      CH: x0 => x0.data,
      CI: x0 => x0.deref(),
      CJ: x0 => x0.statusText,
      CK: () => globalThis.document,
      CL: x0 => x0.vendor,
      CM: o => o.byteLength,
      CN: (x0,x1) => { x0.volume = x1 },
      CO: (x0,x1,x2,x3) => x0.encrypt(x1,x2,x3),
      CP: () => globalThis.firebase_auth.debugErrorMap,
      CQ: x0 => x0.isAnonymous,
      D: Function.prototype.call.bind(BigInt.prototype.toString),
      DB: (x0,x1) => x0.focus(x1),
      DC: Function.prototype.call.bind(DataView.prototype.setInt8),
      DD: o => {
        if (o === null || o === undefined) return 0;
        if (typeof(o) === 'string') return 1;
        return 2;
      },
      DE: x0 => new ResizeObserver(x0),
      DF: x0 => x0.key,
      DG: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      DH: (x0,x1) => { x0.scrollTop = x1 },
      DI: () => globalThis.WeakRef,
      DJ: x0 => x0.getAllResponseHeaders(),
      DK: x0 => x0.src,
      DL: x0 => x0.navigator,
      DM: (x0,x1,x2) => x0.sendCommand(x1,x2),
      DN: (x0,x1) => { x0.muted = x1 },
      DO: x0 => x0.sessionStorage,
      DP: () => globalThis.firebase_auth.browserSessionPersistence,
      DQ: x0 => x0.emailVerified,
      E: (exn) => {
        let stackString = exn.toString();
        let frames = stackString.split('\n');
        let drop = 4;
        if (frames[0].startsWith('Error')) {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      EB: () => ({}),
      EC: Function.prototype.call.bind(DataView.prototype.getInt8),
      ED: x0 => x0.tabIndex,
      EE: (x0,x1) => x0.getPropertyValue(x1),
      EF: x0 => x0.identifier,
      EG: x0 => x0.v8BreakIterator,
      EH: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      EI: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      EJ: x0 => x0.status,
      EK: (x0,x1) => x0.revokeObjectURL(x1),
      EL: x0 => new Blob(x0),
      EM: (o, p) => delete o[p],
      EN: (x0,x1) => { x0.src = x1 },
      EO: (x0,x1,x2,x3,x4,x5,x6,x7) => x0.unwrapKey(x1,x2,x3,x4,x5,x6,x7),
      EP: () => globalThis.firebase_auth.browserLocalPersistence,
      EQ: x0 => x0.email,
      F: () => new Error().stack,
      FB: (o, p, v) => o[p] = v,
      FC: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int8Array) return 1;
        return 2;
      },
      FD: (x0,x1) => x0.contains(x1),
      FE: x0 => globalThis.parseFloat(x0),
      FF: x0 => x0.touches,
      FG: () => globalThis.Intl,
      FH: (x0,x1) => { x0.value = x1 },
      FI: (a, s, e) => a.slice(s, e),
      FJ: x0 => x0.response,
      FK: (x0,x1) => { x0.src = x1 },
      FL: x0 => globalThis.fetch(x0),
      FM: (x0,x1) => x0.registerCallback(x1),
      FN: x0 => x0.message,
      FO: (x0,x1,x2,x3,x4,x5) => x0.importKey(x1,x2,x3,x4,x5),
      FP: () => globalThis.firebase_auth.indexedDBLocalPersistence,
      FQ: x0 => x0.displayName,
      G: s => JSON.stringify(s),
      GB: () => [],
      GC: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      GD: x0 => x0.activeElement,
      GE: (x0,x1) => x0.getComputedStyle(x1),
      GF: x0 => x0.pressure,
      GG: (x0,x1) => x0.segment(x1),
      GH: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      GI: (a, i) => a.splice(i, 1),
      GJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      GK: (x0,x1,x2,x3,x4) => globalThis.createImageBitmap(x0,x1,x2,x3,x4),
      GL: x0 => x0.arrayBuffer(),
      GM: (x0,x1,x2) => x0.showNotification(x1,x2),
      GN: x0 => x0.code,
      GO: (x0,x1,x2,x3,x4) => x0.wrapKey(x1,x2,x3,x4),
      GP: x0 => x0.name,
      GQ: x0 => globalThis.firebase_auth.multiFactor(x0),
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: (a, i) => a.push(i),
      HC: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      HD: x0 => x0.parentNode,
      HE: x0 => x0.documentElement,
      HF: x0 => x0.tiltY,
      HG: x0 => x0.index,
      HH: (x0,x1) => { x0.value = x1 },
      HI: a => a.pop(),
      HJ: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      HK: x0 => x0.naturalHeight,
      HL: (x0,x1) => x0.writeText(x1),
      HM: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9,x10,x11,x12) => ({dir: x0,lang: x1,body: x2,tag: x3,image: x4,icon: x5,badge: x6,timestamp: x7,renotify: x8,silent: x9,requireInteraction: x10,data: x11,actions: x12}),
      HN: x0 => x0.error,
      HO: (x0,x1,x2,x3) => x0.decrypt(x1,x2,x3),
      HP: () => globalThis.firebase_core.SDK_VERSION,
      HQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: x0 => new Int8Array(x0),
      IC: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      ID: x0 => x0.tagName,
      IE: x0 => x0.computedStyleMap(),
      IF: x0 => x0.tiltX,
      IG: x0 => x0.next(),
      IH: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      II: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      IJ: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      IK: x0 => x0.naturalWidth,
      IL: x0 => x0.clipboard,
      IM: x0 => x0.active,
      IN: (x0,x1) => x0.start(x1),
      IO: () => globalThis.removeSplashFromWeb(),
      IP: (x0,x1,x2) => globalThis.firebase_core.registerVersion(x0,x1,x2),
      IQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      J: (s, p, i) => s.lastIndexOf(p, i),
      JB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      JC: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      JD: x0 => x0.target,
      JE: (x0,x1) => x0.get(x1),
      JF: x0 => x0.pointerType,
      JG: x0 => x0.value,
      JH: x0 => x0.value,
      JI: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      JJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      JK: x0 => x0.decode(),
      JL: x0 => x0.close(),
      JM: () => globalThis.Notification.permission,
      JN: (x0,x1) => x0.end(x1),
      JO: x0 => x0.message,
      JP: (x0,x1) => x0.debug(x1),
      JQ: (x0,x1,x2) => x0.onIdTokenChanged(x1,x2),
      K: o => o,
      KB: x0 => new Uint8Array(x0),
      KC: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      KD: x0 => x0.clientY,
      KE: (o, p) => p in o,
      KF: x0 => x0.pointerId,
      KG: x0 => x0.done,
      KH: x0 => x0.selectionDirection,
      KI: (o, p) => p in o,
      KJ: x0 => x0.withCredentials,
      KK: (x0,x1) => { x0.decoding = x1 },
      KL: x0 => x0.close(),
      KM: (x0,x1,x2) => x0.insertBefore(x1,x2),
      KN: x0 => x0.length,
      KO: x0 => x0.code,
      KP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      KQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      L: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'number') return 1;
        return 2;
      },
      LB: x0 => new Uint8ClampedArray(x0),
      LC: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      LD: x0 => x0.clientX,
      LE: (x0,x1) => { x0.textContent = x1 },
      LF: x0 => x0.getCoalescedEvents(),
      LG: (o, m, a) => o[m].apply(o, a),
      LH: x0 => x0.selectionStart,
      LI: x0 => x0.groups,
      LJ: (x0,x1) => { x0.timeout = x1 },
      LK: (x0,x1) => { x0.crossOrigin = x1 },
      LL: x0 => x0.height,
      LM: x0 => x0.id,
      LN: x0 => x0.buffered,
      LO: () => globalThis.Notification.requestPermission(),
      LP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      LQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      M: x0 => x0.index,
      MB: x0 => new Int16Array(x0),
      MC: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      MD: (x0,x1,x2) => x0.setAttribute(x1,x2),
      ME: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      MF: (x0,x1) => x0.getModifierState(x1),
      MG: x0 => x0.iterator,
      MH: x0 => x0.selectionEnd,
      MI: (x0,x1,x2) => x0.transaction(x1,x2),
      MJ: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      MK: (x0,x1) => x0.createObjectURL(x1),
      ML: x0 => x0.width,
      MM: x0 => x0.offsetHeight,
      MN: x0 => x0.videoWidth,
      MO: (x0,x1) => globalThis.firebase_messaging.getToken(x0,x1),
      MP: (x0,x1) => ({createScript: x0,createScriptURL: x1}),
      MQ: x0 => x0.user,
      N: o => String(o),
      NB: x0 => new Uint16Array(x0),
      NC: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      ND: x0 => x0.getBoundingClientRect(),
      NE: x0 => x0.matches,
      NF: s => s.trimLeft(),
      NG: () => globalThis.Symbol,
      NH: x0 => x0.value,
      NI: (x0,x1) => x0.objectStore(x1),
      NJ: (x0,x1) => { x0.withCredentials = x1 },
      NK: x0 => x0.URL,
      NL: (x0,x1) => x0.append(x1),
      NM: x0 => x0.offsetWidth,
      NN: x0 => x0.videoHeight,
      NO: x0 => x0.link,
      NP: (x0,x1,x2) => x0.createPolicy(x1,x2),
      NQ: x0 => globalThis.firebase_auth.OAuthProvider.credentialFromResult(x0),
      O: o => o === undefined,
      OB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI16ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      OC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      OD: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      OE: (x0,x1) => x0.matchMedia(x1),
      OF: s => s.toUpperCase(),
      OG: (x0,x1) => new Intl.Segmenter(x0,x1),
      OH: x0 => x0.selectionDirection,
      OI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      OJ: (x0,x1) => { x0.responseType = x1 },
      OK: x0 => new Blob(x0),
      OL: (x0,x1,x2) => x0.insertRule(x1,x2),
      OM: x0 => x0.stopPropagation(),
      ON: x0 => x0.duration,
      OO: x0 => x0.analyticsLabel,
      OP: (x0,x1) => x0.createScriptURL(x1),
      OQ: x0 => x0.username,
      P: (x0,x1) => x0.exec(x1),
      PB: x0 => new Int32Array(x0),
      PC: (x0,x1) => x0.querySelector(x1),
      PD: s => new Date(s * 1000).getTimezoneOffset() * 60,
      PE: x0 => x0.matches,
      PF: x0 => x0.pop(),
      PG: x0 => x0.Segmenter,
      PH: x0 => x0.selectionStart,
      PI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      PJ: () => new AbortController(),
      PK: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      PL: (x0,x1) => x0.add(x1),
      PM: x0 => x0.disabled,
      PN: (x0,x1) => { x0.playsInline = x1 },
      PO: x0 => x0.image,
      PP: (x0,x1,x2) => x0.createScript(x1,x2),
      PQ: x0 => x0.providerId,
      Q: (x0,x1) => { x0.lastIndex = x1 },
      QB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      QC: (x0,x1) => x0.item(x1),
      QD: Date.now,
      QE: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      QF: x0 => x0.flags,
      QG: x0 => x0.buffer,
      QH: x0 => x0.selectionEnd,
      QI: (x0,x1) => { x0.onerror = x1 },
      QJ: (x0,x1,x2,x3,x4,x5) => ({method: x0,headers: x1,body: x2,credentials: x3,redirect: x4,signal: x5}),
      QK: x0 => new window.ImageDecoder(x0),
      QL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      QM: (x0,x1) => { x0.min = x1 },
      QN: (x0,x1) => { x0.controls = x1 },
      QO: x0 => x0.body,
      QP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      QQ: x0 => x0.profile,
      R: o => o,
      RB: x0 => new Uint32Array(x0),
      RC: x0 => x0.length,
      RD: (handle) => clearTimeout(handle),
      RE: f => f.dartFunction,
      RF: (a, s) => a.join(s),
      RG: x0 => x0.wasmMemory,
      RH: x0 => x0.keyCode,
      RI: x0 => x0.close(),
      RJ: (x0,x1) => globalThis.fetch(x0,x1),
      RK: x0 => x0.name,
      RL: x0 => x0.preventDefault(),
      RM: (x0,x1) => { x0.max = x1 },
      RN: (x0,x1) => { x0.autoplay = x1 },
      RO: x0 => x0.title,
      RP: (x0,x1) => { x0.text = x1 },
      RQ: x0 => x0.isNewUser,
      S: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      SB: x0 => new Float32Array(x0),
      SC: (x0,x1) => x0.querySelectorAll(x1),
      SD: (a, l) => a.length = l,
      SE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      SF: (x0,x1) => x0.error(x1),
      SG: () => globalThis.window._flutter_skwasmInstance,
      SH: (x0,x1) => x0.scrollIntoView(x1),
      SI: x0 => x0.message,
      SJ: (x0,x1) => x0.get(x1),
      SK: x0 => x0.repetitionCount,
      SL: x0 => x0.createRange(),
      SM: (x0,x1) => { x0.disabled = x1 },
      SN: (x0,x1) => { x0.width = x1 },
      SO: x0 => x0.fcmOptions,
      SP: x0 => x0.head,
      SQ: x0 => globalThis.firebase_auth.getAdditionalUserInfo(x0),
      T: o => o instanceof RegExp,
      TB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      TC: (x0,x1) => x0.getAttribute(x1),
      TD: (x0,x1) => x0.closest(x1),
      TE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      TF: () => globalThis.console,
      TG: () => new TextDecoder(),
      TH: x0 => x0.multiViewEnabled,
      TI: x0 => x0.error,
      TJ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      TK: x0 => x0.frameCount,
      TL: (x0,x1) => x0.selectNode(x1),
      TM: (x0,x1) => { x0.scrollLeft = x1 },
      TN: (x0,x1) => { x0.height = x1 },
      TO: x0 => x0.notification,
      TP: (x0,x1) => { x0.text = x1 },
      TQ: (x0,x1,x2) => globalThis.firebase_auth.signInWithEmailAndPassword(x0,x1,x2),
      U: (string, times) => string.repeat(times),
      UB: x0 => new Float64Array(x0),
      UC: x0 => x0.remove(),
      UD: x0 => x0.bottom,
      UE: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      UF: s => s.trimRight(),
      UG: (map, o, v) => map.set(o, v),
      UH: (x0,x1) => x0.replaceWith(x1),
      UI: (x0,x1) => { x0.oncomplete = x1 },
      UJ: (x0,x1) => x0.forEach(x1),
      UK: x0 => x0.selectedTrack,
      UL: x0 => x0.getSelection(),
      UM: (x0,x1) => { x0.spellcheck = x1 },
      UN: (x0,x1) => { x0.border = x1 },
      UO: x0 => x0.messageId,
      UP: x0 => x0.trustedTypes,
      UQ: x0 => x0.click(),
      V: o => o,
      VB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      VC: (x0,x1) => x0.appendChild(x1),
      VD: x0 => x0.top,
      VE: (o, i) => o[i],
      VF: x0 => x0.blur(),
      VG: (map, o) => map.get(o),
      VH: (x0,x1) => { x0.type = x1 },
      VI: x0 => x0.result,
      VJ: x0 => x0.name,
      VK: x0 => x0.completed,
      VL: x0 => x0.removeAllRanges(),
      VM: (x0,x1) => { x0.disabled = x1 },
      VN: x0 => x0.style,
      VO: x0 => x0.from,
      VP: () => globalThis.console,
      VQ: (x0,x1) => x0.removeChild(x1),
      W: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'boolean') return 1;
        return 2;
      },
      WB: x0 => new ArrayBuffer(x0),
      WC: (x0,x1) => x0.append(x1),
      WD: x0 => x0.right,
      WE: o => o.length,
      WF: x0 => x0.button,
      WG: () => new WeakMap(),
      WH: (x0,x1) => { x0.className = x1 },
      WI: (x0,x1,x2) => x0.open(x1,x2),
      WJ: x0 => x0.statusText,
      WK: x0 => x0.ready,
      WL: (x0,x1) => x0.addRange(x1),
      WM: x0 => x0.getRegistration(),
      WN: (x0,x1) => { x0.id = x1 },
      WO: x0 => x0.collapseKey,
      WP: x0 => x0.trustedTypes,
      WQ: x0 => x0.firstChild,
      X: x0 => x0.dotAll,
      XB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      XC: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      XD: x0 => x0.left,
      XE: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        // Feature check for `SharedArrayBuffer` before doing a type-check.
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
            return 17;
        }
        if (o instanceof Promise) return 18;
        return 19;
      },
      XF: x0 => x0.innerHeight,
      XG: x0 => x0.debugSkipFontRetryDelay,
      XH: (x0,x1) => { x0.tabIndex = x1 },
      XI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      XJ: x0 => x0.url,
      XK: x0 => x0.tracks,
      XL: () => globalThis.window,
      XM: (x0,x1) => x0.register(x1),
      XN: (x0,x1) => { x0.currentTime = x1 },
      XO: x0 => x0.data,
      XP: (x0,x1) => { x0.crossOrigin = x1 },
      XQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      Y: x0 => x0.unicode,
      YB: (x0,x1,x2) => new DataView(x0,x1,x2),
      YC: x0 => x0.style,
      YD: x0 => x0.clientY,
      YE: x0 => x0.language,
      YF: x0 => x0.innerWidth,
      YG: x0 => x0.status,
      YH: (x0,x1) => { x0.name = x1 },
      YI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      YJ: x0 => x0.status,
      YK: x0 => x0.close(),
      YL: (x0,x1) => { x0.innerText = x1 },
      YM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      YN: x0 => x0.currentTime,
      YO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      YP: x0 => globalThis.firebase_auth.OAuthProvider.credentialFromError(x0),
      YQ: (x0,x1) => x0.item(x1),
      Z: x0 => x0.ignoreCase,
      ZB: (o, p) => o[p],
      ZC: x0 => x0.debugShowSemanticsNodes,
      ZD: x0 => x0.clientX,
      ZE: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      ZF: x0 => x0.height,
      ZG: (x0,x1,x2) => x0.set(x1,x2),
      ZH: (x0,x1) => { x0.placeholder = x1 },
      ZI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      ZJ: x0 => x0.getReader(),
      ZK: (x0,x1) => ({frameIndex: x0,completeFramesOnly: x1}),
      ZL: x0 => x0.offsetY,
      ZM: (x0,x1) => { x0.onmessage = x1 },
      ZN: (x0,x1) => { x0.playbackRate = x1 },
      ZO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      ZP: x0 => x0.session,
      ZQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      a: x0 => x0.multiline,
      aB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      aC: (x0,x1) => x0.warn(x1),
      aD: x0 => x0.changedTouches,
      aE: () => globalThis.window.FinalizationRegistry,
      aF: x0 => x0.width,
      aG: x0 => x0.arrayBuffer(),
      aH: (x0,x1) => { x0.autocomplete = x1 },
      aI: (x0,x1) => { x0.onerror = x1 },
      aJ: x0 => x0.read(),
      aK: (x0,x1) => x0.decode(x1),
      aL: x0 => x0.offsetX,
      aM: x0 => x0.payload,
      aN: x0 => x0.pause(),
      aO: (x0,x1) => ({next: x0,error: x1}),
      aP: x0 => x0.phoneNumber,
      aQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      b: (exn) => {
        if (exn instanceof Error) {
          return exn.stack;
        } else {
          return null;
        }
      },
      bB: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      bC: x0 => x0.console,
      bD: x0 => x0.offsetY,
      bE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      bF: x0 => x0.clientHeight,
      bG: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof ArrayBuffer) return 1;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 2;
        }
        return 3;
      },
      bH: (x0,x1) => { x0.name = x1 },
      bI: x0 => x0.error,
      bJ: x0 => x0.value,
      bK: x0 => x0.displayHeight,
      bL: x0 => x0.button,
      bM: x0 => x0.reply,
      bN: x0 => x0.play(),
      bO: (x0,x1) => globalThis.firebase_messaging.onMessage(x0,x1),
      bP: x0 => x0.uid,
      bQ: x0 => x0.name,
      c: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      cB: o => o.byteOffset,
      cC: () => globalThis.window,
      cD: x0 => x0.offsetX,
      cE: x0 => new window.FinalizationRegistry(x0),
      cF: x0 => x0.clientWidth,
      cG: (x0,x1) => x0.fetch(x1),
      cH: (x0,x1) => { x0.placeholder = x1 },
      cI: (x0,x1) => { x0.onsuccess = x1 },
      cJ: x0 => x0.done,
      cK: x0 => x0.displayWidth,
      cL: x0 => x0.classList,
      cM: x0 => x0.id,
      cN: x0 => x0.userAgent,
      cO: x0 => globalThis.firebase_messaging.getMessaging(x0),
      cP: x0 => x0.enrollmentTime,
      cQ: x0 => x0.size,
      d: (x0,x1) => x0.didCreateEngineInitializer(x1),
      dB: o => o.buffer,
      dC: (o, c) => o instanceof c,
      dD: x0 => x0.type,
      dE: (x0,x1) => x0.unregister(x1),
      dF: (x0,x1) => { x0.content = x1 },
      dG: x0 => x0.fontFallbackBaseUrl,
      dH: (x0,x1) => { x0.action = x1 },
      dI: (x0,x1) => { x0.onupgradeneeded = x1 },
      dJ: x0 => x0.cancel(),
      dK: x0 => x0.duration,
      dL: x0 => x0.sheet,
      dM: x0 => x0.action,
      dN: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      dO: x0 => globalThis.firebase_core.getApp(x0),
      dP: x0 => x0.factorId,
      dQ: x0 => x0.parentNode,
      e: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      eB: Function.prototype.call.bind(DataView.prototype.getUint8),
      eC: (x0,x1) => x0[x1],
      eD: x0 => x0.maxTouchPoints,
      eE: (x0,x1) => x0.contains(x1),
      eF: (x0,x1) => { x0.name = x1 },
      eG: (handle) => clearInterval(handle),
      eH: (x0,x1) => { x0.method = x1 },
      eI: (x0,x1) => x0.createObjectStore(x1),
      eJ: x0 => x0.body,
      eK: x0 => x0.image,
      eL: x0 => x0.head,
      eM: x0 => x0.serviceWorker,
      eN: (x0,x1,x2) => x0.setAttribute(x1,x2),
      eO: () => globalThis.firebase_core.getApp(),
      eP: x0 => x0.displayName,
      eQ: x0 => x0.length,
      f: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      fB: (b, o) => new DataView(b, o),
      fC: x0 => x0.length,
      fD: x0 => x0.platform,
      fE: (s) => +s,
      fF: x0 => x0.head,
      fG: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      fH: (x0,x1) => { x0.noValidate = x1 },
      fI: x0 => x0.indexedDB,
      fJ: x0 => x0.headers,
      fK: () => globalThis.window.ImageDecoder,
      fL: (x0,x1) => x0.unregisterCallback(x1),
      fM: (x0,x1) => x0.transferFromImageBitmap(x1),
      fN: (x0,x1) => { x0.cursor = x1 },
      fO: x0 => x0.name,
      fP: x0 => x0.hints,
      fQ: x0 => x0.files,
      g: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      gB: (b, o, l) => new DataView(b, o, l),
      gC: (string, token) => string.split(token),
      gD: x0 => x0.body,
      gE: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      gF: (x0,x1) => x0.removeChild(x1),
      gG: () => Date.now(),
      gH: (x0,x1) => x0.removeAttribute(x1),
      gI: () => globalThis.window,
      gJ: x0 => x0.signal,
      gK: x0 => x0.decode(),
      gL: (x0,x1,x2,x3) => x0.sendCommand(x1,x2,x3),
      gM: (x0,x1) => x0.getContext(x1),
      gN: (x0,x1) => { x0.display = x1 },
      gO: x0 => globalThis.firebase_messaging.deleteToken(x0),
      gP: x0 => x0.tenantId,
      gQ: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      h: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      hB: Function.prototype.call.bind(DataView.prototype.getFloat64),
      hC: o => o instanceof Array,
      hD: () => globalThis.document,
      hE: s => s.trim(),
      hF: x0 => x0.firstChild,
      hG: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      hH: x0 => x0.isConnected,
      hI: (x0,x1) => x0.delete(x1),
      hJ: (a, l) => a.length = l,
      hK: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      hL: () => globalThis.PdfiumWasmCommunicator,
      hM: (x0,x1) => { x0.height = x1 },
      hN: (x0,x1) => { x0.opacity = x1 },
      hO: x0 => x0.measurementId,
      hP: x0 => x0.phoneNumber,
      hQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      i: x0 => new Promise(x0),
      iB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float64Array) return 1;
        return 2;
      },
      iC: (a, i) => a[i],
      iD: (x0,x1,x2) => x0.addEventListener(x1,x2),
      iE: x0 => x0.classList,
      iF: x0 => x0.viewConstraints,
      iG: x0 => x0.history,
      iH: x0 => x0.click(),
      iI: x0 => x0.isSecureContext,
      iJ: x0 => x0.protocol,
      iK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      iL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      iM: (x0,x1) => { x0.width = x1 },
      iN: (o, p, v) => o[p] = v,
      iO: x0 => x0.appId,
      iP: x0 => x0.email,
      iQ: (x0,x1) => { x0.accept = x1 },
      j: (x0,x1,x2) => x0.call(x1,x2),
      jB: Function.prototype.call.bind(DataView.prototype.setFloat64),
      jC: a => a.length,
      jD: x0 => x0.hasFocus(),
      jE: x0 => x0.preventDefault(),
      jF: x0 => x0.hostElement,
      jG: x0 => x0.search,
      jH: (x0,x1) => x0.getElementsByClassName(x1),
      jI: x0 => x0.privateKey,
      jJ: (x0,x1,x2) => x0.close(x1,x2),
      jK: (x0,x1,x2) => x0.addEventListener(x1,x2),
      jL: (x0,x1,x2) => x0.addEventListener(x1,x2),
      jM: x0 => x0.rasterEndMilliseconds,
      jN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      jO: x0 => x0.messagingSenderId,
      jP: (x0,x1) => globalThis.firebase_auth.getMultiFactorResolver(x0,x1),
      jQ: (x0,x1) => { x0.multiple = x1 },
      k: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      kB: (t, s) => t.set(s),
      kC: (x0,x1) => x0.test(x1),
      kD: x0 => x0.relatedTarget,
      kE: x0 => x0.parent,
      kF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      kG: x0 => x0.location,
      kH: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      kI: x0 => x0.alg,
      kJ: x0 => x0.close(),
      kK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      kL: x0 => x0.preventDefault(),
      kM: x0 => x0.rasterStartMilliseconds,
      kN: x0 => x0.shiftKey,
      kO: x0 => x0.storageBucket,
      kP: x0 => x0.customData,
      kQ: (x0,x1) => { x0.draggable = x1 },
      l: x0 => new Array(x0),
      lB: Function.prototype.call.bind(DataView.prototype.setFloat32),
      lC: x0 => x0.userAgent,
      lD: x0 => x0.shiftKey,
      lE: x0 => x0.timeStamp,
      lF: x0 => ({runApp: x0}),
      lG: x0 => x0.pathname,
      lH: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      lI: x0 => x0.userid,
      lJ: (x0,x1) => x0.send(x1),
      lK: x0 => x0.send(),
      lL: () => globalThis.document,
      lM: x0 => x0.imageBitmaps,
      lN: x0 => x0.metaKey,
      lO: x0 => x0.databaseURL,
      lP: x0 => x0.message,
      lQ: (x0,x1) => { x0.type = x1 },
      m: o => [o],
      mB: Function.prototype.call.bind(DataView.prototype.getFloat32),
      mC: x0 => x0.navigator,
      mD: (decoder, codeUnits) => decoder.decode(codeUnits),
      mE: (x0,x1) => x0.hasAttribute(x1),
      mF: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      mG: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      mH: (x0,x1) => x0.dispatchEvent(x1),
      mI: x0 => x0.keyid,
      mJ: () => new Array(),
      mK: x0 => x0.status,
      mL: (x0,x1) => x0.createElement(x1),
      mM: x0 => x0.canvasKitMaximumSurfaces,
      mN: x0 => x0.altKey,
      mO: x0 => x0.authDomain,
      mP: x0 => x0.code,
      mQ: x0 => x0.length,
      n: (o0, o1) => [o0, o1],
      nB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float32Array) return 1;
        return 2;
      },
      nC: Function.prototype.call.bind(String.prototype.toLowerCase),
      nD: () => new TextDecoder("utf-8", {fatal: true}),
      nE: x0 => x0.buttons,
      nF: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      nG: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      nH: (x0,x1) => x0.createEvent(x1),
      nI: (x0,x1) => x0.get(x1),
      nJ: (x0,x1) => new WebSocket(x0,x1),
      nK: x0 => x0.response,
      nL: (x0,x1) => x0.querySelector(x1),
      nM: x0 => x0.nextSibling,
      nN: x0 => x0.ctrlKey,
      nO: x0 => x0.projectId,
      nP: x0 => x0.idToken,
      nQ: x0 => x0.getReader(),
      o: (o0, o1, o2) => [o0, o1, o2],
      oB: Function.prototype.call.bind(DataView.prototype.getUint32),
      oC: Object.is,
      oD: () => new TextDecoder("utf-8", {fatal: false}),
      oE: x0 => x0.ctrlKey,
      oF: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      oG: o => Object.keys(o),
      oH: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      oI: (x0,x1,x2,x3) => x0.sign(x1,x2,x3),
      oJ: x0 => x0.reason,
      oK: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      oL: (x0,x1) => x0.appendChild(x1),
      oM: (x0,x1) => x0.debug(x1),
      oN: (x0,x1) => x0.getAttribute(x1),
      oO: x0 => x0.apiKey,
      oP: x0 => x0.secret,
      oQ: x0 => x0.value,
      p: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      pB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint32Array) return 1;
        return 2;
      },
      pC: x0 => x0.vendor,
      pD: (a, i, v) => a[i] = v,
      pE: x0 => x0.y,
      pF: () => typeof dartUseDateNowForTicks !== "undefined",
      pG: x0 => x0.state,
      pH: x0 => x0.readText(),
      pI: x0 => x0.subtle,
      pJ: x0 => x0.code,
      pK: (x0,x1) => { x0.responseType = x1 },
      pL: (x0,x1) => { x0.src = x1 },
      pM: x0 => x0.hostElement,
      pN: (x0,x1) => x0.closest(x1),
      pO: x0 => x0.options,
      pP: x0 => x0.accessToken,
      pQ: x0 => x0.done,
      q: (x0,x1,x2) => { x0[x1] = x2 },
      qB: Function.prototype.call.bind(DataView.prototype.getInt32),
      qC: (x0,x1) => x0.createTextNode(x1),
      qD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      qE: x0 => x0.x,
      qF: () => Date.now(),
      qG: x0 => x0.hash,
      qH: x0 => x0.clipboard,
      qI: x0 => x0.crypto,
      qJ: (o, t) => typeof o === t,
      qK: () => new XMLHttpRequest(),
      qL: (x0,x1) => { x0.async = x1 },
      qM: x0 => x0.location,
      qN: x0 => x0.tagName,
      qO: () => globalThis.firebase_core.getApps(),
      qP: x0 => x0.signInMethod,
      qQ: x0 => x0.read(),
      r: (o, p) => o[p],
      rB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int32Array) return 1;
        return 2;
      },
      rC: (x0,x1) => { x0.id = x1 },
      rD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI16ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      rE: x0 => x0.scrollTop,
      rF: () => 1000 * performance.now(),
      rG: x0 => x0.state,
      rH: (x0,x1) => x0.writeText(x1),
      rI: (x0,x1) => x0.getRandomValues(x1),
      rJ: x0 => x0.data,
      rK: (x0,x1,x2,x3) => ({userid: x0,keyid: x1,alg: x2,privateKey: x3}),
      rL: (x0,x1) => { x0.charset = x1 },
      rM: (x0,x1) => x0.getModifierState(x1),
      rN: x0 => x0.target,
      rO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      rP: x0 => x0.providerId,
      rQ: x0 => x0.body,
      s: () => globalThis,
      sB: o => o instanceof Uint16Array,
      sC: (x0,x1) => { x0.nonce = x1 },
      sD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      sE: x0 => x0.offsetTop,
      sF: (x0,x1) => x0.requestAnimationFrame(x1),
      sG: (x0,x1) => x0.go(x1),
      sH: x0 => x0.unlock(),
      sI: () => globalThis.crypto,
      sJ: x0 => x0.readyState,
      sK: (x0,x1,x2) => x0.put(x1,x2),
      sL: (x0,x1) => { x0.type = x1 },
      sM: x0 => x0.metaKey,
      sN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      sO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      sP: x0 => x0.signOut(),
      sQ: (x0,x1) => new OffscreenCanvas(x0,x1),
      t: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tB: Function.prototype.call.bind(DataView.prototype.getUint16),
      tC: x0 => x0.nonce,
      tD: x0 => x0.visibilityState,
      tE: x0 => x0.scrollLeft,
      tF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tG: x0 => x0.parentElement,
      tH: (x0,x1) => x0.lock(x1),
      tI: l => new DataView(new ArrayBuffer(l)),
      tJ: (x0,x1) => { x0.binaryType = x1 },
      tK: (x0,x1,x2) => x0.exportKey(x1,x2),
      tL: x0 => x0.href,
      tM: x0 => x0.altKey,
      tN: (x0,x1,x2) => x0.setItem(x1,x2),
      tO: (x0,x1,x2) => x0.onAuthStateChanged(x1,x2),
      tP: x0 => x0.providerId,
      tQ: x0 => x0.assetBase,
      u: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      uB: o => o instanceof Int16Array,
      uC: () => globalThis.window.flutterConfiguration,
      uD: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      uE: x0 => x0.offsetLeft,
      uF: x0 => x0.now(),
      uG: (x0,x1) => x0.querySelectorAll(x1),
      uH: x0 => x0.orientation,
      uI: () => new XMLHttpRequest(),
      uJ: x0 => x0.naturalHeight,
      uK: (x0,x1,x2,x3) => x0.generateKey(x1,x2,x3),
      uL: x0 => x0.location,
      uM: x0 => x0.ctrlKey,
      uN: x0 => x0.localStorage,
      uO: x0 => x0.call(),
      uP: x0 => x0.providerData,
      uQ: x0 => x0.loader,
      v: (x0,x1) => ({addView: x0,removeView: x1}),
      vB: Function.prototype.call.bind(DataView.prototype.getInt16),
      vC: (x0,x1) => x0.attachShadow(x1),
      vD: x0 => x0.disconnect(),
      vE: x0 => x0.offsetParent,
      vF: x0 => x0.performance,
      vG: (d, digits) => d.toFixed(digits),
      vH: (x0,x1) => x0.querySelector(x1),
      vI: (x0,x1,x2) => x0.open(x1,x2),
      vJ: x0 => x0.naturalWidth,
      vK: x0 => x0.publicKey,
      vL: x0 => x0.baseURI,
      vM: x0 => x0.isComposing,
      vN: (x0,x1) => x0.removeItem(x1),
      vO: x0 => x0.toJSON(),
      vP: x0 => x0.tenantId,
      vQ: () => globalThis._flutter,
      w: (l, r) => l === r,
      wB: o => o instanceof Uint8ClampedArray,
      wC: (x0,x1) => x0.createElement(x1),
      wD: x0 => new Intl.Locale(x0),
      wE: (o, p, r) => o.replace(p, () => r),
      wF: x0 => new Uint8Array(x0),
      wG: x0 => x0.maxHeight,
      wH: (x0,x1) => { x0.title = x1 },
      wI: (x0,x1) => x0.send(x1),
      wJ: (x0,x1) => x0.createElement(x1),
      wK: x0 => x0.privateKey,
      wL: x0 => { globalThis.pdfiumWasmWorkerUrl = x0 },
      wM: x0 => x0.code,
      wN: (x0,x1) => x0.getItem(x1),
      wO: x0 => x0.uid,
      wP: x0 => x0.refreshToken,
      x: x0 => x0.random(),
      xB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint8Array) return 1;
        return 2;
      },
      xC: x0 => x0.scale,
      xD: x0 => x0.region,
      xE: (o, p, r) => o.replaceAll(p, () => r),
      xF: (x0,x1,x2) => x0.slice(x1,x2),
      xG: x0 => x0.maxWidth,
      xH: (x0,x1) => x0.vibrate(x1),
      xI: x0 => x0.send(),
      xJ: (x0,x1) => { x0.pointerEvents = x1 },
      xK: () => new FileReader(),
      xL: x0 => ({type: x0}),
      xM: x0 => x0.repeat,
      xN: (x0,x1) => x0.key(x1),
      xO: (x0,x1) => globalThis.firebase_auth.connectAuthEmulator(x0,x1),
      xP: x0 => x0.photoURL,
      y: () => globalThis.Math,
      yB: Function.prototype.call.bind(DataView.prototype.setInt32),
      yC: x0 => x0.visualViewport,
      yD: x0 => x0.script,
      yE: x0 => x0.deltaMode,
      yF: (x0,x1) => x0.decode(x1),
      yG: x0 => x0.minHeight,
      yH: x0 => x0.content,
      yI: x0 => x0.abort(),
      yJ: (x0,x1) => { x0.height = x1 },
      yK: (x0,x1) => x0.readAsArrayBuffer(x1),
      yL: (x0,x1) => new Blob(x0,x1),
      yM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      yN: x0 => x0.length,
      yO: x0 => x0.hostname,
      yP: x0 => x0.phoneNumber,
      z: (x0,x1) => x0.prepend(x1),
      zB: Function.prototype.call.bind(DataView.prototype.setUint32),
      zC: x0 => x0.devicePixelRatio,
      zD: x0 => x0.language,
      zE: x0 => x0.deltaY,
      zF: (x0,x1) => x0.adoptText(x1),
      zG: x0 => x0.minWidth,
      zH: x0 => x0.document,
      zI: x0 => x0.upload,
      zJ: (x0,x1) => { x0.width = x1 },
      zK: x0 => x0.result,
      zL: x0 => globalThis.URL.createObjectURL(x0),
      zM: (x0,x1) => x0.removeAttribute(x1),
      zN: (x0,x1) => x0.append(x1),
      zO: (x0,x1,x2) => ({errorMap: x0,persistence: x1,popupRedirectResolver: x2}),
      zP: x0 => x0.lastSignInTime,

    };

    const baseImports = {
      _: dart2wasm,
      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
      WebAssembly: {
        JSTag: WebAssembly.JSTag,
      },
      "": new Proxy({}, { get(_, prop) { return prop; } }),

    };

    const jsStringPolyfill = {
      "charCodeAt": (s, i) => s.charCodeAt(i),
      "compare": (s1, s2) => {
        if (s1 < s2) return -1;
        if (s1 > s2) return 1;
        return 0;
      },
      "concat": (s1, s2) => s1 + s2,
      "equals": (s1, s2) => s1 === s2,
      "fromCharCode": (i) => String.fromCharCode(i),
      "length": (s) => s.length,
      "substring": (s, a, b) => s.substring(a, b),
      "fromCharCodeArray": (a, start, end) => {
        if (end <= start) return '';

        const read = dartInstance.exports.$wasmI16ArrayGet;
        let result = '';
        let index = start;
        const chunkLength = Math.min(end - index, 500);
        let array = new Array(chunkLength);
        while (index < end) {
          const newChunkLength = Math.min(end - index, 500);
          for (let i = 0; i < newChunkLength; i++) {
            array[i] = read(a, index++);
          }
          if (newChunkLength < chunkLength) {
            array = array.slice(0, newChunkLength);
          }
          result += String.fromCharCode(...array);
        }
        return result;
      },
      "intoCharCodeArray": (s, a, start) => {
        if (s === '') return 0;

        const write = dartInstance.exports.$wasmI16ArraySet;
        for (var i = 0; i < s.length; ++i) {
          write(a, start++, s.charCodeAt(i));
        }
        return s.length;
      },
      "test": (s) => typeof s == "string",
    };


    

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      
      "wasm:js-string": jsStringPolyfill,
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}
