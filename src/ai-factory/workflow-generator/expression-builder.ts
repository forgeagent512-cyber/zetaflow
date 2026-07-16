export class ExpressionBuilder {
  buildExpression(variable: string, value: string): string {
    return `={{ ${variable} || '${value}' }}`;
  }

  buildCondition(field: string, operator: string, expected: string): string {
    return `={{ ${field} ${operator} '${expected}' }}`;
  }
}
