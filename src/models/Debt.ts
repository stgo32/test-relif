import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Client } from './Client';

@Entity()
export class Debt {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  institution!: string;

  @Column()
  amount!: number;

  @Column()
  dueDate!: Date;

  @ManyToOne(() => Client, (client) => client.debts)
  client!: Client;
}
