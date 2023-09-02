import readline from 'node:readline';
import { CancelablePromise } from '@inquirer/type';
import MuteStream from 'mute-stream';
import ScreenManager from './lib/screen-manager.mjs';
import { getPromptConfig } from './lib/options.mjs';
export { usePrefix } from './lib/prefix.mjs';
export * from './lib/key.mjs';
export * from './lib/Paginator.mjs';
export * from './lib/Separator.mjs';
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
export function useState(defaultValue) {
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
export function useEffect(cb, depArray) {
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
export function useKeypress(userHandler) {
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
export function useRef(val) {
    return useState({ current: val })[0];
}
export function createPrompt(view) {
    const prompt = (config, context) => {
        if (sessionRl) {
            throw new Error('An inquirer prompt is already running.\nMake sure you await the result of the previous prompt before calling another prompt.');
        }
        // Default `input` to stdin
        const input = context?.input ?? process.stdin;
        // Add mute capabilities to the output
        const output = new MuteStream();
        output.pipe(context?.output ?? process.stdout);
        sessionRl = readline.createInterface({
            terminal: true,
            input,
            output,
        });
        const screen = new ScreenManager(sessionRl);
        let cancel = () => { };
        const answer = new CancelablePromise((resolve, reject) => {
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
                if (context?.clearPromptOnDone) {
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
            getPromptConfig(config).then(workLoop, reject);
        });
        answer.catch(() => {
            resetHookState();
        });
        answer.cancel = cancel;
        return answer;
    };
    return prompt;
}
