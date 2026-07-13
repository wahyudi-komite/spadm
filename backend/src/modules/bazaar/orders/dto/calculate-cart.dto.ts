import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class CalculateCartDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'Keranjang kosong' })
  @IsInt({ each: true, message: 'ID produk harus berupa angka' })
  productIds: number[];
}
