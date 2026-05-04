const { Resend } = require('resend');

const sendEmail = async (options) => {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: 'BozTech <noreply@boztechrd.com.tr>',
      to: options.email,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo || undefined,
    });

    if (error) {
      console.error('Email sending failed:', error.message);
      return false;
    }

    console.log('Email successfully sent:', data.id);
    return true;
  } catch (err) {
    console.error('Email sending failed:', err.message);
    return false;
  }
};

module.exports = sendEmail;
