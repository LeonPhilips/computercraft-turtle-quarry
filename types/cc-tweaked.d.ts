interface Shell {
    exit(): void;
}

interface FileHandle{
    readAll(): string
}

declare namespace textutils {
    export function serialize(t: any, opts?: any): string;
    export function unserialize(data: string): any;
    export function pagedPrint(text: string, free_lines?: number): number;
}

declare namespace peripheral {
    export function hasType(peripheral: string, type: string): boolean | undefined;
}

declare namespace os {
    export function sleep(seconds: number): void;
}

declare namespace term {
    export function clear(): void;
    export function setCursorPos(x: number, y: number): void;
}

declare namespace fs {
    export function open(path: string, mode: "r" | "w" | "a" | "r+" | "w+"): LuaMultiReturn<[FileHandle, string | undefined]>;
}

declare function write(args: any);
declare namespace turtle {
    export function detect(): boolean;

    export function detectDown(): boolean;

    export function detectUp(): boolean;

    export function select(slot: number): void;

    export function getItemCount(slot: number): number;

    export function getFuelLevel(): number | "unlimited";

    export function getFuelLimit(): number | "unlimited";

    export function refuel(amount?: number): LuaMultiReturn<[boolean, string | undefined]>;

    export function dig(): void;

    export function digDown(): void;

    export function digUp(): void;

    export function turnLeft(): void;

    export function turnRight(): void;

    export function forward(): LuaMultiReturn<[boolean, string | undefined]>;

    export function back(): LuaMultiReturn<[boolean, string | undefined]>;

    export function up(): LuaMultiReturn<[boolean, string | undefined]>;

    export function down(): LuaMultiReturn<[boolean, string | undefined]>;

    export function inspect(): LuaMultiReturn<[boolean, Record<string, any>]>;

    export function inspectDown(): LuaMultiReturn<[boolean, Record<string, any>]>;

    export function inspectUp(): LuaMultiReturn<[boolean, Record<string, any>]>;

    export function getItemDetail(slot: number, detailed?: boolean): void|Record<string, any>

    export function suck(count?: number): LuaMultiReturn<[boolean, string | void]>;

    export function suckUp(count?: number): LuaMultiReturn<[boolean, string | void]>;

    export function suckDown(count?: number): LuaMultiReturn<[boolean, string | void]>;

    export function drop(amount?: number): LuaMultiReturn<[boolean, string | void]>

    export function dropUp(amount?: number): LuaMultiReturn<[boolean, string | void]>

    export function dropDown(amount?: number): LuaMultiReturn<[boolean, string | void]>
}