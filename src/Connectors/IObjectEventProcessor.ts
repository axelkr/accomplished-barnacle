import { ObjectEvent } from "choicest-barnacle";

export interface IObjectEventProcessor {
    process(objectEvent: ObjectEvent | ObjectEvent[]): void;
}