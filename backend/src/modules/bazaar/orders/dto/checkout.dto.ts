import { ArrayNotEmpty, IsArray, IsBoolean, IsInt } from 'class-validator';

export class CheckoutDto {
  @IsInt({ message: 'Event ID harus berupa angka' })
  eventId: number;

  @IsArray()
  @ArrayNotEmpty({ message: 'Pilih minimal satu produk' })
  @IsInt({ each: true, message: 'ID produk harus berupa angka' })
  productIds: number[];

  @IsBoolean({ message: 'Anda harus menyetujui syarat dan ketentuan' })
  termsAccepted: boolean;
}
