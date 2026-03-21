import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../../config/env.js';
import Notification from '../../models/Notification.js';
import Organization from '../../models/Organization.js';
import logger from '../../config/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Email Transport ─────────────────────────────────

function createTransport() {
  if (env.NODE_ENV === 'production' && env.AWS_SES_ACCESS_KEY) {
    return nodemailer.createTransport({
      host: `email-smtp.${env.AWS_SES_REGION}.amazonaws.com`,
      port: 465,
      secure: true,
      auth: { user: env.AWS_SES_ACCESS_KEY, pass: env.AWS_SES_SECRET_KEY },
    });
  }

  return nodemailer.createTransport({
    host: env.MAILTRAP_SMTP_HOST,
    port: env.MAILTRAP_SMTP_PORT,
    secure: false,
    auth: { user: env.MAILTRAP_SMTP_USER, pass: env.MAILTRAP_SMTP_PASS },
  });
}

let transporter;
function getTransporter() {
  if (!transporter) transporter = createTransport();
  return transporter;
}

// ─── Template Compilation ────────────────────────────

const templateCache = new Map();

function compileTemplate(name) {
  if (templateCache.has(name)) return templateCache.get(name);

  const filePath = path.join(__dirname, 'templates', `${name}.hbs`);
  const source = fs.readFileSync(filePath, 'utf-8');
  const compiled = Handlebars.compile(source);
  templateCache.set(name, compiled);
  return compiled;
}

// ─── Core Email Send ─────────────────────────────────

export async function sendMail(to, subject, text) {
  try {
    const info = await getTransporter().sendMail({
      from: `"SmartSupport" <${env.EMAIL_FROM}>`,
      to,
      subject,
      text,
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    logger.error(`Email failed to ${to}: ${err.message}`);
    throw err;
  }
}

async function sendTemplateEmail(to, subject, templateName, context) {
  const template = compileTemplate(templateName);
  const text = template(context);
  return sendMail(to, subject, text);
}

// ─── In-App Notification ─────────────────────────────

export async function createInAppNotification(userId, type, payload) {
  return Notification.create({ userId, type, channel: 'in_app', payload });
}

// ─── Webhook (stub) ──────────────────────────────────

async function fireWebhook(orgId, eventType, payload) {
  try {
    const org = await Organization.findById(orgId);
    if (!org?.webhookUrl) return;
    // TODO: POST to org.webhookUrl with payload
    logger.info(`Webhook stub: would POST ${eventType} to ${org.webhookUrl}`);
  } catch (err) {
    logger.error(`Webhook failed for org ${orgId}: ${err.message}`);
  }
}

// ─── High-Level Notification Facades ─────────────────

export async function sendAssignmentNotification(moderator, ticket) {
  await Promise.all([
    sendTemplateEmail(moderator.email, `New Ticket Assigned: ${ticket.title}`, 'assignmentEmail', {
      moderatorName: moderator.name,
      ticketId: ticket.ticketId,
      ticketTitle: ticket.title,
    }),
    createInAppNotification(moderator._id, 'assignment', {
      ticketId: ticket.ticketId,
      title: ticket.title,
    }),
    fireWebhook(ticket.orgId, 'ticket.assigned', { ticketId: ticket.ticketId, moderatorId: moderator._id }),
  ]);
}

export async function sendEscalationNotification(admin, ticket) {
  await Promise.all([
    sendTemplateEmail(admin.email, `Ticket Escalated: ${ticket.title}`, 'escalationEmail', {
      adminName: admin.name,
      ticketId: ticket._id,
      ticketTitle: ticket.title,
      oldPriority: ticket.priority,
      newPriority: ticket.newPriority || 'escalated',
      reason: 'No update for 24 hours',
    }),
    createInAppNotification(admin._id, 'escalation', {
      ticketId: ticket._id,
      title: ticket.title,
    }),
  ]);
}

export async function sendResolutionSurvey(user, ticket) {
  await Promise.all([
    sendTemplateEmail(user.email, `How was your support experience?`, 'resolutionSurvey', {
      userName: user.name,
      ticketId: ticket.ticketId,
      ticketTitle: ticket.title,
    }),
    createInAppNotification(user._id, 'resolution', {
      ticketId: ticket.ticketId,
      title: ticket.title,
    }),
  ]);
}

// ─── Query helpers for in-app notifications ──────────

export async function getNotifications(userId, onlyUnread = false) {
  const filter = { userId, channel: 'in_app' };
  if (onlyUnread) filter.read = false;

  const [notifications, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).limit(50),
    Notification.countDocuments({ userId, channel: 'in_app', read: false }),
  ]);

  return { notifications, unreadCount };
}

export async function markAsRead(notificationId, userId) {
  const notif = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { read: true },
    { new: true },
  );
  return notif;
}
