import { Repository } from 'typeorm';
import { Task } from '../../database/entities/task.entity';
import { CreateTaskDto, UpdateTaskDto } from './dto/create-task.dto';
export declare class TasksService {
    private readonly taskRepository;
    constructor(taskRepository: Repository<Task>);
    findAllByCrop(cropId: number, userId: number): Promise<Task[]>;
    findOne(id: number, userId: number): Promise<Task>;
    create(createTaskDto: CreateTaskDto, userId: number): Promise<Task>;
    update(id: number, updateTaskDto: UpdateTaskDto, userId: number): Promise<Task>;
    remove(id: number, userId: number): Promise<void>;
    getPendingCount(cropId: number, userId: number): Promise<number>;
}
