type Vector3d = { x: number, y: number, z: number };
enum Direction {NORTH, EAST, SOUTH, WEST};


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

export class Controller{

    position: Vector3d = {x: 0, y: 0, z: 0};
    direction: Direction = Direction.NORTH;
    max_fuel: number;
    min_fuel: number;

    constructor(max_fuel: number, dig_size: Vector3d){
        this.max_fuel = max_fuel
        this.min_fuel = (dig_size.x * dig_size.z * 2) + dig_size.y
    }

    reset(){
        this.position = {x: 0, y: 0, z: 0};
        this.direction = Direction.NORTH;
    }

    fuel_check(){
        const required_fuel_level = this.position.x + this.position.y + this.position.z
        if(this.get_fuel_level() - 10 < required_fuel_level){
            this.home()
        }
    }

    store(){

    }

    up(){
        this.position.y++;
        turtle.up();
        this.store();
    }

    down(){
        this.position.y--;
        turtle.down();
        this.store();
    }

    turnLeft(){
        this.direction = LEFT_TURN_MAPPING[this.direction]
        turtle.turnLeft()
        this.store();
    }

    turnRight(){
        this.direction = RIGHT_TURN_MAPPING[this.direction]
        turtle.turnRight()
        this.store();
    }

    forward(){
        switch (this.direction) {
            case Direction.NORTH:
                this.position.y++;
                break;
            case Direction.SOUTH:
                this.position.y--;
                break;
            case Direction.EAST:
                this.position.x--;
                break;
            case Direction.WEST:
                this.position.x++;
                break;
        }
        turtle.forward()
        this.store()
    }

    face(direction: Direction){
        if (this.direction == direction){
            // Already facing the right direction
            return;
        }else if (RIGHT_TURN_MAPPING[this.direction] == direction) {
            this.turnRight();
        }else if (LEFT_TURN_MAPPING[this.direction] == direction) {
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
        return fuel_level as number
    }

    home(){
        this.goto({x: 0, y: 0, z:0})
        // Drop inventory
        this.face(Direction.SOUTH)
        for (let i = 1; i <= 16; i++) {
            turtle.select(i);
            turtle.drop(turtle.getItemCount(i));
        }
        turtle.select(1);

        // Refuel if needed
        do{
            const condition = () => this.get_fuel_level() < math.min(this.max_fuel, turtle.getFuelLimit()) - 1000
            while(condition()){
                if (turtle.getItemCount(1) == 0){
                    const has_items = turtle.suckUp()[0]
                    if (!has_items){
                        break;
                    }
                }
                turtle.refuel(1)
            }
            if(this.get_fuel_level() < this.min_fuel){
                os.sleep(1)
                print("Waiting for fuel...")
            }
        }while(this.get_fuel_level() < this.min_fuel)
        
    }

    goto(target: Vector3d){
        while(this.position.y < target.y){
            this.up()
        }
        while(this.position.y > target.y){
            this.down()
        }
        if (this.position.x != target.x){
            const target_direction_x = target.x > this.position.x ? Direction.WEST : Direction.EAST;
            this.face(target_direction_x)
            while (this.position.x != target.x){
                this.forward()
            }
        }
        if (this.position.z != target.z){
            const target_direction_z = target.z > this.position.z ? Direction.NORTH : Direction.SOUTH;
            this.face(target_direction_z)
            while (this.position.z != target.z){
                this.forward()
            }
        }
    }
}

