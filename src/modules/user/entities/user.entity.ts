import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column()
    username: string;

    @Column({ unique: true, type: 'varchar', length: 80 })
    slug: string;
    
    @Column()
    email: string;

    @Column()
    password_hash: string;
    @Column({ nullable: true })
    avatar_url: string;

    @Column({ nullable: true })
    bio: string;

    @Column({ nullable: true, type: 'smallint' })
    gender: number | null;

    @Column({ type: 'varchar', length: 150, nullable: true })
    hometown: string | null;

    @CreateDateColumn()
    created_at: Date;

}
