import libCommon from '../Library/CommonLibrary';

export default function PartnerNumberForNO() {
    let partnerNumStr = libCommon.getPersonnelNumber();
    return libCommon.removeLeadingZeros(partnerNumStr);
}
