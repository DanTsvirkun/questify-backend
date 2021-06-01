import { Request, Response } from "express";
import { IUser } from "../helpers/typescript-helpers/interfaces";
import { CardStatus } from "../helpers/typescript-helpers/enums";

export const createCard = async (req: Request, res: Response) => {
  const user = req.user;
  const card = { ...req.body, status: CardStatus.INCOMPLETE };
  (user as IUser).cards.push(card);
  await user?.save();
  return res
    .status(201)
    .send({ createdCard: user?.cards[user?.cards.length - 1] });
};

export const editCard = async (req: Request, res: Response) => {
  const user = req.user;
  const { cardId } = req.params;
  const card = user?.cards.find(
    (card) => card._id.toString() === cardId.toString()
  );
  const cardIndex = user?.cards.findIndex(
    (card) => card._id.toString() === cardId.toString()
  );
  if (!card || cardIndex === undefined) {
    return res.status(400).send({ message: "Invalid 'cardId'" });
  }
  const newCard = { ...card.toObject(), ...req.body };
  (user as IUser).cards[cardIndex] = newCard;
  await (user as IUser).save();
  return res.status(200).send({ editedCard: user?.cards[cardIndex] });
};

export const confirmCompletedCard = async (req: Request, res: Response) => {
  const user = req.user;
  const { cardId } = req.params;
  const card = user?.cards.find(
    (card) => card._id.toString() === cardId.toString()
  );
  if (!card) {
    return res.status(400).send({ message: "Invalid 'cardId'" });
  }
  if (!card.status) {
    return res.status(403).send({ message: "This card is already completed" });
  }
  card.status = CardStatus.COMPLETE;
  await (user as IUser).save();
  return res.status(200).send({ completedCard: card });
};

export const deleteCard = async (req: Request, res: Response) => {
  const user = req.user;
  const { cardId } = req.params;
  const cardIndex = user?.cards.findIndex(
    (card) => card._id.toString() === cardId.toString()
  );
  if (cardIndex === undefined) {
    return res.status(400).send({ message: "Invalid 'cardId'" });
  }
  user?.cards.splice(cardIndex, 1);
  await (user as IUser).save();
  return res.status(204).end();
};

export const getAllCards = async (req: Request, res: Response) => {
  const user = req.user;
  return res.status(200).send({ cards: user?.cards });
};
