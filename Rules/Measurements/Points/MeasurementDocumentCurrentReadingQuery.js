/**
* Returns the query options for the Current Reading section
* @param {IClientAPI} context
*/
export default function MeasurementDocumentCurrentReadingQuery() {

    return '$filter=sap.islocal()&$orderby=ReadingTimestamp desc&$top=1';
}
