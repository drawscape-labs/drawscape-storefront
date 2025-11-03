/**
 * Send an email using Postmark API via fetch (avoiding SDK compatibility issues)
 * 
 * @param apiKey Postmark API key
 * @param options Email options including from, to, subject, and body
 * @returns Promise that resolves when email is sent
 */
export const sendPostmarkEmail = async (apiKey: string, options: {
  from?: string;
  to: string;
  subject: string;
  textBody?: string;
  htmlBody?: string;
  replyTo?: string;
  attachments?: Array<{
    Name: string;
    Content: string;
    ContentType: string;
  }>;
}) => {
  if (!apiKey) {
    throw new Error('Postmark API key is required');
  }

  const { from, to, subject, textBody, htmlBody, replyTo, attachments } = options;
  
  // Default from address if not provided
  const fromAddress = from || 'team@drawscape.io';
  
  try {
    const emailData: any = {
      From: fromAddress,
      To: to,
      Subject: subject
    };

    // Attach bodies only if provided
    if (textBody) {
      emailData.TextBody = textBody;
    }

    if (htmlBody) {
      emailData.HtmlBody = htmlBody;
    }

    // Add ReplyTo if provided
    if (replyTo) {
      emailData.ReplyTo = replyTo;
    }

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      emailData.Attachments = attachments;
    }

    const response = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': apiKey,
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorData = await response.json() as { Message?: string };
      throw new Error(`Postmark API error: ${response.status} - ${errorData.Message || 'Unknown error'}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};