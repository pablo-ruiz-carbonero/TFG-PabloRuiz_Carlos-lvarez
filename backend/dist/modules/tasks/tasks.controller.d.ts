import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/create-task.dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(createTaskDto: CreateTaskDto, req: any): Promise<import("../../database/entities/task.entity").Task>;
    findAllByCrop(cropId: string, req: any): Promise<import("../../database/entities/task.entity").Task[]>;
    findOne(id: string, req: any): Promise<import("../../database/entities/task.entity").Task>;
    update(id: string, updateTaskDto: UpdateTaskDto, req: any): Promise<import("../../database/entities/task.entity").Task>;
    remove(id: string, req: any): Promise<void>;
    getPendingCount(cropId: string, req: any): Promise<number>;
}
