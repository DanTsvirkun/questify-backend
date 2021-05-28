import mongoose from "mongoose";
import supertest, { Response } from "supertest";
import { Application } from "express";
import { IUser, ICard } from "../helpers/typescript-helpers/interfaces";
import Server from "../server/server";
import UserModel from "../REST-entities/user/user.model";
import SessionModel from "../REST-entities/session/session.model";
import {
  CardDifficulty,
  CardType,
  CardCategory,
  CardStatus,
} from "../helpers/typescript-helpers/enums";

describe("Card router test suite", () => {
  let app: Application;
  let createdUser: IUser | null;
  let createdCard: ICard | null;
  let accessToken: string;
  let response: Response;

  beforeAll(async () => {
    app = new Server().startForTesting();
    const url = `mongodb://127.0.0.1/card`;
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    await supertest(app)
      .post("/auth/register")
      .send({ email: "test@email.com", password: "qwerty123" });
    response = await supertest(app)
      .post("/auth/login")
      .send({ email: "test@email.com", password: "qwerty123" });
    accessToken = response.body.accessToken;
    createdUser = await UserModel.findById(response.body.userData.id);
  });

  afterAll(async () => {
    await UserModel.deleteOne({ email: "test@email.com" });
    await SessionModel.deleteOne({ _id: response.body.sid });
    await mongoose.connection.close();
  });

  describe("POST /card", () => {
    let response: Response;

    const validReqBody = {
      title: "Test",
      difficulty: CardDifficulty.EASY,
      type: CardType.TASK,
      category: CardCategory.STUFF,
      date: "2020-12-31",
    };

    const invalidReqBody = {
      title: "Test",
      difficulty: CardDifficulty.EASY,
      type: "Taskk",
      category: CardCategory.STUFF,
      date: "2020-12-31",
    };

    it("Init endpoint testing", () => {
      expect(true).toBe(true);
    });

    context("With validReqBody", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/card")
          .set("Authorization", `Bearer ${accessToken}`)
          .send(validReqBody);
        createdUser = await UserModel.findById(createdUser?._id);
        createdCard = response.body.createdCard;
      });

      it("Should return a 201 status code", () => {
        expect(response.status).toBe(201);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          createdCard: {
            title: "Test",
            difficulty: CardDifficulty.EASY,
            type: CardType.TASK,
            category: CardCategory.STUFF,
            date: "2020-12-31",
            status: CardStatus.INCOMPLETE,
            _id: createdCard?._id,
          },
        });
      });

      it("Should create a valid card id", () => {
        expect(response.body.createdCard._id).toBeTruthy();
      });

      it("Should create a new card in user's document", () => {
        expect(createdUser?.cards.length).toBe(1);
      });
    });

    context("With invalidReqBody ('type' is invalid)", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/card")
          .set("Authorization", `Bearer ${accessToken}`)
          .send(invalidReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that 'type' is invalid", () => {
        expect(response.body.message).toBe(
          '"type" must be one of [Task, Challenge]'
        );
      });
    });

    context("Without providing an 'accessToken'", () => {
      beforeAll(async () => {
        response = await supertest(app).post("/card").send(validReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that token wasn't provided", () => {
        expect(response.body.message).toBe("No token provided");
      });
    });

    context("With invalid 'accessToken'", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/card")
          .set("Authorization", `Bearer qwerty123`)
          .send(validReqBody);
      });

      it("Should return a 401 status code", () => {
        expect(response.status).toBe(401);
      });

      it("Should return an unauthorized status", () => {
        expect(response.body.message).toBe("Unauthorized");
      });
    });
  });

  describe("PATCH /card/{cardId}", () => {
    let response: Response;

    const validReqBody = {
      difficulty: CardDifficulty.HARD,
    };

    const invalidReqBody = {
      difficultyy: CardDifficulty.HARD,
    };

    it("Init endpoint testing", () => {
      expect(true).toBe(true);
    });

    context("With validReqBody", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/card/${createdCard?._id}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send(validReqBody);
        createdUser = await UserModel.findById(createdUser?._id);
      });

      it("Should return a 200 status code", () => {
        expect(response.status).toBe(200);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          editedCard: {
            title: "Test",
            difficulty: CardDifficulty.HARD,
            type: CardType.TASK,
            category: CardCategory.STUFF,
            date: "2020-12-31",
            status: CardStatus.INCOMPLETE,
            _id: response.body.editedCard._id,
          },
        });
      });

      it("Should edit card in user's document", () => {
        expect(createdUser?.cards[0].difficulty).toBe(CardDifficulty.HARD);
      });
    });

    context("With invalidReqBody ('difficultyy' is not allowed)", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/card/${createdCard?._id}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send(invalidReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that 'difficultyy' is not allowed", () => {
        expect(response.body.message).toBe('"difficultyy" is not allowed');
      });
    });

    context("Without providing an 'accessToken'", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/card/${createdCard?._id}`)
          .send(validReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that token wasn't provided", () => {
        expect(response.body.message).toBe("No token provided");
      });
    });

    context("With invalid 'accessToken'", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/card/${createdCard?._id}`)
          .set("Authorization", `Bearer qwerty123`)
          .send(validReqBody);
      });

      it("Should return a 401 status code", () => {
        expect(response.status).toBe(401);
      });

      it("Should return an unauthorized status", () => {
        expect(response.body.message).toBe("Unauthorized");
      });
    });
  });

  describe("PATCH /card/complete/{cardId}", () => {
    let response: Response;

    it("Init endpoint testing", () => {
      expect(true).toBe(true);
    });

    context("Valid request", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/card/complete/${createdCard?._id}`)
          .set("Authorization", `Bearer ${accessToken}`);
        createdUser = await UserModel.findById(createdUser?._id);
      });

      it("Should return a 200 status code", () => {
        expect(response.status).toBe(200);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          completedCard: {
            title: "Test",
            difficulty: CardDifficulty.HARD,
            type: CardType.TASK,
            category: CardCategory.STUFF,
            date: "2020-12-31",
            status: CardStatus.COMPLETE,
            _id: response.body.completedCard._id,
          },
        });
      });

      it("Should edit card in user's document", () => {
        expect(createdUser?.cards[0].status).toBe(CardStatus.COMPLETE);
      });
    });

    context("Invalid request (invalid 'cardId')", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/card/complete/qwerty123`)
          .set("Authorization", `Bearer ${accessToken}`);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that 'cardId' must be a MongoDB ObjectId", () => {
        expect(response.body.message).toBe(
          "Invalid 'cardId'. Must be a MongoDB ObjectId"
        );
      });
    });

    context("Without providing an 'accessToken'", () => {
      beforeAll(async () => {
        response = await supertest(app).patch(
          `/card/complete/${createdCard?._id}`
        );
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that token wasn't provided", () => {
        expect(response.body.message).toBe("No token provided");
      });
    });

    context("With invalid 'accessToken'", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/card/complete/${createdCard?._id}`)
          .set("Authorization", `Bearer qwerty123`);
      });

      it("Should return a 401 status code", () => {
        expect(response.status).toBe(401);
      });

      it("Should return an unauthorized status", () => {
        expect(response.body.message).toBe("Unauthorized");
      });
    });
  });

  describe("GET /card", () => {
    let response: Response;

    it("Init endpoint testing", () => {
      expect(true).toBe(true);
    });

    context("Valid request", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .get(`/card`)
          .set("Authorization", `Bearer ${accessToken}`);
        createdUser = await UserModel.findById(createdUser?._id);
      });

      it("Should return a 200 status code", () => {
        expect(response.status).toBe(200);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          cards: [
            {
              title: "Test",
              difficulty: CardDifficulty.HARD,
              type: CardType.TASK,
              category: CardCategory.STUFF,
              date: "2020-12-31",
              status: CardStatus.COMPLETE,
              _id: response.body.cards[0]._id,
            },
          ],
        });
      });
    });

    context("Without providing an 'accessToken'", () => {
      beforeAll(async () => {
        response = await supertest(app).get(`/card`);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that token wasn't provided", () => {
        expect(response.body.message).toBe("No token provided");
      });
    });

    context("With invalid 'accessToken'", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .get(`/card`)
          .set("Authorization", `Bearer qwerty123`);
      });

      it("Should return a 401 status code", () => {
        expect(response.status).toBe(401);
      });

      it("Should return an unauthorized status", () => {
        expect(response.body.message).toBe("Unauthorized");
      });
    });
  });

  describe("DELETE /card/{cardId}", () => {
    let response: Response;

    it("Init endpoint testing", () => {
      expect(true).toBe(true);
    });

    context("Valid request", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .delete(`/card/${createdCard?._id}`)
          .set("Authorization", `Bearer ${accessToken}`);
        createdUser = await UserModel.findById(createdUser?._id);
      });

      it("Should return a 204 status code", () => {
        expect(response.status).toBe(204);
      });

      it("Should delete card in user's document", () => {
        expect(createdUser?.cards[0]).toBe(undefined);
      });
    });

    context("Invalid request (invalid 'cardId')", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .delete("/card/qwert123")
          .set("Authorization", `Bearer ${accessToken}`);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that 'cardId' must be a MongoDB ObjectId", () => {
        expect(response.body.message).toBe(
          "Invalid 'cardId'. Must be a MongoDB ObjectId"
        );
      });
    });

    context("Without providing an 'accessToken'", () => {
      beforeAll(async () => {
        response = await supertest(app).delete(`/card/${createdCard?._id}`);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that token wasn't provided", () => {
        expect(response.body.message).toBe("No token provided");
      });
    });

    context("With invalid 'accessToken'", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .delete(`/card/${createdCard?._id}`)
          .set("Authorization", `Bearer qwerty123`);
      });

      it("Should return a 401 status code", () => {
        expect(response.status).toBe(401);
      });

      it("Should return an unauthorized status", () => {
        expect(response.body.message).toBe("Unauthorized");
      });
    });
  });
});
