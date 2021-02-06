import { ZOptionLocation } from './option-location';

/**
 * An error thrown by {@link ZOptionsParser command line options parser} when it encounters unrecognized or malformed
 * option.
 */
export class ZOptionError extends Error {

  /**
   * Erroneous option location.
   */
  readonly optionLocation: Required<ZOptionLocation>;

  /**
   * Constructs option error.
   *
   * @param optionLocation - Erroneous option location.
   * @param message - Error message.
   */
  constructor(
      optionLocation: ZOptionLocation,
      message = `Unrecognized command line option`,
  ) {
    super(message);
    this.optionLocation = ZOptionLocation.by(optionLocation);
  }

}
