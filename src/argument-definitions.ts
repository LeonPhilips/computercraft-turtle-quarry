import {ArgumentDefinition, ArgumentList as _ArgumentList} from "./argument-parser";

export const argumentDefinition: ArgumentDefinition = {
    name: "QuarryMiner",
    version: "0.2.0",
    command: "main",
    description: "Digs a quarry",
    flags: [
        {name: "setup", alias: "s", description: "Setup"},
        {name: "home", alias: "h", description: "Go home"},
        {name: "info", alias: "i", description: "Print info"},
    ],
    args: [
        {name: "width", defaultValue: 10, description: "Quarry width. Must be even."},
        {name: "length", defaultValue: 10, description: "Quarry length. Must be even."},
        {name: "depth", defaultValue: 60, description: "Quarry depth. Must be multiple of 3."},
        {name: "max_fuel", defaultValue: 10000, description: "Refuel max value"},
        {name: "completed_layers", defaultValue: 0, description: "Update memory to skip layers"},
    ],
    positional: []
};

export interface ArgumentList extends _ArgumentList {
    width: string,
    length: string,
    depth: string,
    max_fuel: string,
    completed_layers: string,
    setup: boolean,
    home: boolean,
    info: boolean,
}