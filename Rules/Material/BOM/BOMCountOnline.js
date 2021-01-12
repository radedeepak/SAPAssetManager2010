import libCom from '../../Common/Library/CommonLibrary';

export default function BOMCountOnline(context) {
    return libCom.getEntitySetCountOnline(context, 'BOMItems', "$filter=BOMId%20eq%20'" + context.binding.BOMId + "'%20and%20BOMCategory%20eq%20'" + context.binding.BOMCategory + "'");
}
