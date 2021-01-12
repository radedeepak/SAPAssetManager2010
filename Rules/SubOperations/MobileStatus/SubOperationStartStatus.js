import libSubOprMobile from './SubOperationMobileStatusLibrary';

export default function SubOperationStartStatus(context) {
    context.showActivityIndicator('');
    return libSubOprMobile.startSubOperation(context);
}
