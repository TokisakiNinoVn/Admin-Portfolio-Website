// src/services/question.service.js

import {
  createTopicApi,
  deleteTopicApi,
  // getTopicApi,
  listTopicApi,
  updateTopicApi,
} from '@/apis/modules/topic.api';

class TopicService {
  async list(query) {
    const response = await listTopicApi(query);

    return {
      items: response.data,
      meta: response.data.meta,
    };
  }

  // async detail(id) {
  //   const response = await getTopicApi(id);

  //   return response.data.data;
  // }

  async create(payload) {
    const response = await createTopicApi(payload);

    return response.data.data;
  }

  async update(id, payload) {
    const response = await updateTopicApi(id, payload);

    return response.data.data;
  }

  async delete(id) {
    return deleteTopicApi(id);
  }
}

export default new TopicService();
