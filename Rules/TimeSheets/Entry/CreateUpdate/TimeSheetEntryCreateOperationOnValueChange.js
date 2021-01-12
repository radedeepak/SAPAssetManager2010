import libCommon from '../../../Common/Library/CommonLibrary';
import libVal from '../../../Common/Library/ValidationLibrary';

export default function TimeSheetEntryCreateOperationOnValueChange(control) {

    let clientData = control.getPageProxy().getClientData();
    if (clientData.LOADED && !clientData.subOpPickerIsLocked) {
        let formCellContainer = control.getPageProxy().getControl('FormCellContainer');
        let OperationLstPkrValue = formCellContainer.getControl('OperationLstPkr').getValue();
        let SubOperationLstPkrControl = formCellContainer.getControl('SubOperationLstPkr');
        var SubOperationSpecifier = SubOperationLstPkrControl.getTargetSpecifier();
        if (!libVal.evalIsEmpty(OperationLstPkrValue)) {
            SubOperationSpecifier.setService('/SAPAssetManager/Services/AssetManager.service');
            SubOperationSpecifier.setEntitySet(libCommon.getListPickerValue(OperationLstPkrValue) + '/SubOperations');
            SubOperationSpecifier.setDisplayValue('{{#Property:SubOperationNo}} - {{#Property:OperationShortText}}');
            SubOperationSpecifier.setReturnValue('{@odata.readLink}');
            SubOperationSpecifier.setQueryOptions('$orderby=SubOperationNo');
            SubOperationLstPkrControl.setEditable(true);
        } else {
            SubOperationLstPkrControl.setEditable(false);
        }
    return SubOperationLstPkrControl.setTargetSpecifier(SubOperationSpecifier);
    }

}
