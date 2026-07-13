import { BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { BazaarProduct } from '../products/entities/product.entity';

describe('OrdersService cart rules', () => {
  const productRepository = { findOne: jest.fn() };
  let service: OrdersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OrdersService(
      {} as never,
      {} as never,
      {} as never,
      productRepository as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
  });

  it('menghitung minyak dan beras memakai fee event snapshot', async () => {
    const event = {
      id: 1,
      subsidy: 20_000,
      goodieBagFee: 3_000,
      applicationFee: 1_000,
    };
    const products = [
      { id: 1, eventId: 1, event, name: 'Minyak', sellingPrice: 50_000, inventoryMode: 'UNLIMITED', stock: 0 },
      { id: 2, eventId: 1, event, name: 'Beras', sellingPrice: 75_000, inventoryMode: 'UNLIMITED', stock: 0 },
    ] as BazaarProduct[];
    productRepository.findOne
      .mockResolvedValueOnce(products[0])
      .mockResolvedValueOnce(products[1]);

    const result = await service.calculateCart([1, 2]);

    expect(result.breakdown).toEqual({
      productSubtotal: 125_000,
      goodieBagFee: 3_000,
      applicationFee: 1_000,
      subsidy: 20_000,
      grandTotal: 109_000,
    });
  });

  it('menolak produk duplikat sebagai lebih dari satu unit', async () => {
    await expect(service.calculateCart([1, 1])).rejects.toThrow(BadRequestException);
    expect(productRepository.findOne).not.toHaveBeenCalled();
  });

  it('menolak produk dari event berbeda', async () => {
    productRepository.findOne
      .mockResolvedValueOnce({ id: 1, eventId: 1, event: {}, sellingPrice: 10_000, inventoryMode: 'UNLIMITED' })
      .mockResolvedValueOnce({ id: 2, eventId: 2, event: {}, sellingPrice: 10_000, inventoryMode: 'UNLIMITED' });

    await expect(service.calculateCart([1, 2])).rejects.toThrow(
      'Semua produk harus berasal dari event yang sama',
    );
  });

  it('menolak produk stok habis untuk mode terbatas', async () => {
    productRepository.findOne.mockResolvedValue({
      id: 1,
      eventId: 1,
      event: {},
      name: 'Beras',
      sellingPrice: 75_000,
      inventoryMode: 'GLOBAL_STOCK',
      stock: 0,
    });

    await expect(service.calculateCart([1])).rejects.toThrow('Produk Beras telah habis');
  });
});
