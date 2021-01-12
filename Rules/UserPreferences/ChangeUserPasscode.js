export default function ChangeUserPasscode(controlProxy) {
    if (controlProxy.getPasscodeSource() === 2) {
        return controlProxy.executeAction('/SAPAssetManager/Actions/Passcode/DisplayPasscodeSource.action');
    } else {
        return controlProxy.executeAction('/SAPAssetManager/Actions/Passcode/ChangeUserPasscode.action');
    }
}
