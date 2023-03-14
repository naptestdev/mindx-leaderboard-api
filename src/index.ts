import dotenv from "dotenv";
import express from "express";
import { swr } from "./services/cache";
import { getSheet } from "./services/sheet";
import cors from "cors";
import { COURSE_CODES, LEVEL_CODES } from "./shared/constants";

dotenv.config();

const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello from MindX Leaderboard API");
});

app.get("/:course/:level/:lesson", async (req, res) => {
  try {
    if (
      !["Scratch", "Game", "Web"].includes(req.params.course) ||
      !["Basic", "Advanced", "Intensive"].includes(req.params.level) ||
      !req.params.lesson ||
      (req.params.lesson !== "Total" && !+req.params.lesson)
    ) {
      return res.status(400).send("Invalid query params");
    }

    const data: string[][] = (await swr("all", () => getSheet())).value as any;

    const page = parseInt((req.query.page as string) || "0");
    const take = 10;
    const skip = page * take;

    const lessonKey =
      req.params.lesson === "Total" ? "Tổng" : `Lesson ${req.params.lesson}`;

    const result = data
      .slice(1)
      .map((item) => {
        const student: { [key: string]: string } = {};
        for (let i = 0; i < data[0].length; i++) {
          student[data[0][i].trim()] = item[i];
        }
        return student;
      })
      .filter(
        (item) =>
          item["Khoá học"] === COURSE_CODES[req.params.course] &&
          item["Level"] === LEVEL_CODES[req.params.level] &&
          +item[lessonKey].replace(",", ".")
      )
      .sort(
        (a, b) =>
          +b[lessonKey].replace(",", ".") - +a[lessonKey].replace(",", ".")
      )
      .slice(skip, skip + take)
      .map((item) => ({
        name: item["Tên học sinh"],
        point: +item[lessonKey].replace(",", "."),
        class: item["Mã lớp"],
      }));

    res.send(result);
  } catch (error) {
    console.log(error);
    if (!res.headersSent) res.sendStatus(500);
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is listening on port ${port}`));
