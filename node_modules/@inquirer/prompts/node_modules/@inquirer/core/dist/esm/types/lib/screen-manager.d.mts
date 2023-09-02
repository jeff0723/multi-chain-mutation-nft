import { InquirerReadline } from '../index.mjs';
export default class ScreenManager {
    private readonly rl;
    private height;
    private extraLinesUnderPrompt;
    constructor(rl: InquirerReadline);
    render(content: string, bottomContent?: string): void;
    clean(): void;
    clearContent(): void;
    done(): void;
}
