

import QueryBuilder from '../../../Common/Query/QueryBuilder';
import GenerateLocalID from '../../../Common/GenerateLocalID';

export default function GenerateConfirmationCounter(context) {
    let binding = context.getBindingObject();

    let queryBuilder = new QueryBuilder();
    if (binding.OrderId) {
        queryBuilder.addFilter(`OrderID eq '${binding.OrderId}'`);
    } else {
        queryBuilder.addFilter(`OrderID eq '${binding.OrderID}'`);
    }

    if (binding.OperationNo) {
        queryBuilder.addFilter(`Operation eq '${binding.OperationNo}'`);
    } else {
        queryBuilder.addFilter(`Operation eq '${binding.Operation}'`);
    }

    if (binding.SubOperationNo) {
        queryBuilder.addFilter('SubOperation eq \'' + binding.SubOperationNo + '\'');
    } else if (binding.SubOperation) {
        queryBuilder.addFilter('SubOperation eq \'' + binding.SubOperation + '\'');
    }

    return GenerateLocalID(context, 'Confirmations', 'ConfirmationCounter', '00000000', queryBuilder.build(),'', 'ConfirmationCounter');

}

