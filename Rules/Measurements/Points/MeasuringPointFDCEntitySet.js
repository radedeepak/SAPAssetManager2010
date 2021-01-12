import libCommon from '../../Common/Library/CommonLibrary';
export default function MeasuringPointFDCEntitySet(context) {
    let pageProxy = context.getPageProxy();
    if (libCommon.isDefined(pageProxy.binding)) {
        let odataType = pageProxy.binding['@odata.type'];
        let operation = context.getGlobalDefinition('/SAPAssetManager/Globals/ODataTypes/WorkOrderOperation.global').getValue();
        let equipment = context.getGlobalDefinition('/SAPAssetManager/Globals/ODataTypes/Equipment.global').getValue();
        let floc = context.getGlobalDefinition('/SAPAssetManager/Globals/ODataTypes/FunctionalLocation.global').getValue();
        switch (odataType) {
            case operation:
              return pageProxy.binding['@odata.readLink'] + '/Tools';
            case equipment:
              return pageProxy.binding['@odata.readLink'] + '/MeasuringPoints';
            case floc:
              return pageProxy.binding['@odata.readLink'] + '/MeasuringPoints';
            default:
              return 'MeasuringPoints';
        }
    }

}
