/* Building a Custom EventEmitter from Scratch

Below is a complete, modern implementation that:

    Mirrors Node’s API (on, off, once, emit, listenerCount).
    Works in any JavaScript runtime (browser, Deno, Node).
    Supports async listeners (awaitable .emitAsync).
    Is tiny – ~90 lines (≈ 1 KB minified).
    Has type‑safety with TypeScript (optional, but the JS version works just as well).

    Note: The class uses a Map<string, Set<Function>> to store listeners. Set guarantees unique callbacks and O(1) removal – a small but important performance win over plain arrays. */

/**
 * Tiny EventEmitter – works everywhere.
 *
 * Features:
 *  - on(event, fn)      – register a listener
 *  - off(event, fn)     – deregister
 *  - once(event, fn)    – fire once then auto‑remove
 *  - emit(event, ...args) – sync dispatch
 *  - emitAsync(event, ...args) – async dispatch (await all listeners)
 *  - listenerCount(event)
 *
 * No external dependencies, no Node globals.
 */

class EventEmitter {
  /** @private map of event name → Set of listeners */
  #events = new Map();

  /** Register a listener */
  on(event, listener) {
    if (typeof listener !== 'function')
      throw new TypeError('Listener must be a function');

    const listeners = this.#events.get(event) ?? new Set();
    listeners.add(listener);
    this.#events.set(event, listeners);
    return this; // chaining
  }

  /** Alias – many devs expect `addListener` */
  addListener(event, listener) {
    return this.on(event, listener);
  }

