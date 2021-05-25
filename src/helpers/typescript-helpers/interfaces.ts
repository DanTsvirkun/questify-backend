import { Document } from "mongoose";
import { Difficulty, Status, CardType } from "./enums";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  cards: ICard[];
}

export interface ICard {
  title: string;
  difficulty: Difficulty.EASY | Difficulty.NORMAL | Difficulty.HARD;
  date: string;
  status: Status.INCOMPLETE | Status.COMPLETE;
  type: CardType.TASK | CardType.CHALLENGE;
}

export interface ISession extends Document {
  uid: string;
}

export interface IJWTPayload {
  uid: string;
  sid: string;
}
