import dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config();

export const getSheet = async () => {
  const auth = await google.auth.getClient({
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS!),
  });

  const sheets = google.sheets({ version: "v4", auth });

  const data = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range: "Rank",
  });

  return data.data.values;
};
