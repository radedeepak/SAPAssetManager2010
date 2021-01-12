export default function FormatPlanningPlant(context) {
    return context.read('/SAPAssetManager/Services/AssetManager.service', `Plants('${context.binding.PlanningPlant}')`, [], '').then(function(result) {
        if (result && result.getItem(0)) {
            return context.binding.PlanningPlant + ' - ' + result.getItem(0).PlantDescription;
        } else {
            return '-';
        }
    });
}
