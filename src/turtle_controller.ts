import { Job } from "./argument-definitions";

export type Vector3d = { x: number, y: number, z: number };
export type Vector2d = { x: number, z: number };
export enum Direction {
    NORTH = "NORTH", // Home location, Z-
    EAST = "EAST",   // X+
    SOUTH = "SOUTH", // Z+
    WEST = "WEST"    // X-
};


const RIGHT_TURN_MAPPING = {
    [Direction.NORTH]: Direction.EAST,
    [Direction.EAST]: Direction.SOUTH,
    [Direction.SOUTH]: Direction.WEST,
    [Direction.WEST]: Direction.NORTH,
};

const LEFT_TURN_MAPPING = {
    [Direction.NORTH]: Direction.WEST,
    [Direction.WEST]: Direction.SOUTH,
    [Direction.SOUTH]: Direction.EAST,
    [Direction.EAST]: Direction.NORTH,
};

class LayerProgress{
    job: Job;

    constructor(job: Job){
        this.job = job;
    }

    *quarry_generator(controller: Controller): Generator<[number, Vector3d, () => void]>{
        const layers = controller.memory.progress.job.get_depth() / 3;
        const position: Vector3d = {x: 0, y: 0, z: 0};

        print(`Doing: ${this.job.get_completed_layers()} ${layers} ${controller.memory.progress.job.get_depth()}`)
        for(let layer_num=Number(this.job.get_completed_layers()); layer_num<layers; layer_num++){
            position.y = (layer_num * -3);
            position.x = 0;
            position.z = 0;
            yield [layer_num / layers, position, () => {
                controller.goto({x: position.x, y: position.y + 2, z: position.z});
                turtle.digDown();
                controller.down();
                turtle.digDown();
                controller.down();
            }];
            for(let [layer_progress, layer_pos, layer_action] of this.layer_generator(controller)){
                const progress = ((layer_num + (layer_progress / layers)) / layers);
                position.x = layer_pos.x;
                position.z = layer_pos.z;
                yield [progress, position, layer_action];
            }
            this.job.set_completed_layers(layer_num + 1);
            controller.store();
        }
    }

    *layer_generator(controller: Controller): Generator<[number, Vector2d, () => void]>{
        const length = Number(controller.memory.progress.job.get_length());
        const width = Number(controller.memory.progress.job.get_width());

        let vec: Vector2d = {x: 0, z: 0};
        let steps = 0;

        //First: South (add one once)
        for(let z=0; z<length; z++){
            vec.z++;
            yield [(++steps / (length*width)), vec, () => {
                controller.face(Direction.SOUTH);
                controller.digAll();
                controller.forward();
            }];
        }

        for(let x=0; x<(width/2)-1; x++){
            // Turn left
            vec.x++;
            yield [(++steps / (length*width)), vec, () => {
                controller.face(Direction.EAST);
                controller.digAll();
                controller.forward();
            }];
            // North
            for(let z=0; z<length-1; z++){
                vec.z--;
                yield [(++steps / (length*width)), vec, () => {
                    controller.face(Direction.NORTH);
                    controller.digAll();
                    controller.forward();
                }];
            }
            // Turn right
            vec.x++;
            yield [(++steps / (length*width)), vec, () => {
                controller.face(Direction.EAST);
                controller.digAll();
                controller.forward();
            }];

            //South
            for(let z=0; z<length-1; z++){
                vec.z++;
                yield [(++steps / (length*width)), vec, () => {
                    controller.face(Direction.SOUTH);
                    controller.digAll();
                    controller.forward();
                }];
            }
            
        }
        // We're on the left hand side. Let's go down.
        vec.x++;
        yield [(++steps / (length*width)), vec, () => {
            controller.face(Direction.EAST);
            controller.digAll();
            controller.forward();
        }];

        for(let z=0; z<length; z++){
            vec.z++;
            yield [(++steps / (length*width)), vec, () => {
                controller.face(Direction.NORTH);
                controller.digAll();
                controller.forward();
            }];
        }

        // Back to start
        for(let x=0; x<length-1; x++){
            vec.x--;
            yield [(++steps / (length*width)), vec, () => {
                controller.face(Direction.WEST);
                controller.digAll();
                controller.forward();
            }];
        }

    }
}

