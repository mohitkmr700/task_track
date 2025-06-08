import { TaskService } from './task.service';
export declare class TaskController {
    private readonly taskService;
    constructor(taskService: TaskService);
    listTasks(email: string): Promise<import("pocketbase").RecordModel[]>;
    createTask(body: any): Promise<import("pocketbase").RecordModel>;
    updateTask(body: any): Promise<import("pocketbase").RecordModel>;
    deleteTask(email: string): Promise<boolean>;
}
