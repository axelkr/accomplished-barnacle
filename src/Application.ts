import { Logger } from 'sitka';
import { Backend } from './Backend/Backend';
import { ITopicService } from './Backend/ITopicService';
import { Connector } from './Connectors/Connector';
import { ISettings } from './ISettings';

export class Application {
    private logger: Logger;
    private backend: Backend;
    private connector: Connector;
    private settings: ISettings;

    constructor(settings: ISettings, logger: Logger) {
        this.logger = logger;
        this.settings = settings;
    }

    public async run(): Promise<void> {
        await this.initialize();
        const topic = this.connector.selectTopic(this.backend as ITopicService);

        this.tearDown();
    }

    private tearDown(): void {
        this.backend.disconnect();
        this.logger.info('tore down.');
    }

    private async initialize(): Promise<void> {
        this.backend = new Backend(this.settings.backendConfiguration(), this.logger);
        await this.backend.connect();

        this.connector = this.settings.selectedConnector();
        this.logger.info('initialized.');
    }
}