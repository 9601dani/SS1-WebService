export interface Page{
    id: number;
    name: string;
    path: string;
    isAvailable: boolean;
}

export interface Module{
    name: string;
    pages: Page[];

}

export interface Comment{
    id: number;
    FK_User: number;
    comment: string;
    created_at: string;
    email: string;
}

export interface CommentRequest{
    id: number,
    FK_User: number,
    comment: string,
    created_at: Date
}