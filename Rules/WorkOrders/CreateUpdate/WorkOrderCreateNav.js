import libCommon from '../../Common/Library/CommonLibrary';
import assnType from '../../Common/Library/AssignmentType';
import lamCopy from './WorkOrderCreateLAMCopy';

export default function WorkOrderCreateNav(clientAPI) {
    //Set the global TransactionType variable to CREATE
    libCommon.setOnCreateUpdateFlag(clientAPI, 'CREATE');

    //set the CHANGSET flag to true
    libCommon.setOnChangesetFlag(clientAPI, true);
    libCommon.setOnWOChangesetFlag(clientAPI, true);
    libCommon.resetChangeSetActionCounter(clientAPI);

    libCommon.removeStateVariable(clientAPI, 'WODefaultPlanningPlant');
    libCommon.removeStateVariable(clientAPI, 'WODefaultWorkCenterPlant');
    libCommon.removeStateVariable(clientAPI, 'WODefaultMainWorkCenter');

    let actionBinding = {
        PlanningPlant: assnType.getWorkOrderFieldDefault('WorkOrderHeader', 'PlanningPlant'),
        OrderType: libCommon.getAppParam(clientAPI, 'WORKORDER', 'OrderType'),
        Priority: libCommon.getAppParam(clientAPI, 'WORKORDER', 'Priority'),
    };
    try {
        actionBinding.MainWorkCenterPlant = clientAPI.binding.MaintPlant ? clientAPI.binding.MaintPlant : assnType.getWorkOrderFieldDefault('WorkOrderHeader', 'WorkCenterPlant');
        actionBinding.MainWorkCenter = clientAPI.binding.WorkCenter_Nav.ExternalWorkCenterId ? clientAPI.binding.WorkCenter_Nav.ExternalWorkCenterId : assnType.getWorkOrderFieldDefault('WorkOrderHeader', 'MainWorkCenter');
    } catch (exc) {
        actionBinding.MainWorkCenterPlant = assnType.getWorkOrderFieldDefault('WorkOrderHeader', 'WorkCenterPlant');
        actionBinding.MainWorkCenter = assnType.getWorkOrderFieldDefault('WorkOrderHeader', 'MainWorkCenter');
    }
    if (libCommon.isDefined(clientAPI.binding)) {
        if (clientAPI.binding['@odata.type'] === '#sap_mobile.MyFunctionalLocation') {
            actionBinding.HeaderFunctionLocation = clientAPI.binding.FuncLocIdIntern;
            if (clientAPI.binding.PlanningPlant) { //Save defaults for planning plant, work center plant and main work center
                libCommon.setStateVariable(clientAPI, 'WODefaultPlanningPlant', clientAPI.binding.PlanningPlant);
            }
            if (clientAPI.binding.WorkCenter_Main_Nav && clientAPI.binding.WorkCenter_Main_Nav.PlantId) {
                libCommon.setStateVariable(clientAPI, 'WODefaultWorkCenterPlant', clientAPI.binding.WorkCenter_Main_Nav.PlantId);
            }
            if (clientAPI.binding.WorkCenter_Main_Nav && clientAPI.binding.WorkCenter_Main_Nav.ExternalWorkCenterId) {
                libCommon.setStateVariable(clientAPI, 'WODefaultMainWorkCenter', clientAPI.binding.WorkCenter_Main_Nav.ExternalWorkCenterId);
            }
        } else if (clientAPI.binding['@odata.type'] === '#sap_mobile.MyEquipment') {
            actionBinding.HeaderEquipment = clientAPI.binding.EquipId;
            actionBinding.HeaderFunctionLocation = clientAPI.binding.FuncLocIdIntern;
            if (clientAPI.binding.PlanningPlant) { //Save defaults for planning plant, work center plant and main work center
                libCommon.setStateVariable(clientAPI, 'WODefaultPlanningPlant', clientAPI.binding.PlanningPlant);
            }
            if (clientAPI.binding.WorkCenter_Main_Nav && clientAPI.binding.WorkCenter_Main_Nav.PlantId) {
                libCommon.setStateVariable(clientAPI, 'WODefaultWorkCenterPlant', clientAPI.binding.WorkCenter_Main_Nav.PlantId);
            }
            if (clientAPI.binding.WorkCenter_Main_Nav && clientAPI.binding.WorkCenter_Main_Nav.ExternalWorkCenterId) {
                libCommon.setStateVariable(clientAPI, 'WODefaultMainWorkCenter', clientAPI.binding.WorkCenter_Main_Nav.ExternalWorkCenterId);
            }
        }
    }

    clientAPI.setActionBinding(actionBinding);
    libCommon.setStateVariable(clientAPI, 'LocalId', ''); //Reset before starting create
    return clientAPI.executeAction('/SAPAssetManager/Actions/WorkOrders/CreateUpdate/WorkOrderCreateChangeset.action').then(() => {
        return lamCopy(clientAPI);
    });
}
