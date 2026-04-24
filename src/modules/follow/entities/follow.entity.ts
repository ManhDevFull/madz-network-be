import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('follows')
export class Follow {
    @PrimaryColumn('uuid')
    follower_id: string;

    @PrimaryColumn('uuid')
    following_id: string;
    
    @CreateDateColumn()
    created_at: Date;
}
