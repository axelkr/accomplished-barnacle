import { Topic } from "choicest-barnacle";
import { HeijunkaBoard } from "outstanding-barnacle";
import { Logger } from "sitka";
import { IObjectEventProcessor } from "../IObjectEventProcessor";

export abstract class ContextDifferencesService {
    abstract reconciliate(topic: Topic, board: HeijunkaBoard, objectEventProcessor: IObjectEventProcessor, logger: Logger): void;
}