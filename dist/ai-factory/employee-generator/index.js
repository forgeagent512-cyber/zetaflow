import { InMemoryRepository } from '../shared/repositories.js';
export class InMemoryEmployeeRepository extends InMemoryRepository {
    async findBySolutionArchitectureId(solutionArchitectureId) {
        return [];
    }
}
export class EmployeeGeneratorService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async generate(request) {
        throw new Error('EmployeeGeneratorService implementation is pending');
    }
}
