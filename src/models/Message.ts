import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Client } from './Client';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  role: 'client' | 'agent';

  @Column()
  sentAt: Date;

  @ManyToOne(() => Client, (client) => client.messages)
  client: Client;
}
