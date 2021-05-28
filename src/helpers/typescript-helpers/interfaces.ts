import { Document } from "mongoose";
import { CardDifficulty, CardStatus, CardType, CardCategory } from "./enums";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  cards: ICard[];
}

export interface ICard extends Document {
  title: string;
  difficulty: CardDifficulty.EASY | CardDifficulty.NORMAL | CardDifficulty.HARD;
  date: string;
  status: CardStatus.COMPLETE | CardStatus.INCOMPLETE;
  category: CardCategory;
  type: CardType;
}

export interface ISession extends Document {
  uid: string;
}

export interface IJWTPayload {
  uid: string;
  sid: string;
}
