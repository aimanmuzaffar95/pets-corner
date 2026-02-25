import { AdoptionListingStatus } from '../entities/adoption-listing-status.enum';

const allowedTransitions: Record<
  AdoptionListingStatus,
  ReadonlySet<AdoptionListingStatus>
> = {
  [AdoptionListingStatus.Draft]: new Set([
    AdoptionListingStatus.Published,
    AdoptionListingStatus.Withdrawn,
    AdoptionListingStatus.Expired,
  ]),
  [AdoptionListingStatus.Published]: new Set([
    AdoptionListingStatus.Paused,
    AdoptionListingStatus.Adopted,
    AdoptionListingStatus.Withdrawn,
    AdoptionListingStatus.Expired,
  ]),
  [AdoptionListingStatus.Paused]: new Set([
    AdoptionListingStatus.Published,
    AdoptionListingStatus.Adopted,
    AdoptionListingStatus.Withdrawn,
    AdoptionListingStatus.Expired,
  ]),
  [AdoptionListingStatus.Adopted]: new Set(),
  [AdoptionListingStatus.Withdrawn]: new Set(),
  [AdoptionListingStatus.Expired]: new Set(),
};

const terminalStatuses = new Set<AdoptionListingStatus>([
  AdoptionListingStatus.Adopted,
  AdoptionListingStatus.Withdrawn,
  AdoptionListingStatus.Expired,
]);

export function canTransitionStatus(
  currentStatus: AdoptionListingStatus,
  nextStatus: AdoptionListingStatus,
): boolean {
  if (currentStatus === nextStatus) {
    return true;
  }

  return allowedTransitions[currentStatus].has(nextStatus);
}

export function isTerminalStatus(status: AdoptionListingStatus): boolean {
  return terminalStatuses.has(status);
}
