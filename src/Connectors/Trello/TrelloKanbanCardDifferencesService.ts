import { Topic, ObjectEvent } from "choicest-barnacle";
import { Logger } from 'sitka';
import { HeijunkaBoard } from "outstanding-barnacle";
import { TrelloConfiguration } from "./TrelloConfiguration";
import { DifferencesService } from "../DifferencesService";
import { HttpClient } from "../../Backend/HttpClient";
import { Observable, from } from "rxjs";
import { reduce, map, mergeAll } from 'rxjs/operators';
import { TrelloKanbanCard } from './TrelloKanbanCard';
import { FetchKanbanCardsFromTrelloService } from './FetchKanbanCardsFromTrelloService';
import { TrelloJointKanbanCardState } from "./TrelloJointKanbanCardState";
import { ReconciliateDifferencesToTrelloKanbanCard } from './ReconciliateDifferencesToTrelloKanbanCard';

export class TrelloKanbanCardDifferencesService extends DifferencesService {
    private configuration: TrelloConfiguration;

    constructor(configuration: TrelloConfiguration) {
        super();
        this.configuration = configuration;
    }

    public reconciliate(topic: Topic, board: HeijunkaBoard, logger: Logger): Observable<ObjectEvent> {
        const httpClient = new HttpClient(logger, true);
        const allCards = board.kanbanCards.getKanbanCards();
        const jointState = new TrelloJointKanbanCardState(allCards, board, topic, logger);
        const reconciliateDifferencesToTrelloKanbanCard = new ReconciliateDifferencesToTrelloKanbanCard()

        return new FetchKanbanCardsFromTrelloService()
            .fetch(httpClient, this.configuration)
            .pipe(
                reduce<TrelloKanbanCard, TrelloJointKanbanCardState>(
                    (acc: TrelloJointKanbanCardState, value: TrelloKanbanCard) => {
                        return reconciliateDifferencesToTrelloKanbanCard.merge(value, acc);
                    },
                    jointState
                ),
                map<TrelloJointKanbanCardState, Observable<ObjectEvent>>(
                    value => { return from(value.getReconciliationEvents()) }
                ),
                mergeAll<ObjectEvent>()
            );
    }
}