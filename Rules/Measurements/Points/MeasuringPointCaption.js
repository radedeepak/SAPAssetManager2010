import libVal from '../../Common/Library/ValidationLibrary';
export default function MeasuringPointCaption(pageClientAPI) {
    let binding = pageClientAPI.binding;
    if (binding['@odata.type'] === pageClientAPI.getGlobalDefinition('/SAPAssetManager/Globals/ODataTypes/WorkOrderTool.global').getValue()) {
        binding = binding.PRTPoint;
    }
    if (!binding.hasOwnProperty('Point')) {
        binding =  binding.MeasuringPoint;
    }

    if (!libVal.evalIsEmpty(pageClientAPI.binding.EquipId)) {
        return  '$(L, equipment)' + ' - ' + pageClientAPI.binding.EquipId;
    } else if (!libVal.evalIsEmpty(pageClientAPI.binding.FuncLocIdIntern)) {
        return  '$(L, functional_location)' + ' - ' + pageClientAPI.binding.FunctionalLocation.FuncLocId;
    }
    return '$(L,point)';
}
