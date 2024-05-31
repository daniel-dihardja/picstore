import { customAlphabet } from "nanoid";

let dailyCounter = 0;
const lastReset = new Date().toISOString().slice(0, 10); // Get the current date as 'YYYY-MM-DD'
const nanoid = customAlphabet("1234567890abcdef", 10);

export const generateSortableId = () => {
  const currentDay = new Date().toISOString().slice(0, 10);
  if (currentDay !== lastReset) {
    dailyCounter = 0; // Reset counter daily
  }
  return `${currentDay}-${dailyCounter++}-${nanoid()}`;
};
