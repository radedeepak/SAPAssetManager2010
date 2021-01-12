import libOprMobile from './OperationMobileStatusLibrary';

export default function OperationChangeStausPopover(context) {
    context.showActivityIndicator('');
    return libOprMobile.operationStatusPopoverMenu(context);
}
