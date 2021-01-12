import common from '../../Common/Library/CommonLibrary';

export default function NotificationCreateUpdatePickerItems(context) {
    let controlName = context.getName();
    // Based on the control we are on, return the right list items accordingly
    switch (controlName) {
        case 'FunctionalLocationLstPkr':
            {
                let formCellContainer = context.getPageProxy().getControl('FormCellContainer');

                let funcLocControlValue = context.getValue();
                let equipmentControl = formCellContainer.getControl('EquipmentLstPkr');

                let equipmentCtrlSpecifier = equipmentControl.getTargetSpecifier();
                if (funcLocControlValue && common.getListPickerValue(funcLocControlValue) !== '') {
                    common.setEditable(equipmentControl, true);
                    equipmentCtrlSpecifier.setQueryOptions("$filter=FuncLocIdIntern eq '" + common.getListPickerValue(funcLocControlValue) + "'&$orderby=EquipId");
                } else {
                    equipmentCtrlSpecifier.setQueryOptions('');
                }
                equipmentControl.setTargetSpecifier(equipmentCtrlSpecifier);
                break;
            }
        case 'EquipmentLstPkr':
            {
                let formCellContainer = context.getPageProxy().getControl('FormCellContainer');
                let funcLocControl = formCellContainer.getControl('FunctionalLocationLstPkr');
                let funcLocCtrlSpecifier = funcLocControl.getTargetSpecifier();

                let equipmentControlValue = context.getValue();
                if (equipmentControlValue && common.getListPickerValue(equipmentControlValue) !== '') {
                    return context.read('/SAPAssetManager/Services/AssetManager.service', 'MyEquipments', ['FuncLocIdIntern'], `$filter=EquipId eq '${common.getListPickerValue(equipmentControlValue)}'&$expand=FunctionalLocation&$orderby=EquipId`).then( results => {
                        if (results.length > 0 && results.getItem(0).FuncLocIdIntern) {
                            funcLocControl.setValue(results.getItem(0).FuncLocIdIntern, false);
                        }
                        return funcLocControl.setTargetSpecifier(funcLocCtrlSpecifier);
                    });
                }
                break;
            }
        default:
            break;
    }
}
