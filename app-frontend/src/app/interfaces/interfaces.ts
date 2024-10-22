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