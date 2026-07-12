import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BazaarOrder } from './order.entity';
import { BazaarProduct } from '../../products/entities/product.entity';

@Entity('bazaar_order_items')
export class BazaarOrderItem {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => BazaarOrder, order => order.items)
  @JoinColumn({ name: 'order_id' })
  order: BazaarOrder;

  @ManyToOne(() => BazaarProduct)
  @JoinColumn({ name: 'product_id' })
  product: BazaarProduct;

  @Column({ name: 'product_name_snapshot' })
  productNameSnapshot: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'product_price_snapshot' })
  productPriceSnapshot: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
