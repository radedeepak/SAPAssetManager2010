import libCommon from '../../Common/Library/CommonLibrary';
export default function IsSubOperationLevelAssigmentType(context) {
     //Return true if Operation level assigment type
     return (libCommon.getWorkOrderAssnTypeLevel(context) === 'SubOperation');
}
