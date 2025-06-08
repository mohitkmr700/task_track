export declare class TaskService {
    listTasks(email?: string): Promise<any>;
    createTask(data: any): Promise<any>;
    updateTask(data: any): Promise<any>;
    deleteTask(id: string): Promise<any>;
} 