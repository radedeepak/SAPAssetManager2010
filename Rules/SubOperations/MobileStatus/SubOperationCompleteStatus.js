import libSubOprMobile from './SubOperationMobileStatusLibrary';

export default function SubOperationCompleteStatus(context) {
    context.showActivityIndicator('');
    return libSubOprMobile.completeSubOperation(context);
}
