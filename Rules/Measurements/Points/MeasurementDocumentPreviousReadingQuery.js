/**
* Returns the query for the Previous Reading Section
* @param {IClientAPI} context
*/
export default function MeasurementDocumentPreviousReadingQuery() {

    return '$filter=sap.islocal() eq false&$expand=MeasuringPoint&$orderby=ReadingTimestamp desc&$top=1';

}
