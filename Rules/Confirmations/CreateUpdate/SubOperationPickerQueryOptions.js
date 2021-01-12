
import MobileStatusLibrary from '../../MobileStatus/MobileStatusLibrary';

export default function SubOperationPickerQueryOptions(context) {

    let binding = context.binding;
    return MobileStatusLibrary.getQueryOptionsForCompletedStatusForSuboperations(context, binding.OrderID, binding.Operation);
}
