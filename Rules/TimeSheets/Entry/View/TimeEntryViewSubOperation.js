import {ValueIfExists} from '../../../Common/Library/Formatter';

export default function TimeEntryViewSubOperation(context) {
    let binding = context.getPageProxy().binding;

    if (binding.MyWOSubOperation) {
        return `${binding.MyWOSubOperation.SubOperationNo} - ${binding.MyWOSubOperation.OperationShortText}`;
    }  else { //If the nav property doesn't exist (which will happen for non-local entries if the wo is completed) then we show the id
        return ValueIfExists(binding.SubOperation);
    }
}
