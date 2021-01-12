import documentEntitySet from './DocumentsBDSListEntitySet';
export default function DocumentListViewCaption(context) {
    return context.count('/SAPAssetManager/Services/AssetManager.service', documentEntitySet(context.getControls()[0]),'$expand=Document&$filter=Document/FileName ne null').then(count => {
        let params=[count];
        context.setCaption(context.localizeText('documents_x', params));
    });
   
}
