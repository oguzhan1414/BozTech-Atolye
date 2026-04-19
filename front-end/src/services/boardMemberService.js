import ApiService from './apiService';

class BoardMemberService extends ApiService {
  constructor() {
    super('board-members');
  }

  async getAll(params = {}) {
    return this.get('', params);
  }

  async create(data) {
    if (data instanceof FormData) return this.postFormData(data);
    return this.post(data);
  }

  async update(id, data) {
    return this.put(id, data);
  }

  async deleteMember(id) {
    return this.delete(id);
  }
}

export const boardMemberService = new BoardMemberService();
