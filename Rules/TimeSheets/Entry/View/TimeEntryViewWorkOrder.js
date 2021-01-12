import {ValueIfExists} from '../../../Common/Library/Formatter';

export default function TimeEntryViewWorkOrder(context) {
    let binding = context.getPageProxy().binding;

    if (binding.MyWOHeader) {
        return `${binding.MyWOHeader.OrderId} - ${binding.MyWOHeader.OrderDescription}`;
    } else { //If the nav property doesn't exist (which will happen for non-local entries if the wo is completed) then we show the id
        return ValueIfExists(binding.RecOrder);
    }
}
