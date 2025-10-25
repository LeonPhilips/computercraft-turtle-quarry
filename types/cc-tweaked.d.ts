interface Shell {
    exit(): void;
}

interface TextUtils {
    serialize(t: any, opts?: any): string;
    unserialize(data: string): any;
}

declare namespace os {
    export function sleep(seconds: number): void;
}

declare function write(args: any);
declare namespace turtle {
    export function detect(): boolean;

    export function select(slot: number): void;

    export function getItemCount(slot: number): number;

    export function getFuelLevel(): number | string;

    export function getFuelLimit(): number;

    export function refuel(amount?: number): void;

    export function detectDown(): boolean;

    export function dig(): void;

    export function digDown(): void;

    export function turnLeft(): void;

    export function turnRight(): void;

    export function forward(): void;

    export function back(): void;

    export function up(): void;

    export function down(): void;

    export function inspect(): LuaMultiReturn<[boolean, Record<string, any>]>;

    export function inspectDown(): LuaMultiReturn<[boolean, Record<string, any>]>;

    export function inspectUp(): LuaMultiReturn<[boolean, Record<string, any>]>;

    export function getItemDetail(slot: number, detailed?: boolean): void|Record<string, any>

    export function suck(count?: number): LuaMultiReturn<[boolean, string | void]>;

    export function suckUp(count?: number): LuaMultiReturn<[boolean, string | void]>;

    export function suckDown(count?: number): LuaMultiReturn<[boolean, string | void]>;

    export function drop(amount: number): void;

    export function dropUp(amount: number): void;

    export function dropDown(amount: number): void;
}