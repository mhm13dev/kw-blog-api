import { Args } from '@nestjs/graphql';

/**
 * This decorator is used to define the input arguments for a GraphQL query or mutation. It avoids the need of naming arguments in `@Args("name")` decorator.
 *
 * @example
 * ```ts
 * // Instead of:
 * \@Query(() => User)
 * async user(@Args('userInput') userInput: UserInput) {
 *  return this.userService.findOneById(userInput);
 * }
 *
 * // You can write:
 * \@Query(() => User)
 * async user(@Input() userInput: UserInput) {
 *  return this.userService.findOneById(userInput);
 * }
 * ```
 */
export const Input = () => Args('input');
