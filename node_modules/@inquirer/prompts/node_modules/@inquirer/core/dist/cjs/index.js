"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPrompt = exports.useRef = exports.useKeypress = exports.useEffect = exports.useState = exports.usePrefix = void 0;
const node_readline_1 = __importDefault(require("node:readline"));
const type_1 = require("@inquirer/type");
const mute_stream_1 = __importDefault(require("mute-stream"));
const screen_manager_mjs_1 = __importDefault(require('./lib/screen-manager.js'));
const options_mjs_1 = require('./lib/options.js');
var prefix_mjs_1 = require('./lib/prefix.js');
Object.defineProperty(exports, "usePrefix", { enumerable: true, get: function () { return prefix_mjs_1.usePrefix; } });
__exportStar(require('./lib/key.js'), exports);
__exportStar(require('./lib/Paginator.js'), exports);
__exportStar(require('./lib/Separator.js'), exports);
const hooks = [];
const hooksCleanup = [];
const hooksEffect = [];
let index = 0;
let handleChange = () => { };
let sessionRl;
function resetHookState() {
    hooks.length = 0;
    hooksCleanup.length = 0;
    hooksEffect.length = 0;
    index = 0;
    handleChange = () => { };
    sessionRl = undefined;
}
function cleanupHook(index) {
    const cleanFn = hooksCleanup[index];
    if (typeof cleanFn === 'function') {
        cleanFn();
    }
}
function mergeStateUpdates(fn) {
    const wrapped = (...args) => {
        let shouldUpdate = false;
        const oldHandleChange = handleChange;
        handleChange = () => {
            shouldUpdate = true;
        };
        const returnValue = fn(...args);
        if (shouldUpdate) {
            oldHandleChange();
        }
        handleChange = oldHandleChange;
        return returnValue;
    };
    return wrapped;
}
function useState(defaultValue) {
    const _idx = index;
    index++;
    if (!(_idx in hooks)) {
        if (typeof defaultValue === 'function') {
            hooks[_idx] = defaultValue();
        }
        else {
            hooks[_idx] = defaultValue;
        }
    }
    return [
        hooks[_idx],
        (newValue) => {
            // Noop if the value is still the same.
            if (hooks[_idx] !== newValue) {
                hooks[_idx] = newValue;
                // Trigger re-render
                handleChange();
            }
        },
    ];
}
exports.useState = useState;
function useEffect(cb, depArray) {
    const rl = sessionRl;
    if (!rl) {
        throw new Error('useEffect must be used within a prompt');
    }
    const _idx = index;
    index++;
    const oldDeps = hooks[_idx];
    let hasChanged = true;
    if (oldDeps) {
        hasChanged = depArray.some((dep, i) => !Object.is(dep, oldDeps[i]));
    }
    if (hasChanged) {
        hooksEffect.push(mergeStateUpdates(() => {
            cleanupHook(_idx);
            const cleanFn = cb(rl);
            if (cleanFn != null && typeof cleanFn !== 'function') {
                throw new Error('useEffect return value must be a cleanup function or nothing.');
            }
            hooksCleanup[_idx] = cleanFn;
        }));
    }
    hooks[_idx] = depArray;
}
exports.useEffect = useEffect;
function useKeypress(userHandler) {
    const rl = sessionRl;
    if (!rl) {
        throw new Error('useKeypress must be used within a prompt');
    }
    useEffect(() => {
        const handler = mergeStateUpdates((_input, event) => {
            userHandler(event, rl);
        });
        rl.input.on('keypress', handler);
        return () => {
            rl.input.removeListener('keypress', handler);
        };
    }, [userHandler]);
}
exports.useKeypress = useKeypress;
function useRef(val) {
    return useState({ current: val })[0];
}
exports.useRef = useRef;
function createPrompt(view) {
    const prompt = (config, context) => {
        var _a, _b;
        if (sessionRl) {
            throw new Error('An inquirer prompt is already running.\nMake sure you await the result of the previous prompt before calling another prompt.');
        }
        // Default `input` to stdin
        const input = (_a = context === null || context === void 0 ? void 0 : context.input) !== null && _a !== void 0 ? _a : process.stdin;
        // Add mute capabilities to the output
        const output = new mute_stream_1.default();
        output.pipe((_b = context === null || context === void 0 ? void 0 : context.output) !== null && _b !== void 0 ? _b : process.stdout);
        sessionRl = node_readline_1.default.createInterface({
            terminal: true,
            input,
            output,
        });
        const screen = new screen_manager_mjs_1.default(sessionRl);
        let cancel = () => { };
        const answer = new type_1.CancelablePromise((resolve, reject) => {
            const onExit = () => {
                try {
                    let len = hooksCleanup.length;
                    while (len--) {
                        cleanupHook(len);
                    }
                }
                catch (err) {
                    reject(err);
                }
                if (context === null || context === void 0 ? void 0 : context.clearPromptOnDone) {
                    screen.clean();
                }
                else {
                    screen.clearContent();
                }
                screen.done();
                resetHookState();
                process.removeListener('SIGINT', onForceExit);
            };
            cancel = () => {
                onExit();
                reject(new Error('Prompt was canceled'));
            };
            let shouldHandleExit = true;
            const onForceExit = () => {
                if (shouldHandleExit) {
                    shouldHandleExit = false;
                    onExit();
                    reject(new Error('User force closed the prompt with CTRL+C'));
                }
            };
            // Handle cleanup on force exit. Main reason is so we restore the cursor if a prompt hide it.
            process.on('SIGINT', onForceExit);
            const done = (value) => {
                // Delay execution to let time to the hookCleanup functions to registers.
                setImmediate(() => {
                    onExit();
                    // Finally we resolve our promise
                    resolve(value);
                });
            };
            const workLoop = (resolvedConfig) => {
                index = 0;
                hooksEffect.length = 0;
                handleChange = () => workLoop(resolvedConfig);
                try {
                    const nextView = view(resolvedConfig, done);
                    for (const effect of hooksEffect) {
                        effect();
                    }
                    const [content, bottomContent] = typeof nextView === 'string' ? [nextView] : nextView;
                    screen.render(content, bottomContent);
                }
                catch (err) {
                    onExit();
                    reject(err);
                }
            };
            // TODO: we should display a loader while we get the default options.
            (0, options_mjs_1.getPromptConfig)(config).then(workLoop, reject);
        });
        answer.catch(() => {
            resetHookState();
        });
        answer.cancel = cancel;
        return answer;
    };
    return prompt;
}
exports.createPrompt = createPrompt;
