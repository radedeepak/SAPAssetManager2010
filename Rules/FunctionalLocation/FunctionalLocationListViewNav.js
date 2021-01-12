import libCom from '../Common/Library/CommonLibrary';

export default function FunctionalLocationListViewNav(context) {
    //Cache tables required for list screen display
    let overviewClientData = libCom.getClientDataForPage(context);
    let plantsCache = libCom.cacheEntity(context, 'Plants', '$select=Plant,PlantDescription', ['Plant'], ['PlantDescription'], overviewClientData);
    let workCentersCache = libCom.cacheEntity(context, 'WorkCenters', '$select=WorkCenterId,ExternalWorkCenterId', ['WorkCenterId'], ['ExternalWorkCenterId'], overviewClientData);
    return Promise.all([plantsCache, workCentersCache]).then(() => {
        context.executeAction('/SAPAssetManager/Actions/FunctionalLocation/FunctionalLocationsListViewNav.action');
    });
}
