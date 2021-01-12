import DocLib from './DocumentLibrary';
import {ValueIfExists} from '../Common/Library/Formatter';

export default function DocumentFileSize(clientAPI, document) {
    if (document) {
        return ValueIfExists(document.FileSize, '-', function(filesize) {
            return DocLib.formatFileSize(filesize, clientAPI);
        });
    }
}
