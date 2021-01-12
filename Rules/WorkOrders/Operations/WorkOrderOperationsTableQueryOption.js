import { OperationConstants as Constants } from './WorkOrderOperationLibrary';

export default function WorkOrderOperationsTableQueryOption() {
    let query = Constants.OperationListQueryOptions + '&$top=2';
    return query;
}
