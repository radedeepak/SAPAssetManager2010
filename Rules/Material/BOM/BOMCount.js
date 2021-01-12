import libCom from '../../Common/Library/CommonLibrary';

export default function BOMCount(context) {
    return libCom.getEntitySetCount(context, 'BOMItems', "$filter=BOMId eq '" + context.binding.BOMId + "' and BOMCategory eq '" + context.binding.BOMCategory + "'");
}
