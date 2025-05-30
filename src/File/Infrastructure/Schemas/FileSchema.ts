import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('files')
export class FileEntity
{
  @PrimaryGeneratedColumn('increment')
    id: number;

  @Column({ name: 'original_name' })
    originalName: string;

  @Column({ name: 'mime_type' })
    mimeType: string;

  @Column()
    size: number;

  @Column({ name: 'bucket_name' })
    bucketName: string;

  @Column()
    path: string;

  @Column({ name: 'tenant_id', nullable: true })
    tenantId: number;

  @Column({ name: 'is_public', default: false })
    isPublic: boolean;

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
