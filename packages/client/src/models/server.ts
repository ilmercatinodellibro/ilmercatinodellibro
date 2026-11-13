/**
 * This is a made up error class which doesn't reflect our server errors
 * @deprecated Use ApolloError instead!
 *
 * @see https://gist.github.com/slavafomin/b164e3e710a6fc9352c934b9073e7216#defining-our-own-base-class-for-errors - Potential source
 */
export class ServerError extends Error {
  public name: string;

  constructor(
    public message: string,
    public status: number,
  ) {
    // Calling parent constructor of base Error class.
    super(message);
    // Saving class name in the property of our custom error as a shortcut.
    this.name = this.constructor.name;
  }
}
