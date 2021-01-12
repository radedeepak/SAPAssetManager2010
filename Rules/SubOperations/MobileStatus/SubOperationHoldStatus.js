import libSubOprMobile from './SubOperationMobileStatusLibrary';

export default function SubOperationHoldStatus(context) {
    context.showActivityIndicator('');
    return libSubOprMobile.holdSubOperation(context);
}
