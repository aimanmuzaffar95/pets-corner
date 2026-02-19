import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SpeciesEntity } from './species.entity';

@Entity({ name: 'pets' })
@Index('IDX_pets_species_id', ['speciesId'])
@Index('IDX_pets_name', ['name'])
export class PetEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  breed!: string | null;

  @Column({ type: 'integer', nullable: true })
  age!: number | null;

  @Column({ name: 'species_id', type: 'uuid' })
  speciesId!: string;

  @ManyToOne(() => SpeciesEntity, (species) => species.pets, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'species_id' })
  species!: SpeciesEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
