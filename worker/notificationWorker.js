// worker/notificationWorker.js
require('dotenv').config();
const { Worker } = require('bullmq');
const redis = require('../backend/src/config/redis');
const nodemailer = require('nodemailer');

// 1. 設定郵件傳送器（以 SMTP 為例，可改用 SendGrid、Mailgun）
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const worker = new Worker(
  'notification',
  async job => {
    const { to, subject, text } = job.data;
    console.log(`✉️ 寄信給 ${to}：${subject}`);
    await transporter.sendMail({ from: process.env.SMTP_FROM, to, subject, text });
    console.log(`✅ 已寄給 ${to} (job ${job.id})`);
  },
  { connection: redis }
);

worker.on('failed', (job, err) => {
  console.error(`❌ 寄信失敗 job ${job.id}：`, err);
});
