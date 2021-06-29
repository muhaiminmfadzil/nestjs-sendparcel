import { CreateShipmentDto } from './create-shipment.dto';

class BulkAwb extends CreateShipmentDto {
  integration_order_id: string;
}

export class CreateBulkAwbDto {
  shipments: BulkAwb[];
}
