// Ensure Web Streams are available before importing Playwright in specs.
// This file must be imported first in every spec.
import * as web from 'stream/web'

const g: any = globalThis as any
if (!g.TransformStream && (web as any).TransformStream)
  g.TransformStream = (web as any).TransformStream
if (!g.ReadableStream && (web as any).ReadableStream)
  g.ReadableStream = (web as any).ReadableStream
if (!g.WritableStream && (web as any).WritableStream)
  g.WritableStream = (web as any).WritableStream
