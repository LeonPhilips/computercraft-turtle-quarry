import {parseArgs} from "./argument-parser";
import {argumentDefinition, ArgumentList} from "./argument-definitions";
import {Controller} from "./turtle_controller";


function main(args: ArgumentList): void {
    if (Number(args.length) % 2 != 0){
        error("Length not even.");
    }
    if (Number(args.width) % 2 != 0){
        error("Width not even.");
    }
    if (Number(args.depth) % 3 != 0){
        error("Length not multiple of 3.");
    }

    const controller = new Controller(args);
    if (args.setup){
        controller.reset();
        print("Setup complete.")
        return;
    }
    controller.load();
    if(args.info){
        textutils.pagedPrint(textutils.serialize(controller.memory));
        return;
    }
    if (args.home){
        controller.home(false);
        print("Went back home.");
        return;
    }
    if (Number(args.completed_layers) > 0){
        controller.memory.progress.job.completed_layers = args.completed_layers;
        controller.store();
        print("Updated config");
        return;
    }
    print("Position:", controller.memory.position.x,  controller.memory.position.y,  controller.memory.position.z);

    for(let [progress, position, action] of controller.quarry()){
        term.clear();
        term.setCursorPos(1,1);
        print(`Digging a quarry of ${Number(args.width)}x${Number(args.length)}x${Number(args.depth)}`);
        print("Progress:", math.ceil(progress*10000.0)/100.0);
        print("Position:", position.x,  position.y,  position.z);
        print(`Completed layers: ${Number(controller.memory.progress.job.completed_layers)}/${Number(args.depth)/3}`)
        print("Fuel:", controller.get_fuel_level());
        action();
    }
    
}

((...args) => {
    const parsedArgs = parseArgs(argumentDefinition, ...args);
    if (parsedArgs === false) {
        return;
    }
    main(<ArgumentList>parsedArgs);
})(...$vararg);
