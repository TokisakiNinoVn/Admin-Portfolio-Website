// src/services/question.service.js

import {
  createQuestionApi,
  deleteQuestionApi,
  getQuestionApi,
  listQuestionApi,
  updateQuestionApi,
} from '@/apis/modules/question.api';

class QuestionService {
  async list(query) {
    const response = await listQuestionApi(query);

    return {
      items: response.data.data,
      meta: response.data.meta,
    };
  }

  async detail(id) {
    const response = await getQuestionApi(id);

    return response.data ?? [];
  }

  async create(payload) {
    const response = await createQuestionApi(payload);

    return response.data.data;
  }

  async update(id, payload) {
    const response = await updateQuestionApi(id, payload);

    return response.data.data;
  }

  async delete(id) {
    return deleteQuestionApi(id);
  }
}

export default new QuestionService();
