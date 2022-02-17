
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function once(fn) {
        let ran = false;
        return function (...args) {
            if (ran)
                return;
            ran = true;
            fn.call(this, ...args);
        };
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function self$1(fn) {
        return function (event) {
            // @ts-ignore
            if (event.target === this)
                fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    var alea$1 = {exports: {}};

    (function (module) {
    // A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
    // http://baagoe.com/en/RandomMusings/javascript/
    // https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
    // Original work is under MIT license -

    // Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
    //
    // Permission is hereby granted, free of charge, to any person obtaining a copy
    // of this software and associated documentation files (the "Software"), to deal
    // in the Software without restriction, including without limitation the rights
    // to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    // copies of the Software, and to permit persons to whom the Software is
    // furnished to do so, subject to the following conditions:
    //
    // The above copyright notice and this permission notice shall be included in
    // all copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    // THE SOFTWARE.



    (function(global, module, define) {

    function Alea(seed) {
      var me = this, mash = Mash();

      me.next = function() {
        var t = 2091639 * me.s0 + me.c * 2.3283064365386963e-10; // 2^-32
        me.s0 = me.s1;
        me.s1 = me.s2;
        return me.s2 = t - (me.c = t | 0);
      };

      // Apply the seeding algorithm from Baagoe.
      me.c = 1;
      me.s0 = mash(' ');
      me.s1 = mash(' ');
      me.s2 = mash(' ');
      me.s0 -= mash(seed);
      if (me.s0 < 0) { me.s0 += 1; }
      me.s1 -= mash(seed);
      if (me.s1 < 0) { me.s1 += 1; }
      me.s2 -= mash(seed);
      if (me.s2 < 0) { me.s2 += 1; }
      mash = null;
    }

    function copy(f, t) {
      t.c = f.c;
      t.s0 = f.s0;
      t.s1 = f.s1;
      t.s2 = f.s2;
      return t;
    }

    function impl(seed, opts) {
      var xg = new Alea(seed),
          state = opts && opts.state,
          prng = xg.next;
      prng.int32 = function() { return (xg.next() * 0x100000000) | 0; };
      prng.double = function() {
        return prng() + (prng() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
      };
      prng.quick = prng;
      if (state) {
        if (typeof(state) == 'object') copy(state, xg);
        prng.state = function() { return copy(xg, {}); };
      }
      return prng;
    }

    function Mash() {
      var n = 0xefc8249d;

      var mash = function(data) {
        data = String(data);
        for (var i = 0; i < data.length; i++) {
          n += data.charCodeAt(i);
          var h = 0.02519603282416938 * n;
          n = h >>> 0;
          h -= n;
          h *= n;
          n = h >>> 0;
          h -= n;
          n += h * 0x100000000; // 2^32
        }
        return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
      };

      return mash;
    }


    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function() { return impl; });
    } else {
      this.alea = impl;
    }

    })(
      commonjsGlobal,
      module,    // present in node.js
      (typeof undefined) == 'function'    // present with an AMD loader
    );
    }(alea$1));

    var xor128$1 = {exports: {}};

    (function (module) {
    // A Javascript implementaion of the "xor128" prng algorithm by
    // George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

    (function(global, module, define) {

    function XorGen(seed) {
      var me = this, strseed = '';

      me.x = 0;
      me.y = 0;
      me.z = 0;
      me.w = 0;

      // Set up generator function.
      me.next = function() {
        var t = me.x ^ (me.x << 11);
        me.x = me.y;
        me.y = me.z;
        me.z = me.w;
        return me.w ^= (me.w >>> 19) ^ t ^ (t >>> 8);
      };

      if (seed === (seed | 0)) {
        // Integer seed.
        me.x = seed;
      } else {
        // String seed.
        strseed += seed;
      }

      // Mix in string seed, then discard an initial batch of 64 values.
      for (var k = 0; k < strseed.length + 64; k++) {
        me.x ^= strseed.charCodeAt(k) | 0;
        me.next();
      }
    }

    function copy(f, t) {
      t.x = f.x;
      t.y = f.y;
      t.z = f.z;
      t.w = f.w;
      return t;
    }

    function impl(seed, opts) {
      var xg = new XorGen(seed),
          state = opts && opts.state,
          prng = function() { return (xg.next() >>> 0) / 0x100000000; };
      prng.double = function() {
        do {
          var top = xg.next() >>> 11,
              bot = (xg.next() >>> 0) / 0x100000000,
              result = (top + bot) / (1 << 21);
        } while (result === 0);
        return result;
      };
      prng.int32 = xg.next;
      prng.quick = prng;
      if (state) {
        if (typeof(state) == 'object') copy(state, xg);
        prng.state = function() { return copy(xg, {}); };
      }
      return prng;
    }

    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function() { return impl; });
    } else {
      this.xor128 = impl;
    }

    })(
      commonjsGlobal,
      module,    // present in node.js
      (typeof undefined) == 'function'    // present with an AMD loader
    );
    }(xor128$1));

    var xorwow$1 = {exports: {}};

    (function (module) {
    // A Javascript implementaion of the "xorwow" prng algorithm by
    // George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

    (function(global, module, define) {

    function XorGen(seed) {
      var me = this, strseed = '';

      // Set up generator function.
      me.next = function() {
        var t = (me.x ^ (me.x >>> 2));
        me.x = me.y; me.y = me.z; me.z = me.w; me.w = me.v;
        return (me.d = (me.d + 362437 | 0)) +
           (me.v = (me.v ^ (me.v << 4)) ^ (t ^ (t << 1))) | 0;
      };

      me.x = 0;
      me.y = 0;
      me.z = 0;
      me.w = 0;
      me.v = 0;

      if (seed === (seed | 0)) {
        // Integer seed.
        me.x = seed;
      } else {
        // String seed.
        strseed += seed;
      }

      // Mix in string seed, then discard an initial batch of 64 values.
      for (var k = 0; k < strseed.length + 64; k++) {
        me.x ^= strseed.charCodeAt(k) | 0;
        if (k == strseed.length) {
          me.d = me.x << 10 ^ me.x >>> 4;
        }
        me.next();
      }
    }

    function copy(f, t) {
      t.x = f.x;
      t.y = f.y;
      t.z = f.z;
      t.w = f.w;
      t.v = f.v;
      t.d = f.d;
      return t;
    }

    function impl(seed, opts) {
      var xg = new XorGen(seed),
          state = opts && opts.state,
          prng = function() { return (xg.next() >>> 0) / 0x100000000; };
      prng.double = function() {
        do {
          var top = xg.next() >>> 11,
              bot = (xg.next() >>> 0) / 0x100000000,
              result = (top + bot) / (1 << 21);
        } while (result === 0);
        return result;
      };
      prng.int32 = xg.next;
      prng.quick = prng;
      if (state) {
        if (typeof(state) == 'object') copy(state, xg);
        prng.state = function() { return copy(xg, {}); };
      }
      return prng;
    }

    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function() { return impl; });
    } else {
      this.xorwow = impl;
    }

    })(
      commonjsGlobal,
      module,    // present in node.js
      (typeof undefined) == 'function'    // present with an AMD loader
    );
    }(xorwow$1));

    var xorshift7$1 = {exports: {}};

    (function (module) {
    // A Javascript implementaion of the "xorshift7" algorithm by
    // François Panneton and Pierre L'ecuyer:
    // "On the Xorgshift Random Number Generators"
    // http://saluc.engr.uconn.edu/refs/crypto/rng/panneton05onthexorshift.pdf

    (function(global, module, define) {

    function XorGen(seed) {
      var me = this;

      // Set up generator function.
      me.next = function() {
        // Update xor generator.
        var X = me.x, i = me.i, t, v;
        t = X[i]; t ^= (t >>> 7); v = t ^ (t << 24);
        t = X[(i + 1) & 7]; v ^= t ^ (t >>> 10);
        t = X[(i + 3) & 7]; v ^= t ^ (t >>> 3);
        t = X[(i + 4) & 7]; v ^= t ^ (t << 7);
        t = X[(i + 7) & 7]; t = t ^ (t << 13); v ^= t ^ (t << 9);
        X[i] = v;
        me.i = (i + 1) & 7;
        return v;
      };

      function init(me, seed) {
        var j, X = [];

        if (seed === (seed | 0)) {
          // Seed state array using a 32-bit integer.
          X[0] = seed;
        } else {
          // Seed state using a string.
          seed = '' + seed;
          for (j = 0; j < seed.length; ++j) {
            X[j & 7] = (X[j & 7] << 15) ^
                (seed.charCodeAt(j) + X[(j + 1) & 7] << 13);
          }
        }
        // Enforce an array length of 8, not all zeroes.
        while (X.length < 8) X.push(0);
        for (j = 0; j < 8 && X[j] === 0; ++j);
        if (j == 8) X[7] = -1;

        me.x = X;
        me.i = 0;

        // Discard an initial 256 values.
        for (j = 256; j > 0; --j) {
          me.next();
        }
      }

      init(me, seed);
    }

    function copy(f, t) {
      t.x = f.x.slice();
      t.i = f.i;
      return t;
    }

    function impl(seed, opts) {
      if (seed == null) seed = +(new Date);
      var xg = new XorGen(seed),
          state = opts && opts.state,
          prng = function() { return (xg.next() >>> 0) / 0x100000000; };
      prng.double = function() {
        do {
          var top = xg.next() >>> 11,
              bot = (xg.next() >>> 0) / 0x100000000,
              result = (top + bot) / (1 << 21);
        } while (result === 0);
        return result;
      };
      prng.int32 = xg.next;
      prng.quick = prng;
      if (state) {
        if (state.x) copy(state, xg);
        prng.state = function() { return copy(xg, {}); };
      }
      return prng;
    }

    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function() { return impl; });
    } else {
      this.xorshift7 = impl;
    }

    })(
      commonjsGlobal,
      module,    // present in node.js
      (typeof undefined) == 'function'    // present with an AMD loader
    );
    }(xorshift7$1));

    var xor4096$1 = {exports: {}};

    (function (module) {
    // A Javascript implementaion of Richard Brent's Xorgens xor4096 algorithm.
    //
    // This fast non-cryptographic random number generator is designed for
    // use in Monte-Carlo algorithms. It combines a long-period xorshift
    // generator with a Weyl generator, and it passes all common batteries
    // of stasticial tests for randomness while consuming only a few nanoseconds
    // for each prng generated.  For background on the generator, see Brent's
    // paper: "Some long-period random number generators using shifts and xors."
    // http://arxiv.org/pdf/1004.3115v1.pdf
    //
    // Usage:
    //
    // var xor4096 = require('xor4096');
    // random = xor4096(1);                        // Seed with int32 or string.
    // assert.equal(random(), 0.1520436450538547); // (0, 1) range, 53 bits.
    // assert.equal(random.int32(), 1806534897);   // signed int32, 32 bits.
    //
    // For nonzero numeric keys, this impelementation provides a sequence
    // identical to that by Brent's xorgens 3 implementaion in C.  This
    // implementation also provides for initalizing the generator with
    // string seeds, or for saving and restoring the state of the generator.
    //
    // On Chrome, this prng benchmarks about 2.1 times slower than
    // Javascript's built-in Math.random().

    (function(global, module, define) {

    function XorGen(seed) {
      var me = this;

      // Set up generator function.
      me.next = function() {
        var w = me.w,
            X = me.X, i = me.i, t, v;
        // Update Weyl generator.
        me.w = w = (w + 0x61c88647) | 0;
        // Update xor generator.
        v = X[(i + 34) & 127];
        t = X[i = ((i + 1) & 127)];
        v ^= v << 13;
        t ^= t << 17;
        v ^= v >>> 15;
        t ^= t >>> 12;
        // Update Xor generator array state.
        v = X[i] = v ^ t;
        me.i = i;
        // Result is the combination.
        return (v + (w ^ (w >>> 16))) | 0;
      };

      function init(me, seed) {
        var t, v, i, j, w, X = [], limit = 128;
        if (seed === (seed | 0)) {
          // Numeric seeds initialize v, which is used to generates X.
          v = seed;
          seed = null;
        } else {
          // String seeds are mixed into v and X one character at a time.
          seed = seed + '\0';
          v = 0;
          limit = Math.max(limit, seed.length);
        }
        // Initialize circular array and weyl value.
        for (i = 0, j = -32; j < limit; ++j) {
          // Put the unicode characters into the array, and shuffle them.
          if (seed) v ^= seed.charCodeAt((j + 32) % seed.length);
          // After 32 shuffles, take v as the starting w value.
          if (j === 0) w = v;
          v ^= v << 10;
          v ^= v >>> 15;
          v ^= v << 4;
          v ^= v >>> 13;
          if (j >= 0) {
            w = (w + 0x61c88647) | 0;     // Weyl.
            t = (X[j & 127] ^= (v + w));  // Combine xor and weyl to init array.
            i = (0 == t) ? i + 1 : 0;     // Count zeroes.
          }
        }
        // We have detected all zeroes; make the key nonzero.
        if (i >= 128) {
          X[(seed && seed.length || 0) & 127] = -1;
        }
        // Run the generator 512 times to further mix the state before using it.
        // Factoring this as a function slows the main generator, so it is just
        // unrolled here.  The weyl generator is not advanced while warming up.
        i = 127;
        for (j = 4 * 128; j > 0; --j) {
          v = X[(i + 34) & 127];
          t = X[i = ((i + 1) & 127)];
          v ^= v << 13;
          t ^= t << 17;
          v ^= v >>> 15;
          t ^= t >>> 12;
          X[i] = v ^ t;
        }
        // Storing state as object members is faster than using closure variables.
        me.w = w;
        me.X = X;
        me.i = i;
      }

      init(me, seed);
    }

    function copy(f, t) {
      t.i = f.i;
      t.w = f.w;
      t.X = f.X.slice();
      return t;
    }
    function impl(seed, opts) {
      if (seed == null) seed = +(new Date);
      var xg = new XorGen(seed),
          state = opts && opts.state,
          prng = function() { return (xg.next() >>> 0) / 0x100000000; };
      prng.double = function() {
        do {
          var top = xg.next() >>> 11,
              bot = (xg.next() >>> 0) / 0x100000000,
              result = (top + bot) / (1 << 21);
        } while (result === 0);
        return result;
      };
      prng.int32 = xg.next;
      prng.quick = prng;
      if (state) {
        if (state.X) copy(state, xg);
        prng.state = function() { return copy(xg, {}); };
      }
      return prng;
    }

    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function() { return impl; });
    } else {
      this.xor4096 = impl;
    }

    })(
      commonjsGlobal,                                     // window object or global
      module,    // present in node.js
      (typeof undefined) == 'function'    // present with an AMD loader
    );
    }(xor4096$1));

    var tychei$1 = {exports: {}};

    (function (module) {
    // A Javascript implementaion of the "Tyche-i" prng algorithm by
    // Samuel Neves and Filipe Araujo.
    // See https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf

    (function(global, module, define) {

    function XorGen(seed) {
      var me = this, strseed = '';

      // Set up generator function.
      me.next = function() {
        var b = me.b, c = me.c, d = me.d, a = me.a;
        b = (b << 25) ^ (b >>> 7) ^ c;
        c = (c - d) | 0;
        d = (d << 24) ^ (d >>> 8) ^ a;
        a = (a - b) | 0;
        me.b = b = (b << 20) ^ (b >>> 12) ^ c;
        me.c = c = (c - d) | 0;
        me.d = (d << 16) ^ (c >>> 16) ^ a;
        return me.a = (a - b) | 0;
      };

      /* The following is non-inverted tyche, which has better internal
       * bit diffusion, but which is about 25% slower than tyche-i in JS.
      me.next = function() {
        var a = me.a, b = me.b, c = me.c, d = me.d;
        a = (me.a + me.b | 0) >>> 0;
        d = me.d ^ a; d = d << 16 ^ d >>> 16;
        c = me.c + d | 0;
        b = me.b ^ c; b = b << 12 ^ d >>> 20;
        me.a = a = a + b | 0;
        d = d ^ a; me.d = d = d << 8 ^ d >>> 24;
        me.c = c = c + d | 0;
        b = b ^ c;
        return me.b = (b << 7 ^ b >>> 25);
      }
      */

      me.a = 0;
      me.b = 0;
      me.c = 2654435769 | 0;
      me.d = 1367130551;

      if (seed === Math.floor(seed)) {
        // Integer seed.
        me.a = (seed / 0x100000000) | 0;
        me.b = seed | 0;
      } else {
        // String seed.
        strseed += seed;
      }

      // Mix in string seed, then discard an initial batch of 64 values.
      for (var k = 0; k < strseed.length + 20; k++) {
        me.b ^= strseed.charCodeAt(k) | 0;
        me.next();
      }
    }

    function copy(f, t) {
      t.a = f.a;
      t.b = f.b;
      t.c = f.c;
      t.d = f.d;
      return t;
    }
    function impl(seed, opts) {
      var xg = new XorGen(seed),
          state = opts && opts.state,
          prng = function() { return (xg.next() >>> 0) / 0x100000000; };
      prng.double = function() {
        do {
          var top = xg.next() >>> 11,
              bot = (xg.next() >>> 0) / 0x100000000,
              result = (top + bot) / (1 << 21);
        } while (result === 0);
        return result;
      };
      prng.int32 = xg.next;
      prng.quick = prng;
      if (state) {
        if (typeof(state) == 'object') copy(state, xg);
        prng.state = function() { return copy(xg, {}); };
      }
      return prng;
    }

    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function() { return impl; });
    } else {
      this.tychei = impl;
    }

    })(
      commonjsGlobal,
      module,    // present in node.js
      (typeof undefined) == 'function'    // present with an AMD loader
    );
    }(tychei$1));

    var seedrandom$1 = {exports: {}};

    /*
    Copyright 2019 David Bau.

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
    IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
    CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
    TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
    SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

    */

    (function (module) {
    (function (global, pool, math) {
    //
    // The following constants are related to IEEE 754 limits.
    //

    var width = 256,        // each RC4 output is 0 <= x < 256
        chunks = 6,         // at least six RC4 outputs for each double
        digits = 52,        // there are 52 significant digits in a double
        rngname = 'random', // rngname: name for Math.random and Math.seedrandom
        startdenom = math.pow(width, chunks),
        significance = math.pow(2, digits),
        overflow = significance * 2,
        mask = width - 1,
        nodecrypto;         // node.js crypto module, initialized at the bottom.

    //
    // seedrandom()
    // This is the seedrandom function described above.
    //
    function seedrandom(seed, options, callback) {
      var key = [];
      options = (options == true) ? { entropy: true } : (options || {});

      // Flatten the seed string or build one from local entropy if needed.
      var shortseed = mixkey(flatten(
        options.entropy ? [seed, tostring(pool)] :
        (seed == null) ? autoseed() : seed, 3), key);

      // Use the seed to initialize an ARC4 generator.
      var arc4 = new ARC4(key);

      // This function returns a random double in [0, 1) that contains
      // randomness in every bit of the mantissa of the IEEE 754 value.
      var prng = function() {
        var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
            d = startdenom,                 //   and denominator d = 2 ^ 48.
            x = 0;                          //   and no 'extra last byte'.
        while (n < significance) {          // Fill up all significant digits by
          n = (n + x) * width;              //   shifting numerator and
          d *= width;                       //   denominator and generating a
          x = arc4.g(1);                    //   new least-significant-byte.
        }
        while (n >= overflow) {             // To avoid rounding up, before adding
          n /= 2;                           //   last byte, shift everything
          d /= 2;                           //   right using integer math until
          x >>>= 1;                         //   we have exactly the desired bits.
        }
        return (n + x) / d;                 // Form the number within [0, 1).
      };

      prng.int32 = function() { return arc4.g(4) | 0; };
      prng.quick = function() { return arc4.g(4) / 0x100000000; };
      prng.double = prng;

      // Mix the randomness into accumulated entropy.
      mixkey(tostring(arc4.S), pool);

      // Calling convention: what to return as a function of prng, seed, is_math.
      return (options.pass || callback ||
          function(prng, seed, is_math_call, state) {
            if (state) {
              // Load the arc4 state from the given state if it has an S array.
              if (state.S) { copy(state, arc4); }
              // Only provide the .state method if requested via options.state.
              prng.state = function() { return copy(arc4, {}); };
            }

            // If called as a method of Math (Math.seedrandom()), mutate
            // Math.random because that is how seedrandom.js has worked since v1.0.
            if (is_math_call) { math[rngname] = prng; return seed; }

            // Otherwise, it is a newer calling convention, so return the
            // prng directly.
            else return prng;
          })(
      prng,
      shortseed,
      'global' in options ? options.global : (this == math),
      options.state);
    }

    //
    // ARC4
    //
    // An ARC4 implementation.  The constructor takes a key in the form of
    // an array of at most (width) integers that should be 0 <= x < (width).
    //
    // The g(count) method returns a pseudorandom integer that concatenates
    // the next (count) outputs from ARC4.  Its return value is a number x
    // that is in the range 0 <= x < (width ^ count).
    //
    function ARC4(key) {
      var t, keylen = key.length,
          me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

      // The empty key [] is treated as [0].
      if (!keylen) { key = [keylen++]; }

      // Set up S using the standard key scheduling algorithm.
      while (i < width) {
        s[i] = i++;
      }
      for (i = 0; i < width; i++) {
        s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
        s[j] = t;
      }

      // The "g" method returns the next (count) outputs as one number.
      (me.g = function(count) {
        // Using instance members instead of closure state nearly doubles speed.
        var t, r = 0,
            i = me.i, j = me.j, s = me.S;
        while (count--) {
          t = s[i = mask & (i + 1)];
          r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
        }
        me.i = i; me.j = j;
        return r;
        // For robust unpredictability, the function call below automatically
        // discards an initial batch of values.  This is called RC4-drop[256].
        // See http://google.com/search?q=rsa+fluhrer+response&btnI
      })(width);
    }

    //
    // copy()
    // Copies internal state of ARC4 to or from a plain object.
    //
    function copy(f, t) {
      t.i = f.i;
      t.j = f.j;
      t.S = f.S.slice();
      return t;
    }
    //
    // flatten()
    // Converts an object tree to nested arrays of strings.
    //
    function flatten(obj, depth) {
      var result = [], typ = (typeof obj), prop;
      if (depth && typ == 'object') {
        for (prop in obj) {
          try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
        }
      }
      return (result.length ? result : typ == 'string' ? obj : obj + '\0');
    }

    //
    // mixkey()
    // Mixes a string seed into a key that is an array of integers, and
    // returns a shortened string seed that is equivalent to the result key.
    //
    function mixkey(seed, key) {
      var stringseed = seed + '', smear, j = 0;
      while (j < stringseed.length) {
        key[mask & j] =
          mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
      }
      return tostring(key);
    }

    //
    // autoseed()
    // Returns an object for autoseeding, using window.crypto and Node crypto
    // module if available.
    //
    function autoseed() {
      try {
        var out;
        if (nodecrypto && (out = nodecrypto.randomBytes)) {
          // The use of 'out' to remember randomBytes makes tight minified code.
          out = out(width);
        } else {
          out = new Uint8Array(width);
          (global.crypto || global.msCrypto).getRandomValues(out);
        }
        return tostring(out);
      } catch (e) {
        var browser = global.navigator,
            plugins = browser && browser.plugins;
        return [+new Date, global, plugins, global.screen, tostring(pool)];
      }
    }

    //
    // tostring()
    // Converts an array of charcodes to a string
    //
    function tostring(a) {
      return String.fromCharCode.apply(0, a);
    }

    //
    // When seedrandom.js is loaded, we immediately mix a few bits
    // from the built-in RNG into the entropy pool.  Because we do
    // not want to interfere with deterministic PRNG state later,
    // seedrandom will not call math.random on its own again after
    // initialization.
    //
    mixkey(math.random(), pool);

    //
    // Nodejs and AMD support: export the implementation as a module using
    // either convention.
    //
    if (module.exports) {
      module.exports = seedrandom;
      // When in node.js, try using crypto package for autoseeding.
      try {
        nodecrypto = require('crypto');
      } catch (ex) {}
    } else {
      // When included as a plain script, set up Math.seedrandom global.
      math['seed' + rngname] = seedrandom;
    }


    // End anonymous scope, and pass initial values.
    })(
      // global: `self` in browsers (including strict mode and web workers),
      // otherwise `this` in Node and other environments
      (typeof self !== 'undefined') ? self : commonjsGlobal,
      [],     // pool: entropy pool starts empty
      Math    // math: package containing random, pow, and seedrandom
    );
    }(seedrandom$1));

    // A library of seedable RNGs implemented in Javascript.
    //
    // Usage:
    //
    // var seedrandom = require('seedrandom');
    // var random = seedrandom(1); // or any seed.
    // var x = random();       // 0 <= x < 1.  Every bit is random.
    // var x = random.quick(); // 0 <= x < 1.  32 bits of randomness.

    // alea, a 53-bit multiply-with-carry generator by Johannes Baagøe.
    // Period: ~2^116
    // Reported to pass all BigCrush tests.
    var alea = alea$1.exports;

    // xor128, a pure xor-shift generator by George Marsaglia.
    // Period: 2^128-1.
    // Reported to fail: MatrixRank and LinearComp.
    var xor128 = xor128$1.exports;

    // xorwow, George Marsaglia's 160-bit xor-shift combined plus weyl.
    // Period: 2^192-2^32
    // Reported to fail: CollisionOver, SimpPoker, and LinearComp.
    var xorwow = xorwow$1.exports;

    // xorshift7, by François Panneton and Pierre L'ecuyer, takes
    // a different approach: it adds robustness by allowing more shifts
    // than Marsaglia's original three.  It is a 7-shift generator
    // with 256 bits, that passes BigCrush with no systmatic failures.
    // Period 2^256-1.
    // No systematic BigCrush failures reported.
    var xorshift7 = xorshift7$1.exports;

    // xor4096, by Richard Brent, is a 4096-bit xor-shift with a
    // very long period that also adds a Weyl generator. It also passes
    // BigCrush with no systematic failures.  Its long period may
    // be useful if you have many generators and need to avoid
    // collisions.
    // Period: 2^4128-2^32.
    // No systematic BigCrush failures reported.
    var xor4096 = xor4096$1.exports;

    // Tyche-i, by Samuel Neves and Filipe Araujo, is a bit-shifting random
    // number generator derived from ChaCha, a modern stream cipher.
    // https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf
    // Period: ~2^127
    // No systematic BigCrush failures reported.
    var tychei = tychei$1.exports;

    // The original ARC4-based prng included in this library.
    // Period: ~2^1600
    var sr = seedrandom$1.exports;

    sr.alea = alea;
    sr.xor128 = xor128;
    sr.xorwow = xorwow;
    sr.xorshift7 = xorshift7;
    sr.xor4096 = xor4096;
    sr.tychei = tychei;

    var seedrandom = sr;

    var GameMode;
    (function (GameMode) {
        GameMode[GameMode["daily"] = 0] = "daily";
    })(GameMode || (GameMode = {}));

    const words$1 = {
        "words": [
            "norte",
            "final",
            "tests",
            "covid",
            "ayres",
            "sleep",
            "child",
            "weeds",
            "alarm",
            "links",
            "years",
            "coats",
            "craig",
            "curry",
            "dafoe",
            "dupas",
            "halls",
            "hanes",
            "krenz",
            "nydam",
            "ozuna",
            "reich",
            "smith",
            "death",
            "study",
            "abuse",
            "chair",
            "drama",
            "whelp",
            "enemy",
            "focus",
            "drugs",
            "crack",
            "break",
            "canva",
            "paper",
            "lunch",
            "table",
            "clock",
            "grade",
            "coach",
            "score",
            "vaped",
            "vapes",
            "alarm",
            "cites",
            "curve",
            "limit",
            "trash",
            "books",
            "snake",
            "tutor",
            "smart",
            "geeky",
            "loser",
            "nerdy",
            "clubs",
            "teach",
            "study",
            "robot",
            "cheer",
            "dance",
            "track",
            "field",
            "pervy",
            "drive",
            "masks",
            "xanax",
            "apple",
            "stats",
            "rigid",
            "gross",
            "bread"
        ]
    };

    const ROWS = 6;
    const COLS = 5;
    const words = Object.assign(Object.assign({}, words$1), { contains: (word) => {
            return words$1.words.includes(word) || words$1.valid.includes(word);
        } });
    function checkHardMode(board, row) {
        for (let i = 0; i < COLS; ++i) {
            if (board.state[row - 1][i] === "🟩" && board.words[row - 1][i] !== board.words[row][i]) {
                return { pos: i, char: board.words[row - 1][i], type: "🟩" };
            }
        }
        for (let i = 0; i < COLS; ++i) {
            if (board.state[row - 1][i] === "🟨" && !board.words[row].includes(board.words[row - 1][i])) {
                return { pos: i, char: board.words[row - 1][i], type: "🟨" };
            }
        }
        return { pos: -1, char: "", type: "⬛" };
    }
    function getRowData(n, board) {
        const wordData = {
            // letters not contained
            not: [],
            // for letters contained in the word that are not the same as any that are in the correct place
            contained: new Set(),
            letters: Array.from({ length: COLS }, () => ({ val: null, not: new Set() })),
        };
        for (let row = 0; row < n; ++row) {
            for (let col = 0; col < COLS; ++col)
                if (board.state[row][col] === "🟨") {
                    wordData.contained.add(board.words[row][col]);
                    wordData.letters[col].not.add(board.words[row][col]);
                }
                else if (board.state[row][col] === "🟩") {
                    wordData.contained.delete(board.words[row][col]);
                    wordData.letters[col].val = board.words[row][col];
                }
                else {
                    wordData.not.push(board.words[row][col]);
                }
        }
        let exp = "";
        for (let i = 0; i < COLS; ++i) {
            exp += wordData.letters[i].val
                ? wordData.letters[i].val
                : `[^${[...wordData.not, ...wordData.letters[i].not].join(" ")}]`;
        }
        return (word) => {
            if (new RegExp(exp).test(word)) {
                for (const char of wordData.contained) {
                    if (!word.includes(char))
                        return false;
                }
                return true;
            }
            return false;
        };
    }
    function getState(word, guess) {
        const charArr = word.split("");
        const result = Array(5).fill("⬛");
        for (let i = 0; i < word.length; ++i) {
            if (charArr[i] === guess.charAt(i)) {
                result[i] = "🟩";
                charArr[i] = "$";
            }
        }
        return result.map((e, i) => charArr.includes(guess[i]) && e !== "🟩" ? "🟨" : e);
    }
    function contractNum(n) {
        switch (n % 10) {
            case 1: return `${n}st`;
            case 2: return `${n}nd`;
            case 3: return `${n}rd`;
            default: return `${n}rd`;
        }
    }
    const keys = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
    function newSeed(mode) {
        const today = new Date();
        switch (mode) {
            case GameMode.daily:
                return new Date(today.getFullYear(), today.getMonth(), today.getDate()).valueOf();
            case GameMode.hourly:
                return new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours()).valueOf();
            case GameMode.infinite:
                return new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds()).valueOf();
        }
    }
    const modeData = {
        default: GameMode.daily,
        modes: [
            {
                name: "Daily",
                unit: 86400000,
                start: 1642370400000,
                seed: newSeed(GameMode.daily),
                historical: false,
                streak: true,
            }
        ]
    };
    function getWordNumber(mode) {
        return Math.round((modeData.modes[mode].seed - modeData.modes[mode].start) / modeData.modes[mode].unit) + 1;
    }
    function seededRandomInt(min, max, seed) {
        const rng = seedrandom(`${seed}`);
        return Math.floor(min + (max - min) * rng());
    }
    const DELAY_INCREMENT = 150;
    const PRAISE = [
        "Genius",
        "Magnificent",
        "Impressive",
        "Splendid",
        "Great",
        "Phew",
    ];
    function createNewGame(mode) {
        return {
            active: true,
            guesses: 0,
            time: modeData.modes[mode].seed,
            wordNumber: getWordNumber(mode),
            validHard: true,
            board: {
                words: Array(ROWS).fill(""),
                state: Array.from({ length: ROWS }, () => (Array(COLS).fill("🔳")))
            },
        };
    }
    function createDefaultSettings() {
        return {
            hard: new Array(modeData.modes.length).map(() => false),
            dark: false,
            colorblind: false,
            tutorial: 2,
        };
    }
    function createDefaultStats(mode) {
        const stats = {
            played: 0,
            lastGame: 0,
            guesses: {
                fail: 0,
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0,
                6: 0,
            }
        };
        if (!modeData.modes[mode].streak)
            return stats;
        return Object.assign(Object.assign({}, stats), { streak: 0, maxStreak: 0 });
    }
    function createLetterStates() {
        return {
            a: "🔳",
            b: "🔳",
            c: "🔳",
            d: "🔳",
            e: "🔳",
            f: "🔳",
            g: "🔳",
            h: "🔳",
            i: "🔳",
            j: "🔳",
            k: "🔳",
            l: "🔳",
            m: "🔳",
            n: "🔳",
            o: "🔳",
            p: "🔳",
            q: "🔳",
            r: "🔳",
            s: "🔳",
            t: "🔳",
            u: "🔳",
            v: "🔳",
            w: "🔳",
            x: "🔳",
            y: "🔳",
            z: "🔳",
        };
    }
    const definitions = new Map();

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }
    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function blur(node, { delay = 0, duration = 400, easing = cubicInOut, amount = 5, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const f = style.filter === 'none' ? '' : style.filter;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `opacity: ${target_opacity - (od * u)}; filter: ${f} blur(${u * amount}px);`
        };
    }
    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const mode = writable();
    const letterStates = writable(createLetterStates());
    const settings = writable(createDefaultSettings());

    /* src\components\GameIcon.svelte generated by Svelte v3.46.4 */

    const file$o = "src\\components\\GameIcon.svelte";

    function create_fragment$p(ctx) {
    	let svg;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (default_slot) default_slot.c();
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "svelte-17ud64h");
    			add_location(svg, file$o, 3, 0, 64);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);

    			if (default_slot) {
    				default_slot.m(svg, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					svg,
    					"click",
    					function () {
    						if (is_function(/*onClick*/ ctx[0])) /*onClick*/ ctx[0].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('GameIcon', slots, ['default']);

    	let { onClick = () => {
    		
    	} } = $$props;

    	const writable_props = ['onClick'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<GameIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('onClick' in $$props) $$invalidate(0, onClick = $$props.onClick);
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ onClick });

    	$$self.$inject_state = $$props => {
    		if ('onClick' in $$props) $$invalidate(0, onClick = $$props.onClick);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [onClick, $$scope, slots];
    }

    class GameIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, { onClick: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GameIcon",
    			options,
    			id: create_fragment$p.name
    		});
    	}

    	get onClick() {
    		throw new Error("<GameIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClick(value) {
    		throw new Error("<GameIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Header.svelte generated by Svelte v3.46.4 */
    const file$n = "src\\components\\Header.svelte";

    // (20:2) <GameIcon onClick={() => dispatch("tutorial")}>
    function create_default_slot_3(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z");
    			add_location(path, file$n, 20, 3, 658);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(20:2) <GameIcon onClick={() => dispatch(\\\"tutorial\\\")}>",
    		ctx
    	});

    	return block;
    }

    // (25:2) {#if showRefresh}
    function create_if_block_1$2(ctx) {
    	let gameicon;
    	let current;

    	gameicon = new GameIcon({
    			props: {
    				onClick: /*func_1*/ ctx[7],
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(gameicon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gameicon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const gameicon_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				gameicon_changes.$$scope = { dirty, ctx };
    			}

    			gameicon.$set(gameicon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gameicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gameicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gameicon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(25:2) {#if showRefresh}",
    		ctx
    	});

    	return block;
    }

    // (26:3) <GameIcon onClick={() => dispatch("reload")}>
    function create_default_slot_2$1(ctx) {
    	let path;
    	let path_transition;
    	let current;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M4.609 12c0-4.082 3.309-7.391 7.391-7.391a7.39 7.39 0 0 1 6.523 3.912l-1.653 1.567H22v-5.13l-1.572 1.659C18.652 3.841 15.542 2 12 2 6.477 2 2 6.477 2 12s4.477 10 10 10c4.589 0 8.453-3.09 9.631-7.301l-2.512-.703c-.871 3.113-3.73 5.395-7.119 5.395-4.082 0-7.391-3.309-7.391-7.391z");
    			add_location(path, file$n, 26, 4, 1015);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!path_transition) path_transition = create_bidirectional_transition(path, fade, { duration: 200 }, true);
    				path_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!path_transition) path_transition = create_bidirectional_transition(path, fade, { duration: 200 }, false);
    			path_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    			if (detaching && path_transition) path_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(26:3) <GameIcon onClick={() => dispatch(\\\"reload\\\")}>",
    		ctx
    	});

    	return block;
    }

    // (47:2) {#if showStats}
    function create_if_block$8(ctx) {
    	let gameicon;
    	let current;

    	gameicon = new GameIcon({
    			props: {
    				onClick: /*func_2*/ ctx[10],
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(gameicon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gameicon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const gameicon_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				gameicon_changes.$$scope = { dirty, ctx };
    			}

    			gameicon.$set(gameicon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gameicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gameicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gameicon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(47:2) {#if showStats}",
    		ctx
    	});

    	return block;
    }

    // (48:3) <GameIcon onClick={() => dispatch("stats")}>
    function create_default_slot_1$2(ctx) {
    	let path;
    	let path_transition;
    	let current;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M16,11V3H8v6H2v12h20V11H16z M10,5h4v14h-4V5z M4,11h4v8H4V11z M20,19h-4v-6h4V19z");
    			add_location(path, file$n, 48, 4, 1816);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!path_transition) path_transition = create_bidirectional_transition(path, fade, { duration: 200 }, true);
    				path_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!path_transition) path_transition = create_bidirectional_transition(path, fade, { duration: 200 }, false);
    			path_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    			if (detaching && path_transition) path_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(48:3) <GameIcon onClick={() => dispatch(\\\"stats\\\")}>",
    		ctx
    	});

    	return block;
    }

    // (55:2) <GameIcon onClick={() => dispatch("settings")}>
    function create_default_slot$4(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z");
    			add_location(path, file$n, 55, 3, 2042);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(55:2) <GameIcon onClick={() => dispatch(\\\"settings\\\")}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$o(ctx) {
    	let header;
    	let div0;
    	let gameicon0;
    	let t0;
    	let t1;
    	let h1;
    	let t3;
    	let div1;
    	let t4;
    	let gameicon1;
    	let current;
    	let mounted;
    	let dispose;

    	gameicon0 = new GameIcon({
    			props: {
    				onClick: /*func*/ ctx[6],
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block0 = /*showRefresh*/ ctx[0] && create_if_block_1$2(ctx);
    	let if_block1 = /*showStats*/ ctx[1] && create_if_block$8(ctx);

    	gameicon1 = new GameIcon({
    			props: {
    				onClick: /*func_3*/ ctx[11],
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			header = element("header");
    			div0 = element("div");
    			create_component(gameicon0.$$.fragment);
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			h1 = element("h1");
    			h1.textContent = "delordle";
    			t3 = space();
    			div1 = element("div");
    			if (if_block1) if_block1.c();
    			t4 = space();
    			create_component(gameicon1.$$.fragment);
    			attr_dev(div0, "class", "icons svelte-1wr6bbv");
    			add_location(div0, file$n, 18, 1, 583);
    			attr_dev(h1, "class", "svelte-1wr6bbv");
    			add_location(h1, file$n, 33, 1, 1396);
    			attr_dev(div1, "class", "icons svelte-1wr6bbv");
    			add_location(div1, file$n, 45, 1, 1723);
    			attr_dev(header, "class", "svelte-1wr6bbv");
    			add_location(header, file$n, 17, 0, 572);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div0);
    			mount_component(gameicon0, div0, null);
    			append_dev(div0, t0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(header, t1);
    			append_dev(header, h1);
    			append_dev(header, t3);
    			append_dev(header, div1);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div1, t4);
    			mount_component(gameicon1, div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(h1, "click", self$1(/*click_handler*/ ctx[8]), false, false, false),
    					listen_dev(h1, "contextmenu", self$1(prevent_default(/*contextmenu_handler*/ ctx[9])), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const gameicon0_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				gameicon0_changes.$$scope = { dirty, ctx };
    			}

    			gameicon0.$set(gameicon0_changes);

    			if (/*showRefresh*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*showRefresh*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*showStats*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*showStats*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$8(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, t4);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			const gameicon1_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				gameicon1_changes.$$scope = { dirty, ctx };
    			}

    			gameicon1.$set(gameicon1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gameicon0.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(gameicon1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gameicon0.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(gameicon1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_component(gameicon0);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_component(gameicon1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let $mode;
    	validate_store(mode, 'mode');
    	component_subscribe($$self, mode, $$value => $$invalidate(3, $mode = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	let { showStats } = $$props;
    	let { tutorial } = $$props;
    	let { showRefresh } = $$props;
    	let { toaster = getContext("toaster") } = $$props;
    	const dispatch = createEventDispatcher();

    	mode.subscribe(m => {
    		if (modeData.modes[m].unit - (new Date().valueOf() - modeData.modes[m].seed) > 0) {
    			$$invalidate(0, showRefresh = false);
    		}
    	});

    	const writable_props = ['showStats', 'tutorial', 'showRefresh', 'toaster'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	const func = () => dispatch("tutorial");
    	const func_1 = () => dispatch("reload");

    	const click_handler = () => {
    		set_store_value(mode, $mode = ($mode + 1) % modeData.modes.length, $mode);
    		toaster.pop(modeData.modes[$mode].name);
    	};

    	const contextmenu_handler = () => {
    		set_store_value(mode, $mode = ($mode - 1 + modeData.modes.length) % modeData.modes.length, $mode);
    		toaster.pop(modeData.modes[$mode].name);
    	};

    	const func_2 = () => dispatch("stats");
    	const func_3 = () => dispatch("settings");

    	$$self.$$set = $$props => {
    		if ('showStats' in $$props) $$invalidate(1, showStats = $$props.showStats);
    		if ('tutorial' in $$props) $$invalidate(5, tutorial = $$props.tutorial);
    		if ('showRefresh' in $$props) $$invalidate(0, showRefresh = $$props.showRefresh);
    		if ('toaster' in $$props) $$invalidate(2, toaster = $$props.toaster);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		getContext,
    		scale,
    		fade,
    		mode,
    		modeData,
    		GameIcon,
    		showStats,
    		tutorial,
    		showRefresh,
    		toaster,
    		dispatch,
    		$mode
    	});

    	$$self.$inject_state = $$props => {
    		if ('showStats' in $$props) $$invalidate(1, showStats = $$props.showStats);
    		if ('tutorial' in $$props) $$invalidate(5, tutorial = $$props.tutorial);
    		if ('showRefresh' in $$props) $$invalidate(0, showRefresh = $$props.showRefresh);
    		if ('toaster' in $$props) $$invalidate(2, toaster = $$props.toaster);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		showRefresh,
    		showStats,
    		toaster,
    		$mode,
    		dispatch,
    		tutorial,
    		func,
    		func_1,
    		click_handler,
    		contextmenu_handler,
    		func_2,
    		func_3
    	];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {
    			showStats: 1,
    			tutorial: 5,
    			showRefresh: 0,
    			toaster: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$o.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*showStats*/ ctx[1] === undefined && !('showStats' in props)) {
    			console.warn("<Header> was created without expected prop 'showStats'");
    		}

    		if (/*tutorial*/ ctx[5] === undefined && !('tutorial' in props)) {
    			console.warn("<Header> was created without expected prop 'tutorial'");
    		}

    		if (/*showRefresh*/ ctx[0] === undefined && !('showRefresh' in props)) {
    			console.warn("<Header> was created without expected prop 'showRefresh'");
    		}
    	}

    	get showStats() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showStats(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tutorial() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tutorial(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showRefresh() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showRefresh(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toaster() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toaster(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\board\Tile.svelte generated by Svelte v3.46.4 */
    const file$m = "src\\components\\board\\Tile.svelte";

    function create_fragment$n(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let div2_class_value;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(/*value*/ ctx[0]);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(/*value*/ ctx[0]);
    			attr_dev(div0, "class", "front svelte-onsmvf");
    			add_location(div0, file$m, 30, 1, 802);
    			attr_dev(div1, "class", "back svelte-onsmvf");
    			add_location(div1, file$m, 31, 1, 837);
    			attr_dev(div2, "data-animation", /*animation*/ ctx[5]);
    			attr_dev(div2, "class", div2_class_value = "tile " + /*state*/ ctx[1] + " " + /*s*/ ctx[3] + " svelte-onsmvf");
    			set_style(div2, "transition-delay", /*position*/ ctx[2] * DELAY_INCREMENT + "ms");
    			toggle_class(div2, "value", /*value*/ ctx[0]);
    			toggle_class(div2, "pop", /*pop*/ ctx[4]);
    			add_location(div2, file$m, 23, 0, 651);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*value*/ 1) set_data_dev(t0, /*value*/ ctx[0]);
    			if (dirty & /*value*/ 1) set_data_dev(t2, /*value*/ ctx[0]);

    			if (dirty & /*animation*/ 32) {
    				attr_dev(div2, "data-animation", /*animation*/ ctx[5]);
    			}

    			if (dirty & /*state, s*/ 10 && div2_class_value !== (div2_class_value = "tile " + /*state*/ ctx[1] + " " + /*s*/ ctx[3] + " svelte-onsmvf")) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (dirty & /*position*/ 4) {
    				set_style(div2, "transition-delay", /*position*/ ctx[2] * DELAY_INCREMENT + "ms");
    			}

    			if (dirty & /*state, s, value*/ 11) {
    				toggle_class(div2, "value", /*value*/ ctx[0]);
    			}

    			if (dirty & /*state, s, pop*/ 26) {
    				toggle_class(div2, "pop", /*pop*/ ctx[4]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tile', slots, []);
    	let { value = "" } = $$props;
    	let { state } = $$props;
    	let { position = 0 } = $$props;

    	function bounce() {
    		setTimeout(() => $$invalidate(5, animation = "bounce"), (ROWS + position) * DELAY_INCREMENT);
    	}

    	let s;
    	let pop = false;
    	let animation = "";

    	// ensure all animations play
    	const unsub = mode.subscribe(() => {
    		$$invalidate(5, animation = "");
    		$$invalidate(3, s = "🔳");
    		setTimeout(() => $$invalidate(3, s = ""), 10);
    	});

    	// prevent pop animation from playing at the beginning
    	setTimeout(() => $$invalidate(4, pop = true), 200);

    	onDestroy(unsub);
    	const writable_props = ['value', 'state', 'position'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tile> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('state' in $$props) $$invalidate(1, state = $$props.state);
    		if ('position' in $$props) $$invalidate(2, position = $$props.position);
    	};

    	$$self.$capture_state = () => ({
    		onDestroy,
    		mode,
    		DELAY_INCREMENT,
    		ROWS,
    		value,
    		state,
    		position,
    		bounce,
    		s,
    		pop,
    		animation,
    		unsub
    	});

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('state' in $$props) $$invalidate(1, state = $$props.state);
    		if ('position' in $$props) $$invalidate(2, position = $$props.position);
    		if ('s' in $$props) $$invalidate(3, s = $$props.s);
    		if ('pop' in $$props) $$invalidate(4, pop = $$props.pop);
    		if ('animation' in $$props) $$invalidate(5, animation = $$props.animation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, state, position, s, pop, animation, bounce];
    }

    class Tile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {
    			value: 0,
    			state: 1,
    			position: 2,
    			bounce: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tile",
    			options,
    			id: create_fragment$n.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*state*/ ctx[1] === undefined && !('state' in props)) {
    			console.warn("<Tile> was created without expected prop 'state'");
    		}
    	}

    	get value() {
    		throw new Error("<Tile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Tile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Tile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Tile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get position() {
    		throw new Error("<Tile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<Tile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bounce() {
    		return this.$$.ctx[6];
    	}

    	set bounce(value) {
    		throw new Error("<Tile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\board\Row.svelte generated by Svelte v3.46.4 */
    const file$l = "src\\components\\board\\Row.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[14] = list;
    	child_ctx[15] = i;
    	return child_ctx;
    }

    // (27:1) {#each Array(COLS) as _, i}
    function create_each_block$7(ctx) {
    	let tile;
    	let i = /*i*/ ctx[15];
    	let current;
    	const assign_tile = () => /*tile_binding*/ ctx[9](tile, i);
    	const unassign_tile = () => /*tile_binding*/ ctx[9](null, i);

    	let tile_props = {
    		state: /*state*/ ctx[3][/*i*/ ctx[15]],
    		value: /*value*/ ctx[2].charAt(/*i*/ ctx[15]),
    		position: /*i*/ ctx[15]
    	};

    	tile = new Tile({ props: tile_props, $$inline: true });
    	assign_tile();

    	const block = {
    		c: function create() {
    			create_component(tile.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tile, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (i !== /*i*/ ctx[15]) {
    				unassign_tile();
    				i = /*i*/ ctx[15];
    				assign_tile();
    			}

    			const tile_changes = {};
    			if (dirty & /*state*/ 8) tile_changes.state = /*state*/ ctx[3][/*i*/ ctx[15]];
    			if (dirty & /*value*/ 4) tile_changes.value = /*value*/ ctx[2].charAt(/*i*/ ctx[15]);
    			tile.$set(tile_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tile.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tile.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			unassign_tile();
    			destroy_component(tile, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(27:1) {#each Array(COLS) as _, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = Array(COLS);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "board-row svelte-ssibky");
    			attr_dev(div, "data-animation", /*animation*/ ctx[4]);
    			toggle_class(div, "complete", /*guesses*/ ctx[0] > /*num*/ ctx[1]);
    			add_location(div, file$l, 18, 0, 440);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "contextmenu", prevent_default(/*contextmenu_handler*/ ctx[10]), false, true, false),
    					listen_dev(div, "dblclick", prevent_default(/*dblclick_handler*/ ctx[11]), false, true, false),
    					listen_dev(div, "animationend", /*animationend_handler*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*state, value, tiles*/ 44) {
    				each_value = Array(COLS);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*animation*/ 16) {
    				attr_dev(div, "data-animation", /*animation*/ ctx[4]);
    			}

    			if (dirty & /*guesses, num*/ 3) {
    				toggle_class(div, "complete", /*guesses*/ ctx[0] > /*num*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Row', slots, []);
    	let { guesses } = $$props;
    	let { num } = $$props;
    	let { value = "" } = $$props;
    	let { state } = $$props;

    	function shake() {
    		$$invalidate(4, animation = "shake");
    	}

    	function bounce() {
    		tiles.forEach(e => e.bounce());
    	}

    	const dispatch = createEventDispatcher();
    	let animation = "";
    	let tiles = [];
    	const writable_props = ['guesses', 'num', 'value', 'state'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Row> was created with unknown prop '${key}'`);
    	});

    	function tile_binding($$value, i) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			tiles[i] = $$value;
    			$$invalidate(5, tiles);
    		});
    	}

    	const contextmenu_handler = e => dispatch("ctx", { x: e.clientX, y: e.clientY });
    	const dblclick_handler = e => dispatch("ctx", { x: e.clientX, y: e.clientY });
    	const animationend_handler = () => $$invalidate(4, animation = "");

    	$$self.$$set = $$props => {
    		if ('guesses' in $$props) $$invalidate(0, guesses = $$props.guesses);
    		if ('num' in $$props) $$invalidate(1, num = $$props.num);
    		if ('value' in $$props) $$invalidate(2, value = $$props.value);
    		if ('state' in $$props) $$invalidate(3, state = $$props.state);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		COLS,
    		Tile,
    		guesses,
    		num,
    		value,
    		state,
    		shake,
    		bounce,
    		dispatch,
    		animation,
    		tiles
    	});

    	$$self.$inject_state = $$props => {
    		if ('guesses' in $$props) $$invalidate(0, guesses = $$props.guesses);
    		if ('num' in $$props) $$invalidate(1, num = $$props.num);
    		if ('value' in $$props) $$invalidate(2, value = $$props.value);
    		if ('state' in $$props) $$invalidate(3, state = $$props.state);
    		if ('animation' in $$props) $$invalidate(4, animation = $$props.animation);
    		if ('tiles' in $$props) $$invalidate(5, tiles = $$props.tiles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		guesses,
    		num,
    		value,
    		state,
    		animation,
    		tiles,
    		dispatch,
    		shake,
    		bounce,
    		tile_binding,
    		contextmenu_handler,
    		dblclick_handler,
    		animationend_handler
    	];
    }

    class Row extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {
    			guesses: 0,
    			num: 1,
    			value: 2,
    			state: 3,
    			shake: 7,
    			bounce: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Row",
    			options,
    			id: create_fragment$m.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*guesses*/ ctx[0] === undefined && !('guesses' in props)) {
    			console.warn("<Row> was created without expected prop 'guesses'");
    		}

    		if (/*num*/ ctx[1] === undefined && !('num' in props)) {
    			console.warn("<Row> was created without expected prop 'num'");
    		}

    		if (/*state*/ ctx[3] === undefined && !('state' in props)) {
    			console.warn("<Row> was created without expected prop 'state'");
    		}
    	}

    	get guesses() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set guesses(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get num() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set num(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shake() {
    		return this.$$.ctx[7];
    	}

    	set shake(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bounce() {
    		return this.$$.ctx[8];
    	}

    	set bounce(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\widgets\Definition.svelte generated by Svelte v3.46.4 */

    const { Error: Error_1 } = globals;
    const file$k = "src\\components\\widgets\\Definition.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (35:1) {:catch}
    function create_catch_block(ctx) {
    	let div;
    	let t0;
    	let strong;
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Your word was ");
    			strong = element("strong");
    			t1 = text(/*word*/ ctx[0]);
    			t2 = text(". (failed to fetch definition)");
    			add_location(strong, file$k, 35, 21, 1041);
    			add_location(div, file$k, 35, 2, 1022);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, strong);
    			append_dev(strong, t1);
    			append_dev(div, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*word*/ 1) set_data_dev(t1, /*word*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(35:1) {:catch}",
    		ctx
    	});

    	return block;
    }

    // (24:1) {:then data}
    function create_then_block(ctx) {
    	let h2;
    	let t0;
    	let t1;
    	let em;
    	let t2_value = /*data*/ ctx[3].meanings[0].partOfSpeech + "";
    	let t2;
    	let t3;
    	let ol;
    	let t4;
    	let if_block = /*word*/ ctx[0] !== /*data*/ ctx[3].word && create_if_block$7(ctx);
    	let each_value = /*data*/ ctx[3].meanings[0].definitions.slice(0, 1 + /*alternates*/ ctx[1] - (/*word*/ ctx[0] !== /*data*/ ctx[3].word ? 1 : 0));
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t0 = text(/*word*/ ctx[0]);
    			t1 = space();
    			em = element("em");
    			t2 = text(t2_value);
    			t3 = space();
    			ol = element("ol");
    			if (if_block) if_block.c();
    			t4 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "svelte-1cpaagx");
    			add_location(h2, file$k, 24, 2, 707);
    			add_location(em, file$k, 25, 2, 726);
    			attr_dev(ol, "class", "svelte-1cpaagx");
    			add_location(ol, file$k, 26, 2, 770);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, em, anchor);
    			append_dev(em, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, ol, anchor);
    			if (if_block) if_block.m(ol, null);
    			append_dev(ol, t4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ol, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*word*/ 1) set_data_dev(t0, /*word*/ ctx[0]);
    			if (dirty & /*word*/ 1 && t2_value !== (t2_value = /*data*/ ctx[3].meanings[0].partOfSpeech + "")) set_data_dev(t2, t2_value);

    			if (/*word*/ ctx[0] !== /*data*/ ctx[3].word) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					if_block.m(ol, t4);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*getWordData, word, alternates*/ 7) {
    				each_value = /*data*/ ctx[3].meanings[0].definitions.slice(0, 1 + /*alternates*/ ctx[1] - (/*word*/ ctx[0] !== /*data*/ ctx[3].word ? 1 : 0));
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ol, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(em);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(ol);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(24:1) {:then data}",
    		ctx
    	});

    	return block;
    }

    // (28:3) {#if word !== data.word}
    function create_if_block$7(ctx) {
    	let li;
    	let t0;
    	let t1_value = /*data*/ ctx[3].word + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text("variant of ");
    			t1 = text(t1_value);
    			t2 = text(".");
    			attr_dev(li, "class", "svelte-1cpaagx");
    			add_location(li, file$k, 28, 4, 809);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*word*/ 1 && t1_value !== (t1_value = /*data*/ ctx[3].word + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(28:3) {#if word !== data.word}",
    		ctx
    	});

    	return block;
    }

    // (31:3) {#each data.meanings[0].definitions.slice(0, 1 + alternates - (word !== data.word ? 1 : 0)) as def}
    function create_each_block$6(ctx) {
    	let li;
    	let t_value = /*def*/ ctx[4].definition + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", "svelte-1cpaagx");
    			add_location(li, file$k, 31, 4, 961);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*word, alternates*/ 3 && t_value !== (t_value = /*def*/ ctx[4].definition + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(31:3) {#each data.meanings[0].definitions.slice(0, 1 + alternates - (word !== data.word ? 1 : 0)) as def}",
    		ctx
    	});

    	return block;
    }

    // (22:27)     <h4>Fetching definition...</h4>   {:then data}
    function create_pending_block(ctx) {
    	let h4;

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			h4.textContent = "Fetching definition...";
    			add_location(h4, file$k, 22, 2, 657);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(22:27)     <h4>Fetching definition...</h4>   {:then data}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let div;
    	let promise;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 3
    	};

    	handle_promise(promise = /*getWordData*/ ctx[2](/*word*/ ctx[0]), info);

    	const block = {
    		c: function create() {
    			div = element("div");
    			info.block.c();
    			attr_dev(div, "class", "def");
    			add_location(div, file$k, 20, 0, 607);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			info.block.m(div, info.anchor = null);
    			info.mount = () => div;
    			info.anchor = null;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*word*/ 1 && promise !== (promise = /*getWordData*/ ctx[2](/*word*/ ctx[0])) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Definition', slots, []);
    	let { word } = $$props;
    	let { alternates = 9 } = $$props;

    	async function getWordData(word) {
    		if (!definitions.has(word)) {
    			const data = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, { mode: "cors" });

    			if (data.ok) {
    				definitions.set(word, (await data.json())[0]);
    			} else {
    				throw new Error(`Failed to fetch definition`);
    			}
    		}

    		return definitions.get(word);
    	}

    	const writable_props = ['word', 'alternates'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Definition> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('word' in $$props) $$invalidate(0, word = $$props.word);
    		if ('alternates' in $$props) $$invalidate(1, alternates = $$props.alternates);
    	};

    	$$self.$capture_state = () => ({ cache: definitions, word, alternates, getWordData });

    	$$self.$inject_state = $$props => {
    		if ('word' in $$props) $$invalidate(0, word = $$props.word);
    		if ('alternates' in $$props) $$invalidate(1, alternates = $$props.alternates);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [word, alternates, getWordData];
    }

    class Definition extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { word: 0, alternates: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Definition",
    			options,
    			id: create_fragment$l.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*word*/ ctx[0] === undefined && !('word' in props)) {
    			console.warn("<Definition> was created without expected prop 'word'");
    		}
    	}

    	get word() {
    		throw new Error_1("<Definition>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set word(value) {
    		throw new Error_1("<Definition>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alternates() {
    		throw new Error_1("<Definition>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alternates(value) {
    		throw new Error_1("<Definition>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\widgets\ContextMenu.svelte generated by Svelte v3.46.4 */
    const file$j = "src\\components\\widgets\\ContextMenu.svelte";

    // (21:1) {:else}
    function create_else_block$3(ctx) {
    	let div;
    	let t0;
    	let br0;
    	let br1;
    	let t1;
    	let t2;
    	let t3;
    	let br2;
    	let t4;
    	let t5;
    	let t6;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Considering all hints, there are:\r\n\t\t\t");
    			br0 = element("br");
    			br1 = element("br");
    			t1 = space();
    			t2 = text(/*pAns*/ ctx[3]);
    			t3 = text(" possible answers\r\n\t\t\t");
    			br2 = element("br");
    			t4 = space();
    			t5 = text(/*pSols*/ ctx[4]);
    			t6 = text(" valid guesses");
    			add_location(br0, file$j, 23, 3, 661);
    			add_location(br1, file$j, 23, 9, 667);
    			add_location(br2, file$j, 25, 3, 706);
    			add_location(div, file$j, 21, 2, 613);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, br0);
    			append_dev(div, br1);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, br2);
    			append_dev(div, t4);
    			append_dev(div, t5);
    			append_dev(div, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*pAns*/ 8) set_data_dev(t2, /*pAns*/ ctx[3]);
    			if (dirty & /*pSols*/ 16) set_data_dev(t5, /*pSols*/ ctx[4]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(21:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (12:1) {#if word !== ""}
    function create_if_block$6(ctx) {
    	let div;
    	let t0;
    	let br0;
    	let br1;
    	let t1;
    	let t2;
    	let t3;
    	let br2;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let definition;
    	let current;

    	definition = new Definition({
    			props: { word: /*word*/ ctx[2], alternates: 1 },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Considering all hints, this row had:\r\n\t\t\t");
    			br0 = element("br");
    			br1 = element("br");
    			t1 = space();
    			t2 = text(/*pAns*/ ctx[3]);
    			t3 = text(" possible answers\r\n\t\t\t");
    			br2 = element("br");
    			t4 = space();
    			t5 = text(/*pSols*/ ctx[4]);
    			t6 = text(" valid guesses");
    			t7 = space();
    			create_component(definition.$$.fragment);
    			add_location(br0, file$j, 14, 3, 472);
    			add_location(br1, file$j, 14, 9, 478);
    			add_location(br2, file$j, 16, 3, 517);
    			add_location(div, file$j, 12, 2, 421);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, br0);
    			append_dev(div, br1);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, br2);
    			append_dev(div, t4);
    			append_dev(div, t5);
    			append_dev(div, t6);
    			insert_dev(target, t7, anchor);
    			mount_component(definition, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*pAns*/ 8) set_data_dev(t2, /*pAns*/ ctx[3]);
    			if (!current || dirty & /*pSols*/ 16) set_data_dev(t5, /*pSols*/ ctx[4]);
    			const definition_changes = {};
    			if (dirty & /*word*/ 4) definition_changes.word = /*word*/ ctx[2];
    			definition.$set(definition_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(definition.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(definition.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t7);
    			destroy_component(definition, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(12:1) {#if word !== \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$6, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*word*/ ctx[2] !== "") return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "ctx-menu svelte-bkv8yc");
    			set_style(div, "top", /*y*/ ctx[1] + "px");
    			set_style(div, "left", /*x*/ ctx[0] + "px");
    			add_location(div, file$j, 10, 0, 342);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}

    			if (!current || dirty & /*y*/ 2) {
    				set_style(div, "top", /*y*/ ctx[1] + "px");
    			}

    			if (!current || dirty & /*x*/ 1) {
    				set_style(div, "left", /*x*/ ctx[0] + "px");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ContextMenu', slots, []);
    	let { x = 0 } = $$props;
    	let { y = 0 } = $$props;
    	let { word = "" } = $$props;
    	let { pAns } = $$props;
    	let { pSols } = $$props;
    	const width = parseInt(getComputedStyle(document.body).getPropertyValue("--game-width")) / 2;
    	const writable_props = ['x', 'y', 'word', 'pAns', 'pSols'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ContextMenu> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('x' in $$props) $$invalidate(0, x = $$props.x);
    		if ('y' in $$props) $$invalidate(1, y = $$props.y);
    		if ('word' in $$props) $$invalidate(2, word = $$props.word);
    		if ('pAns' in $$props) $$invalidate(3, pAns = $$props.pAns);
    		if ('pSols' in $$props) $$invalidate(4, pSols = $$props.pSols);
    	};

    	$$self.$capture_state = () => ({
    		Definition,
    		x,
    		y,
    		word,
    		pAns,
    		pSols,
    		width
    	});

    	$$self.$inject_state = $$props => {
    		if ('x' in $$props) $$invalidate(0, x = $$props.x);
    		if ('y' in $$props) $$invalidate(1, y = $$props.y);
    		if ('word' in $$props) $$invalidate(2, word = $$props.word);
    		if ('pAns' in $$props) $$invalidate(3, pAns = $$props.pAns);
    		if ('pSols' in $$props) $$invalidate(4, pSols = $$props.pSols);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*x*/ 1) {
    			$$invalidate(0, x = window.innerWidth - x < width
    			? window.innerWidth - width
    			: x);
    		}
    	};

    	return [x, y, word, pAns, pSols];
    }

    class ContextMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { x: 0, y: 1, word: 2, pAns: 3, pSols: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContextMenu",
    			options,
    			id: create_fragment$k.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pAns*/ ctx[3] === undefined && !('pAns' in props)) {
    			console.warn("<ContextMenu> was created without expected prop 'pAns'");
    		}

    		if (/*pSols*/ ctx[4] === undefined && !('pSols' in props)) {
    			console.warn("<ContextMenu> was created without expected prop 'pSols'");
    		}
    	}

    	get x() {
    		throw new Error("<ContextMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<ContextMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<ContextMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<ContextMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get word() {
    		throw new Error("<ContextMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set word(value) {
    		throw new Error("<ContextMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pAns() {
    		throw new Error("<ContextMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pAns(value) {
    		throw new Error("<ContextMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pSols() {
    		throw new Error("<ContextMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pSols(value) {
    		throw new Error("<ContextMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\board\Board.svelte generated by Svelte v3.46.4 */
    const file$i = "src\\components\\board\\Board.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	child_ctx[19] = list;
    	child_ctx[20] = i;
    	return child_ctx;
    }

    // (38:0) {#if showCtx}
    function create_if_block_1$1(ctx) {
    	let contextmenu;
    	let current;

    	contextmenu = new ContextMenu({
    			props: {
    				pAns: /*pAns*/ ctx[6],
    				pSols: /*pSols*/ ctx[7],
    				x: /*x*/ ctx[8],
    				y: /*y*/ ctx[9],
    				word: /*word*/ ctx[10]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(contextmenu.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(contextmenu, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const contextmenu_changes = {};
    			if (dirty & /*pAns*/ 64) contextmenu_changes.pAns = /*pAns*/ ctx[6];
    			if (dirty & /*pSols*/ 128) contextmenu_changes.pSols = /*pSols*/ ctx[7];
    			if (dirty & /*x*/ 256) contextmenu_changes.x = /*x*/ ctx[8];
    			if (dirty & /*y*/ 512) contextmenu_changes.y = /*y*/ ctx[9];
    			if (dirty & /*word*/ 1024) contextmenu_changes.word = /*word*/ ctx[10];
    			contextmenu.$set(contextmenu_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contextmenu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contextmenu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(contextmenu, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(38:0) {#if showCtx}",
    		ctx
    	});

    	return block;
    }

    // (43:1) {#each value as _, i}
    function create_each_block$5(ctx) {
    	let row;
    	let i = /*i*/ ctx[20];
    	let updating_value;
    	let current;
    	const assign_row = () => /*row_binding*/ ctx[15](row, i);
    	const unassign_row = () => /*row_binding*/ ctx[15](null, i);

    	function row_value_binding(value) {
    		/*row_value_binding*/ ctx[16](value, /*i*/ ctx[20]);
    	}

    	function ctx_handler(...args) {
    		return /*ctx_handler*/ ctx[17](/*i*/ ctx[20], ...args);
    	}

    	let row_props = {
    		num: /*i*/ ctx[20],
    		guesses: /*guesses*/ ctx[2],
    		state: /*board*/ ctx[1].state[/*i*/ ctx[20]]
    	};

    	if (/*value*/ ctx[0][/*i*/ ctx[20]] !== void 0) {
    		row_props.value = /*value*/ ctx[0][/*i*/ ctx[20]];
    	}

    	row = new Row({ props: row_props, $$inline: true });
    	assign_row();
    	binding_callbacks.push(() => bind(row, 'value', row_value_binding));
    	row.$on("ctx", ctx_handler);

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (i !== /*i*/ ctx[20]) {
    				unassign_row();
    				i = /*i*/ ctx[20];
    				assign_row();
    			}

    			const row_changes = {};
    			if (dirty & /*guesses*/ 4) row_changes.guesses = /*guesses*/ ctx[2];
    			if (dirty & /*board*/ 2) row_changes.state = /*board*/ ctx[1].state[/*i*/ ctx[20]];

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				row_changes.value = /*value*/ ctx[0][/*i*/ ctx[20]];
    				add_flush_callback(() => updating_value = false);
    			}

    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			unassign_row();
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(43:1) {#each value as _, i}",
    		ctx
    	});

    	return block;
    }

    // (53:1) {#if icon}
    function create_if_block$5(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", /*icon*/ ctx[3]);
    			attr_dev(path, "stroke-width", "14");
    			attr_dev(path, "class", "svelte-10yswyk");
    			add_location(path, file$i, 54, 3, 1323);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 200 200");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "class", "svelte-10yswyk");
    			add_location(svg, file$i, 53, 2, 1244);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*icon*/ 8) {
    				attr_dev(path, "d", /*icon*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(53:1) {#if icon}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let t0;
    	let div;
    	let t1;
    	let current;
    	let if_block0 = /*showCtx*/ ctx[5] && create_if_block_1$1(ctx);
    	let each_value = /*value*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block1 = /*icon*/ ctx[3] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div, "class", "board svelte-10yswyk");
    			add_location(div, file$i, 41, 0, 992);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t1);
    			if (if_block1) if_block1.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showCtx*/ ctx[5]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*showCtx*/ 32) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*guesses, board, rows, value, context*/ 2071) {
    				each_value = /*value*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, t1);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*icon*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$5(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Board', slots, []);
    	let { value } = $$props;
    	let { board } = $$props;
    	let { guesses } = $$props;
    	let { icon } = $$props;

    	function shake(row) {
    		rows[row].shake();
    	}

    	function bounce(row) {
    		rows[row].bounce();
    	}

    	function hideCtx(e) {
    		if (!e || !e.defaultPrevented) $$invalidate(5, showCtx = false);
    	}

    	let rows = [];
    	let showCtx = false;
    	let pAns = 0;
    	let pSols = 0;
    	let x = 0;
    	let y = 0;
    	let word = "";

    	function context(cx, cy, num, val) {
    		if (guesses >= num) {
    			$$invalidate(8, x = cx);
    			$$invalidate(9, y = cy);
    			$$invalidate(5, showCtx = true);
    			$$invalidate(10, word = guesses > num ? val : "");
    			const match = getRowData(num, board);
    			$$invalidate(6, pAns = words.words.filter(w => match(w)).length);
    			$$invalidate(7, pSols = pAns + words.valid.filter(w => match(w)).length);
    		}
    	}

    	const writable_props = ['value', 'board', 'guesses', 'icon'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Board> was created with unknown prop '${key}'`);
    	});

    	function row_binding($$value, i) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			rows[i] = $$value;
    			$$invalidate(4, rows);
    		});
    	}

    	function row_value_binding(value$1, i) {
    		if ($$self.$$.not_equal(value[i], value$1)) {
    			value[i] = value$1;
    			$$invalidate(0, value);
    		}
    	}

    	const ctx_handler = (i, e) => context(e.detail.x, e.detail.y, i, value[i]);

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('board' in $$props) $$invalidate(1, board = $$props.board);
    		if ('guesses' in $$props) $$invalidate(2, guesses = $$props.guesses);
    		if ('icon' in $$props) $$invalidate(3, icon = $$props.icon);
    	};

    	$$self.$capture_state = () => ({
    		getRowData,
    		words,
    		Row,
    		ContextMenu,
    		value,
    		board,
    		guesses,
    		icon,
    		shake,
    		bounce,
    		hideCtx,
    		rows,
    		showCtx,
    		pAns,
    		pSols,
    		x,
    		y,
    		word,
    		context
    	});

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('board' in $$props) $$invalidate(1, board = $$props.board);
    		if ('guesses' in $$props) $$invalidate(2, guesses = $$props.guesses);
    		if ('icon' in $$props) $$invalidate(3, icon = $$props.icon);
    		if ('rows' in $$props) $$invalidate(4, rows = $$props.rows);
    		if ('showCtx' in $$props) $$invalidate(5, showCtx = $$props.showCtx);
    		if ('pAns' in $$props) $$invalidate(6, pAns = $$props.pAns);
    		if ('pSols' in $$props) $$invalidate(7, pSols = $$props.pSols);
    		if ('x' in $$props) $$invalidate(8, x = $$props.x);
    		if ('y' in $$props) $$invalidate(9, y = $$props.y);
    		if ('word' in $$props) $$invalidate(10, word = $$props.word);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		board,
    		guesses,
    		icon,
    		rows,
    		showCtx,
    		pAns,
    		pSols,
    		x,
    		y,
    		word,
    		context,
    		shake,
    		bounce,
    		hideCtx,
    		row_binding,
    		row_value_binding,
    		ctx_handler
    	];
    }

    class Board extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {
    			value: 0,
    			board: 1,
    			guesses: 2,
    			icon: 3,
    			shake: 12,
    			bounce: 13,
    			hideCtx: 14
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Board",
    			options,
    			id: create_fragment$j.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !('value' in props)) {
    			console.warn("<Board> was created without expected prop 'value'");
    		}

    		if (/*board*/ ctx[1] === undefined && !('board' in props)) {
    			console.warn("<Board> was created without expected prop 'board'");
    		}

    		if (/*guesses*/ ctx[2] === undefined && !('guesses' in props)) {
    			console.warn("<Board> was created without expected prop 'guesses'");
    		}

    		if (/*icon*/ ctx[3] === undefined && !('icon' in props)) {
    			console.warn("<Board> was created without expected prop 'icon'");
    		}
    	}

    	get value() {
    		throw new Error("<Board>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Board>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get board() {
    		throw new Error("<Board>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set board(value) {
    		throw new Error("<Board>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get guesses() {
    		throw new Error("<Board>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set guesses(value) {
    		throw new Error("<Board>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Board>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Board>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shake() {
    		return this.$$.ctx[12];
    	}

    	set shake(value) {
    		throw new Error("<Board>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bounce() {
    		return this.$$.ctx[13];
    	}

    	set bounce(value) {
    		throw new Error("<Board>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideCtx() {
    		return this.$$.ctx[14];
    	}

    	set hideCtx(value) {
    		throw new Error("<Board>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\keyboard\Key.svelte generated by Svelte v3.46.4 */
    const file$h = "src\\components\\keyboard\\Key.svelte";

    function create_fragment$i(ctx) {
    	let div;
    	let t;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*letter*/ ctx[0]);
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*state*/ ctx[1]) + " svelte-1ymomqm"));
    			toggle_class(div, "big", /*letter*/ ctx[0].length !== 1);
    			add_location(div, file$h, 6, 0, 169);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*letter*/ 1) set_data_dev(t, /*letter*/ ctx[0]);

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*state*/ 2 && div_class_value !== (div_class_value = "" + (null_to_empty(/*state*/ ctx[1]) + " svelte-1ymomqm"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*state, letter*/ 3) {
    				toggle_class(div, "big", /*letter*/ ctx[0].length !== 1);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Key', slots, ['default']);
    	let { letter } = $$props;
    	let { state = "🔳" } = $$props;
    	const dispatch = createEventDispatcher();
    	const writable_props = ['letter', 'state'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Key> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("keystroke", letter);

    	$$self.$$set = $$props => {
    		if ('letter' in $$props) $$invalidate(0, letter = $$props.letter);
    		if ('state' in $$props) $$invalidate(1, state = $$props.state);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		letter,
    		state,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ('letter' in $$props) $$invalidate(0, letter = $$props.letter);
    		if ('state' in $$props) $$invalidate(1, state = $$props.state);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [letter, state, dispatch, $$scope, slots, click_handler];
    }

    class Key extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { letter: 0, state: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Key",
    			options,
    			id: create_fragment$i.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*letter*/ ctx[0] === undefined && !('letter' in props)) {
    			console.warn("<Key> was created without expected prop 'letter'");
    		}
    	}

    	get letter() {
    		throw new Error("<Key>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set letter(value) {
    		throw new Error("<Key>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Key>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Key>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\keyboard\Keyboard.svelte generated by Svelte v3.46.4 */
    const file$g = "src\\components\\keyboard\\Keyboard.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (45:2) {#each keys[0] as letter}
    function create_each_block_2(ctx) {
    	let key;
    	let current;

    	key = new Key({
    			props: {
    				letter: /*letter*/ ctx[13],
    				state: /*$letterStates*/ ctx[2][/*letter*/ ctx[13]]
    			},
    			$$inline: true
    		});

    	key.$on("keystroke", /*keystroke_handler*/ ctx[8]);

    	const block = {
    		c: function create() {
    			create_component(key.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(key, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const key_changes = {};
    			if (dirty & /*$letterStates*/ 4) key_changes.state = /*$letterStates*/ ctx[2][/*letter*/ ctx[13]];
    			key.$set(key_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(key.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(key.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(key, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(45:2) {#each keys[0] as letter}",
    		ctx
    	});

    	return block;
    }

    // (54:2) {#each keys[1] as letter}
    function create_each_block_1(ctx) {
    	let key;
    	let current;

    	key = new Key({
    			props: {
    				letter: /*letter*/ ctx[13],
    				state: /*$letterStates*/ ctx[2][/*letter*/ ctx[13]]
    			},
    			$$inline: true
    		});

    	key.$on("keystroke", /*keystroke_handler_1*/ ctx[9]);

    	const block = {
    		c: function create() {
    			create_component(key.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(key, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const key_changes = {};
    			if (dirty & /*$letterStates*/ 4) key_changes.state = /*$letterStates*/ ctx[2][/*letter*/ ctx[13]];
    			key.$set(key_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(key.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(key.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(key, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(54:2) {#each keys[1] as letter}",
    		ctx
    	});

    	return block;
    }

    // (64:2) {#each keys[2] as letter}
    function create_each_block$4(ctx) {
    	let key;
    	let current;

    	key = new Key({
    			props: {
    				letter: /*letter*/ ctx[13],
    				state: /*$letterStates*/ ctx[2][/*letter*/ ctx[13]]
    			},
    			$$inline: true
    		});

    	key.$on("keystroke", /*keystroke_handler_3*/ ctx[11]);

    	const block = {
    		c: function create() {
    			create_component(key.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(key, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const key_changes = {};
    			if (dirty & /*$letterStates*/ 4) key_changes.state = /*$letterStates*/ ctx[2][/*letter*/ ctx[13]];
    			key.$set(key_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(key.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(key.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(key, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(64:2) {#each keys[2] as letter}",
    		ctx
    	});

    	return block;
    }

    // (71:2) <Key letter="" on:keystroke={backspaceValue}>
    function create_default_slot$3(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z");
    			add_location(path, file$g, 72, 4, 2174);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "svelte-fc2dek");
    			add_location(svg, file$g, 71, 3, 2108);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(71:2) <Key letter=\\\"\\\" on:keystroke={backspaceValue}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let t0;
    	let div3;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let div2;
    	let key0;
    	let t3;
    	let t4;
    	let key1;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_2 = keys[0];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks_2[i], 1, 1, () => {
    		each_blocks_2[i] = null;
    	});

    	let each_value_1 = keys[1];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out_1 = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	key0 = new Key({
    			props: { letter: "ENTER" },
    			$$inline: true
    		});

    	key0.$on("keystroke", /*keystroke_handler_2*/ ctx[10]);
    	let each_value = keys[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out_2 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	key1 = new Key({
    			props: {
    				letter: "",
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	key1.$on("keystroke", /*backspaceValue*/ ctx[5]);

    	const block = {
    		c: function create() {
    			t0 = space();
    			div3 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			div2 = element("div");
    			create_component(key0.$$.fragment);
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			create_component(key1.$$.fragment);
    			attr_dev(div0, "class", "row svelte-fc2dek");
    			add_location(div0, file$g, 43, 1, 1434);
    			attr_dev(div1, "class", "row svelte-fc2dek");
    			add_location(div1, file$g, 52, 1, 1617);
    			attr_dev(div2, "class", "row svelte-fc2dek");
    			add_location(div2, file$g, 61, 1, 1800);
    			attr_dev(div3, "class", "keyboard svelte-fc2dek");
    			toggle_class(div3, "preventChange", /*preventChange*/ ctx[1]);
    			add_location(div3, file$g, 42, 0, 1389);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div0, null);
    			}

    			append_dev(div3, t1);
    			append_dev(div3, div1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div1, null);
    			}

    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			mount_component(key0, div2, null);
    			append_dev(div2, t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div2, t4);
    			mount_component(key1, div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(document.body, "keydown", /*handleKeystroke*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*keys, $letterStates, appendValue*/ 20) {
    				each_value_2 = keys[0];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    						transition_in(each_blocks_2[i], 1);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						transition_in(each_blocks_2[i], 1);
    						each_blocks_2[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks_2.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*keys, $letterStates, appendValue*/ 20) {
    				each_value_1 = keys[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*keys, $letterStates, appendValue*/ 20) {
    				each_value = keys[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div2, t4);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_2(i);
    				}

    				check_outros();
    			}

    			const key1_changes = {};

    			if (dirty & /*$$scope*/ 1048576) {
    				key1_changes.$$scope = { dirty, ctx };
    			}

    			key1.$set(key1_changes);

    			if (dirty & /*preventChange*/ 2) {
    				toggle_class(div3, "preventChange", /*preventChange*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks_2[i]);
    			}

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			transition_in(key0.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(key1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_2 = each_blocks_2.filter(Boolean);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				transition_out(each_blocks_2[i]);
    			}

    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			transition_out(key0.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(key1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_component(key0);
    			destroy_each(each_blocks, detaching);
    			destroy_component(key1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let $letterStates;
    	validate_store(letterStates, 'letterStates');
    	component_subscribe($$self, letterStates, $$value => $$invalidate(2, $letterStates = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Keyboard', slots, []);
    	let { value = "" } = $$props;
    	let { disabled = false } = $$props;
    	let preventChange = true;
    	const dispatch = createEventDispatcher();

    	function appendValue(char) {
    		if (!disabled && value.length < COLS) {
    			dispatch("keystroke", char);
    			$$invalidate(7, value += char);
    		}
    	}

    	function backspaceValue() {
    		if (!disabled) {
    			$$invalidate(7, value = value.slice(0, value.length - 1));
    		}
    	}

    	function handleKeystroke(e) {
    		if (!disabled && !e.ctrlKey && !e.altKey) {
    			if (e.key && (/^[a-z]$/).test(e.key.toLowerCase())) {
    				return appendValue(e.key.toLowerCase());
    			}

    			if (e.key === "Backspace") return backspaceValue();
    			if (e.key === "Enter") return dispatch("submitWord");
    		}

    		if (e.key === "Escape") dispatch("esc");
    	}

    	// Ensure keys change on load instead of loading their state color & change the color of all the keys to neutral, then to their correct color on mode change
    	const unsub = mode.subscribe(() => {
    		$$invalidate(1, preventChange = true);
    		setTimeout(() => $$invalidate(1, preventChange = false), 200);
    	});

    	onDestroy(unsub);
    	const writable_props = ['value', 'disabled'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Keyboard> was created with unknown prop '${key}'`);
    	});

    	const keystroke_handler = e => appendValue(e.detail);
    	const keystroke_handler_1 = e => appendValue(e.detail);
    	const keystroke_handler_2 = () => !disabled && dispatch("submitWord");
    	const keystroke_handler_3 = e => appendValue(e.detail);

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(7, value = $$props.value);
    		if ('disabled' in $$props) $$invalidate(0, disabled = $$props.disabled);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onDestroy,
    		onMount,
    		letterStates,
    		mode,
    		COLS,
    		keys,
    		Key,
    		value,
    		disabled,
    		preventChange,
    		dispatch,
    		appendValue,
    		backspaceValue,
    		handleKeystroke,
    		unsub,
    		$letterStates
    	});

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(7, value = $$props.value);
    		if ('disabled' in $$props) $$invalidate(0, disabled = $$props.disabled);
    		if ('preventChange' in $$props) $$invalidate(1, preventChange = $$props.preventChange);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		disabled,
    		preventChange,
    		$letterStates,
    		dispatch,
    		appendValue,
    		backspaceValue,
    		handleKeystroke,
    		value,
    		keystroke_handler,
    		keystroke_handler_1,
    		keystroke_handler_2,
    		keystroke_handler_3
    	];
    }

    class Keyboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { value: 7, disabled: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Keyboard",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get value() {
    		throw new Error("<Keyboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Keyboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Keyboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Keyboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Modal.svelte generated by Svelte v3.46.4 */
    const file$f = "src\\components\\Modal.svelte";

    // (23:0) {:else}
    function create_else_block$2(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let gameicon;
    	let t;
    	let current;
    	let mounted;
    	let dispose;

    	gameicon = new GameIcon({
    			props: {
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			create_component(gameicon.$$.fragment);
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "exit svelte-1838614");
    			add_location(div0, file$f, 25, 3, 674);
    			attr_dev(div1, "class", "modal svelte-1838614");
    			add_location(div1, file$f, 24, 2, 650);
    			attr_dev(div2, "class", "overlay svelte-1838614");
    			toggle_class(div2, "visible", /*visible*/ ctx[0]);
    			add_location(div2, file$f, 23, 1, 589);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			mount_component(gameicon, div0, null);
    			append_dev(div1, t);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*close*/ ctx[2], false, false, false),
    					listen_dev(div2, "click", self$1(/*close*/ ctx[2]), false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const gameicon_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				gameicon_changes.$$scope = { dirty, ctx };
    			}

    			gameicon.$set(gameicon_changes);

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			}

    			if (dirty & /*visible*/ 1) {
    				toggle_class(div2, "visible", /*visible*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gameicon.$$.fragment, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gameicon.$$.fragment, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(gameicon);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(23:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (12:0) {#if fullscreen}
    function create_if_block$4(ctx) {
    	let div1;
    	let div0;
    	let gameicon;
    	let t;
    	let current;
    	let mounted;
    	let dispose;

    	gameicon = new GameIcon({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(gameicon.$$.fragment);
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "exit svelte-1838614");
    			add_location(div0, file$f, 13, 2, 349);
    			attr_dev(div1, "class", "page svelte-1838614");
    			toggle_class(div1, "visible", /*visible*/ ctx[0]);
    			add_location(div1, file$f, 12, 1, 313);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(gameicon, div0, null);
    			append_dev(div1, t);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*close*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const gameicon_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				gameicon_changes.$$scope = { dirty, ctx };
    			}

    			gameicon.$set(gameicon_changes);

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			}

    			if (dirty & /*visible*/ 1) {
    				toggle_class(div1, "visible", /*visible*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gameicon.$$.fragment, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gameicon.$$.fragment, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(gameicon);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(12:0) {#if fullscreen}",
    		ctx
    	});

    	return block;
    }

    // (27:4) <GameIcon>
    function create_default_slot_1$1(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z");
    			add_location(path, file$f, 27, 5, 732);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(27:4) <GameIcon>",
    		ctx
    	});

    	return block;
    }

    // (15:3) <GameIcon>
    function create_default_slot$2(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z");
    			add_location(path, file$f, 15, 4, 405);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(15:3) <GameIcon>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$4, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*fullscreen*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modal', slots, ['default']);
    	let { visible = false } = $$props;
    	let { fullscreen = false } = $$props;
    	const dispach = createEventDispatcher();

    	function close() {
    		$$invalidate(0, visible = false);
    		dispach("close");
    	}

    	const writable_props = ['visible', 'fullscreen'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('visible' in $$props) $$invalidate(0, visible = $$props.visible);
    		if ('fullscreen' in $$props) $$invalidate(1, fullscreen = $$props.fullscreen);
    		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		GameIcon,
    		visible,
    		fullscreen,
    		dispach,
    		close
    	});

    	$$self.$inject_state = $$props => {
    		if ('visible' in $$props) $$invalidate(0, visible = $$props.visible);
    		if ('fullscreen' in $$props) $$invalidate(1, fullscreen = $$props.fullscreen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [visible, fullscreen, close, slots, $$scope];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { visible: 0, fullscreen: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get visible() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fullscreen() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fullscreen(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\widgets\Seperator.svelte generated by Svelte v3.46.4 */

    const file$e = "src\\components\\widgets\\Seperator.svelte";
    const get__2_slot_changes = dirty => ({});
    const get__2_slot_context = ctx => ({});
    const get__1_slot_changes = dirty => ({});
    const get__1_slot_context = ctx => ({});

    function create_fragment$f(ctx) {
    	let div2;
    	let div0;
    	let t;
    	let div1;
    	let current;
    	const _1_slot_template = /*#slots*/ ctx[2]["1"];
    	const _1_slot = create_slot(_1_slot_template, ctx, /*$$scope*/ ctx[1], get__1_slot_context);
    	const _2_slot_template = /*#slots*/ ctx[2]["2"];
    	const _2_slot = create_slot(_2_slot_template, ctx, /*$$scope*/ ctx[1], get__2_slot_context);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			if (_1_slot) _1_slot.c();
    			t = space();
    			div1 = element("div");
    			if (_2_slot) _2_slot.c();
    			attr_dev(div0, "class", "svelte-1cu43ge");
    			add_location(div0, file$e, 4, 1, 93);
    			attr_dev(div1, "class", "svelte-1cu43ge");
    			add_location(div1, file$e, 7, 1, 131);
    			attr_dev(div2, "class", "sep svelte-1cu43ge");
    			toggle_class(div2, "visible", /*visible*/ ctx[0]);
    			add_location(div2, file$e, 3, 0, 59);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);

    			if (_1_slot) {
    				_1_slot.m(div0, null);
    			}

    			append_dev(div2, t);
    			append_dev(div2, div1);

    			if (_2_slot) {
    				_2_slot.m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (_1_slot) {
    				if (_1_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						_1_slot,
    						_1_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(_1_slot_template, /*$$scope*/ ctx[1], dirty, get__1_slot_changes),
    						get__1_slot_context
    					);
    				}
    			}

    			if (_2_slot) {
    				if (_2_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						_2_slot,
    						_2_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(_2_slot_template, /*$$scope*/ ctx[1], dirty, get__2_slot_changes),
    						get__2_slot_context
    					);
    				}
    			}

    			if (dirty & /*visible*/ 1) {
    				toggle_class(div2, "visible", /*visible*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(_1_slot, local);
    			transition_in(_2_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(_1_slot, local);
    			transition_out(_2_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (_1_slot) _1_slot.d(detaching);
    			if (_2_slot) _2_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Seperator', slots, ['1','2']);
    	let { visible = true } = $$props;
    	const writable_props = ['visible'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Seperator> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('visible' in $$props) $$invalidate(0, visible = $$props.visible);
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ visible });

    	$$self.$inject_state = $$props => {
    		if ('visible' in $$props) $$invalidate(0, visible = $$props.visible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [visible, $$scope, slots];
    }

    class Seperator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { visible: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Seperator",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get visible() {
    		throw new Error("<Seperator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<Seperator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\widgets\Share.svelte generated by Svelte v3.46.4 */
    const file$d = "src\\components\\widgets\\Share.svelte";

    function create_fragment$e(ctx) {
    	let div;
    	let t;
    	let svg;
    	let path;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text("share\r\n\t");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", "white");
    			attr_dev(path, "d", "M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z");
    			add_location(path, file$d, 19, 2, 696);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "width", "24");
    			add_location(svg, file$d, 18, 1, 609);
    			attr_dev(div, "class", "svelte-1n7mq4x");
    			add_location(div, file$d, 11, 0, 499);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    			append_dev(div, svg);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let stats;
    	let $mode;
    	validate_store(mode, 'mode');
    	component_subscribe($$self, mode, $$value => $$invalidate(3, $mode = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Share', slots, []);
    	let { state } = $$props;
    	const toaster = getContext("toaster");
    	const writable_props = ['state'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Share> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		navigator.clipboard.writeText(stats);
    		toaster.pop("Copied");
    	};

    	$$self.$$set = $$props => {
    		if ('state' in $$props) $$invalidate(2, state = $$props.state);
    	};

    	$$self.$capture_state = () => ({
    		mode,
    		modeData,
    		ROWS,
    		getContext,
    		state,
    		toaster,
    		stats,
    		$mode
    	});

    	$$self.$inject_state = $$props => {
    		if ('state' in $$props) $$invalidate(2, state = $$props.state);
    		if ('stats' in $$props) $$invalidate(0, stats = $$props.stats);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$mode, state*/ 12) {
    			$$invalidate(0, stats = `${modeData.modes[$mode].name} delordle+ #${state.wordNumber} ${state.guesses <= ROWS ? state.guesses : "X"}/${state.board.words.length}\n\n    ${state.board.state.slice(0, state.guesses).map(r => r.join("")).join("\n    ")}\nmikhad.github.io/delordle`);
    		}
    	};

    	return [stats, toaster, state, $mode, click_handler];
    }

    class Share extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { state: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Share",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*state*/ ctx[2] === undefined && !('state' in props)) {
    			console.warn("<Share> was created without expected prop 'state'");
    		}
    	}

    	get state() {
    		throw new Error("<Share>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Share>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\widgets\Tutorial.svelte generated by Svelte v3.46.4 */
    const file$c = "src\\components\\widgets\\Tutorial.svelte";

    function create_fragment$d(ctx) {
    	let h3;
    	let t1;
    	let div0;
    	let t2;
    	let strong0;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let div1;
    	let t11;
    	let div2;
    	let t13;
    	let div10;
    	let div3;
    	let strong1;
    	let t15;
    	let div4;
    	let tile0;
    	let t16;
    	let tile1;
    	let t17;
    	let tile2;
    	let t18;
    	let tile3;
    	let t19;
    	let tile4;
    	let t20;
    	let div5;
    	let t21;
    	let strong2;
    	let t23;
    	let t24;
    	let div6;
    	let tile5;
    	let t25;
    	let tile6;
    	let t26;
    	let tile7;
    	let t27;
    	let tile8;
    	let t28;
    	let tile9;
    	let t29;
    	let div7;
    	let t30;
    	let strong3;
    	let t32;
    	let t33;
    	let div8;
    	let tile10;
    	let t34;
    	let tile11;
    	let t35;
    	let tile12;
    	let t36;
    	let tile13;
    	let t37;
    	let tile14;
    	let t38;
    	let div9;
    	let t39;
    	let strong4;
    	let t41;
    	let t42;
    	let div11;
    	let current;

    	tile0 = new Tile({
    			props: { value: "n", state: "🟩" },
    			$$inline: true
    		});

    	tile1 = new Tile({
    			props: { value: "o", state: "🔳" },
    			$$inline: true
    		});

    	tile2 = new Tile({
    			props: { value: "r", state: "🔳" },
    			$$inline: true
    		});

    	tile3 = new Tile({
    			props: { value: "t", state: "🔳" },
    			$$inline: true
    		});

    	tile4 = new Tile({
    			props: { value: "e", state: "🔳" },
    			$$inline: true
    		});

    	tile5 = new Tile({
    			props: { value: "k", state: "🔳" },
    			$$inline: true
    		});

    	tile6 = new Tile({
    			props: { value: "r", state: "🟨" },
    			$$inline: true
    		});

    	tile7 = new Tile({
    			props: { value: "e", state: "🔳" },
    			$$inline: true
    		});

    	tile8 = new Tile({
    			props: { value: "n", state: "🔳" },
    			$$inline: true
    		});

    	tile9 = new Tile({
    			props: { value: "z", state: "🔳" },
    			$$inline: true
    		});

    	tile10 = new Tile({
    			props: { value: "d", state: "🔳" },
    			$$inline: true
    		});

    	tile11 = new Tile({
    			props: { value: "e", state: "🔳" },
    			$$inline: true
    		});

    	tile12 = new Tile({
    			props: { value: "a", state: "🔳" },
    			$$inline: true
    		});

    	tile13 = new Tile({
    			props: { value: "t", state: "⬛" },
    			$$inline: true
    		});

    	tile14 = new Tile({
    			props: { value: "h", state: "🔳" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "how to play";
    			t1 = space();
    			div0 = element("div");
    			t2 = text("Guess the ");
    			strong0 = element("strong");
    			strong0.textContent = "delordle";
    			t4 = text(" in ");
    			t5 = text(ROWS);
    			t6 = text(" tries.");
    			t7 = space();
    			div1 = element("div");
    			div1.textContent = `Each guess must be a valid ${COLS} letter word. Hit the enter button to submit.`;
    			t11 = space();
    			div2 = element("div");
    			div2.textContent = "After each guess, the color of the tiles will change to show how close your guess was to the\r\n\tword.";
    			t13 = space();
    			div10 = element("div");
    			div3 = element("div");
    			strong1 = element("strong");
    			strong1.textContent = "Examples";
    			t15 = space();
    			div4 = element("div");
    			create_component(tile0.$$.fragment);
    			t16 = space();
    			create_component(tile1.$$.fragment);
    			t17 = space();
    			create_component(tile2.$$.fragment);
    			t18 = space();
    			create_component(tile3.$$.fragment);
    			t19 = space();
    			create_component(tile4.$$.fragment);
    			t20 = space();
    			div5 = element("div");
    			t21 = text("The letter ");
    			strong2 = element("strong");
    			strong2.textContent = "N";
    			t23 = text(" is in the word and in the correct spot.");
    			t24 = space();
    			div6 = element("div");
    			create_component(tile5.$$.fragment);
    			t25 = space();
    			create_component(tile6.$$.fragment);
    			t26 = space();
    			create_component(tile7.$$.fragment);
    			t27 = space();
    			create_component(tile8.$$.fragment);
    			t28 = space();
    			create_component(tile9.$$.fragment);
    			t29 = space();
    			div7 = element("div");
    			t30 = text("The letter ");
    			strong3 = element("strong");
    			strong3.textContent = "R";
    			t32 = text(" is in the word but in the wrong spot.");
    			t33 = space();
    			div8 = element("div");
    			create_component(tile10.$$.fragment);
    			t34 = space();
    			create_component(tile11.$$.fragment);
    			t35 = space();
    			create_component(tile12.$$.fragment);
    			t36 = space();
    			create_component(tile13.$$.fragment);
    			t37 = space();
    			create_component(tile14.$$.fragment);
    			t38 = space();
    			div9 = element("div");
    			t39 = text("The letter ");
    			strong4 = element("strong");
    			strong4.textContent = "T";
    			t41 = text(" is not in the word in any spot.");
    			t42 = space();
    			div11 = element("div");
    			div11.textContent = "This is a Del Norte High School Themed Wordle.";
    			add_location(h3, file$c, 5, 0, 129);
    			add_location(strong0, file$c, 6, 15, 166);
    			attr_dev(div0, "class", "svelte-6daei");
    			add_location(div0, file$c, 6, 0, 151);
    			attr_dev(div1, "class", "svelte-6daei");
    			add_location(div1, file$c, 7, 0, 216);
    			attr_dev(div2, "class", "svelte-6daei");
    			add_location(div2, file$c, 8, 0, 307);
    			add_location(strong1, file$c, 13, 6, 480);
    			attr_dev(div3, "class", "svelte-6daei");
    			add_location(div3, file$c, 13, 1, 475);
    			attr_dev(div4, "class", "row svelte-6daei");
    			add_location(div4, file$c, 14, 1, 514);
    			add_location(strong2, file$c, 21, 17, 724);
    			attr_dev(div5, "class", "svelte-6daei");
    			add_location(div5, file$c, 21, 1, 708);
    			attr_dev(div6, "class", "row svelte-6daei");
    			add_location(div6, file$c, 22, 1, 791);
    			add_location(strong3, file$c, 29, 17, 1001);
    			attr_dev(div7, "class", "svelte-6daei");
    			add_location(div7, file$c, 29, 1, 985);
    			attr_dev(div8, "class", "row svelte-6daei");
    			add_location(div8, file$c, 30, 1, 1066);
    			add_location(strong4, file$c, 37, 17, 1275);
    			attr_dev(div9, "class", "svelte-6daei");
    			add_location(div9, file$c, 37, 1, 1259);
    			attr_dev(div10, "class", "examples svelte-6daei");
    			toggle_class(div10, "complete", /*visible*/ ctx[0]);
    			add_location(div10, file$c, 12, 0, 425);
    			attr_dev(div11, "class", "svelte-6daei");
    			add_location(div11, file$c, 39, 0, 1341);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t2);
    			append_dev(div0, strong0);
    			append_dev(div0, t4);
    			append_dev(div0, t5);
    			append_dev(div0, t6);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, div10, anchor);
    			append_dev(div10, div3);
    			append_dev(div3, strong1);
    			append_dev(div10, t15);
    			append_dev(div10, div4);
    			mount_component(tile0, div4, null);
    			append_dev(div4, t16);
    			mount_component(tile1, div4, null);
    			append_dev(div4, t17);
    			mount_component(tile2, div4, null);
    			append_dev(div4, t18);
    			mount_component(tile3, div4, null);
    			append_dev(div4, t19);
    			mount_component(tile4, div4, null);
    			append_dev(div10, t20);
    			append_dev(div10, div5);
    			append_dev(div5, t21);
    			append_dev(div5, strong2);
    			append_dev(div5, t23);
    			append_dev(div10, t24);
    			append_dev(div10, div6);
    			mount_component(tile5, div6, null);
    			append_dev(div6, t25);
    			mount_component(tile6, div6, null);
    			append_dev(div6, t26);
    			mount_component(tile7, div6, null);
    			append_dev(div6, t27);
    			mount_component(tile8, div6, null);
    			append_dev(div6, t28);
    			mount_component(tile9, div6, null);
    			append_dev(div10, t29);
    			append_dev(div10, div7);
    			append_dev(div7, t30);
    			append_dev(div7, strong3);
    			append_dev(div7, t32);
    			append_dev(div10, t33);
    			append_dev(div10, div8);
    			mount_component(tile10, div8, null);
    			append_dev(div8, t34);
    			mount_component(tile11, div8, null);
    			append_dev(div8, t35);
    			mount_component(tile12, div8, null);
    			append_dev(div8, t36);
    			mount_component(tile13, div8, null);
    			append_dev(div8, t37);
    			mount_component(tile14, div8, null);
    			append_dev(div10, t38);
    			append_dev(div10, div9);
    			append_dev(div9, t39);
    			append_dev(div9, strong4);
    			append_dev(div9, t41);
    			insert_dev(target, t42, anchor);
    			insert_dev(target, div11, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*visible*/ 1) {
    				toggle_class(div10, "complete", /*visible*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tile0.$$.fragment, local);
    			transition_in(tile1.$$.fragment, local);
    			transition_in(tile2.$$.fragment, local);
    			transition_in(tile3.$$.fragment, local);
    			transition_in(tile4.$$.fragment, local);
    			transition_in(tile5.$$.fragment, local);
    			transition_in(tile6.$$.fragment, local);
    			transition_in(tile7.$$.fragment, local);
    			transition_in(tile8.$$.fragment, local);
    			transition_in(tile9.$$.fragment, local);
    			transition_in(tile10.$$.fragment, local);
    			transition_in(tile11.$$.fragment, local);
    			transition_in(tile12.$$.fragment, local);
    			transition_in(tile13.$$.fragment, local);
    			transition_in(tile14.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tile0.$$.fragment, local);
    			transition_out(tile1.$$.fragment, local);
    			transition_out(tile2.$$.fragment, local);
    			transition_out(tile3.$$.fragment, local);
    			transition_out(tile4.$$.fragment, local);
    			transition_out(tile5.$$.fragment, local);
    			transition_out(tile6.$$.fragment, local);
    			transition_out(tile7.$$.fragment, local);
    			transition_out(tile8.$$.fragment, local);
    			transition_out(tile9.$$.fragment, local);
    			transition_out(tile10.$$.fragment, local);
    			transition_out(tile11.$$.fragment, local);
    			transition_out(tile12.$$.fragment, local);
    			transition_out(tile13.$$.fragment, local);
    			transition_out(tile14.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(div10);
    			destroy_component(tile0);
    			destroy_component(tile1);
    			destroy_component(tile2);
    			destroy_component(tile3);
    			destroy_component(tile4);
    			destroy_component(tile5);
    			destroy_component(tile6);
    			destroy_component(tile7);
    			destroy_component(tile8);
    			destroy_component(tile9);
    			destroy_component(tile10);
    			destroy_component(tile11);
    			destroy_component(tile12);
    			destroy_component(tile13);
    			destroy_component(tile14);
    			if (detaching) detach_dev(t42);
    			if (detaching) detach_dev(div11);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tutorial', slots, []);
    	let { visible } = $$props;
    	const writable_props = ['visible'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tutorial> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('visible' in $$props) $$invalidate(0, visible = $$props.visible);
    	};

    	$$self.$capture_state = () => ({ COLS, ROWS, Tile, visible });

    	$$self.$inject_state = $$props => {
    		if ('visible' in $$props) $$invalidate(0, visible = $$props.visible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [visible];
    }

    class Tutorial extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { visible: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tutorial",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*visible*/ ctx[0] === undefined && !('visible' in props)) {
    			console.warn("<Tutorial> was created without expected prop 'visible'");
    		}
    	}

    	get visible() {
    		throw new Error("<Tutorial>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<Tutorial>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\widgets\Timer.svelte generated by Svelte v3.46.4 */
    const file$b = "src\\components\\widgets\\Timer.svelte";

    // (35:1) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let svg;
    	let path;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M4.609 12c0-4.082 3.309-7.391 7.391-7.391a7.39 7.39 0 0 1 6.523 3.912l-1.653 1.567H22v-5.13l-1.572 1.659C18.652 3.841 15.542 2 12 2 6.477 2 2 6.477 2 12s4.477 10 10 10c4.589 0 8.453-3.09 9.631-7.301l-2.512-.703c-.871 3.113-3.73 5.395-7.119 5.395-4.082 0-7.391-3.309-7.391-7.391z");
    			add_location(path, file$b, 37, 4, 1259);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "svelte-1r6cx1i");
    			add_location(svg, file$b, 36, 3, 1193);
    			attr_dev(div, "class", "button svelte-1r6cx1i");
    			add_location(div, file$b, 35, 2, 1116);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, blur, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, blur, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(35:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (29:1) {#if ms > 0}
    function create_if_block$3(ctx) {
    	let div;
    	let t0_value = `${Math.floor(/*ms*/ ctx[0] / HOUR)}`.padStart(2, "0") + "";
    	let t0;
    	let t1;
    	let t2_value = `${Math.floor(/*ms*/ ctx[0] % HOUR / MINUTE)}`.padStart(2, "0") + "";
    	let t2;
    	let t3;
    	let t4_value = `${Math.floor(/*ms*/ ctx[0] % MINUTE / SECOND)}`.padStart(2, "0") + "";
    	let t4;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text(":");
    			t2 = text(t2_value);
    			t3 = text(":");
    			t4 = text(t4_value);
    			attr_dev(div, "class", "timer svelte-1r6cx1i");
    			add_location(div, file$b, 29, 2, 880);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*ms*/ 1) && t0_value !== (t0_value = `${Math.floor(/*ms*/ ctx[0] / HOUR)}`.padStart(2, "0") + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*ms*/ 1) && t2_value !== (t2_value = `${Math.floor(/*ms*/ ctx[0] % HOUR / MINUTE)}`.padStart(2, "0") + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*ms*/ 1) && t4_value !== (t4_value = `${Math.floor(/*ms*/ ctx[0] % MINUTE / SECOND)}`.padStart(2, "0") + "")) set_data_dev(t4, t4_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, blur, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, blur, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(29:1) {#if ms > 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let h3;
    	let t1;
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*ms*/ ctx[0] > 0) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Next delordle";
    			t1 = space();
    			div = element("div");
    			if_block.c();
    			attr_dev(h3, "class", "svelte-1r6cx1i");
    			add_location(h3, file$b, 26, 0, 814);
    			attr_dev(div, "class", "container svelte-1r6cx1i");
    			add_location(div, file$b, 27, 0, 838);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const HOUR = 3600000;
    const MINUTE = 60000;
    const SECOND = 1000;

    function instance$c($$self, $$props, $$invalidate) {
    	let $mode;
    	validate_store(mode, 'mode');
    	component_subscribe($$self, mode, $$value => $$invalidate(3, $mode = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Timer', slots, []);
    	const dispatch = createEventDispatcher();
    	let ms = 1000;
    	let countDown;

    	function reset(m) {
    		clearInterval(countDown);
    		$$invalidate(0, ms = modeData.modes[m].unit - (new Date().valueOf() - modeData.modes[m].seed));
    		if (ms < 0) dispatch("timeup");

    		countDown = setInterval(
    			() => {
    				$$invalidate(0, ms = modeData.modes[m].unit - (new Date().valueOf() - modeData.modes[m].seed));

    				if (ms < 0) {
    					clearInterval(countDown);
    					dispatch("timeup");
    				}
    			},
    			SECOND
    		);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Timer> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("reload");

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onDestroy,
    		blur,
    		mode,
    		modeData,
    		dispatch,
    		HOUR,
    		MINUTE,
    		SECOND,
    		ms,
    		countDown,
    		reset,
    		$mode
    	});

    	$$self.$inject_state = $$props => {
    		if ('ms' in $$props) $$invalidate(0, ms = $$props.ms);
    		if ('countDown' in $$props) countDown = $$props.countDown;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$mode*/ 8) {
    			reset($mode);
    		}
    	};

    	return [ms, dispatch, reset, $mode, click_handler];
    }

    class Timer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { reset: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Timer",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get reset() {
    		return this.$$.ctx[2];
    	}

    	set reset(value) {
    		throw new Error("<Timer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\widgets\Toaster.svelte generated by Svelte v3.46.4 */
    const file$a = "src\\components\\widgets\\Toaster.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (10:1) {#each toast as slice}
    function create_each_block$3(ctx) {
    	let div;
    	let t_value = /*slice*/ ctx[2] + "";
    	let t;
    	let div_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "slice svelte-1dgg1bc");
    			add_location(div, file$a, 10, 2, 300);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*toast*/ 1) && t_value !== (t_value = /*slice*/ ctx[2] + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (div_outro) div_outro.end(1);
    			current = true;
    		},
    		o: function outro(local) {
    			div_outro = create_out_transition(div, fade, { duration: 200 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(10:1) {#each toast as slice}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div;
    	let current;
    	let each_value = /*toast*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "toast svelte-1dgg1bc");
    			add_location(div, file$a, 8, 0, 252);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*toast*/ 1) {
    				each_value = /*toast*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Toaster', slots, []);

    	function pop(text, duration = 1) {
    		$$invalidate(0, toast = [text, ...toast]);
    		setTimeout(() => $$invalidate(0, toast = toast.slice(0, toast.length - 1)), duration * 1000);
    	}

    	let toast = [];
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Toaster> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ fade, pop, toast });

    	$$self.$inject_state = $$props => {
    		if ('toast' in $$props) $$invalidate(0, toast = $$props.toast);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [toast, pop];
    }

    class Toaster extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { pop: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Toaster",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get pop() {
    		return this.$$.ctx[1];
    	}

    	set pop(value) {
    		throw new Error("<Toaster>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\widgets\Tips.svelte generated by Svelte v3.46.4 */

    const file$9 = "src\\components\\widgets\\Tips.svelte";

    function create_fragment$a(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let t1_value = /*index*/ ctx[0] + 1 + "";
    	let t1;
    	let t2;
    	let t3_value = /*tips*/ ctx[1].length + "";
    	let t3;
    	let t4;
    	let div1;
    	let t5_value = /*tips*/ ctx[1][/*index*/ ctx[0]] + "";
    	let t5;
    	let t6;
    	let svg0;
    	let path0;
    	let t7;
    	let svg1;
    	let path1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text("Tip ");
    			t1 = text(t1_value);
    			t2 = text("/");
    			t3 = text(t3_value);
    			t4 = space();
    			div1 = element("div");
    			t5 = text(t5_value);
    			t6 = space();
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t7 = space();
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			attr_dev(div0, "class", "number svelte-7nikys");
    			add_location(div0, file$9, 11, 1, 371);
    			attr_dev(div1, "class", "tip svelte-7nikys");
    			add_location(div1, file$9, 12, 1, 429);
    			attr_dev(path0, "d", "M75,0L25,50L75,100z");
    			add_location(path0, file$9, 19, 2, 629);
    			attr_dev(svg0, "class", "left svelte-7nikys");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 100 100");
    			add_location(svg0, file$9, 13, 1, 468);
    			attr_dev(path1, "d", "M25,0L75,50L25,100z");
    			add_location(path1, file$9, 27, 2, 821);
    			attr_dev(svg1, "class", "right svelte-7nikys");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 100 100");
    			add_location(svg1, file$9, 21, 1, 673);
    			attr_dev(div2, "class", "outer svelte-7nikys");
    			add_location(div2, file$9, 10, 0, 349);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, t2);
    			append_dev(div0, t3);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, t5);
    			append_dev(div2, t6);
    			append_dev(div2, svg0);
    			append_dev(svg0, path0);
    			append_dev(div2, t7);
    			append_dev(div2, svg1);
    			append_dev(svg1, path1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg0, "click", /*click_handler*/ ctx[2], false, false, false),
    					listen_dev(svg1, "click", /*click_handler_1*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*index*/ 1 && t1_value !== (t1_value = /*index*/ ctx[0] + 1 + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*index*/ 1 && t5_value !== (t5_value = /*tips*/ ctx[1][/*index*/ ctx[0]] + "")) set_data_dev(t5, t5_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tips', slots, []);
    	let { index = 0 } = $$props;

    	const tips = [
    		"If you wear a tank top, don't walk by Ms. Lanzi's classroom - she likes to dress code girls.",
    		"Become deaf if you don't want to hear Euphoria spoilers",
    		"Buy a yearbook!",
    		"UCSD stands for UC Socially Dead",
    		"If you're a girl, avoid Mr. Hannover"
    	];

    	const writable_props = ['index'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tips> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, index = (index - 1 + tips.length) % tips.length);
    	const click_handler_1 = () => $$invalidate(0, index = (index + 1) % tips.length);

    	$$self.$$set = $$props => {
    		if ('index' in $$props) $$invalidate(0, index = $$props.index);
    	};

    	$$self.$capture_state = () => ({ index, tips });

    	$$self.$inject_state = $$props => {
    		if ('index' in $$props) $$invalidate(0, index = $$props.index);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [index, tips, click_handler, click_handler_1];
    }

    class Tips extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { index: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tips",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get index() {
    		throw new Error("<Tips>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Tips>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\widgets\ShareGame.svelte generated by Svelte v3.46.4 */
    const file$8 = "src\\components\\widgets\\ShareGame.svelte";

    // (15:1) <GameIcon>
    function create_default_slot$1(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M4.167 4.167c-1.381 1.381-1.381 3.619 0 5L6.5 11.5a1.18 1.18 0 0 1 0 1.667 1.18 1.18 0 0 1-1.667 0L2.5 10.833C.199 8.532.199 4.801 2.5 2.5s6.032-2.301 8.333 0l3.333 3.333c2.301 2.301 2.301 6.032 0 8.333a1.18 1.18 0 0 1-1.667 0 1.18 1.18 0 0 1 0-1.667c1.381-1.381 1.381-3.619 0-5L9.167 4.167c-1.381-1.381-3.619-1.381-5 0zm5.667 14c-2.301-2.301-2.301-6.032 0-8.333a1.18 1.18 0 0 1 1.667 0 1.18 1.18 0 0 1 0 1.667c-1.381 1.381-1.381 3.619 0 5l3.333 3.333c1.381 1.381 3.619 1.381 5 0s1.381-3.619 0-5L17.5 12.5a1.18 1.18 0 0 1 0-1.667 1.18 1.18 0 0 1 1.667 0l2.333 2.333c2.301 2.301 2.301 6.032 0 8.333s-6.032 2.301-8.333 0l-3.333-3.333z");
    			add_location(path, file$8, 15, 2, 464);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(15:1) <GameIcon>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div;
    	let gameicon;
    	let t0;
    	let t1_value = modeData.modes[/*$mode*/ ctx[1]].name + "";
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let current;
    	let mounted;
    	let dispose;

    	gameicon = new GameIcon({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(gameicon.$$.fragment);
    			t0 = text("\r\n\tCopy link to this game (");
    			t1 = text(t1_value);
    			t2 = text(" #");
    			t3 = text(/*wordNumber*/ ctx[0]);
    			t4 = text(")");
    			attr_dev(div, "class", "svelte-qtlar2");
    			add_location(div, file$8, 13, 0, 425);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(gameicon, div, null);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*share*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const gameicon_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				gameicon_changes.$$scope = { dirty, ctx };
    			}

    			gameicon.$set(gameicon_changes);
    			if ((!current || dirty & /*$mode*/ 2) && t1_value !== (t1_value = modeData.modes[/*$mode*/ ctx[1]].name + "")) set_data_dev(t1, t1_value);
    			if (!current || dirty & /*wordNumber*/ 1) set_data_dev(t3, /*wordNumber*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gameicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gameicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(gameicon);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $mode;
    	validate_store(mode, 'mode');
    	component_subscribe($$self, mode, $$value => $$invalidate(1, $mode = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ShareGame', slots, []);
    	let { wordNumber } = $$props;
    	const toaster = getContext("toaster");

    	function share() {
    		toaster.pop("Copied");
    		navigator.clipboard.writeText(`${window.location.href}/${wordNumber}`);
    	}

    	const writable_props = ['wordNumber'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ShareGame> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('wordNumber' in $$props) $$invalidate(0, wordNumber = $$props.wordNumber);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		GameMode,
    		mode,
    		modeData,
    		GameIcon,
    		wordNumber,
    		toaster,
    		share,
    		$mode
    	});

    	$$self.$inject_state = $$props => {
    		if ('wordNumber' in $$props) $$invalidate(0, wordNumber = $$props.wordNumber);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [wordNumber, $mode, share];
    }

    class ShareGame extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { wordNumber: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ShareGame",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*wordNumber*/ ctx[0] === undefined && !('wordNumber' in props)) {
    			console.warn("<ShareGame> was created without expected prop 'wordNumber'");
    		}
    	}

    	get wordNumber() {
    		throw new Error("<ShareGame>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wordNumber(value) {
    		throw new Error("<ShareGame>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\widgets\stats\Stat.svelte generated by Svelte v3.46.4 */

    const file$7 = "src\\components\\widgets\\stats\\Stat.svelte";

    function create_fragment$8(ctx) {
    	let section;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let t2;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			t0 = text(/*stat*/ ctx[0]);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(/*name*/ ctx[1]);
    			attr_dev(div0, "class", "stat svelte-dvu5v6");
    			add_location(div0, file$7, 5, 1, 79);
    			attr_dev(div1, "class", "name svelte-dvu5v6");
    			add_location(div1, file$7, 6, 1, 112);
    			attr_dev(section, "class", "svelte-dvu5v6");
    			add_location(section, file$7, 4, 0, 67);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(div0, t0);
    			append_dev(section, t1);
    			append_dev(section, div1);
    			append_dev(div1, t2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*stat*/ 1) set_data_dev(t0, /*stat*/ ctx[0]);
    			if (dirty & /*name*/ 2) set_data_dev(t2, /*name*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Stat', slots, []);
    	let { stat } = $$props;
    	let { name } = $$props;
    	const writable_props = ['stat', 'name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Stat> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('stat' in $$props) $$invalidate(0, stat = $$props.stat);
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({ stat, name });

    	$$self.$inject_state = $$props => {
    		if ('stat' in $$props) $$invalidate(0, stat = $$props.stat);
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [stat, name];
    }

    class Stat extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { stat: 0, name: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Stat",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*stat*/ ctx[0] === undefined && !('stat' in props)) {
    			console.warn("<Stat> was created without expected prop 'stat'");
    		}

    		if (/*name*/ ctx[1] === undefined && !('name' in props)) {
    			console.warn("<Stat> was created without expected prop 'name'");
    		}
    	}

    	get stat() {
    		throw new Error("<Stat>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stat(value) {
    		throw new Error("<Stat>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Stat>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Stat>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\widgets\stats\Statistics.svelte generated by Svelte v3.46.4 */

    const { Object: Object_1$1 } = globals;
    const file$6 = "src\\components\\widgets\\stats\\Statistics.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (32:1) {#each stats as stat}
    function create_each_block$2(ctx) {
    	let stat;
    	let current;

    	stat = new Stat({
    			props: {
    				name: /*stat*/ ctx[3][0],
    				stat: /*stat*/ ctx[3][1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(stat.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(stat, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const stat_changes = {};
    			if (dirty & /*stats*/ 1) stat_changes.name = /*stat*/ ctx[3][0];
    			if (dirty & /*stats*/ 1) stat_changes.stat = /*stat*/ ctx[3][1];
    			stat.$set(stat_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(stat.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(stat.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(stat, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(32:1) {#each stats as stat}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let h3;
    	let t0;
    	let t1_value = modeData.modes[/*$mode*/ ctx[1]].name + "";
    	let t1;
    	let t2;
    	let t3;
    	let div;
    	let current;
    	let each_value = /*stats*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t0 = text("Statistics (");
    			t1 = text(t1_value);
    			t2 = text(")");
    			t3 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h3, file$6, 29, 0, 891);
    			attr_dev(div, "class", "svelte-ljn64v");
    			add_location(div, file$6, 30, 0, 943);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t0);
    			append_dev(h3, t1);
    			append_dev(h3, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$mode*/ 2) && t1_value !== (t1_value = modeData.modes[/*$mode*/ ctx[1]].name + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*stats*/ 1) {
    				each_value = /*stats*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $mode;
    	validate_store(mode, 'mode');
    	component_subscribe($$self, mode, $$value => $$invalidate(1, $mode = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Statistics', slots, []);
    	let { data } = $$props;
    	let stats;
    	const writable_props = ['data'];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Statistics> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(2, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ mode, modeData, Stat, data, stats, $mode });

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(2, data = $$props.data);
    		if ('stats' in $$props) $$invalidate(0, stats = $$props.stats);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data, stats*/ 5) {
    			{
    				$$invalidate(0, stats = [
    					["Played", data.played],
    					[
    						"Win %",
    						Math.round((data.played - data.guesses.fail) / data.played * 100) || 0
    					],
    					[
    						"Average Guesses",
    						(Object.entries(data.guesses).reduce(
    							(a, b) => {
    								if (!isNaN(parseInt(b[0]))) {
    									return a + parseInt(b[0]) * b[1];
    								}

    								return a;
    							},
    							0
    						) / data.played || 0).toFixed(1)
    					]
    				]);

    				if (data.guesses.fail > 0) {
    					stats.push(["Lost", data.guesses.fail]);
    				}

    				if ("streak" in data) {
    					stats.push(["Current Streak", data.streak]);
    					stats.push(["Max Streak", data.maxStreak]);
    				}
    			}
    		}
    	};

    	return [stats, $mode, data];
    }

    class Statistics extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { data: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Statistics",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[2] === undefined && !('data' in props)) {
    			console.warn("<Statistics> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<Statistics>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Statistics>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\widgets\stats\Distribution.svelte generated by Svelte v3.46.4 */

    const { Object: Object_1 } = globals;
    const file$5 = "src\\components\\widgets\\stats\\Distribution.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (10:2) {#if !isNaN(parseInt(guess[0]))}
    function create_if_block$2(ctx) {
    	let div1;
    	let span;
    	let t0_value = /*guess*/ ctx[4][0] + "";
    	let t0;
    	let t1;
    	let div0;
    	let t2_value = /*guess*/ ctx[4][1] + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			attr_dev(span, "class", "guess svelte-1oddrjt");
    			add_location(span, file$5, 11, 4, 334);
    			attr_dev(div0, "class", "bar svelte-1oddrjt");
    			set_style(div0, "width", /*guess*/ ctx[4][1] / /*max*/ ctx[3] * 100 + "%");
    			toggle_class(div0, "this", parseInt(/*guess*/ ctx[4][0]) === /*guesses*/ ctx[0] && !/*active*/ ctx[2]);
    			add_location(div0, file$5, 12, 4, 377);
    			attr_dev(div1, "class", "graph svelte-1oddrjt");
    			add_location(div1, file$5, 10, 3, 309);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, span);
    			append_dev(span, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, t2);
    			append_dev(div1, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*distribution*/ 2 && t0_value !== (t0_value = /*guess*/ ctx[4][0] + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*distribution*/ 2 && t2_value !== (t2_value = /*guess*/ ctx[4][1] + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*distribution, max*/ 10) {
    				set_style(div0, "width", /*guess*/ ctx[4][1] / /*max*/ ctx[3] * 100 + "%");
    			}

    			if (dirty & /*parseInt, Object, distribution, guesses, active*/ 7) {
    				toggle_class(div0, "this", parseInt(/*guess*/ ctx[4][0]) === /*guesses*/ ctx[0] && !/*active*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(10:2) {#if !isNaN(parseInt(guess[0]))}",
    		ctx
    	});

    	return block;
    }

    // (9:1) {#each Object.entries(distribution) as guess, i (guess[0])}
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let show_if = !isNaN(parseInt(/*guess*/ ctx[4][0]));
    	let if_block_anchor;
    	let if_block = show_if && create_if_block$2(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*distribution*/ 2) show_if = !isNaN(parseInt(/*guess*/ ctx[4][0]));

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(9:1) {#each Object.entries(distribution) as guess, i (guess[0])}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let h3;
    	let t1;
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = Object.entries(/*distribution*/ ctx[1]);
    	validate_each_argument(each_value);
    	const get_key = ctx => /*guess*/ ctx[4][0];
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "guess distribution";
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h3, file$5, 6, 0, 154);
    			attr_dev(div, "class", "container svelte-1oddrjt");
    			add_location(div, file$5, 7, 0, 183);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Object, distribution, max, parseInt, guesses, active, isNaN*/ 15) {
    				each_value = Object.entries(/*distribution*/ ctx[1]);
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block$1, null, get_each_context$1);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let max;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Distribution', slots, []);
    	let { guesses = 0 } = $$props;
    	let { distribution } = $$props;
    	let { active } = $$props;
    	const writable_props = ['guesses', 'distribution', 'active'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Distribution> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('guesses' in $$props) $$invalidate(0, guesses = $$props.guesses);
    		if ('distribution' in $$props) $$invalidate(1, distribution = $$props.distribution);
    		if ('active' in $$props) $$invalidate(2, active = $$props.active);
    	};

    	$$self.$capture_state = () => ({ guesses, distribution, active, max });

    	$$self.$inject_state = $$props => {
    		if ('guesses' in $$props) $$invalidate(0, guesses = $$props.guesses);
    		if ('distribution' in $$props) $$invalidate(1, distribution = $$props.distribution);
    		if ('active' in $$props) $$invalidate(2, active = $$props.active);
    		if ('max' in $$props) $$invalidate(3, max = $$props.max);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*distribution*/ 2) {
    			$$invalidate(3, max = Math.max(...Object.values(distribution)));
    		}
    	};

    	return [guesses, distribution, active, max];
    }

    class Distribution extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { guesses: 0, distribution: 1, active: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Distribution",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*distribution*/ ctx[1] === undefined && !('distribution' in props)) {
    			console.warn("<Distribution> was created without expected prop 'distribution'");
    		}

    		if (/*active*/ ctx[2] === undefined && !('active' in props)) {
    			console.warn("<Distribution> was created without expected prop 'active'");
    		}
    	}

    	get guesses() {
    		throw new Error("<Distribution>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set guesses(value) {
    		throw new Error("<Distribution>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get distribution() {
    		throw new Error("<Distribution>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set distribution(value) {
    		throw new Error("<Distribution>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Distribution>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Distribution>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\settings\Switch.svelte generated by Svelte v3.46.4 */

    const file$4 = "src\\components\\settings\\Switch.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "disabled", /*disabled*/ ctx[1]);
    			attr_dev(div, "class", "svelte-16o9p8g");
    			toggle_class(div, "checked", /*value*/ ctx[0]);
    			add_location(div, file$4, 4, 0, 80);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*disabled*/ 2) {
    				attr_dev(div, "disabled", /*disabled*/ ctx[1]);
    			}

    			if (dirty & /*value*/ 1) {
    				toggle_class(div, "checked", /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Switch', slots, []);
    	let { value } = $$props;
    	let { disabled = false } = $$props;
    	const writable_props = ['value', 'disabled'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Switch> was created with unknown prop '${key}'`);
    	});

    	const click_handler = e => !disabled && $$invalidate(0, value = !value);

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('disabled' in $$props) $$invalidate(1, disabled = $$props.disabled);
    	};

    	$$self.$capture_state = () => ({ value, disabled });

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('disabled' in $$props) $$invalidate(1, disabled = $$props.disabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, disabled, click_handler];
    }

    class Switch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { value: 0, disabled: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Switch",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !('value' in props)) {
    			console.warn("<Switch> was created without expected prop 'value'");
    		}
    	}

    	get value() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\settings\DropDown.svelte generated by Svelte v3.46.4 */

    const file$3 = "src\\components\\settings\\DropDown.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (7:1) {#each options as val, i}
    function create_each_block(ctx) {
    	let option;
    	let t_value = /*val*/ ctx[4] + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*i*/ ctx[6];
    			option.value = option.__value;
    			add_location(option, file$3, 7, 2, 163);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*options*/ 2 && t_value !== (t_value = /*val*/ ctx[4] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(7:1) {#each options as val, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let select;
    	let mounted;
    	let dispose;
    	let each_value = /*options*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			select.disabled = /*disabled*/ ctx[2];
    			attr_dev(select, "class", "svelte-2btkgx");
    			if (/*value*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[3].call(select));
    			add_location(select, file$3, 5, 0, 101);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*options*/ 2) {
    				each_value = /*options*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*disabled*/ 4) {
    				prop_dev(select, "disabled", /*disabled*/ ctx[2]);
    			}

    			if (dirty & /*value*/ 1) {
    				select_option(select, /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('DropDown', slots, []);
    	let { value } = $$props;
    	let { options } = $$props;
    	let { disabled = false } = $$props;
    	const writable_props = ['value', 'options', 'disabled'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<DropDown> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		value = select_value(this);
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('options' in $$props) $$invalidate(1, options = $$props.options);
    		if ('disabled' in $$props) $$invalidate(2, disabled = $$props.disabled);
    	};

    	$$self.$capture_state = () => ({ value, options, disabled });

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('options' in $$props) $$invalidate(1, options = $$props.options);
    		if ('disabled' in $$props) $$invalidate(2, disabled = $$props.disabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, options, disabled, select_change_handler];
    }

    class DropDown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { value: 0, options: 1, disabled: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DropDown",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !('value' in props)) {
    			console.warn("<DropDown> was created without expected prop 'value'");
    		}

    		if (/*options*/ ctx[1] === undefined && !('options' in props)) {
    			console.warn("<DropDown> was created without expected prop 'options'");
    		}
    	}

    	get value() {
    		throw new Error("<DropDown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<DropDown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<DropDown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<DropDown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<DropDown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<DropDown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\settings\Setting.svelte generated by Svelte v3.46.4 */
    const file$2 = "src\\components\\settings\\Setting.svelte";
    const get_desc_slot_changes = dirty => ({});
    const get_desc_slot_context = ctx => ({});
    const get_title_slot_changes = dirty => ({});
    const get_title_slot_context = ctx => ({});

    function create_fragment$3(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let switch_instance;
    	let updating_value;
    	let current;
    	const title_slot_template = /*#slots*/ ctx[6].title;
    	const title_slot = create_slot(title_slot_template, ctx, /*$$scope*/ ctx[5], get_title_slot_context);
    	const desc_slot_template = /*#slots*/ ctx[6].desc;
    	const desc_slot = create_slot(desc_slot_template, ctx, /*$$scope*/ ctx[5], get_desc_slot_context);

    	function switch_instance_value_binding(value) {
    		/*switch_instance_value_binding*/ ctx[7](value);
    	}

    	var switch_value = /*types*/ ctx[4][/*type*/ ctx[1]];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			options: /*options*/ ctx[2],
    			disabled: /*disabled*/ ctx[3]
    		};

    		if (/*value*/ ctx[0] !== void 0) {
    			switch_instance_props.value = /*value*/ ctx[0];
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		binding_callbacks.push(() => bind(switch_instance, 'value', switch_instance_value_binding));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			if (title_slot) title_slot.c();
    			t0 = space();
    			div1 = element("div");
    			if (desc_slot) desc_slot.c();
    			t1 = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div0, "class", "title svelte-40b4uj");
    			add_location(div0, file$2, 14, 2, 306);
    			attr_dev(div1, "class", "desc svelte-40b4uj");
    			add_location(div1, file$2, 15, 2, 356);
    			add_location(div2, file$2, 13, 1, 297);
    			attr_dev(div3, "class", "setting svelte-40b4uj");
    			add_location(div3, file$2, 12, 0, 273);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);

    			if (title_slot) {
    				title_slot.m(div0, null);
    			}

    			append_dev(div2, t0);
    			append_dev(div2, div1);

    			if (desc_slot) {
    				desc_slot.m(div1, null);
    			}

    			append_dev(div3, t1);

    			if (switch_instance) {
    				mount_component(switch_instance, div3, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (title_slot) {
    				if (title_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						title_slot,
    						title_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(title_slot_template, /*$$scope*/ ctx[5], dirty, get_title_slot_changes),
    						get_title_slot_context
    					);
    				}
    			}

    			if (desc_slot) {
    				if (desc_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						desc_slot,
    						desc_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(desc_slot_template, /*$$scope*/ ctx[5], dirty, get_desc_slot_changes),
    						get_desc_slot_context
    					);
    				}
    			}

    			const switch_instance_changes = {};
    			if (dirty & /*options*/ 4) switch_instance_changes.options = /*options*/ ctx[2];
    			if (dirty & /*disabled*/ 8) switch_instance_changes.disabled = /*disabled*/ ctx[3];

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				switch_instance_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			if (switch_value !== (switch_value = /*types*/ ctx[4][/*type*/ ctx[1]])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					binding_callbacks.push(() => bind(switch_instance, 'value', switch_instance_value_binding));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div3, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title_slot, local);
    			transition_in(desc_slot, local);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title_slot, local);
    			transition_out(desc_slot, local);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (title_slot) title_slot.d(detaching);
    			if (desc_slot) desc_slot.d(detaching);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Setting', slots, ['title','desc']);
    	let { value } = $$props;
    	let { type } = $$props;
    	let { options = [] } = $$props;
    	let { disabled = false } = $$props;
    	const types = { switch: Switch, dropdown: DropDown };
    	const writable_props = ['value', 'type', 'options', 'disabled'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Setting> was created with unknown prop '${key}'`);
    	});

    	function switch_instance_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('type' in $$props) $$invalidate(1, type = $$props.type);
    		if ('options' in $$props) $$invalidate(2, options = $$props.options);
    		if ('disabled' in $$props) $$invalidate(3, disabled = $$props.disabled);
    		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Switch,
    		DropDown,
    		value,
    		type,
    		options,
    		disabled,
    		types
    	});

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('type' in $$props) $$invalidate(1, type = $$props.type);
    		if ('options' in $$props) $$invalidate(2, options = $$props.options);
    		if ('disabled' in $$props) $$invalidate(3, disabled = $$props.disabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		type,
    		options,
    		disabled,
    		types,
    		$$scope,
    		slots,
    		switch_instance_value_binding
    	];
    }

    class Setting extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			value: 0,
    			type: 1,
    			options: 2,
    			disabled: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Setting",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !('value' in props)) {
    			console.warn("<Setting> was created without expected prop 'value'");
    		}

    		if (/*type*/ ctx[1] === undefined && !('type' in props)) {
    			console.warn("<Setting> was created without expected prop 'type'");
    		}
    	}

    	get value() {
    		throw new Error("<Setting>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Setting>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Setting>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Setting>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<Setting>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Setting>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Setting>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Setting>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\settings\Settings.svelte generated by Svelte v3.46.4 */
    const file$1 = "src\\components\\settings\\Settings.svelte";

    // (47:3) 
    function create_title_slot_2(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Dark Theme";
    			attr_dev(span, "slot", "title");
    			add_location(span, file$1, 46, 3, 1515);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_2.name,
    		type: "slot",
    		source: "(47:3) ",
    		ctx
    	});

    	return block;
    }

    // (50:3) 
    function create_title_slot_1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Color Blind Mode";
    			attr_dev(span, "slot", "title");
    			add_location(span, file$1, 49, 3, 1631);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_1.name,
    		type: "slot",
    		source: "(50:3) ",
    		ctx
    	});

    	return block;
    }

    // (51:3) 
    function create_desc_slot_1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "High contrast colors";
    			attr_dev(span, "slot", "desc");
    			add_location(span, file$1, 50, 3, 1678);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_desc_slot_1.name,
    		type: "slot",
    		source: "(51:3) ",
    		ctx
    	});

    	return block;
    }

    // (54:3) 
    function create_title_slot(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Game Mode";
    			attr_dev(span, "slot", "title");
    			add_location(span, file$1, 53, 3, 1834);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot.name,
    		type: "slot",
    		source: "(54:3) ",
    		ctx
    	});

    	return block;
    }

    // (55:3) 
    function create_desc_slot(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "The game mode determines how often the word refreshes";
    			attr_dev(span, "slot", "desc");
    			add_location(span, file$1, 54, 3, 1874);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_desc_slot.name,
    		type: "slot",
    		source: "(55:3) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div7;
    	let div2;
    	let h3;
    	let t1;
    	let div0;
    	let t2;
    	let setting0;
    	let updating_value;
    	let t3;
    	let setting1;
    	let updating_value_1;
    	let t4;
    	let setting2;
    	let updating_value_2;
    	let t5;
    	let div1;
    	let a0;
    	let t7;
    	let a1;
    	let t9;
    	let div6;
    	let div5;
    	let div3;
    	let t11;
    	let div4;
    	let t12_value = modeData.modes[/*$mode*/ ctx[3]].name + "";
    	let t12;
    	let t13;
    	let t14;
    	let current;
    	let mounted;
    	let dispose;

    	function setting0_value_binding(value) {
    		/*setting0_value_binding*/ ctx[8](value);
    	}

    	let setting0_props = {
    		type: "switch",
    		$$slots: { title: [create_title_slot_2] },
    		$$scope: { ctx }
    	};

    	if (/*$settings*/ ctx[2].dark !== void 0) {
    		setting0_props.value = /*$settings*/ ctx[2].dark;
    	}

    	setting0 = new Setting({ props: setting0_props, $$inline: true });
    	binding_callbacks.push(() => bind(setting0, 'value', setting0_value_binding));

    	function setting1_value_binding(value) {
    		/*setting1_value_binding*/ ctx[9](value);
    	}

    	let setting1_props = {
    		type: "switch",
    		$$slots: {
    			desc: [create_desc_slot_1],
    			title: [create_title_slot_1]
    		},
    		$$scope: { ctx }
    	};

    	if (/*$settings*/ ctx[2].colorblind !== void 0) {
    		setting1_props.value = /*$settings*/ ctx[2].colorblind;
    	}

    	setting1 = new Setting({ props: setting1_props, $$inline: true });
    	binding_callbacks.push(() => bind(setting1, 'value', setting1_value_binding));

    	function setting2_value_binding(value) {
    		/*setting2_value_binding*/ ctx[10](value);
    	}

    	let setting2_props = {
    		type: "dropdown",
    		options: modeData.modes.map(func),
    		$$slots: {
    			desc: [create_desc_slot],
    			title: [create_title_slot]
    		},
    		$$scope: { ctx }
    	};

    	if (/*$mode*/ ctx[3] !== void 0) {
    		setting2_props.value = /*$mode*/ ctx[3];
    	}

    	setting2 = new Setting({ props: setting2_props, $$inline: true });
    	binding_callbacks.push(() => bind(setting2, 'value', setting2_value_binding));

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div2 = element("div");
    			h3 = element("h3");
    			h3.textContent = "settings";
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			create_component(setting0.$$.fragment);
    			t3 = space();
    			create_component(setting1.$$.fragment);
    			t4 = space();
    			create_component(setting2.$$.fragment);
    			t5 = space();
    			div1 = element("div");
    			a0 = element("a");
    			a0.textContent = "Leave a ⭐";
    			t7 = space();
    			a1 = element("a");
    			a1.textContent = "Report a Bug";
    			t9 = space();
    			div6 = element("div");
    			div5 = element("div");
    			div3 = element("div");
    			div3.textContent = "v1.1.1";
    			t11 = space();
    			div4 = element("div");
    			t12 = text(t12_value);
    			t13 = text(" word #");
    			t14 = text(/*wordNumber*/ ctx[1]);
    			add_location(h3, file$1, 31, 2, 1061);
    			add_location(div0, file$1, 32, 2, 1082);
    			attr_dev(a0, "href", "https://github.com/MikhaD/delordle");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$1, 57, 3, 1994);
    			attr_dev(a1, "href", "https://github.com/MikhaD/delordle/issues");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$1, 58, 3, 2073);
    			attr_dev(div1, "class", "links svelte-12vbqbj");
    			add_location(div1, file$1, 56, 2, 1970);
    			attr_dev(div2, "class", "settings-top");
    			add_location(div2, file$1, 30, 1, 1031);
    			add_location(div3, file$1, 66, 3, 2251);
    			attr_dev(div4, "class", "word");
    			add_location(div4, file$1, 67, 3, 2273);
    			add_location(div5, file$1, 65, 2, 2241);
    			attr_dev(div6, "class", "footer svelte-12vbqbj");
    			add_location(div6, file$1, 63, 1, 2215);
    			attr_dev(div7, "class", "outer svelte-12vbqbj");
    			add_location(div7, file$1, 29, 0, 1009);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div2);
    			append_dev(div2, h3);
    			append_dev(div2, t1);
    			append_dev(div2, div0);
    			append_dev(div2, t2);
    			mount_component(setting0, div2, null);
    			append_dev(div2, t3);
    			mount_component(setting1, div2, null);
    			append_dev(div2, t4);
    			mount_component(setting2, div2, null);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, a0);
    			append_dev(div1, t7);
    			append_dev(div1, a1);
    			append_dev(div7, t9);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			append_dev(div5, t11);
    			append_dev(div5, div4);
    			append_dev(div4, t12);
    			append_dev(div4, t13);
    			append_dev(div4, t14);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[7], false, false, false),
    					listen_dev(div4, "contextmenu", prevent_default(/*contextmenu_handler*/ ctx[11]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const setting0_changes = {};

    			if (dirty & /*$$scope*/ 8192) {
    				setting0_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*$settings*/ 4) {
    				updating_value = true;
    				setting0_changes.value = /*$settings*/ ctx[2].dark;
    				add_flush_callback(() => updating_value = false);
    			}

    			setting0.$set(setting0_changes);
    			const setting1_changes = {};

    			if (dirty & /*$$scope*/ 8192) {
    				setting1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_1 && dirty & /*$settings*/ 4) {
    				updating_value_1 = true;
    				setting1_changes.value = /*$settings*/ ctx[2].colorblind;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			setting1.$set(setting1_changes);
    			const setting2_changes = {};

    			if (dirty & /*$$scope*/ 8192) {
    				setting2_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_2 && dirty & /*$mode*/ 8) {
    				updating_value_2 = true;
    				setting2_changes.value = /*$mode*/ ctx[3];
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			setting2.$set(setting2_changes);
    			if ((!current || dirty & /*$mode*/ 8) && t12_value !== (t12_value = modeData.modes[/*$mode*/ ctx[3]].name + "")) set_data_dev(t12, t12_value);
    			if (!current || dirty & /*wordNumber*/ 2) set_data_dev(t14, /*wordNumber*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(setting0.$$.fragment, local);
    			transition_in(setting1.$$.fragment, local);
    			transition_in(setting2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(setting0.$$.fragment, local);
    			transition_out(setting1.$$.fragment, local);
    			transition_out(setting2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    			destroy_component(setting0);
    			destroy_component(setting1);
    			destroy_component(setting2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func = e => e.name;

    function instance$2($$self, $$props, $$invalidate) {
    	let $settings;
    	let $mode;
    	validate_store(settings, 'settings');
    	component_subscribe($$self, settings, $$value => $$invalidate(2, $settings = $$value));
    	validate_store(mode, 'mode');
    	component_subscribe($$self, mode, $$value => $$invalidate(3, $mode = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Settings', slots, []);
    	let { validHard } = $$props;
    	let { visible } = $$props;
    	let { wordNumber } = $$props;
    	let tip = 0;
    	const toaster = getContext("toaster");
    	let root;

    	onMount(() => {
    		$$invalidate(6, root = document.documentElement);
    	});

    	const writable_props = ['validHard', 'visible', 'wordNumber'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Settings> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		if (!validHard) {
    			toaster.pop("Game has already violated hard mode");
    		}
    	};

    	function setting0_value_binding(value) {
    		if ($$self.$$.not_equal($settings.dark, value)) {
    			$settings.dark = value;
    			settings.set($settings);
    		}
    	}

    	function setting1_value_binding(value) {
    		if ($$self.$$.not_equal($settings.colorblind, value)) {
    			$settings.colorblind = value;
    			settings.set($settings);
    		}
    	}

    	function setting2_value_binding(value) {
    		$mode = value;
    		mode.set($mode);
    	}

    	const contextmenu_handler = () => {
    		localStorage.clear();
    		toaster.pop("localStorage cleared");
    	};

    	$$self.$$set = $$props => {
    		if ('validHard' in $$props) $$invalidate(0, validHard = $$props.validHard);
    		if ('visible' in $$props) $$invalidate(5, visible = $$props.visible);
    		if ('wordNumber' in $$props) $$invalidate(1, wordNumber = $$props.wordNumber);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onMount,
    		mode,
    		settings,
    		modeData,
    		Tips,
    		Toaster,
    		Setting,
    		validHard,
    		visible,
    		wordNumber,
    		tip,
    		toaster,
    		root,
    		$settings,
    		$mode
    	});

    	$$self.$inject_state = $$props => {
    		if ('validHard' in $$props) $$invalidate(0, validHard = $$props.validHard);
    		if ('visible' in $$props) $$invalidate(5, visible = $$props.visible);
    		if ('wordNumber' in $$props) $$invalidate(1, wordNumber = $$props.wordNumber);
    		if ('tip' in $$props) tip = $$props.tip;
    		if ('root' in $$props) $$invalidate(6, root = $$props.root);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*visible*/ 32) {
    			if (visible) tip = Math.floor(10 * Math.random());
    		}

    		if ($$self.$$.dirty & /*root, $settings*/ 68) {
    			{
    				if (root) {
    					$settings.dark
    					? root.classList.remove("light")
    					: root.classList.add("light");

    					$settings.colorblind
    					? root.classList.add("colorblind")
    					: root.classList.remove("colorblind");

    					localStorage.setItem("settings", JSON.stringify($settings));
    				}
    			}
    		}
    	};

    	return [
    		validHard,
    		wordNumber,
    		$settings,
    		$mode,
    		toaster,
    		visible,
    		root,
    		click_handler,
    		setting0_value_binding,
    		setting1_value_binding,
    		setting2_value_binding,
    		contextmenu_handler
    	];
    }

    class Settings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { validHard: 0, visible: 5, wordNumber: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Settings",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*validHard*/ ctx[0] === undefined && !('validHard' in props)) {
    			console.warn("<Settings> was created without expected prop 'validHard'");
    		}

    		if (/*visible*/ ctx[5] === undefined && !('visible' in props)) {
    			console.warn("<Settings> was created without expected prop 'visible'");
    		}

    		if (/*wordNumber*/ ctx[1] === undefined && !('wordNumber' in props)) {
    			console.warn("<Settings> was created without expected prop 'wordNumber'");
    		}
    	}

    	get validHard() {
    		throw new Error("<Settings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set validHard(value) {
    		throw new Error("<Settings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get visible() {
    		throw new Error("<Settings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<Settings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wordNumber() {
    		throw new Error("<Settings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wordNumber(value) {
    		throw new Error("<Settings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Game.svelte generated by Svelte v3.46.4 */
    const file = "src\\components\\Game.svelte";

    // (147:0) <Modal   bind:visible={showTutorial}   on:close|once={() => $settings.tutorial === 2 && --$settings.tutorial}   fullscreen={$settings.tutorial === 0}  >
    function create_default_slot_2(ctx) {
    	let tutorial;
    	let current;

    	tutorial = new Tutorial({
    			props: { visible: /*showTutorial*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tutorial.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tutorial, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tutorial_changes = {};
    			if (dirty[0] & /*showTutorial*/ 16) tutorial_changes.visible = /*showTutorial*/ ctx[4];
    			tutorial.$set(tutorial_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tutorial.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tutorial.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tutorial, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(147:0) <Modal   bind:visible={showTutorial}   on:close|once={() => $settings.tutorial === 2 && --$settings.tutorial}   fullscreen={$settings.tutorial === 0}  >",
    		ctx
    	});

    	return block;
    }

    // (158:1) {:else}
    function create_else_block(ctx) {
    	let statistics;
    	let t;
    	let distribution;
    	let current;

    	statistics = new Statistics({
    			props: { data: /*stats*/ ctx[1] },
    			$$inline: true
    		});

    	distribution = new Distribution({
    			props: {
    				distribution: /*stats*/ ctx[1].guesses,
    				guesses: /*game*/ ctx[2].guesses,
    				active: /*game*/ ctx[2].active
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(statistics.$$.fragment);
    			t = space();
    			create_component(distribution.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(statistics, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(distribution, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const statistics_changes = {};
    			if (dirty[0] & /*stats*/ 2) statistics_changes.data = /*stats*/ ctx[1];
    			statistics.$set(statistics_changes);
    			const distribution_changes = {};
    			if (dirty[0] & /*stats*/ 2) distribution_changes.distribution = /*stats*/ ctx[1].guesses;
    			if (dirty[0] & /*game*/ 4) distribution_changes.guesses = /*game*/ ctx[2].guesses;
    			if (dirty[0] & /*game*/ 4) distribution_changes.active = /*game*/ ctx[2].active;
    			distribution.$set(distribution_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(statistics.$$.fragment, local);
    			transition_in(distribution.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(statistics.$$.fragment, local);
    			transition_out(distribution.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(statistics, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(distribution, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(158:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (156:1) {#if modeData.modes[$mode].historical}
    function create_if_block_1(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Statistics not available for historical games";
    			attr_dev(h2, "class", "historical svelte-sv913b");
    			add_location(h2, file, 156, 2, 5433);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(156:1) {#if modeData.modes[$mode].historical}",
    		ctx
    	});

    	return block;
    }

    // (163:2) 
    function create__1_slot(ctx) {
    	let timer_1;
    	let current;
    	let timer_1_props = { slot: "1" };
    	timer_1 = new Timer({ props: timer_1_props, $$inline: true });
    	/*timer_1_binding*/ ctx[27](timer_1);
    	timer_1.$on("timeup", /*timeup_handler*/ ctx[28]);
    	timer_1.$on("reload", /*reload*/ ctx[13]);

    	const block = {
    		c: function create() {
    			create_component(timer_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(timer_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const timer_1_changes = {};
    			timer_1.$set(timer_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(timer_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(timer_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*timer_1_binding*/ ctx[27](null);
    			destroy_component(timer_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create__1_slot.name,
    		type: "slot",
    		source: "(163:2) ",
    		ctx
    	});

    	return block;
    }

    // (169:2) 
    function create__2_slot(ctx) {
    	let share;
    	let current;

    	share = new Share({
    			props: { slot: "2", state: /*game*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(share.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(share, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const share_changes = {};
    			if (dirty[0] & /*game*/ 4) share_changes.state = /*game*/ ctx[2];
    			share.$set(share_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(share.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(share.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(share, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create__2_slot.name,
    		type: "slot",
    		source: "(169:2) ",
    		ctx
    	});

    	return block;
    }

    // (172:1) {#if !game.active}
    function create_if_block$1(ctx) {
    	let definition;
    	let current;

    	definition = new Definition({
    			props: { word: /*word*/ ctx[0], alternates: 2 },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(definition.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(definition, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const definition_changes = {};
    			if (dirty[0] & /*word*/ 1) definition_changes.word = /*word*/ ctx[0];
    			definition.$set(definition_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(definition.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(definition.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(definition, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(172:1) {#if !game.active}",
    		ctx
    	});

    	return block;
    }

    // (155:0) <Modal bind:visible={showStats}>
    function create_default_slot_1(ctx) {
    	let current_block_type_index;
    	let if_block0;
    	let t0;
    	let seperator;
    	let t1;
    	let sharegame;
    	let t2;
    	let if_block1_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*modeData*/ ctx[3].modes[/*$mode*/ ctx[10]].historical) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	seperator = new Seperator({
    			props: {
    				visible: !/*game*/ ctx[2].active,
    				$$slots: {
    					"2": [create__2_slot],
    					"1": [create__1_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	sharegame = new ShareGame({
    			props: { wordNumber: /*game*/ ctx[2].wordNumber },
    			$$inline: true
    		});

    	let if_block1 = !/*game*/ ctx[2].active && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if_block0.c();
    			t0 = space();
    			create_component(seperator.$$.fragment);
    			t1 = space();
    			create_component(sharegame.$$.fragment);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(seperator, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(sharegame, target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(t0.parentNode, t0);
    			}

    			const seperator_changes = {};
    			if (dirty[0] & /*game*/ 4) seperator_changes.visible = !/*game*/ ctx[2].active;

    			if (dirty[0] & /*game, timer, showRefresh*/ 644 | dirty[1] & /*$$scope*/ 16) {
    				seperator_changes.$$scope = { dirty, ctx };
    			}

    			seperator.$set(seperator_changes);
    			const sharegame_changes = {};
    			if (dirty[0] & /*game*/ 4) sharegame_changes.wordNumber = /*game*/ ctx[2].wordNumber;
    			sharegame.$set(sharegame_changes);

    			if (!/*game*/ ctx[2].active) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*game*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(seperator.$$.fragment, local);
    			transition_in(sharegame.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(seperator.$$.fragment, local);
    			transition_out(sharegame.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(seperator, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(sharegame, detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(155:0) <Modal bind:visible={showStats}>",
    		ctx
    	});

    	return block;
    }

    // (177:0) <Modal fullscreen={true} bind:visible={showSettings}>
    function create_default_slot(ctx) {
    	let settings_1;
    	let current;

    	settings_1 = new Settings({
    			props: {
    				visible: /*showSettings*/ ctx[5],
    				wordNumber: /*game*/ ctx[2].wordNumber,
    				validHard: /*game*/ ctx[2].validHard
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(settings_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(settings_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const settings_1_changes = {};
    			if (dirty[0] & /*showSettings*/ 32) settings_1_changes.visible = /*showSettings*/ ctx[5];
    			if (dirty[0] & /*game*/ 4) settings_1_changes.wordNumber = /*game*/ ctx[2].wordNumber;
    			if (dirty[0] & /*game*/ 4) settings_1_changes.validHard = /*game*/ ctx[2].validHard;
    			settings_1.$set(settings_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(settings_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(settings_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(settings_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(177:0) <Modal fullscreen={true} bind:visible={showSettings}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let t0;
    	let main;
    	let header;
    	let updating_showRefresh;
    	let t1;
    	let board_1;
    	let updating_value;
    	let t2;
    	let keyboard;
    	let updating_value_1;
    	let t3;
    	let modal0;
    	let updating_visible;
    	let t4;
    	let modal1;
    	let updating_visible_1;
    	let t5;
    	let modal2;
    	let updating_visible_2;
    	let current;
    	let mounted;
    	let dispose;

    	function header_showRefresh_binding(value) {
    		/*header_showRefresh_binding*/ ctx[15](value);
    	}

    	let header_props = {
    		tutorial: /*$settings*/ ctx[11].tutorial === 1,
    		showStats: /*stats*/ ctx[1].played > 0 || /*modeData*/ ctx[3].modes[/*$mode*/ ctx[10]].historical && !/*game*/ ctx[2].active
    	};

    	if (/*showRefresh*/ ctx[7] !== void 0) {
    		header_props.showRefresh = /*showRefresh*/ ctx[7];
    	}

    	header = new Header({ props: header_props, $$inline: true });
    	binding_callbacks.push(() => bind(header, 'showRefresh', header_showRefresh_binding));
    	header.$on("closeTutPopUp", /*closeTutPopUp_handler*/ ctx[16]);
    	header.$on("stats", /*stats_handler*/ ctx[17]);
    	header.$on("tutorial", /*tutorial_handler*/ ctx[18]);
    	header.$on("settings", /*settings_handler*/ ctx[19]);
    	header.$on("reload", /*reload*/ ctx[13]);

    	function board_1_value_binding(value) {
    		/*board_1_value_binding*/ ctx[21](value);
    	}

    	let board_1_props = {
    		board: /*game*/ ctx[2].board,
    		guesses: /*game*/ ctx[2].guesses,
    		icon: /*modeData*/ ctx[3].modes[/*$mode*/ ctx[10]].icon
    	};

    	if (/*game*/ ctx[2].board.words !== void 0) {
    		board_1_props.value = /*game*/ ctx[2].board.words;
    	}

    	board_1 = new Board({ props: board_1_props, $$inline: true });
    	/*board_1_binding*/ ctx[20](board_1);
    	binding_callbacks.push(() => bind(board_1, 'value', board_1_value_binding));

    	function keyboard_value_binding(value) {
    		/*keyboard_value_binding*/ ctx[22](value);
    	}

    	let keyboard_props = {
    		disabled: !/*game*/ ctx[2].active || /*$settings*/ ctx[11].tutorial === 2
    	};

    	if (/*game*/ ctx[2].board.words[/*game*/ ctx[2].guesses] !== void 0) {
    		keyboard_props.value = /*game*/ ctx[2].board.words[/*game*/ ctx[2].guesses];
    	}

    	keyboard = new Keyboard({ props: keyboard_props, $$inline: true });
    	binding_callbacks.push(() => bind(keyboard, 'value', keyboard_value_binding));
    	keyboard.$on("keystroke", /*keystroke_handler*/ ctx[23]);
    	keyboard.$on("submitWord", /*submitWord*/ ctx[12]);
    	keyboard.$on("esc", /*esc_handler*/ ctx[24]);

    	function modal0_visible_binding(value) {
    		/*modal0_visible_binding*/ ctx[25](value);
    	}

    	let modal0_props = {
    		fullscreen: /*$settings*/ ctx[11].tutorial === 0,
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	};

    	if (/*showTutorial*/ ctx[4] !== void 0) {
    		modal0_props.visible = /*showTutorial*/ ctx[4];
    	}

    	modal0 = new Modal({ props: modal0_props, $$inline: true });
    	binding_callbacks.push(() => bind(modal0, 'visible', modal0_visible_binding));
    	modal0.$on("close", once(/*close_handler*/ ctx[26]));

    	function modal1_visible_binding(value) {
    		/*modal1_visible_binding*/ ctx[29](value);
    	}

    	let modal1_props = {
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	};

    	if (/*showStats*/ ctx[6] !== void 0) {
    		modal1_props.visible = /*showStats*/ ctx[6];
    	}

    	modal1 = new Modal({ props: modal1_props, $$inline: true });
    	binding_callbacks.push(() => bind(modal1, 'visible', modal1_visible_binding));

    	function modal2_visible_binding(value) {
    		/*modal2_visible_binding*/ ctx[30](value);
    	}

    	let modal2_props = {
    		fullscreen: true,
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	if (/*showSettings*/ ctx[5] !== void 0) {
    		modal2_props.visible = /*showSettings*/ ctx[5];
    	}

    	modal2 = new Modal({ props: modal2_props, $$inline: true });
    	binding_callbacks.push(() => bind(modal2, 'visible', modal2_visible_binding));

    	const block = {
    		c: function create() {
    			t0 = space();
    			main = element("main");
    			create_component(header.$$.fragment);
    			t1 = space();
    			create_component(board_1.$$.fragment);
    			t2 = space();
    			create_component(keyboard.$$.fragment);
    			t3 = space();
    			create_component(modal0.$$.fragment);
    			t4 = space();
    			create_component(modal1.$$.fragment);
    			t5 = space();
    			create_component(modal2.$$.fragment);
    			set_style(main, "--rows", ROWS);
    			set_style(main, "--cols", COLS);
    			attr_dev(main, "class", "svelte-sv913b");
    			toggle_class(main, "guesses", /*game*/ ctx[2].guesses !== 0);
    			add_location(main, file, 112, 0, 4189);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(header, main, null);
    			append_dev(main, t1);
    			mount_component(board_1, main, null);
    			append_dev(main, t2);
    			mount_component(keyboard, main, null);
    			insert_dev(target, t3, anchor);
    			mount_component(modal0, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(modal1, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(modal2, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						document.body,
    						"click",
    						function () {
    							if (is_function(/*board*/ ctx[8].hideCtx)) /*board*/ ctx[8].hideCtx.apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						document.body,
    						"contextmenu",
    						function () {
    							if (is_function(/*board*/ ctx[8].hideCtx)) /*board*/ ctx[8].hideCtx.apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const header_changes = {};
    			if (dirty[0] & /*$settings*/ 2048) header_changes.tutorial = /*$settings*/ ctx[11].tutorial === 1;
    			if (dirty[0] & /*stats, modeData, $mode, game*/ 1038) header_changes.showStats = /*stats*/ ctx[1].played > 0 || /*modeData*/ ctx[3].modes[/*$mode*/ ctx[10]].historical && !/*game*/ ctx[2].active;

    			if (!updating_showRefresh && dirty[0] & /*showRefresh*/ 128) {
    				updating_showRefresh = true;
    				header_changes.showRefresh = /*showRefresh*/ ctx[7];
    				add_flush_callback(() => updating_showRefresh = false);
    			}

    			header.$set(header_changes);
    			const board_1_changes = {};
    			if (dirty[0] & /*game*/ 4) board_1_changes.board = /*game*/ ctx[2].board;
    			if (dirty[0] & /*game*/ 4) board_1_changes.guesses = /*game*/ ctx[2].guesses;
    			if (dirty[0] & /*modeData, $mode*/ 1032) board_1_changes.icon = /*modeData*/ ctx[3].modes[/*$mode*/ ctx[10]].icon;

    			if (!updating_value && dirty[0] & /*game*/ 4) {
    				updating_value = true;
    				board_1_changes.value = /*game*/ ctx[2].board.words;
    				add_flush_callback(() => updating_value = false);
    			}

    			board_1.$set(board_1_changes);
    			const keyboard_changes = {};
    			if (dirty[0] & /*game, $settings*/ 2052) keyboard_changes.disabled = !/*game*/ ctx[2].active || /*$settings*/ ctx[11].tutorial === 2;

    			if (!updating_value_1 && dirty[0] & /*game*/ 4) {
    				updating_value_1 = true;
    				keyboard_changes.value = /*game*/ ctx[2].board.words[/*game*/ ctx[2].guesses];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			keyboard.$set(keyboard_changes);

    			if (dirty[0] & /*game*/ 4) {
    				toggle_class(main, "guesses", /*game*/ ctx[2].guesses !== 0);
    			}

    			const modal0_changes = {};
    			if (dirty[0] & /*$settings*/ 2048) modal0_changes.fullscreen = /*$settings*/ ctx[11].tutorial === 0;

    			if (dirty[0] & /*showTutorial*/ 16 | dirty[1] & /*$$scope*/ 16) {
    				modal0_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible && dirty[0] & /*showTutorial*/ 16) {
    				updating_visible = true;
    				modal0_changes.visible = /*showTutorial*/ ctx[4];
    				add_flush_callback(() => updating_visible = false);
    			}

    			modal0.$set(modal0_changes);
    			const modal1_changes = {};

    			if (dirty[0] & /*word, game, timer, showRefresh, modeData, $mode, stats*/ 1679 | dirty[1] & /*$$scope*/ 16) {
    				modal1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible_1 && dirty[0] & /*showStats*/ 64) {
    				updating_visible_1 = true;
    				modal1_changes.visible = /*showStats*/ ctx[6];
    				add_flush_callback(() => updating_visible_1 = false);
    			}

    			modal1.$set(modal1_changes);
    			const modal2_changes = {};

    			if (dirty[0] & /*showSettings, game*/ 36 | dirty[1] & /*$$scope*/ 16) {
    				modal2_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible_2 && dirty[0] & /*showSettings*/ 32) {
    				updating_visible_2 = true;
    				modal2_changes.visible = /*showSettings*/ ctx[5];
    				add_flush_callback(() => updating_visible_2 = false);
    			}

    			modal2.$set(modal2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(board_1.$$.fragment, local);
    			transition_in(keyboard.$$.fragment, local);
    			transition_in(modal0.$$.fragment, local);
    			transition_in(modal1.$$.fragment, local);
    			transition_in(modal2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(board_1.$$.fragment, local);
    			transition_out(keyboard.$$.fragment, local);
    			transition_out(modal0.$$.fragment, local);
    			transition_out(modal1.$$.fragment, local);
    			transition_out(modal2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			/*board_1_binding*/ ctx[20](null);
    			destroy_component(board_1);
    			destroy_component(keyboard);
    			if (detaching) detach_dev(t3);
    			destroy_component(modal0, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(modal1, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(modal2, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $mode;
    	let $letterStates;
    	let $settings;
    	validate_store(mode, 'mode');
    	component_subscribe($$self, mode, $$value => $$invalidate(10, $mode = $$value));
    	validate_store(letterStates, 'letterStates');
    	component_subscribe($$self, letterStates, $$value => $$invalidate(31, $letterStates = $$value));
    	validate_store(settings, 'settings');
    	component_subscribe($$self, settings, $$value => $$invalidate(11, $settings = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Game', slots, []);
    	let { word } = $$props;
    	let { stats } = $$props;
    	let { game } = $$props;
    	let { toaster } = $$props;
    	setContext("toaster", toaster);

    	// implement transition delay on keys
    	const delay = DELAY_INCREMENT * ROWS + 800;

    	let showTutorial = $settings.tutorial === 2;
    	let showSettings = false;
    	let showStats = false;
    	let showRefresh = false;
    	let board;
    	let timer;

    	function submitWord() {
    		if (game.board.words[game.guesses].length !== COLS) {
    			toaster.pop("Not enough letters");
    			board.shake(game.guesses);
    		} else if (words.contains(game.board.words[game.guesses])) {
    			if (game.guesses > 0) {
    				const hm = checkHardMode(game.board, game.guesses);

    				if ($settings.hard[$mode]) {
    					if (hm.type === "🟩") {
    						toaster.pop(`${contractNum(hm.pos + 1)} letter must be ${hm.char.toUpperCase()}`);
    						board.shake(game.guesses);
    						return;
    					} else if (hm.type === "🟨") {
    						toaster.pop(`Guess must contain ${hm.char.toUpperCase()}`);
    						board.shake(game.guesses);
    						return;
    					}
    				} else if (hm.type !== "⬛") {
    					$$invalidate(2, game.validHard = false, game);
    				}
    			}

    			const state = getState(word, game.board.words[game.guesses]);
    			$$invalidate(2, game.board.state[game.guesses] = state, game);
    			state.forEach((e, i) => set_store_value(letterStates, $letterStates[game.board.words[game.guesses][i]] = e, $letterStates));
    			$$invalidate(2, ++game.guesses, game);
    			if (game.board.words[game.guesses - 1] === word) win(); else if (game.guesses === ROWS) lose();
    		} else {
    			toaster.pop("Not in word list");
    			board.shake(game.guesses);
    		}
    	}

    	function win() {
    		board.bounce(game.guesses - 1);
    		$$invalidate(2, game.active = false, game);
    		setTimeout(() => toaster.pop(PRAISE[game.guesses - 1]), DELAY_INCREMENT * ROWS);
    		setTimeout(() => $$invalidate(6, showStats = true), delay * 1.4);

    		if (!modeData.modes[$mode].historical) {
    			$$invalidate(1, ++stats.guesses[game.guesses], stats);
    			$$invalidate(1, ++stats.played, stats);

    			if ("streak" in stats) {
    				$$invalidate(
    					1,
    					stats.streak = modeData.modes[$mode].seed - stats.lastGame >= modeData.modes[$mode].unit
    					? 1
    					: stats.streak + 1,
    					stats
    				);

    				if (stats.streak > stats.maxStreak) $$invalidate(1, stats.maxStreak = stats.streak, stats);
    			}

    			$$invalidate(1, stats.lastGame = modeData.modes[$mode].seed, stats);
    			localStorage.setItem(`stats-${$mode}`, JSON.stringify(stats));
    		}
    	}

    	function lose() {
    		$$invalidate(2, ++game.guesses, game);
    		$$invalidate(2, game.active = false, game);
    		setTimeout(() => $$invalidate(6, showStats = true), delay);

    		if (!modeData.modes[$mode].historical) {
    			$$invalidate(1, ++stats.guesses.fail, stats);
    			$$invalidate(1, ++stats.played, stats);
    			if ("streak" in stats) $$invalidate(1, stats.streak = 0, stats);
    			$$invalidate(1, stats.lastGame = modeData.modes[$mode].seed, stats);
    			localStorage.setItem(`stats-${$mode}`, JSON.stringify(stats));
    		}
    	}

    	function reload() {
    		$$invalidate(3, modeData.modes[$mode].historical = false, modeData);
    		$$invalidate(3, modeData.modes[$mode].seed = newSeed($mode), modeData);
    		$$invalidate(2, game = createNewGame($mode));
    		$$invalidate(0, word = words.words[seededRandomInt(0, words.words.length, modeData.modes[$mode].seed)]);
    		set_store_value(letterStates, $letterStates = createLetterStates(), $letterStates);
    		$$invalidate(6, showStats = false);
    		$$invalidate(7, showRefresh = false);
    		timer.reset($mode);
    	}

    	onMount(() => {
    		if (!game.active) setTimeout(() => $$invalidate(6, showStats = true), delay);
    	});

    	const writable_props = ['word', 'stats', 'game', 'toaster'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Game> was created with unknown prop '${key}'`);
    	});

    	function header_showRefresh_binding(value) {
    		showRefresh = value;
    		$$invalidate(7, showRefresh);
    	}

    	const closeTutPopUp_handler = () => set_store_value(settings, $settings.tutorial = 0, $settings);
    	const stats_handler = () => $$invalidate(6, showStats = true);
    	const tutorial_handler = () => $$invalidate(4, showTutorial = true);
    	const settings_handler = () => $$invalidate(5, showSettings = true);

    	function board_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			board = $$value;
    			$$invalidate(8, board);
    		});
    	}

    	function board_1_value_binding(value) {
    		if ($$self.$$.not_equal(game.board.words, value)) {
    			game.board.words = value;
    			$$invalidate(2, game);
    		}
    	}

    	function keyboard_value_binding(value) {
    		if ($$self.$$.not_equal(game.board.words[game.guesses], value)) {
    			game.board.words[game.guesses] = value;
    			$$invalidate(2, game);
    		}
    	}

    	const keystroke_handler = () => {
    		if ($settings.tutorial) set_store_value(settings, $settings.tutorial = 0, $settings);
    		board.hideCtx();
    	};

    	const esc_handler = () => {
    		$$invalidate(4, showTutorial = false);
    		$$invalidate(6, showStats = false);
    		$$invalidate(5, showSettings = false);
    	};

    	function modal0_visible_binding(value) {
    		showTutorial = value;
    		$$invalidate(4, showTutorial);
    	}

    	const close_handler = () => $settings.tutorial === 2 && set_store_value(settings, --$settings.tutorial, $settings);

    	function timer_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			timer = $$value;
    			$$invalidate(9, timer);
    		});
    	}

    	const timeup_handler = () => $$invalidate(7, showRefresh = true);

    	function modal1_visible_binding(value) {
    		showStats = value;
    		$$invalidate(6, showStats);
    	}

    	function modal2_visible_binding(value) {
    		showSettings = value;
    		$$invalidate(5, showSettings);
    	}

    	$$self.$$set = $$props => {
    		if ('word' in $$props) $$invalidate(0, word = $$props.word);
    		if ('stats' in $$props) $$invalidate(1, stats = $$props.stats);
    		if ('game' in $$props) $$invalidate(2, game = $$props.game);
    		if ('toaster' in $$props) $$invalidate(14, toaster = $$props.toaster);
    	};

    	$$self.$capture_state = () => ({
    		Header,
    		Board,
    		Keyboard,
    		Modal,
    		onMount,
    		setContext,
    		Settings,
    		Share,
    		Seperator,
    		Definition,
    		Tutorial,
    		Statistics,
    		Distribution,
    		Timer,
    		Toaster,
    		ShareGame,
    		contractNum,
    		DELAY_INCREMENT,
    		PRAISE,
    		getState,
    		modeData,
    		checkHardMode,
    		ROWS,
    		COLS,
    		newSeed,
    		createNewGame,
    		seededRandomInt,
    		createLetterStates,
    		words,
    		letterStates,
    		settings,
    		mode,
    		word,
    		stats,
    		game,
    		toaster,
    		delay,
    		showTutorial,
    		showSettings,
    		showStats,
    		showRefresh,
    		board,
    		timer,
    		submitWord,
    		win,
    		lose,
    		reload,
    		$mode,
    		$letterStates,
    		$settings
    	});

    	$$self.$inject_state = $$props => {
    		if ('word' in $$props) $$invalidate(0, word = $$props.word);
    		if ('stats' in $$props) $$invalidate(1, stats = $$props.stats);
    		if ('game' in $$props) $$invalidate(2, game = $$props.game);
    		if ('toaster' in $$props) $$invalidate(14, toaster = $$props.toaster);
    		if ('showTutorial' in $$props) $$invalidate(4, showTutorial = $$props.showTutorial);
    		if ('showSettings' in $$props) $$invalidate(5, showSettings = $$props.showSettings);
    		if ('showStats' in $$props) $$invalidate(6, showStats = $$props.showStats);
    		if ('showRefresh' in $$props) $$invalidate(7, showRefresh = $$props.showRefresh);
    		if ('board' in $$props) $$invalidate(8, board = $$props.board);
    		if ('timer' in $$props) $$invalidate(9, timer = $$props.timer);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		word,
    		stats,
    		game,
    		modeData,
    		showTutorial,
    		showSettings,
    		showStats,
    		showRefresh,
    		board,
    		timer,
    		$mode,
    		$settings,
    		submitWord,
    		reload,
    		toaster,
    		header_showRefresh_binding,
    		closeTutPopUp_handler,
    		stats_handler,
    		tutorial_handler,
    		settings_handler,
    		board_1_binding,
    		board_1_value_binding,
    		keyboard_value_binding,
    		keystroke_handler,
    		esc_handler,
    		modal0_visible_binding,
    		close_handler,
    		timer_1_binding,
    		timeup_handler,
    		modal1_visible_binding,
    		modal2_visible_binding
    	];
    }

    class Game extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { word: 0, stats: 1, game: 2, toaster: 14 }, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Game",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*word*/ ctx[0] === undefined && !('word' in props)) {
    			console.warn("<Game> was created without expected prop 'word'");
    		}

    		if (/*stats*/ ctx[1] === undefined && !('stats' in props)) {
    			console.warn("<Game> was created without expected prop 'stats'");
    		}

    		if (/*game*/ ctx[2] === undefined && !('game' in props)) {
    			console.warn("<Game> was created without expected prop 'game'");
    		}

    		if (/*toaster*/ ctx[14] === undefined && !('toaster' in props)) {
    			console.warn("<Game> was created without expected prop 'toaster'");
    		}
    	}

    	get word() {
    		throw new Error("<Game>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set word(value) {
    		throw new Error("<Game>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stats() {
    		throw new Error("<Game>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stats(value) {
    		throw new Error("<Game>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get game() {
    		throw new Error("<Game>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set game(value) {
    		throw new Error("<Game>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toaster() {
    		throw new Error("<Game>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toaster(value) {
    		throw new Error("<Game>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.46.4 */

    // (72:0) {#if toaster}
    function create_if_block(ctx) {
    	let game;
    	let updating_game;
    	let current;

    	function game_game_binding(value) {
    		/*game_game_binding*/ ctx[5](value);
    	}

    	let game_props = {
    		stats: /*stats*/ ctx[1],
    		word: /*word*/ ctx[2],
    		toaster: /*toaster*/ ctx[3]
    	};

    	if (/*state*/ ctx[0] !== void 0) {
    		game_props.game = /*state*/ ctx[0];
    	}

    	game = new Game({ props: game_props, $$inline: true });
    	binding_callbacks.push(() => bind(game, 'game', game_game_binding));

    	const block = {
    		c: function create() {
    			create_component(game.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(game, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const game_changes = {};
    			if (dirty & /*stats*/ 2) game_changes.stats = /*stats*/ ctx[1];
    			if (dirty & /*word*/ 4) game_changes.word = /*word*/ ctx[2];
    			if (dirty & /*toaster*/ 8) game_changes.toaster = /*toaster*/ ctx[3];

    			if (!updating_game && dirty & /*state*/ 1) {
    				updating_game = true;
    				game_changes.game = /*state*/ ctx[0];
    				add_flush_callback(() => updating_game = false);
    			}

    			game.$set(game_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(game.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(game.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(game, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(72:0) {#if toaster}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let toaster_1;
    	let t;
    	let if_block_anchor;
    	let current;
    	let toaster_1_props = {};
    	toaster_1 = new Toaster({ props: toaster_1_props, $$inline: true });
    	/*toaster_1_binding*/ ctx[4](toaster_1);
    	let if_block = /*toaster*/ ctx[3] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			create_component(toaster_1.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(toaster_1, target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const toaster_1_changes = {};
    			toaster_1.$set(toaster_1_changes);

    			if (/*toaster*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*toaster*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toaster_1.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toaster_1.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*toaster_1_binding*/ ctx[4](null);
    			destroy_component(toaster_1, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $mode;
    	validate_store(mode, 'mode');
    	component_subscribe($$self, mode, $$value => $$invalidate(7, $mode = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let stats;
    	let word;
    	let state;
    	settings.set(JSON.parse(localStorage.getItem("settings")) || createDefaultSettings());
    	settings.subscribe(s => localStorage.setItem("settings", JSON.stringify(s)));
    	const hash = window.location.hash.slice(1).split("/");

    	const modeVal = !isNaN(GameMode[hash[0]])
    	? GameMode[hash[0]]
    	: parseInt(localStorage.getItem("mode")) || modeData.default;

    	mode.set(modeVal);

    	// If this is a link to a specific word make sure that that is the word
    	if (!isNaN(parseInt(hash[1])) && parseInt(hash[1]) < getWordNumber(modeVal)) {
    		modeData.modes[modeVal].seed = (parseInt(hash[1]) - 1) * modeData.modes[modeVal].unit + modeData.modes[modeVal].start;
    		modeData.modes[modeVal].historical = true;
    	}

    	mode.subscribe(m => {
    		localStorage.setItem("mode", `${m}`);
    		window.location.hash = GameMode[m];
    		$$invalidate(1, stats = JSON.parse(localStorage.getItem(`stats-${m}`)) || createDefaultStats(m));
    		$$invalidate(2, word = words.words[seededRandomInt(0, words.words.length, modeData.modes[m].seed)]);
    		let temp;

    		if (modeData.modes[m].historical === true) {
    			temp = JSON.parse(localStorage.getItem(`state-${m}-h`));

    			if (!temp || temp.wordNumber !== getWordNumber(m)) {
    				$$invalidate(0, state = createNewGame(m));
    			} else {
    				$$invalidate(0, state = temp);
    			}
    		} else {
    			temp = JSON.parse(localStorage.getItem(`state-${m}`));

    			if (!temp || modeData.modes[m].seed - temp.time >= modeData.modes[m].unit) {
    				$$invalidate(0, state = createNewGame(m));
    			} else {
    				// This is for backwards compatibility, can be removed in a day
    				if (!temp.wordNumber) {
    					temp.wordNumber = getWordNumber(m);
    				}

    				$$invalidate(0, state = temp);
    			}
    		}

    		// Set the letter states when data for a new game mode is loaded so the keyboard is correct
    		const letters = createLetterStates();

    		for (let row = 0; row < ROWS; ++row) {
    			for (let col = 0; col < state.board.words[row].length; ++col) {
    				letters[state.board.words[row][col]] = state.board.state[row][col];
    			}
    		}

    		letterStates.set(letters);
    	});

    	function saveState(state) {
    		if (modeData.modes[$mode].historical) {
    			localStorage.setItem(`state-${$mode}-h`, JSON.stringify(state));
    		} else {
    			localStorage.setItem(`state-${$mode}`, JSON.stringify(state));
    		}
    	}

    	let toaster;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function toaster_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			toaster = $$value;
    			$$invalidate(3, toaster);
    		});
    	}

    	function game_game_binding(value) {
    		state = value;
    		$$invalidate(0, state);
    	}

    	$$self.$capture_state = () => ({
    		modeData,
    		seededRandomInt,
    		createDefaultStats,
    		createNewGame,
    		createDefaultSettings,
    		createLetterStates,
    		ROWS,
    		getWordNumber,
    		words,
    		Game,
    		letterStates,
    		settings,
    		mode,
    		GameMode,
    		Toaster,
    		stats,
    		word,
    		state,
    		hash,
    		modeVal,
    		saveState,
    		toaster,
    		$mode
    	});

    	$$self.$inject_state = $$props => {
    		if ('stats' in $$props) $$invalidate(1, stats = $$props.stats);
    		if ('word' in $$props) $$invalidate(2, word = $$props.word);
    		if ('state' in $$props) $$invalidate(0, state = $$props.state);
    		if ('toaster' in $$props) $$invalidate(3, toaster = $$props.toaster);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*state*/ 1) {
    			saveState(state);
    		}
    	};

    	return [state, stats, word, toaster, toaster_1_binding, game_game_binding];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var main = new App({
        target: document.body,
        // props: {}
    });

    return main;

})();
//# sourceMappingURL=bundle.js.map
