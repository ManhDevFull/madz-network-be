import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('friendships')
export class Friendship {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column()
    requester_id: string;

    @Column()
    addressee_id: string;

    @Column({ type: 'smallint' })
    status: number;

    @CreateDateColumn()
    created_at: Date;
}
