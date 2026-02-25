import {
  canTransitionStatus,
  isTerminalStatus,
} from './adoption-listing-status-policy';
import { AdoptionListingStatus } from '../entities/adoption-listing-status.enum';

describe('adoption-listing-status-policy', () => {
  it('allows publishing draft listing', () => {
    expect(
      canTransitionStatus(
        AdoptionListingStatus.Draft,
        AdoptionListingStatus.Published,
      ),
    ).toBe(true);
  });

  it('rejects direct draft to adopted transition', () => {
    expect(
      canTransitionStatus(
        AdoptionListingStatus.Draft,
        AdoptionListingStatus.Adopted,
      ),
    ).toBe(false);
  });

  it('marks adopted as terminal', () => {
    expect(isTerminalStatus(AdoptionListingStatus.Adopted)).toBe(true);
  });
});
