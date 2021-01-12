/**
 * Creates the navigation relationships for a new UserTimeEntry work order or operation record
 * @param {*} context
 */
export default function WorkOrderClockInCreateLinks(context) {

var links = [];

if (context.binding.ClockType === 'WorkOrder') {
    links.push({
        'Property': 'WOHeader_Nav',
        'Target':
        {
            'EntitySet': 'MyWorkOrderHeaders',
            'ReadLink': "MyWorkOrderHeaders('" + context.binding.ClockOrderId + "')",
        },
    });
} else if (context.binding.ClockType === 'Operation') {
    links.push({
        'Property': 'WOOperation_Nav',
        'Target':
        {
            'EntitySet': 'MyWorkOrderOperations',
            'ReadLink': "MyWorkOrderOperations(OrderId='" + context.binding.ClockOrderId + "',OperationNo='" + context.binding.ClockOperationNo + "')",
        },
    });
}
    return links;
}
