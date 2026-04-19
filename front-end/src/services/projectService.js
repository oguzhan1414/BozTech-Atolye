import ApiService from './apiService';

class ProjectService extends ApiService {
  constructor() {
    super('projects');
  }

  async getAll(params = {}) {
    return this.get('', params);
  }

  async create(data) {
    if (data instanceof FormData) return this.postFormData(data);
    return this.post(data);
  }

  async update(id, data) {
    // If future needs FormData update, add putFormData to ApiService
    return this.put(id, data);
  }

  async deleteProject(id) {
    return this.delete(id);
  }
}

export const projectService = new ProjectService();
