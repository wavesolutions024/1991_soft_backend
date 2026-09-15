import cron from "node-cron";
import { sendBirthdayNotification } from "../services/WhatsappService.js";

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