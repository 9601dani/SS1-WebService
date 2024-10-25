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

export interface Card {
    credit_card_number: string;
    expiration_date: string;
    account_type: string;
    credit_card_type: string;
    state: string;
    current_balance: string;
    email: string;
    username: string;
  }
  
export interface CardsResponse {
    message: string;
    cards: Card[];
  }
  