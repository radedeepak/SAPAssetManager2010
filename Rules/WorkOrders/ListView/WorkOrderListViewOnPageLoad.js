import Logger from '../../Log/Logger';
import setCaption from '../WorkOrderListViewCaption';
export default function WorkOrderListViewOnPageLoad(pageClientAPI) {
    setCaption(pageClientAPI);
    Logger.info(pageClientAPI.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryPrefs.global').getValue(), 'WorkOrderListViewOnPageLoad called');

}
