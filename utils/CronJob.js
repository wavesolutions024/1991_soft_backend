import cron from "node-cron";
import { sendBirthdayNotification } from "../services/WhatsappService.js";
import {
  getTodayBirthdayCustomers,
  getUpcomingBirthdayCustomers,
} from "../controller/NotificationController.js";

cron.schedule(
  "0 10 * * *",
  async () => {
    console.log("Birthday cron started:", new Date());

    try {
      const numbers = await getTodayBirthdayCustomers();

      console.log("Today's birthdays:", numbers.length);

      if (numbers.length > 0) {
        await sendBirthdayNotification(numbers);
      } else {
        console.log("No birthdays today.");
      }
    } catch (error) {
      console.error("Birthday cron error:", error);
    }
  },
  {
    timezone: "Asia/Kolkata",
  }
);

cron.schedule(
  "55 9 * * *",
  async () => {
    console.log("Upcoming birthday cron started:", new Date());

    try {
      const numbers = await getUpcomingBirthdayCustomers();

      console.log("Upcoming birthdays:", numbers.length);

      if (numbers.length > 0) {
        await sendBirthdayNotification(numbers);
      } else {
        console.log("No upcoming birthdays.");
      }
    } catch (error) {
      console.error("Upcoming birthday cron error:", error);
    }
  },
  {
    timezone: "Asia/Kolkata",
  }
);