class ControllerMemory{
    progress: LayerProgress;
    position: Vector3d = {x: 0, y: 0, z: 0};
    direction: Direction = Direction.NORTH;

    constructor(job: Job){
        this.progress = new LayerProgress(job);
    }
};

export class Controller{
    readonly HOME_LOCATION: Vector3d =  {x: 0, y: 0, z: -2}

    memory: ControllerMemory;
    max_fuel: number;
    min_fuel: number;

    constructor(args: Job){
        this.max_fuel = args.get_max_fuel();
        this.min_fuel = (args.get_length() * args.get_width() * 2) + args.get_depth();
        this.memory = new ControllerMemory(args);
    }

    reset(){
        let found = false;
        for(const dir of [Direction.NORTH, Direction.EAST, Direction.SOUTH, Direction.WEST]) {
            this.face(dir);
            const err = this.ensure_parked();
            if(err == undefined){
                found = true;
                break;
            }
        }
        if(!found){
            error("Expected inventories in front, below and above this turtle.");
        }
        this.memory.position = {x: this.HOME_LOCATION.x, y: this.HOME_LOCATION.y, z: this.HOME_LOCATION.z};
        this.memory.direction = Direction.NORTH;
        this.store();
    }

    quarry(): Generator<[number, Vector3d, () => void]>{
        return this.memory.progress.quarry_generator(this);
    }

    fuel_check(){
        const required_fuel_level = this.memory.position.x + this.memory.position.y + this.memory.position.z;
        if(this.get_fuel_level() - 10 < required_fuel_level){
            this.interrupt_home();
        }
    }

    load(){
        const [handle, _err] = fs.open("quarry_memory", "r");
        if (handle == undefined){
            print("Starting fresh...");
            return;
        }
        const data = handle.readAll();
        if (data == undefined){
            print("Old data is corrupt.");
            this.reset();
        }else{
            const loaded = textutils.unserialize(data);
            this.memory.direction = loaded.direction;
            this.memory.position = loaded.position;
            this.memory.progress.job.accept(loaded.progress.job);
        }
    }

    store(){
        const [handle, err] = io.open("quarry_memory", "w");
        if (handle == undefined){
            error(err);
        }
        handle.write(textutils.serialize(this.memory));
        handle.flush();
        handle.close();
    }

    up(check_fuel: boolean = true){
        if(turtle.detectUp()){
            print("Can't move up.")
            while(turtle.detectUp()){
                os.sleep(0.5);
            }
        }
        this.memory.position.y++;
        while(!turtle.up()[0]){
            print("Could not move up");
            os.sleep(1);
        }
        this.store();
        if(check_fuel){
            this.fuel_check();
        }
        return true;
    }

    down(check_fuel: boolean = true){
        if(turtle.detectDown()){
            print("Can't move down.")
            while(turtle.detectDown()){
                os.sleep(0.5);
            }
        }
        this.memory.position.y--;
        while(!turtle.down()[0]){
            print("Could not move down");
            os.sleep(1);
        }
        this.store();
        if(check_fuel){
            this.fuel_check();
        }
        return true;
    }

    turnLeft(){
        this.memory.direction = LEFT_TURN_MAPPING[this.memory.direction]
        this.store();
        turtle.turnLeft();
    }

    turnRight(){
        this.memory.direction = RIGHT_TURN_MAPPING[this.memory.direction]
        this.store();
        turtle.turnRight();
    }

    forward(check_fuel: boolean = true): boolean {
        switch (this.memory.direction) {
            case Direction.NORTH:
                this.memory.position.z--
                break;
            case Direction.SOUTH:
                this.memory.position.z++;
                break;
            case Direction.EAST:
                this.memory.position.x++;
                break;
            case Direction.WEST:
                this.memory.position.x--;
                break;
        }
        while(!turtle.forward()[0]){
            print("Could not move forward");
            turtle.dig();
        }
        this.store();
        if(check_fuel){
            this.fuel_check();
        }
        return true;
    }

    face(direction: Direction){
        if (this.memory.direction == direction){
            // Already facing the right direction
            return;
        }else if (RIGHT_TURN_MAPPING[this.memory.direction] == direction) {
            this.turnRight();
        }else if (LEFT_TURN_MAPPING[this.memory.direction] == direction) {
            this.turnLeft();
        }else{
            // Turn right twice if it's behind us
            this.turnRight();
            this.turnRight();
        }
    }

