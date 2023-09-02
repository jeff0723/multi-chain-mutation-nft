"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cli_width_1 = __importDefault(require("cli-width"));
const strip_ansi_1 = __importDefault(require("strip-ansi"));
const string_width_1 = __importDefault(require("string-width"));
const ansi_escapes_1 = __importDefault(require("ansi-escapes"));
const utils_mjs_1 = require('./utils.js');
const height = (content) => content.split('\n').length;
const lastLine = (content) => { var _a; return (_a = content.split('\n').pop()) !== null && _a !== void 0 ? _a : ''; };
class ScreenManager {
    constructor(rl) {
        Object.defineProperty(this, "rl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: rl
        });
        // These variables are keeping information to allow correct prompt re-rendering
        Object.defineProperty(this, "height", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "extraLinesUnderPrompt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        this.rl = rl;
    }
    render(content, bottomContent = '') {
        this.clean();
        this.rl.output.unmute();
        /**
         * Write message to screen and setPrompt to control backspace
         */
        const promptLine = lastLine(content);
        const rawPromptLine = (0, strip_ansi_1.default)(promptLine);
        // Remove the rl.line from our prompt. We can't rely on the content of
        // rl.line (mainly because of the password prompt), so just rely on it's
        // length.
        let prompt = rawPromptLine;
        if (this.rl.line.length) {
            prompt = prompt.slice(0, -this.rl.line.length);
        }
        this.rl.setPrompt(prompt);
        // SetPrompt will change cursor position, now we can get correct value
        const cursorPos = this.rl._getCursorPos();
        const width = (0, cli_width_1.default)({ defaultWidth: 80, output: this.rl.output });
        content = (0, utils_mjs_1.breakLines)(content, width);
        bottomContent = (0, utils_mjs_1.breakLines)(bottomContent, width);
        // Manually insert an extra line if we're at the end of the line.
        // This prevent the cursor from appearing at the beginning of the
        // current line.
        if (rawPromptLine.length % width === 0) {
            content += '\n';
        }
        let output = content + (bottomContent ? '\n' + bottomContent : '');
        /**
         * Re-adjust the cursor at the correct position.
         */
        // We need to consider parts of the prompt under the cursor as part of the bottom
        // content in order to correctly cleanup and re-render.
        const promptLineUpDiff = Math.floor(rawPromptLine.length / width) - cursorPos.rows;
        const bottomContentHeight = promptLineUpDiff + (bottomContent ? height(bottomContent) : 0);
        // Return cursor to the input position (on top of the bottomContent)
        if (bottomContentHeight > 0)
            output += ansi_escapes_1.default.cursorUp(bottomContentHeight);
        // Move cursor at the start of the line, then return to the initial left offset.
        const backward = (0, string_width_1.default)(lastLine(output));
        if (backward > 0)
            output += ansi_escapes_1.default.cursorBackward(backward);
        if (cursorPos.cols > 0)
            output += ansi_escapes_1.default.cursorForward(cursorPos.cols);
        /**
         * Set up state for next re-rendering
         */
        this.extraLinesUnderPrompt = bottomContentHeight;
        this.height = height(output);
        this.rl.output.write(output);
        this.rl.output.mute();
    }
    clean() {
        this.rl.output.unmute();
        this.rl.output.write([
            this.extraLinesUnderPrompt > 0
                ? ansi_escapes_1.default.cursorDown(this.extraLinesUnderPrompt)
                : '',
            ansi_escapes_1.default.eraseLines(this.height),
        ].join(''));
        this.extraLinesUnderPrompt = 0;
        this.rl.output.mute();
    }
    clearContent() {
        this.rl.output.unmute();
        // Reset the cursor at the end of the previously displayed content
        this.rl.output.write([
            this.extraLinesUnderPrompt > 0
                ? ansi_escapes_1.default.cursorDown(this.extraLinesUnderPrompt)
                : '',
            '\n',
        ].join(''));
        this.rl.output.mute();
    }
    done() {
        this.rl.setPrompt('');
        this.rl.output.unmute();
        this.rl.output.write(ansi_escapes_1.default.cursorShow);
        this.rl.output.end();
        this.rl.close();
    }
}
exports.default = ScreenManager;
