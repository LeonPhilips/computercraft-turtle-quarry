import {parseArgs} from "./argument-parser";
import {argumentDefinition, ArgumentList, loadJob} from "./argument-definitions";
import {Controller} from "./turtle_controller";


function main(args: ArgumentList): void {
    const arg_job = loadJob(args);
    arg_job.verify();

    const controller = new Controller(arg_job.clone());
    if (args.rehome){
        controller.load();
        controller.reset();
        print("Marked home position.")
        return;
    }
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

    if (arg_job.has_layer_data()){
        controller.memory.progress.job.set_completed_layers(arg_job.get_completed_layers());
        controller.store();
        print("Updated config");
        return;
    }
    // if (arg_job.has_depth_data()){
    //     controller.load();
    //     controller.memory.progress.job.set_depth(arg_job.get_depth());
    //     controller.store();
    // }
    // if (arg_job.has_width_data()){
    //     controller.load();
    //     controller.memory.progress.job.set_width(arg_job.get_width());
    //     controller.store();
    // }
    // if (arg_job.has_length_data()){
    //     controller.load();
    //     controller.memory.progress.job.set_length(arg_job.get_length());
    //     controller.store();
    // }
    print("Starting...")
    for(let [progress, position, action] of controller.quarry()){
        term.clear();
        term.setCursorPos(1,1);
        print(`Digging a quarry of ${controller.memory.progress.job.get_width()}x${controller.memory.progress.job.get_length()}x${controller.memory.progress.job.get_depth()}`);
        print("Progress:", math.ceil(progress*10000.0)/100.0);
        print("Position:", position.x, position.y, position.z);
        print(`Completed layers: ${Number(controller.memory.progress.job.get_completed_layers())}/${controller.memory.progress.job.get_depth()/3}`)
        print("Fuel:", controller.get_fuel_level());
        action();
    }
    print("Done!")
    
}

((...args) => {
    const parsedArgs = parseArgs(argumentDefinition, ...args);
    if (parsedArgs === false) {
        return;
    }
    main(<ArgumentList>parsedArgs);
})(...$vararg);
