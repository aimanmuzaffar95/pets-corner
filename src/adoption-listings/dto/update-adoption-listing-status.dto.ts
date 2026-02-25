import { IsEnum } from 'class-validator';
import { AdoptionListingStatus } from '../entities/adoption-listing-status.enum';

export class UpdateAdoptionListingStatusDto {
  @IsEnum(AdoptionListingStatus)
  readonly status: AdoptionListingStatus;
}
