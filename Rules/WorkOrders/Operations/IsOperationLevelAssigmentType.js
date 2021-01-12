import libCommon from '../../Common/Library/CommonLibrary';
export default function IsOperationLevelAssigmentType(context) {
     //Return true if Operation level assigment type
     return (libCommon.getWorkOrderAssnTypeLevel(context) === 'Operation');
}
