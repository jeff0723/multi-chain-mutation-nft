"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Paginator = void 0;
const chalk_1 = __importDefault(require("chalk"));
const cli_width_1 = __importDefault(require("cli-width"));
const utils_mjs_1 = require('./utils.js');
/**
 * The paginator keeps track of a pointer index in a list and returns
 * a subset of the choices if the list is too long.
 */
class Paginator {
    constructor() {
        Object.defineProperty(this, "pointer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "lastIndex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    paginate(output, active, pageSize = 7) {
        const middleOfList = Math.floor(pageSize / 2);
        // TODO: I've remove the dependency on readline here. But we should refactor the
        // paginator to also rely on hook.
        const width = (0, cli_width_1.default)({ defaultWidth: 80, output: process.stdout });
        const lines = (0, utils_mjs_1.breakLines)(output, width).split('\n');
        // Make sure there's enough lines to paginate
        if (lines.length <= pageSize) {
            return output;
        }
        // Move the pointer only when the user go down and limit it to the middle of the list
        if (this.pointer < middleOfList &&
            this.lastIndex < active &&
            active - this.lastIndex < pageSize) {
            this.pointer = Math.min(middleOfList, this.pointer + active - this.lastIndex);
        }
        this.lastIndex = active;
        // Duplicate the lines so it give an infinite list look
        const infinite = [lines, lines, lines].flat();
        const topIndex = Math.max(0, active + lines.length - this.pointer);
        const section = infinite.splice(topIndex, pageSize).join('\n');
        return section + '\n' + chalk_1.default.dim('(Move up and down to reveal more choices)');
    }
}
exports.Paginator = Paginator;
