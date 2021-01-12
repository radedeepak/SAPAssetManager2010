
import ConfirmationDateFromOData from '../ConfirmationDateFromOData';
import QueryBuilder from '../../Common/Query/QueryBuilder';
import FetchRequest from '../../Common/Query/FetchRequest';
import libVal from '../../Common/Library/ValidationLibrary';

export default function ConfirmationUpdateNav(context) {

    return setupClientData(context).then(() => {
        return setupBinding(context).then(() => {
            return context.executeAction('/SAPAssetManager/Actions/Confirmations/ConfirmationsCreateUpdateNav.action');
        });
    });
}

function setupClientData(context) {
    var binding = context.getBindingObject();
    let queryBuilder = new QueryBuilder();
    queryBuilder.addFilter(`PostingDate eq datetime'${binding.PostingDate}'`);
    queryBuilder.addExtra('top=1');
    let request = new FetchRequest('ConfirmationOverviewRows', queryBuilder.build());

    return request.execute(context).then(result => {

        if (context.getClientData().FromErrorArchive) {
            context.getClientData().ConfirmationOverviewRowReadlink = binding['@odata.readLink'];
        } else {
            if (libVal.evalIsEmpty(result)) {
                context.getClientData().ConfirmationOverviewRowReadlink = '';
            } else {
                context.getClientData().ConfirmationOverviewRowReadlink = result.getItem(0)['@odata.readLink'];
            }
        }
        return true;
    });
}

function setupBinding(context) {
    let binding = context.getBindingObject();
    return context.read('/SAPAssetManager/Services/AssetManager.service', 'MyWorkOrderHeaders', [], `$filter=OrderId eq '${binding.OrderID}'&$expand=OrderMobileStatus_Nav,UserTimeEntry_Nav&$top=1`).then(result => {

        binding.IsOnCreate = false;
        binding.IsWorkOrderChangable = false;
        binding.IsOperationChangable = true;
        binding.IsSubOperationChangable = true;
        binding.WorkOrderHeader = result.getItem(0);
        binding.IsFinal = binding.FinalConfirmation === 'X';

        let confirmationStartDate = ConfirmationDateFromOData(context, binding, true);
        binding._Start = confirmationStartDate.date();

        let confirmationEndDate = ConfirmationDateFromOData(context, binding, false);
        binding._End = confirmationEndDate.date();

        return context.read('/SAPAssetManager/Services/AssetManager.service', 'ConfirmationLongTexts', [], `$filter=ConfirmationNum eq '${context.binding.ConfirmationNum}'`).then(longTextArray => {
            if (!libVal.evalIsEmpty(longTextArray)) {
                binding.LongText = longTextArray.getItem(0);
            }
            context.setActionBinding(binding);
            return true;
        });
    });
}



