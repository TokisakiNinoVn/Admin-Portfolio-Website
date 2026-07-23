// src/models/topic.model.js

export default class TopicModel {
    constructor(data = {}) {
        this.name = data.name || ''
        this.description = data.description || ''
    }

    static fromJson(json = {}) {
        return new TopicModel({
        name: json.name,
        description: json.description,
        })
    }

    toJson() {
        return {
        name: this.name,
        description: this.description,
        }
    }

    isValid() {
        return this.name.trim().length > 0
    }
}
