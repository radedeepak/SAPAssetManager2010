import {ValueIfExists} from '../Common/Library/Formatter';
import { EquipmentLibrary as EquipmentLib } from './EquipmentLibrary';
export default function EquipmentPlant(context) {
    return ValueIfExists(EquipmentLib.getPlantNumberAndDescription(context));
}
