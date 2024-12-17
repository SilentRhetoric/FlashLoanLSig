import { Contract } from '@algorandfoundation/tealscript';

export class HelloWorld extends Contract {
  /**
   * A demonstration method used in the AlgoKit fullstack template.
   * Greets the user by name.
   *
   * @param name The name of the user to greet.
   * @returns A greeting message to the user.
   */
  hello(name: string): string {
    return 'Hello, ' + name;
  }
}
