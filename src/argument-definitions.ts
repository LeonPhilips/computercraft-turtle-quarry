import {ArgumentDefinition, ArgumentList as _ArgumentList} from "./argument-parser";
import {command, description, name, version} from "./const";

export const argumentDefinition: ArgumentDefinition = {
    name: name,
    version: version,
    command: command,
    description: description,
    flags: [
        {name: "refuel", alias: "a", description: "Refuel with coal"},
    ],
    args: [
        {name: "width", defaultValue: 10, description: "Quarry width"},
        {name: "length", defaultValue: 10, description: "Quarry length"},
        {name: "depth", defaultValue: 50, description: "Quarry depth"}
    ],
    positional: []
};

export interface ArgumentList extends _ArgumentList {
    width: number,
    length: number,
    depth: number,
    force: boolean,
    return: boolean,
    refuel: boolean,
    dropoff: boolean,
}