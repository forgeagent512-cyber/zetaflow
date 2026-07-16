import { createClient } from '@supabase/supabase-js';
import type { NotificationData } from './devops.types.js';

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase configuration missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

interface ChannelConfig {
  webhookUrl?: string;
  phone?: string;
  chatId?: string;
  email?: string;
}

export class NotificationCenter {
  async sendNotification(orgId: string, userId: string, data: NotificationData): Promise<string> {
    const supabase = getSupabase();
    const id = crypto.randomUUID();
    const { error } = await supabase.from('notifications').insert({
      id,
      organization_id: orgId,
      user_id: userId,
      channel: data.channel,
      title: data.title,
      message: data.message,
      type: data.type ?? 'info',
      priority: data.priority ?? 'medium',
      is_read: false,
      created_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    this.dispatchToChannel(data, orgId).catch(() => {});
    return id;
  }

  private async dispatchToChannel(data: NotificationData, orgId: string): Promise<void> {
    try {
      switch (data.channel) {
        case 'email':
          await this.sendEmailViaChannel(orgId, data.message);
          break;
        case 'slack':
          await this.sendSlackViaChannel(orgId, data.message);
          break;
        case 'discord':
          await this.sendDiscordViaChannel(orgId, data.message);
          break;
        case 'whatsapp':
          await this.sendWhatsAppViaChannel(orgId, data.message);
          break;
        case 'telegram':
          await this.sendTelegramViaChannel(orgId, data.message);
          break;
        case 'webhook':
          await this.sendWebhookViaChannel(orgId, data);
          break;
        case 'dashboard':
          break;
      }
    } catch {
      // Non-blocking
    }
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY ?? process.env.SENDGRID_API_KEY;
    if (!apiKey) throw new Error('Email service not configured');
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.EMAIL_FROM ?? 'noreply@buildagent.ai', to, subject, html: body }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`Email send failed: ${response.status}`);
  }

  async sendSlack(webhookUrl: string, message: string): Promise<void> {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Slack send failed: ${response.status}`);
  }

  async sendDiscord(webhookUrl: string, message: string): Promise<void> {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Discord send failed: ${response.status}`);
  }

  async sendWhatsApp(phone: string, message: string): Promise<void> {
    const apiKey = process.env.TWILIO_API_KEY;
    if (!apiKey) throw new Error('WhatsApp service not configured');
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: { Authorization: `Basic ${Buffer.from(`${accountSid}:${apiKey}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ To: `whatsapp:${phone}`, From: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM ?? '+14155238886'}`, Body: message }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`WhatsApp send failed: ${response.status}`);
  }

  async sendTelegram(chatId: string, message: string): Promise<void> {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) throw new Error('Telegram service not configured');
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Telegram send failed: ${response.status}`);
  }

  async sendWebhook(url: string, payload: any): Promise<void> {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Webhook send failed: ${response.status}`);
  }

  async getNotifications(orgId: string, userId: string): Promise<any[]> {
    const supabase = getSupabase();
    const { data } = await supabase.from('notifications').select('*').eq('organization_id', orgId).eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
    return (data ?? []).map((r: any) => ({
      id: r.id,
      organizationId: r.organization_id,
      userId: r.user_id,
      channel: r.channel,
      title: r.title,
      message: r.message,
      type: r.type,
      priority: r.priority,
      isRead: r.is_read,
      createdAt: r.created_at,
    }));
  }

  async markAsRead(notificationId: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
    if (error) throw new Error(error.message);
  }

  async configureChannel(orgId: string, channel: string, config: Partial<ChannelConfig>): Promise<void> {
    const supabase = getSupabase();
    const { data: existing } = await supabase.from('notification_channels').select('id').eq('organization_id', orgId).eq('channel', channel).single();
    if (existing) {
      const { error } = await supabase.from('notification_channels').update({ config, updated_at: new Date().toISOString() }).eq('id', existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from('notification_channels').insert({
        id: crypto.randomUUID(),
        organization_id: orgId,
        channel,
        config,
        created_at: new Date().toISOString(),
      });
      if (error) throw new Error(error.message);
    }
  }

  private async sendEmailViaChannel(orgId: string, message: string): Promise<void> {
    const supabase = getSupabase();
    const { data: channel } = await supabase.from('notification_channels').select('config').eq('organization_id', orgId).eq('channel', 'email').single();
    if (channel?.config?.email) {
      await this.sendEmail(channel.config.email, 'Notification from BuildAgent', message);
    }
  }

  private async sendSlackViaChannel(orgId: string, message: string): Promise<void> {
    const supabase = getSupabase();
    const { data: channel } = await supabase.from('notification_channels').select('config').eq('organization_id', orgId).eq('channel', 'slack').single();
    if (channel?.config?.webhookUrl) {
      await this.sendSlack(channel.config.webhookUrl, message);
    }
  }

  private async sendDiscordViaChannel(orgId: string, message: string): Promise<void> {
    const supabase = getSupabase();
    const { data: channel } = await supabase.from('notification_channels').select('config').eq('organization_id', orgId).eq('channel', 'discord').single();
    if (channel?.config?.webhookUrl) {
      await this.sendDiscord(channel.config.webhookUrl, message);
    }
  }

  private async sendWhatsAppViaChannel(orgId: string, message: string): Promise<void> {
    const supabase = getSupabase();
    const { data: channel } = await supabase.from('notification_channels').select('config').eq('organization_id', orgId).eq('channel', 'whatsapp').single();
    if (channel?.config?.phone) {
      await this.sendWhatsApp(channel.config.phone, message);
    }
  }

  private async sendTelegramViaChannel(orgId: string, message: string): Promise<void> {
    const supabase = getSupabase();
    const { data: channel } = await supabase.from('notification_channels').select('config').eq('organization_id', orgId).eq('channel', 'telegram').single();
    if (channel?.config?.chatId) {
      await this.sendTelegram(channel.config.chatId, message);
    }
  }

  private async sendWebhookViaChannel(orgId: string, data: NotificationData): Promise<void> {
    const supabase = getSupabase();
    const { data: channel } = await supabase.from('notification_channels').select('config').eq('organization_id', orgId).eq('channel', 'webhook').single();
    if (channel?.config?.webhookUrl) {
      await this.sendWebhook(channel.config.webhookUrl, data);
    }
  }
}
