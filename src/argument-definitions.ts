import {ArgumentDefinition, ArgumentList as _ArgumentList} from "./argument-parser";

export const argumentDefinition: ArgumentDefinition = {
    name: "QuarryMiner",
    version: "0.2.0",
    command: "main",
    description: "Digs a quarry",
    flags: [
        {name: "setup", alias: "s", description: "Setup"},
        {name: "home", alias: "h", description: "Go home"},
        {name: "rehome", alias: "r", description: "Mark home positon"},
        {name: "info", alias: "i", description: "Print info"},
    ],
    args: [
        {name: "width", required: true, description: "Quarry width. Must be even."},
        {name: "length", required: true, description: "Quarry length. Must be even."},
        {name: "depth", required: true, description: "Quarry depth. Must be multiple of 3."},
        {name: "max_fuel", required: false, description: "Refuel max value"},
        {name: "completed_layers", description: "Update memory to skip layers"},
    ],
    positional: []
};

export interface ArgumentList extends _ArgumentList {
    width: string,
    length: string,
    depth: string,
    max_fuel: string,
    completed_layers: string,
    rehome: boolean,
    setup: boolean,
    home: boolean,
    info: boolean,
};

export class Job {
    constructor(
        private width: number | null,
        private length: number | null,
        private depth: number | null,
        private max_fuel: number | null,
        private completed_layers: number | null
    ){}

    verify(){
        if (this.get_length() % 2 != 0){
            error("Length not even.");
        }
        if (this.get_width() % 2 != 0){
            error("Width not even.");
        }
        if (this.get_depth() % 3 != 0){
            error("Depth not multiple of 3.");
        }
    }

    accept(other: Job){
        this.width = other.width != null ? other.width : this.width;
        this.length = other.length != null ? other.length : this.length;
        this.depth = other.depth != null ? other.depth : this.depth;
        this.max_fuel = other.max_fuel != null ? other.max_fuel : this.max_fuel;
        this.completed_layers = other.completed_layers != null ? other.completed_layers : this.completed_layers;
    }

    set_depth(depth: number){
        this.depth = depth;
    }

    set_width(width: number){
        this.width = width;
    }

    set_length(length: number){
        this.length = length;
    }

    set_completed_layers(completed_layers: number){
        this.completed_layers = completed_layers;
    }

    get_width(): number{
        return this.width != null ? this.width : 10;
    }

    get_length(): number{
        return this.length != null ? this.length : 10;
    }
    
    get_depth(): number{
        return this.depth != null ? this.depth : 60;
    }

    get_max_fuel(): number{
        return this.max_fuel != null ? this.max_fuel : 10000;
    }

    get_completed_layers(): number{
        return this.completed_layers != null ? this.completed_layers : 0;
    }

    has_layer_data(): boolean {
        return this.completed_layers != null;
    }

    has_depth_data(): boolean {
        return this.depth != null;
    }

    has_width_data(): boolean {
        return this.width != null;
    }

    has_length_data(): boolean {
        return this.length != null;
    }

    clone(): Job{
        return new Job(this.width, this.length, this.depth, this.max_fuel, this.completed_layers);
    }
};

export function loadJob(args: ArgumentList): Job{
    const width = args.width ? Number(args.width) : null;
    const length = args.length ? Number(args.length) : null;
    const depth = args.depth ? Number(args.depth) : null;
    const completed_layers = args.completed_layers ? Number(args.completed_layers) : null;
    const max_fuel = args.max_fuel ? Number(args.max_fuel) : null;
    return new Job(width, length, depth, max_fuel, completed_layers);
}