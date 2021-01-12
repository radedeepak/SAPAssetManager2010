
export default function BOMHeaderQtyAndUom(context) {
    return context.binding.BOMHeader_Nav.BaseQuantity + ' - ' + context.binding.BOMHeader_Nav.BaseUoM;
}
