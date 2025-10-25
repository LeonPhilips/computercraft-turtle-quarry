import {createEventHelpers, Event, EventHandlerCollection} from "./event";

export enum MoveDirection {
    FORWARD,
    UP,
    DOWN
}

export class MoveEvent extends Event {
    constructor(public direction: MoveDirection) {
        super();
    }
}

export class PlaneFinishedEvent extends Event {
    constructor(public nextPlane: number, public maxPlanes: number) {
        super();
    }
}

let _moveEventHandlers: EventHandlerCollection<MoveEvent> = [];
let _planeFinishedEventHandlers: EventHandlerCollection<PlaneFinishedEvent> = [];

export const [
    addMoveEventHandler,
    removeMoveEventHandler,
    dispatchMoveEvent
] = createEventHelpers(_moveEventHandlers);

export const [
    addPlaneFinishedEventHandler,
    removePlaneFinishedEventHandler,
    dispatchPlaneFinishedEvent
] = createEventHelpers(_planeFinishedEventHandlers);

export function quarry(){


}