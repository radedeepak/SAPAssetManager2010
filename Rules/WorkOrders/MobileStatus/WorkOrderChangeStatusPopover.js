import libWOMobile from './WorkOrderMobileStatusLibrary';

export default function WorkOrderChangeStatusPopover(context) {
    context.showActivityIndicator('');
    return libWOMobile.workOrderStatusPopoverMenu(context);
}
