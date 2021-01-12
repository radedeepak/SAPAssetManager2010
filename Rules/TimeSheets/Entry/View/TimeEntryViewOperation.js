import {ValueIfExists} from '../../../Common/Library/Formatter';

export default function TimeEntryViewOperation(context) {
    let binding = context.getPageProxy().binding;

    if (binding.MyWOOperation) {
        return `${binding.MyWOOperation.OperationNo} - ${binding.MyWOOperation.OperationShortText}`;
    } else { //If the nav property doesn't exist (which will happen for non-local entries if the wo is completed) then we show the id
        return ValueIfExists(binding.Operation);
    }
}
