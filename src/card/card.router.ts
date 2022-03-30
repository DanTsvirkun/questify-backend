import { Router } from "express";
import mongoose from "mongoose";
import Joi from "joi";
import validate from "../helpers/function-helpers/validate";
import tryCatchWrapper from "../helpers/function-helpers/try-catch-wrapper";
import { authorize } from "../auth/auth.controller";
import {
  createCard,
  editCard,
  confirmCompletedCard,
  deleteCard,
  getAllCards,
} from "./card.controller";
import {
  CardType,
  CardCategory,
  CardDifficulty,
} from "../helpers/typescript-helpers/enums";

const createCardSchema = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  date: Joi.string()
    .custom((value, helpers) => {
      const dateRegex = /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/;
      const isValidDate = dateRegex.test(value);
      if (!isValidDate) {
        return helpers.message({
          custom: "Invalid 'date'. Please, use YYYY-MM-DD string format",
        });
      }
      return value;
    })
    .required(),
  time: Joi.string()
    .custom((value, helpers) => {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      const isValidTime = timeRegex.test(value);
      if (!isValidTime) {
        return helpers.message({
          custom: "Invalid 'time'. Please, use HH:MM string format",
        });
      }
      return value;
    })
    .required(),
  type: Joi.string().valid(CardType.TASK, CardType.CHALLENGE).required(),
  category: Joi.string()
    .valid(
      CardCategory.FAMILY,
      CardCategory.HEALTH,
      CardCategory.LEARNING,
      CardCategory.LEISURE,
      CardCategory.STUFF,
      CardCategory.WORK
    )
    .required(),
  difficulty: Joi.string()
    .valid(CardDifficulty.EASY, CardDifficulty.NORMAL, CardDifficulty.HARD)
    .required(),
});

const editCardSchema = Joi.object({
  title: Joi.string().min(2).max(100),
  date: Joi.string().custom((value, helpers) => {
    const dateRegex = /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/;
    const isValidDate = dateRegex.test(value);
    if (!isValidDate) {
      return helpers.message({
        custom: "Invalid 'date'. Please, use YYYY-MM-DD string format",
      });
    }
    return value;
  }),
  time: Joi.string().custom((value, helpers) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const isValidTime = timeRegex.test(value);
    if (!isValidTime) {
      return helpers.message({
        custom: "Invalid 'time'. Please, use HH:MM string format",
      });
    }
    return value;
  }),
  type: Joi.string().valid(CardType.TASK, CardType.CHALLENGE),
  category: Joi.string().valid(
    CardCategory.FAMILY,
    CardCategory.HEALTH,
    CardCategory.LEARNING,
    CardCategory.LEISURE,
    CardCategory.STUFF,
    CardCategory.WORK
  ),
  difficulty: Joi.string().valid(
    CardDifficulty.EASY,
    CardDifficulty.NORMAL,
    CardDifficulty.HARD
  ),
});

const cardIdSchema = Joi.object({
  cardId: Joi.string()
    .custom((value, helpers) => {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(value);
      if (!isValidObjectId) {
        return helpers.message({
          custom: "Invalid 'cardId'. Must be a MongoDB ObjectId",
        });
      }
      return value;
    })
    .required(),
});

const router = Router();

router.post(
  "/",
  tryCatchWrapper(authorize),
  validate(createCardSchema),
  tryCatchWrapper(createCard)
);
router.patch(
  "/:cardId",
  tryCatchWrapper(authorize),
  validate(cardIdSchema, "params"),
  validate(editCardSchema),
  tryCatchWrapper(editCard)
);
router.patch(
  "/complete/:cardId",
  tryCatchWrapper(authorize),
  validate(cardIdSchema, "params"),
  tryCatchWrapper(confirmCompletedCard)
);
router.delete(
  "/:cardId",
  tryCatchWrapper(authorize),
  validate(cardIdSchema, "params"),
  tryCatchWrapper(deleteCard)
);
router.get("/", tryCatchWrapper(authorize), tryCatchWrapper(getAllCards));

export default router;
