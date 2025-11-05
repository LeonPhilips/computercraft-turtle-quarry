import {parseArgs} from "./argument-parser";
import {argumentDefinition, ArgumentList, loadJob} from "./argument-definitions";
import {Controller, Vector3d} from "./turtle_controller";


function main(args: ArgumentList): void {
    const arg_job = loadJob(args);
    arg_job.verify();

    const renderer = (controller: Controller) => {
        term.clear();
        term.setCursorPos(1,1);
        print(`Digging a quarry of ${controller.memory.progress.job.get_width()}x${controller.memory.progress.job.get_length()}x${controller.memory.progress.job.get_depth()}`);
        print("Progress:", math.ceil(controller.progress_percent*10000.0)/100.0);
        print("Position:", controller.memory.position.x, controller.memory.position.y, controller.memory.position.z);
        print(`Completed layers: ${Number(controller.memory.progress.job.get_completed_layers())}/${controller.memory.progress.job.get_depth()/3}`)
        print("Fuel:", controller.get_fuel_level());
    }
    
    const controller = new Controller(arg_job.clone(), renderer);
    if (args.rehome){
        controller.load();
        controller.reset();
        controller.tell("Marked home position.")
        return;
    }
    if (args.setup){
        controller.reset();
        controller.tell("Setup complete.")
        return;
    }
    controller.load();
    if(args.info){
        textutils.pagedPrint(textutils.serialize(controller.memory));
        return;
    }
    if (args.home){
        controller.home(false, false);
        print("Went back home.");
        return;
    }

    if (arg_job.has_layer_data()){
        controller.memory.progress.job.set_completed_layers(arg_job.get_completed_layers());
        controller.store();
        print("Updated config");
        return;
    }
    print("Fuel check...")
    controller.fuel_check(false);


    print("Starting...")
    for(let [_progress, _quarry_position, action] of controller.quarry()){
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
