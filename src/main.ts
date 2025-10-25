import {parseArgs} from "./argument-parser";
import {argumentDefinition, ArgumentList} from "./argument-definitions";
import {
    addPlaneFinishedEventHandler,
    quarry
} from "./quarry";
import {Controller} from "./track-position";


function main(args: ArgumentList): void {
    addPlaneFinishedEventHandler(
        e => print(`Progress: ${100 - Math.ceil((e.nextPlane) * 100 / e.maxPlanes)}%`)
    );
    print(`Digging a quarry of ${Number(args.width)}x${Number(args.length)}x${Number(args.depth)} dimensions...`);
    print(`Progress: 0%`);
    //quarry(Number(args.width), Number(args.length), Number(args.depth));
}

((...args) => {
    const parsedArgs = parseArgs(argumentDefinition, ...args);
    if (parsedArgs === false) {
        return;
    }
    main(<ArgumentList>parsedArgs);
})(...$vararg);
