import { ObjectEvent, Topic } from "choicest-barnacle";
import { HeijunkaBoard, ObjectEventCommandProcessor } from "outstanding-barnacle";
import { IObjectEventProcessor } from "../IObjectEventProcessor";
import { Backend } from "../Backend/Backend";

export class DomainModel implements IObjectEventProcessor {
    private localProcessor: ObjectEventCommandProcessor;
    private topic: Topic;
    private backend: Backend;

    constructor(backend: Backend) {
        this.backend = backend;
    }

    public async switchToTopic(topic: Topic): Promise<void> {
        this.localProcessor = new ObjectEventCommandProcessor();
        this.backend.getObjectEvents().subscribe((objectEvent: ObjectEvent) => {
            this.processLocalDomainModel(objectEvent);
        });
        this.backend.switchToTopic(topic);
        // block until all objects have been received
        while (this.backend.hasPendingRequests()) {
            await new Promise(r => setTimeout(r, 100));
        }
    }

    public getDomainModel(): HeijunkaBoard {
        return this.localProcessor.getHeijunkaBoard();
    }

    public process(objectEvent: ObjectEvent): void {
        this.processLocalDomainModel(objectEvent);
        this.saveInBackend(objectEvent);
    }

    private processLocalDomainModel(objectEvent: ObjectEvent): void {
        if (objectEvent.topic !== this.topic.id) {
            return;
        }
        this.localProcessor.process(objectEvent);
    }

    private saveInBackend(objectEvent: ObjectEvent): void {
        if (objectEvent.topic !== this.topic.id) {
            return;
        }
        this.backend;
    }
}