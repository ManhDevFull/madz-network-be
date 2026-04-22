export declare class Post {
    id: string;
    user_id: string;
    content: string | null;
    media_url: string | null;
    post_type: number;
    parent_post_id: string | null;
    root_post_id: string | null;
    like_count: number;
    comment_count: number;
    visibility: number;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}
