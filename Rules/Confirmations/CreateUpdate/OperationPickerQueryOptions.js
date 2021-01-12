
import MobileStatusLibrary from '../../MobileStatus/MobileStatusLibrary';

export default function OperationPickerQueryOptions(context) {

    let binding = context.getBindingObject();
    return MobileStatusLibrary.getQueryOptionsForCompletedStatusForOperations(context, binding.OrderID);
}
