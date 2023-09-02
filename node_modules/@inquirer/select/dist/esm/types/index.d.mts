import { Separator, AsyncPromptConfig } from '@inquirer/core';
type Choice<Value> = {
    value: Value;
    name?: string;
    description?: string;
    disabled?: boolean | string;
    type?: never;
};
declare const _default: <Value extends unknown>(config: AsyncPromptConfig & {
    choices: readonly (Separator | Choice<Value>)[];
    pageSize?: number | undefined;
}, context?: import("@inquirer/type").Context | undefined) => import("@inquirer/type").CancelablePromise<Value>;
export default _default;
export { Separator };