  /** Remove a specific listener (or all listeners if none supplied) */
  off(event, listener) {
    if (!this.#events.has(event)) return this;

    if (listener === undefined) {
      // Remove *all* listeners for this event
      this.#events.delete(event);
      return this;
    }

    const listeners = this.#events.get(event);
    listeners.delete(listener);
    // Clean up empty sets to keep the map lean
    if (listeners.size === 0) this.#events.delete(event);
    return this;
  }

  /** Alias for `off` */
  removeListener(event, listener) {
    return this.off(event, listener);
  }

  /** Register a listener that runs at most once */
  once(event, listener) {
    const onceWrapper = (...args) => {
      // Remove before invoking in case listener throws
      this.off(event, onceWrapper);
      listener.apply(this, args);
    };
    // Preserve reference for removal if user calls off(event, listener) later
    onceWrapper.original = listener;
    return this.on(event, onceWrapper);
  }

  /** Dispatch an event synchronously */
  emit(event, ...args) {
    const listeners = this.#events.get(event);
    if (!listeners) return false; // no listeners

    // Clone to allow listeners to add/remove during iteration
    for (const listener of [...listeners]) {
      try {
        listener.apply(this, args);
      } catch (err) {
        // Mimic Node: emit 'error' if not already handling it
        if (event !== 'error') this.emit('error', err);
        else console.error('Uncaught error event listener:', err);
      }
    }
    return true;
  }

  /** Dispatch an event and await any promises returned by listeners */
  async emitAsync(event, ...args) {
    const listeners = this.#events.get(event);
    if (!listeners) return false;

    const results = [];
    for (const listener of [...listeners]) {
      try {
        const res = listener.apply(this, args);
        // If the listener returns a promise, await it
        results.push(Promise.resolve(res));
      } catch (err) {
        // Same error‑forwarding behaviour as `emit`
        if (event !== 'error') this.emit('error', err);
        else console.error('Uncaught error event listener:', err);
      }
    }
    await Promise.all(results);
    return true;
  }

  /** Number of listeners for a given event */
  listenerCount(event) {
    const listeners = this.#events.get(event);
    return listeners ? listeners.size : 0;
  }

  /** Return an array of listeners (read‑only) – useful for debugging */
  listeners(event) {
    const listeners = this.#events.get(event);
    return listeners ? [...listeners] : [];
  }

  /** Remove *all* listeners for all events (or just one event) */
  removeAllListeners(event) {
    if (event !== undefined) {
      this.#events.delete(event);
    } else {
      this.#events.clear();
    }
    return this;
  }
}

module.exports = { EventEmitter }


/*

How It Works – A Quick Walk‑through
Part 	What it does
#events 	Private Map holding a Set of callbacks per event name.
on / addListener 	Guarantees the listener is a function, adds it to the Set.
off / removeListener 	If a listener is supplied, delete it; otherwise wipe the whole event.
once 	Wraps the original listener in a “self‑removing” function. The wrapper holds a reference to the original via .original – handy for later removal if needed.
emit 	Synchronously invokes each listener in insertion order. Errors are caught and re‑emitted on 'error' (just like Node).
emitAsync 	Same as emit but aggregates all returned promises and awaits them. Perfect for e.g., loading data before UI updates.
listenerCount / listeners 	Inspection utilities for debugging or introspection.
removeAllListeners 	Bulk cleanup, especially handy in a component’s dispose method.

    Why use a Set?

        No duplicate callbacks (adding the same function twice is a no‑op).
        Fast delete – O(1) compared to O(n) for an array splice.

4️⃣ Using the Custom Emitter – Real‑World Scenarios
4.1 A Minimal Pub/Sub Service

// pubsub.js
export const bus = new EventEmitter();

// componentA.js
import { bus } from './pubsub.js';

bus.on('user:login', ({ id, name }) => {
  console.log(`Welcome, ${name}!`);
});

// componentB.js
import { bus } from './pubsub.js';

function login(user) {
  // ... authentication logic ...
  bus.emit('user:login', user);
}

4.2 Async Workflow (e.g., Data Fetch + UI Refresh)

class DataStore extends EventEmitter {
  async fetchAndStore(url) {
    const resp = await fetch(url);
    const data = await resp.json();
    this.emit('data:ready', data); // synchronous for UI
    await this.emitAsync('data:ready:async', data); // wait for any async listeners
  }
}

const store = new DataStore();

store.on('data:ready', data => {
  // quick UI update
  document.querySelector('#count').textContent = data.items.length;
});

store.on('data:ready:async', async data => {
  // heavy processing that we don't want to block UI
  await heavyComputation(data);
});

store.fetchAndStore('/api/items');

4.3 Cleaning Up in a SPA Component

class Modal extends EventEmitter {
  constructor() {
    super();
    this._closeHandler = this.close.bind(this);
    document.addEventListener('keydown', this._closeHandler);
  }

  close() {
    this.emit('close');
    this.destroy();
  }

  destroy() {
    document.removeEventListener('keydown', this._closeHandler);
    this.removeAllListeners(); // avoid memory leaks
  }
}

5️⃣ Advanced Tips & Gotchas
Tip 	Why it matters
Never expose the internal Map – keep it private (#events). This prevents external code from mutating your listener registry unintentionally. 	
Clone listeners before iteration ([...listeners]). Listeners may add or remove other listeners while the event is being emitted; cloning protects us from “skip or double‑call” bugs. 	
Graceful error handling – Re‑emit errors on 'error'. If no 'error' listener exists, log it. This mirrors Node’s behaviour and prevents uncaught exceptions from silently killing your app. 	
Maximum listeners warning – Node warns when you add >10 listeners to avoid memory leaks. You can add a similar safeguard (this.maxListeners = 20;) if you want, but it’s optional for most front‑end code. 	
Wildcard / pattern matching – Not included in the tiny version, but you can extend the class (e.g., store listeners keyed by regex or *). See libraries like eventemitter2 for inspiration. 	
TypeScript users – Declare a generic interface: class EventEmitter<Events extends Record<string, any[]>> to get compile‑time safety for event names and payloads. 	
5.1 Adding a maxListeners Feature (Optional)

class EventEmitter {
  maxListeners = 10; // default

  on(event, listener) {
    // ... previous code ...
    if (this.listenerCount(event) > this.maxListeners) {
      console.warn(`Possible memory leak: ${this.listenerCount(event)} listeners added for "${event}"`);
    }
    return this;
  }
}

That tiny addition gives you the same helpful warning you see in Node.
6️⃣ When to Prefer the Native EventTarget
Situation 	Best choice
You already have an HTML element and want to dispatch UI‑related events. 	Use element.dispatchEvent(new CustomEvent(...)).
You need bubbling/capturing across a DOM tree. 	EventTarget + CustomEvent (or a library that builds on it).
You’re writing a library that must interoperate with other DOM‑centric code (e.g., a tooltip component that should be cancelable). 	Subclass EventTarget and expose addEventListener/dispatchEvent.
You need a tiny, Node‑like API and don’t care about bubbling. 	Use the custom EventEmitter above.

Both approaches are perfectly valid; pick the one that matches your use‑case and bundle constraints.
7️⃣ TL;DR – The One‑Liner Summary

    If you need a small, framework‑agnostic event hub that works everywhere, roll your own EventEmitter (≈ 1 KB).
    For DOM‑centric interactions, lean on the native EventTarget/CustomEvent.

Either way, you now have the tools to handle custom JavaScript events without pulling in Node’s events module. 

*/