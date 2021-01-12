import libOprMobile from './MobileStatus/SubOperationMobileStatusLibrary';

export default function SubOperationChangeStausPopover(context) {
    context.showActivityIndicator('');
    return libOprMobile.subOperationStatusPopoverMenu(context); 
}
