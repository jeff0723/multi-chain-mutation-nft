/**
 * The paginator keeps track of a pointer index in a list and returns
 * a subset of the choices if the list is too long.
 */
export declare class Paginator {
    pointer: number;
    lastIndex: number;
    paginate(output: string, active: number, pageSize?: number): string;
}
