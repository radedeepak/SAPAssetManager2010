import {TimeSheetLibrary as libTS} from '../../TimeSheetLibrary';

import libCom from '../../../Common/Library/CommonLibrary';

export default function TimeSheetEntryCreateUpdateOperationUpdate(controlProxy) {
    let pageProxy = controlProxy.getPageProxy();
    let recOrderProxy = libCom.getControlProxy(pageProxy, 'RecOrderLstPkr');
    
    if (recOrderProxy) {
        let selection = controlProxy.getValue()[0] ? controlProxy.getValue()[0].ReturnValue : '';
        let listPickerProxy = libCom.getControlProxy(pageProxy,'SubOperationLstPkr');
        return getWorkCenterFromOperation(pageProxy, selection).then(newWorkCenter => {
            return libTS.updateWorkCenter(pageProxy, newWorkCenter).then(() => {                    
                return libTS.ShouldEnableSubOperations(pageProxy).then(function(result) {                        
                    if (result) {
                        libCom.setFormcellEditable(listPickerProxy);
                        let entity = selection + '/SubOperations';
                        let filter = '$orderby=SubOperationNo asc';                                           
                        return setSubOperationSpecifier(listPickerProxy, entity, filter);
                    } else {
                        libCom.setFormcellNonEditable(listPickerProxy);
                        let entity = 'MyWorkOrderSubOperations';
                        let filter = "$filter=SubOperationNo eq ''";    
                        return setSubOperationSpecifier(listPickerProxy, entity, filter);
                    }
                });
            });
        });
    }
    return Promise.resolve(true);  
}

function getWorkCenterFromOperation(context, operationReadLink) {
    if (operationReadLink) {
        return context.read('/SAPAssetManager/Services/AssetManager.service', operationReadLink, ['MainWorkCenter'], '').then(result => {
            if (result && result.getItem(0)) {
                return Promise.resolve(result.getItem(0).MainWorkCenter);
            }
            return Promise.resolve('');
        });
    }
    return Promise.resolve('');
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