    get_fuel_level(): number {
        const fuel_level = turtle.getFuelLevel()
        // Handle infinite fuel turtles.
        if(fuel_level == "unlimited"){
            return this.max_fuel
        }
        return fuel_level
    }

    get_fuel_limit(): number {
        const fuel_limit = turtle.getFuelLimit()
        // Handle infinite fuel turtles.
        if(fuel_limit == "unlimited"){
            return this.max_fuel
        }
        return fuel_limit
    }

    ensure_parked(): void | string {
        const present_front = peripheral.hasType("front", "inventory");
        if(present_front == undefined || present_front == false){
            return "Assert failed: Expected an inventory in front of this turtle.";
        }
        const present_top = peripheral.hasType("top", "inventory");
        if(present_top == undefined || present_top == false){
            return "Assert failed: Expected an inventory on top of this turtle.";
        }
        const present_bottom = peripheral.hasType("bottom", "inventory");
        if(present_bottom == undefined || present_bottom == false){
            return "Assert failed: Expected an inventory below of this turtle.";
        }
    }

    home(exit: boolean=true){
        const max_up_moves = math.min(this.HOME_LOCATION.y - this.memory.position.y, 2);
        for(let i=0; i<max_up_moves; i++){
            this.up(false);
        }
        this.goto({x: 0, y: 0, z:0}, false);
        this.goto(this.HOME_LOCATION, false);
        // Drop inventory
        this.face(Direction.NORTH);
        const err = this.ensure_parked();
        if (err){
            error(err);
        }
        // We're facing the correct way, and all chests are present.
        for (let i = 1; i <= 16; i++) {
            const num_items = turtle.getItemCount(i);
            if(num_items > 0){
                turtle.select(i);
                while (!turtle.drop(num_items)[0]){
                    os.sleep(1.0);
                }
            }
        }
        turtle.select(1);

        // Refuel if needed
        do{
            const condition = () => this.get_fuel_level() < math.min(this.max_fuel, this.get_fuel_limit()) - 1000
            while(condition()){
                if (turtle.getItemCount(1) == 0){
                    const has_items = turtle.suckUp()[0];
                    if (!has_items){
                        break;
                    }
                }
                if(!turtle.refuel(1)[0]){
                    turtle.dropDown();
                }
                const detail = turtle.getItemDetail(2);
                if (detail != undefined){
                    turtle.select(2);
                    turtle.dropDown();
                    turtle.select(1);
                }
            }
            if(this.get_fuel_level() < this.min_fuel){
                os.sleep(1);
                print("Waiting for fuel...");
            }
        }while(this.get_fuel_level() < this.min_fuel);
        if(exit){
            this.goto({x: 0, y: 0, z:0}, false);
        }
    }

    interrupt_home(){
        const current_pos = {x: this.memory.position.x, y: this.memory.position.y, z: this.memory.position.z};
        const current_direction = this.memory.direction;
        this.home();
        this.goto({x: current_pos.x, y: current_pos.y+2, z: current_pos.z}, false);
        this.down();
        this.down();
        this.face(current_direction);
    }

    digAll(){
        turtle.digUp();
        turtle.digDown();
        turtle.dig();
        if (turtle.getItemDetail(14) != undefined || turtle.getItemDetail(15) != undefined || turtle.getItemDetail(16) != undefined){
            this.interrupt_home();
        }
    }

    goto(target: Vector3d, fuel_check: boolean = false){
        if(this.memory.position.y != target.y){
            this.goto({x: 0, y: this.memory.position.y, z: 0}, false);
            while(this.memory.position.y < target.y){
                this.up(fuel_check);
            }
            while(this.memory.position.y > target.y){
                this.down(fuel_check);
            }
        }
        if (this.memory.position.x != target.x){
            const target_direction_x = target.x > this.memory.position.x ? Direction.EAST : Direction.WEST;
            this.face(target_direction_x);
            while (this.memory.position.x != target.x){
                this.forward(fuel_check);
            }
        }
        if (this.memory.position.z != target.z){
            const target_direction_z = target.z > this.memory.position.z ? Direction.SOUTH : Direction.NORTH;
            this.face(target_direction_z);
            while (this.memory.position.z != target.z){
                this.forward(fuel_check);
            }
        }
    }
}

