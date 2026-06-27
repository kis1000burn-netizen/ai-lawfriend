#!/usr/bin/env node
import { compressDiagnosticBundle } from "../lib/compress-bundle.mjs";

const result = compressDiagnosticBundle();
console.log(result.ok ? "compress PASS" : "compress FAIL");
console.log(result.bundlePath ?? "(no bundle)");
if (!result.ok) process.exit(1);
