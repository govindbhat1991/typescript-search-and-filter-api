import { GraphQLScalarType } from 'graphql';

export const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',

  serialize(value: unknown): string | null {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'string') {
      // Try to parse the string as a date
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
    if (typeof value === 'number') {
      // Handle timestamp
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
    return null;
  },

  parseValue(value: unknown): Date | null {
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    if (typeof value === 'number') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  },

  parseLiteral(ast: any): Date | null {
    if (ast.kind === 'StringValue') {
      const date = new Date(ast.value);
      return isNaN(date.getTime()) ? null : date;
    }
    if (ast.kind === 'IntValue') {
      const date = new Date(parseInt(ast.value, 10));
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  },
}); 