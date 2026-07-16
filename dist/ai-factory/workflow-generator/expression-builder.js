export class ExpressionBuilder {
    buildExpression(variable, value) {
        return `={{ ${variable} || '${value}' }}`;
    }
    buildCondition(field, operator, expected) {
        return `={{ ${field} ${operator} '${expected}' }}`;
    }
}
