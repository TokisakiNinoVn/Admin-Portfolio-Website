// src/services/question.service.js

import {
  createRubricApi,
  deleteRubricApi,
  // getTopicApi,
  listRubricApi,
  updateRubricApi
} from '@/apis/modules/rubric.api';

class RubricService {
  async list() {
    const response = await listRubricApi();

    return response.data ?? [];
  }

  async create(payload) {
    const response = await createRubricApi(payload);

    return response.data;
  }

  async update(id, payload) {
    const response = await updateRubricApi(id, payload);

    return response.data;
  }

  async delete(id) {
    return deleteRubricApi(id);
  }
}

export default new RubricService();
