import 'reflect-metadata';
import { validate } from 'class-validator';
import { CreateProductDto } from './create-product.dto';

describe('CreateProductDto', () => {
  const createDto = (imageUrl: string): CreateProductDto =>
    Object.assign(new CreateProductDto(), {
      eventId: 1,
      name: 'Produk Uji',
      normalPrice: 10_000,
      sellingPrice: 8_000,
      imageUrl,
    });

  it('accepts the relative product image path returned by the upload endpoint', async () => {
    const errors = await validate(
      createDto('/storage/products/1e02b16e-6fa3-4d7d-8d77-5620f023856a.png'),
    );

    expect(errors).toHaveLength(0);
  });

  it('rejects unsafe image URLs', async () => {
    const errors = await validate(createDto('javascript:alert(1)'));

    expect(errors.some((error) => error.property === 'imageUrl')).toBe(true);
  });
});
