
import ConfirmationCreateUpdateNav from './ConfirmationCreateUpdateNav';

export default function ConfirmationCreateFromWONav(context) {

    let binding = context.getBindingObject();
    let override = {
        'WorkOrderHeader': binding,
        'OrderID': binding.OrderId,
        'IsWorkOrderChangable': false,
    };

    if (binding.MainWorkCenterPlant !== undefined) {
        override.Plant = binding.MainWorkCenterPlant;
    }

    return ConfirmationCreateUpdateNav(context, override);
} 
