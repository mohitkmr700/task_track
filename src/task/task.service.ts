import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import PocketBase from 'pocketbase';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class TaskService {
  private pb: PocketBase;

  constructor() {
    this.pb = new PocketBase(process.env.POCKETBASE_URL || 'http://algoarena.co.in/pocketbase');
  }

  async listTasks(email?: string) {
    const filter = email ? `email = '${email}'` : '';
    const records = await this.pb.collection('task').getFullList({ filter });
    if (!records.length) {
      throw new NotFoundException('No tasks found for the specified email.');
    }
    return records;
  }

  async createTask(data: any) {
    // Check for duplicate task with the same title
    const existingTasks = await this.pb.collection('task').getFullList({
      filter: `title = '${data.title}'`,
    });
    if (existingTasks.length) {
      throw new ConflictException('A task with this title already exists.');
    }
    return this.pb.collection('task').create(data);
  }

  async updateTask(data: any) {
    // Find record by email
    const records = await this.pb.collection('task').getFullList({
      filter: `email = '${data.email}'`,
    });
    if (!records.length) {
      throw new NotFoundException('Task not found for the specified email.');
    }
    const recordId = records[0].id;
    return this.pb.collection('task').update(recordId, data);
  }

  async deleteTask(email: string) {
    // Find record by email
    const records = await this.pb.collection('task').getFullList({
      filter: `email = '${email}'`,
    });
    if (!records.length) {
      throw new NotFoundException('Task not found for the specified email.');
    }
    const recordId = records[0].id;
    return this.pb.collection('task').delete(recordId);
  }
}
