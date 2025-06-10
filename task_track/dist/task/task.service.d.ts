export declare class TaskService {
    private pb;
    constructor();
    listTasks(email?: string): Promise<import("pocketbase").RecordModel[]>;
    createTask(data: any): Promise<import("pocketbase").RecordModel>;
    updateTask(data: any): Promise<import("pocketbase").RecordModel>;
    deleteTask(email: string): Promise<boolean>;
}
