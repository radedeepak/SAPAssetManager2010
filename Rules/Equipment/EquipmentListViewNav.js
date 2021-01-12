import Logger from '../Log/Logger';
import libCom from '../Common/Library/CommonLibrary';

export default function EquipmentListViewNav(context) {
    Logger.info(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryEquipment.global').getValue(), 'EquipmentListViewNav called');
    //Cache tables required for list screen display
    let overviewClientData = libCom.getClientDataForPage(context);
    let plantsCache = libCom.cacheEntity(context, 'Plants', '$select=Plant,PlantDescription', ['Plant'], ['PlantDescription'], overviewClientData);
    let workCentersCache = libCom.cacheEntity(context, 'WorkCenters', '$select=WorkCenterId,ExternalWorkCenterId', ['WorkCenterId'], ['ExternalWorkCenterId'], overviewClientData);
    return Promise.all([plantsCache, workCentersCache]).then(() => {
        context.executeAction('/SAPAssetManager/Actions/Equipment/EquipmentListViewNav.action');
    });
}
