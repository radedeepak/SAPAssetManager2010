import Logger from '../Log/Logger';

export default function FunctionalLocationBOMPageNav(context) {
    context.binding.Online = false;
    let filterQuery = `$expand=FLocBOMs_Nav/BOMHeader_Nav/BOMItems_Nav&$filter=FuncLocIdIntern eq '${context.binding.FuncLocIdIntern}'`;
    return context.read('/SAPAssetManager/Services/AssetManager.service', 'MyFunctionalLocations', [], filterQuery).then(function(result) {
        if (result && result.length > 0) {
            if (result.getItem(0).FLocBOMs_Nav.length === 0) {
                context.binding.Online = true;
                context.binding.CreateOnlineODataAction = '/SAPAssetManager/Actions/OData/CreateOnlineOData.action';
                context.binding.OpenOnlineServiceAction = '/SAPAssetManager/Actions/OData/OpenOnlineService.action';
                context.showActivityIndicator(context.localizeText('online_search_activityindicator_text'));
                let filterOnlineQuery = `$filter=FuncLocIdIntern%20eq%20'${context.binding.FuncLocIdIntern}'`;
                return context.executeAction('/SAPAssetManager/Actions/OData/CreateOnlineOData.action').then(function() {
                    return context.executeAction('/SAPAssetManager/Actions/OData/OpenOnlineService.action').then(function() {
                        return context.read('/SAPAssetManager/Services/OnlineAssetManager.service', 'FunctionalLocationBOMs', [], filterOnlineQuery).then(function(flocBOMresult) {
                            // do the logic
                            context.dismissActivityIndicator();
                            if (flocBOMresult) {
                                context.binding.HC_ROOT_CHILDCOUNT = flocBOMresult.length;
                                context.getPageProxy().setActionBinding(context.binding);
                            }
                            return context.executeAction('/SAPAssetManager/Actions/HierarchyControl/BOMHierarchyControlPageNavOnline.action');
                        }).catch(function() {
                            context.dismissActivityIndicator();
                        });
                    }).catch(function(err) {
                        // Could not open online service
                        Logger.error(`Failed to open Online OData Service: ${err}`);
                        context.dismissActivityIndicator();
                        context.setValue(false);
                        context.setEditable(false);
                    });
                }).catch(function(err) {
                    // Could not init online service
                    Logger.error(`Failed to initialize Online OData Service: ${err}`);
                    context.dismissActivityIndicator();
                    context.setValue(false);
                    context.setEditable(false);
                });
            } else {
                context.binding.HC_ROOT_CHILDCOUNT = result.getItem(0).FLocBOMs_Nav.length;
                context.getPageProxy().setActionBinding(context.binding);
                return context.executeAction('/SAPAssetManager/Actions/HierarchyControl/BOMHierarchyControlPageNav.action');
            }
        }
        return true;
       
    });
}
