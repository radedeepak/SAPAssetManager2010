import CommonLibrary from '../../Common/Library/CommonLibrary';

export default function WorkOrderOperationsCount(sectionProxy, queryOptions='') {
    let context = (typeof sectionProxy.getPageProxy !== 'undefined') ? sectionProxy.getPageProxy() : sectionProxy;

    let readLink = context.binding['@odata.readLink'];
    return CommonLibrary.getEntitySetCount(context, readLink + '/Operations', queryOptions);
}
