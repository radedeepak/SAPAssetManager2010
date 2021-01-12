export default function MeasuringPointsListViewQueryOption(context) {

    if (typeof context.dataQueryBuilder === 'function') {
        let qob = context.dataQueryBuilder();
        let searchString = context.searchString;

        let readLink = context.evaluateTargetPathForAPI('#Page:-Previous').getReadLink();
        let filters = [];
        if (readLink && readLink.indexOf('MyWorkOrderOperations') !== -1) {
            qob.expand('PRTPoint').orderBy('PRTPoint/SortField').select('PRTPoint/Point,PRTPoint/PointDesc,PRTPoint/UoM');
            if (searchString) {
                filters.push(`substringof('${searchString.toLowerCase()}', tolower(PRTPoint/PointDesc))`);
                filters.push(`substringof('${searchString.toLowerCase()}', tolower(PRTPoint/Point))`);

                qob.filter(`(PRTCategory eq 'P') and (${filters.join(' or ')})`);
            } else {
                qob.filter('(PRTCategory eq \'P\')');
            }
        } else {
            qob.orderBy('SortField').select('Point,PointDesc,UoM');
            if (searchString) {
                filters.push(`substringof('${searchString.toLowerCase()}', tolower(PointDesc))`);
                filters.push(`substringof('${searchString.toLowerCase()}', tolower(Point))`);
                qob.filter(filters.join(' or '));
            }
        }
        return qob;
    } else {
        return '$orderby=SortField&$select=Point,PointDesc,UoM';
    }
}
