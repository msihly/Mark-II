import { ConnectOptions } from "mongoose";
import { dayjs } from ".";

export type DayJsInput = string | number | Date | dayjs.Dayjs;

export const BOOKMARK_COUNT = 21;

export const MONGOOSE_OPTS: ConnectOptions = { family: 4 };
