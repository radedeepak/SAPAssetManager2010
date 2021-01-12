import libCom from '../../../Common/Library/CommonLibrary';
import {TimeSheetLibrary as libTS} from '../../TimeSheetLibrary';
import libVal from '../../../Common/Library/ValidationLibrary';

export default function TimeSheetEntryCreateUpdateRecOrderUpdate(controlProxy) {
    let pageProxy = controlProxy.getPageProxy();
    let selection = controlProxy.getValue()[0] ? controlProxy.getValue()[0].ReturnValue : '';
    let opListPickerProxy = libCom.getControlProxy(pageProxy,'OperationLstPkr');
    let subOpListPickerProxy = libCom.getControlProxy(pageProxy,'SubOperationLstPkr');

    if (libVal.evalIsEmpty(selection)) { //No order, so disable and empty op and sub-op pickers
        opListPickerProxy.setValue('');
        subOpListPickerProxy.setValue('');
        let entity = 'MyWorkOrderOperations';
        let filter = "$filter=OperationNo eq ''";
        return setOperationSpecifier(opListPickerProxy, entity, filter).then(() => {
            libCom.setFormcellNonEditable(opListPickerProxy);
            libCom.setFormcellNonEditable(subOpListPickerProxy);
            entity = 'MyWorkOrderSubOperations';
            filter = "$filter=SubOperationNo eq ''";    
            return setSubOperationSpecifier(subOpListPickerProxy, entity, filter);                        
        });
    } else {
        let activityTypeListPickerProxy = libCom.getControlProxy(pageProxy,'ActivityTypeLstPkr');
        let activityTypeSpecifier = activityTypeListPickerProxy.getTargetSpecifier();
        libCom.setFormcellEditable(opListPickerProxy);
        let entity = selection + '/Operations';
        let filter = '$orderby=OperationNo asc';
        return setOperationSpecifier(opListPickerProxy, entity, filter).then(() => { //Populate op picker from chosen order
            activityTypeSpecifier.setEntitySet('COActivityTypes');
            activityTypeSpecifier.setService('/SAPAssetManager/Services/AssetManager.service');
            return libTS.GetWorkCenterFromRecOrder(pageProxy, selection).then(newWorkCenter => {
                if (newWorkCenter) {
                    return libTS.updateWorkCenter(controlProxy.getPageProxy(), newWorkCenter).then(() => {
                        return controlProxy.read('/SAPAssetManager/Services/AssetManager.service', selection, ['CostCenter'], '').then(result => {
                            if (!libVal.evalIsEmpty(result) && !libVal.evalIsEmpty(result.getItem(0).CostCenter)) {
                                activityTypeSpecifier.setQueryOptions(`$filter=CostCenter eq '${result.getItem(0).CostCenter}'&$orderby=ActivityType`);
                            } else {
                                activityTypeSpecifier.setQueryOptions('$orderby=ActivityType');
                            }
                            libCom.setFormcellNonEditable(subOpListPickerProxy);
                            entity = 'MyWorkOrderSubOperations';
                            filter = "$filter=SubOperationNo eq ''";    
                            return setSubOperationSpecifier(subOpListPickerProxy, entity, filter).then(() => { //Empty and disable sub-op picker
                                return activityTypeListPickerProxy.setTargetSpecifier(activityTypeSpecifier);
                            });
                        });
                    });
                }
                return Promise.resolve(true);
            });
        });
    }
}

function setOperationSpecifier(picker, entity, filter) {
    let specifier = picker.getTargetSpecifier();
    specifier.setEntitySet(entity);
    specifier.setReturnValue('{@odata.readLink}');
    specifier.setService('/SAPAssetManager/Services/AssetManager.service');
    specifier.setQueryOptions(filter);
    specifier.setDisplayValue('{{#Property:OperationNo}} - {{#Property:OperationShortText}}');         
    return picker.setTargetSpecifier(specifier);
}

function setSubOperationSpecifier(picker, entity, filter) {
    let specifier = picker.getTargetSpecifier();
    specifier.setEntitySet(entity);
    specifier.setReturnValue('{@odata.readLink}');
    specifier.setService('/SAPAssetManager/Services/AssetManager.service');
    specifier.setQueryOptions(filter);
    specifier.setDisplayValue('{{#Property:SubOperationNo}} - {{#Property:OperationShortText}}');                
    return picker.setTargetSpecifier(specifier);
}
