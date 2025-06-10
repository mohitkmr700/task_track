"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const common_1 = require("@nestjs/common");
const pocketbase_1 = require("pocketbase");
const dotenv = require("dotenv");
dotenv.config();
let TaskService = class TaskService {
    pb;
    constructor() {
        this.pb = new pocketbase_1.default(process.env.POCKETBASE_URL || 'http://algoarena.co.in/pocketbase');
    }
    async listTasks(email) {
        const filter = email ? `email = '${email}'` : '';
        const records = await this.pb.collection('task').getFullList({ filter });
        if (!records.length) {
            throw new common_1.NotFoundException('No tasks found for the specified email.');
        }
        return records;
    }
    async createTask(data) {
        const existingTasks = await this.pb.collection('task').getFullList({
            filter: `title = '${data.title}'`,
        });
        if (existingTasks.length) {
            throw new common_1.ConflictException('A task with this title already exists.');
        }
        return this.pb.collection('task').create(data);
    }
    async updateTask(data) {
        const records = await this.pb.collection('task').getFullList({
            filter: `email = '${data.email}'`,
        });
        if (!records.length) {
            throw new common_1.NotFoundException('Task not found for the specified email.');
        }
        const recordId = records[0].id;
        return this.pb.collection('task').update(recordId, data);
    }
    async deleteTask(email) {
        const records = await this.pb.collection('task').getFullList({
            filter: `email = '${email}'`,
        });
        if (!records.length) {
            throw new common_1.NotFoundException('Task not found for the specified email.');
        }
        const recordId = records[0].id;
        return this.pb.collection('task').delete(recordId);
    }
};
exports.TaskService = TaskService;
exports.TaskService = TaskService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TaskService);
//# sourceMappingURL=task.service.js.map