/**
 * Splits a ReadLink's keys into a key-value pair object
 * If ReadLink contains a single key, a string is returned
 * 
 * Example: MaterialSLocs(MaterialNum='112',Plant='1000',StorageLocation='0001') => {MaterialNum : '112', Plant : '1000', StorageLocation: '0001'}
 * 
 * Example: MyWorkOrderHeaders('10000000') => '10000000'
 * @param {String} readLink OData ReadLink to be split
 */

export function SplitReadLink(readLink) {
    let splitReadLink = readLink.match(/[A-z]+='[A-z0-9-]+'/g);
    if (splitReadLink !== null) {
        return splitReadLink.reduce(function(obj, e) {
            let keyParts = e.split('=');
            obj[keyParts[0]] = keyParts[1].replace(/'([A-z0-9-]+)'/g, '$1');
            return obj;
        }, {});
    } else {
        return readLink.match(/'[A-z0-9-]'/)[0].replace(/'([A-z0-9-]+)'/g, '$1');
    }
}
