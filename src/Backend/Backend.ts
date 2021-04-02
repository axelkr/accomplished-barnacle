import { ObjectEvent, Topic } from 'choicest-barnacle';
import { Logger } from 'sitka';
import { ITopicService } from './ITopicService';
import { HttpClient } from './HttpClient';
import { BackendConfiguration } from '../ISettings';
import { Client } from 'prime-barnacle';
import { EventSourceFactory } from './EventSourceFactory';
import { Observable, Subscription } from 'rxjs';

export class Backend implements ITopicService {
    private logger: Logger;
    private configuration: BackendConfiguration;
    private client: Client;
    private topics: Topic[] = [];
    private newTopicStream: Subscription = undefined;

    constructor(configuration: BackendConfiguration, logger: Logger) {
        this.logger = logger;
        this.configuration = configuration;
    }

    public async connect(): Promise<void> {
        this.logger.debug('connecting with backend at ' + this.configuration.endpoint);
        this.client = new Client(this.configuration.endpoint, new EventSourceFactory(), new HttpClient(this.logger));
        this.connectWithTopics();

        // block until all topics have been received
        while (this.client.hasPendingRequests()) {
            await new Promise(r => setTimeout(r, 100));
        }
    }

    public getObjectEvents(): Observable<ObjectEvent> {
        return this.client.publishedObjectEvents;
    }

    public switchToTopic(topic: Topic): void {
        this.client.switchToTopic(topic);
    }

    public storeObjectEvent(objectEvent: ObjectEvent): void {
        this.client.storeObjectEvent(objectEvent);
    }

    public disconnect(): void {
        this.logger.debug('disconnecting from backend at ' + this.configuration.endpoint);
        this.disconnectWithTopics();
    }

    public getAvailableTopics(): Topic[] {
        return [...this.topics];
    }

    private connectWithTopics(): void {
        if (this.newTopicStream !== undefined) {
            this.disconnectWithTopics();
        }
        this.newTopicStream = this.client.publishedTopics.subscribe((topic: Topic) => {
            this.topics.push(topic);
        });
        this.client.getAllTopics();
    }

    private disconnectWithTopics(): void {
        if (this.newTopicStream === undefined) {
            return;
        }
        this.newTopicStream.unsubscribe();
        this.newTopicStream = undefined;
    }
}