import libVal from '../../Common/Library/ValidationLibrary';

export default function EquipmentPickerInitialQueryOptions(context) {

    let equipmentId = context.binding.EquipId;
    let filter = `$filter=(ObjectStatus_Nav/SystemStatus_Nav/SystemStatus eq 'I0099' or ObjectStatus_Nav/SystemStatus_Nav/SystemStatus eq 'I0184') and SystemStatuses_Nav/all(s:s/Status ne 'I0076') and EquipId ne '${equipmentId}'`;
    let expand = '$expand=EquipDocuments,WorkCenter_Nav,ObjectStatus_Nav/SystemStatus_Nav,SystemStatus_Nav';
    let orderBy = '$orderby=EquipId';

    if (!libVal.evalIsEmpty(context.binding.MaintPlant)) {
        filter = filter + ` and MaintPlant eq '${context.binding.MaintPlant}'`;
    }

    if (!libVal.evalIsEmpty(context.binding.MaintWorkCenter)) {
        filter = filter +  ` and MaintWorkCenter eq '${context.binding.MaintWorkCenter}'`;
    }

    return filter + '&' + expand + '&' + orderBy;
}
