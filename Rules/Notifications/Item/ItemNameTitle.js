import libCommon from '../../Common/Library/CommonLibrary';

export default function ItemNameTitle(context) {
    try	{
        var tmp = libCommon.getTargetPathValue(context, '#Control:NameTitle/#Value');
        return tmp !== undefined ? tmp : '';
    } catch (exception)	{
        return undefined;
    }
}
