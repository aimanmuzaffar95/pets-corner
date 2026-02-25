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
import { PetEntity } from '../../pet/entities/pet.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { AdoptionListingStatus } from './adoption-listing-status.enum';

@Entity({ name: 'adoption_listings' })
@Index('IDX_adoption_listings_pet_id', ['petId'])
@Index('IDX_adoption_listings_owner_user_id', ['ownerUserId'])
@Index('IDX_adoption_listings_status_created_at', ['status', 'createdAt'])
@Index('IDX_adoption_listings_city_state_status', ['city', 'state', 'status'])
@Index('IDX_adoption_listings_status_pet_id', ['status', 'petId'])
export class AdoptionListingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'pet_id', type: 'uuid' })
  petId!: string;

  @ManyToOne(() => PetEntity, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'pet_id' })
  pet!: PetEntity;

  @Column({ name: 'owner_user_id', type: 'uuid' })
  ownerUserId!: string;

  @ManyToOne(() => UserEntity, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'owner_user_id' })
  owner!: UserEntity;

  @Column({
    type: 'enum',
    enum: AdoptionListingStatus,
    enumName: 'adoption_listing_status_enum',
    default: AdoptionListingStatus.Draft,
  })
  status!: AdoptionListingStatus;

  @Column({ type: 'varchar', length: 140 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'adoption_fee_cents', type: 'integer', nullable: true })
  adoptionFeeCents!: number | null;

  @Column({ type: 'char', length: 3, nullable: true })
  currency!: string | null;

  @Column({ type: 'varchar', length: 120 })
  city!: string;

  @Column({ type: 'varchar', length: 120 })
  state!: string;

  @Column({ type: 'char', length: 2 })
  country!: string;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
