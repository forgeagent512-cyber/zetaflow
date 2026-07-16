import { InMemoryRepository } from '../shared/repositories.js';
export class InMemoryEmployeeRepository extends InMemoryRepository {
    async findBySolutionArchitectureId(solutionArchitectureId) {
        return [];
    }
}
export { EmployeeGeneratorService } from './employee-generator.service.js';
