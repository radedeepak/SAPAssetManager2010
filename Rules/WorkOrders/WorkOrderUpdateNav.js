import libCommon from '../Common/Library/CommonLibrary';
import libWOStatus from './MobileStatus/WorkOrderMobileStatusLibrary';

const queryOption = '$select=*,Equipment/EquipId,FunctionalLocation/FuncLocIdIntern&$expand=MarkedJob,Equipment,FunctionalLocation,WODocuments,OrderMobileStatus_Nav';

export default function WorkOrderUpdateNav(context) {
    let currentReadLink = libCommon.getTargetPathValue(context, '#Property:@odata.readLink');
    let isLocal = libCommon.isCurrentReadLinkLocal(currentReadLink);
    libCommon.setOnCreateUpdateFlag(context, 'UPDATE');
    libCommon.removeStateVariable(context, 'WODefaultPlanningPlant');
    libCommon.removeStateVariable(context, 'WODefaultWorkCenterPlant');
    libCommon.removeStateVariable(context, 'WODefaultMainWorkCenter');
    if (!isLocal) {
        return libWOStatus.isOrderComplete(context).then(status => {
            if (!status) {
                //Set the global TransactionType variable to CREATE
                return libCommon.navigateOnRead(context, '/SAPAssetManager/Actions/WorkOrders/CreateUpdate/WorkOrderCreateUpdateNav.action', context.getBindingObject()['@odata.readLink'] , queryOption);
            }
            return '';
        });
    }
    return libCommon.navigateOnRead(context, '/SAPAssetManager/Actions/WorkOrders/CreateUpdate/WorkOrderCreateUpdateNav.action', context.getBindingObject()['@odata.readLink'] , queryOption);
}
