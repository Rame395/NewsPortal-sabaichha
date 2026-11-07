import nodemailer, { type Transporter } from 'nodemailer'

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com'
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10)
const SMTP_SECURE = process.env.SMTP_SECURE === 'true' || SMTP_PORT === 465
const SMTP_USER = process.env.SMTP_USER || 'sunchhaharikhabar@gmail.com'
const SMTP_PASS = process.env.SMTP_PASS || 'hifsbcgctbxfhbqn'
const SMTP_FROM = process.env.SMTP_FROM || `SabaiChha Newsroom <${SMTP_USER}>`

const SITE_URL = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

// Create cached nodemailer transporter instance
let transporterInstance: Transporter | null = null

function getTransporter(): Transporter {
  if (!transporterInstance) {
    transporterInstance = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  }
  return transporterInstance
}

export interface SendStaffWelcomeEmailParams {
  to: string
  fullName: string
  email: string
  password: string
  role: string
  loginUrl?: string
}

export interface SendRoleOrPasswordUpdateParams {
  to: string
  fullName: string
  email: string
  role?: string
  newPassword?: string
  loginUrl?: string
}

/**
 * Verify SMTP connection health
 */
export async function verifySmtpConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = getTransporter()
    await transporter.verify()
    return { success: true }
  } catch (error) {
    console.error('SMTP verification failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown SMTP verification error',
    }
  }
}

/**
 * Send welcome onboarding email with login credentials and assigned role
 */
export async function sendStaffWelcomeEmail({
  to,
  fullName,
  email,
  password,
  role,
  loginUrl,
}: SendStaffWelcomeEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = getTransporter()
    const targetLoginUrl = loginUrl || `${SITE_URL}/admin/login`

    const roleBadgeColors: Record<string, { bg: string; text: string }> = {
      SUPER_ADMIN: { bg: '#dc2626', text: '#ffffff' },
      ADMIN: { bg: '#ea580c', text: '#ffffff' },
      CHIEF_EDITOR: { bg: '#9333ea', text: '#ffffff' },
      EDITOR: { bg: '#2563eb', text: '#ffffff' },
      JOURNALIST: { bg: '#059669', text: '#ffffff' },
      REPORTER: { bg: '#0891b2', text: '#ffffff' },
      CONTRIBUTOR: { bg: '#475569', text: '#ffffff' },
    }

    const badge = roleBadgeColors[role] || { bg: '#dc2626', text: '#ffffff' }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to the Editorial Team</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header Bar with Red Accent -->
          <tr>
            <td style="background: linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #991b1b 100%); padding: 32px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">SabaiChha Newsroom</h1>
              <p style="margin: 6px 0 0 0; color: #fecaca; font-size: 13px; font-weight: 500;">Official Editorial Access & Onboarding</p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 30px;">
              <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 19px; font-weight: 700;">
                Namaste, ${fullName}!
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                An administrative account has been created for you on the <strong>SabaiChha Digital News Portal</strong>. You have been assigned the following role in our editorial hierarchy:
              </p>

              <!-- Role Pill -->
              <div style="margin-bottom: 24px; text-align: center;">
                <span style="display: inline-block; background-color: ${badge.bg}; color: ${badge.text}; padding: 6px 18px; border-radius: 9999px; font-size: 13px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">
                  ${role}
                </span>
              </div>

              <!-- Credentials Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; border-radius: 12px; border: 1px solid #cbd5e1; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 12px;">
                      Your Login Credentials
                    </div>

                    <div style="margin-bottom: 12px;">
                      <span style="font-size: 12px; color: #64748b; display: block; margin-bottom: 2px;">Email Address / Username:</span>
                      <span style="font-size: 15px; font-weight: 700; color: #0f172a; font-family: monospace;">${email}</span>
                    </div>

                    <div>
                      <span style="font-size: 12px; color: #64748b; display: block; margin-bottom: 2px;">Temporary Password:</span>
                      <span style="font-size: 16px; font-weight: 800; color: #dc2626; font-family: monospace; letter-spacing: 1px; background-color: #ffffff; padding: 4px 10px; border-radius: 6px; display: inline-block; border: 1px dashed #f87171;">
                        ${password}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Login CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${targetLoginUrl}" target="_blank" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 13px 32px; border-radius: 10px; box-shadow: 0 4px 10px rgba(220, 38, 38, 0.3);">
                      Log In to Editorial Portal &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <div style="padding: 14px 16px; background-color: #fffbeb; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #92400e;">
                  <strong>Important Security Note:</strong> For the security of our newsroom, you will be prompted to change this temporary password upon your first login. Please do not share these credentials with anyone.
                </p>
              </div>

              <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                If you did not expect this invitation or have questions regarding your access privileges, please contact the Lead Administrator immediately.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} SabaiChha Digital News Portal. All rights reserved.
              </p>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8;">
                This is an automated administrative notification. Please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject: `Welcome to SabaiChha Newsroom - Your Staff Login Credentials (${role})`,
      html: htmlContent,
      text: `Namaste ${fullName},\n\nYou have been added as a ${role} to the SabaiChha Newsroom.\n\nLogin URL: ${targetLoginUrl}\nEmail: ${email}\nTemporary Password: ${password}\n\nPlease change your password upon first login.\n\nBest regards,\nSabaiChha Administration`,
    })

    console.log(`[SMTP] Welcome email sent successfully to ${to} (Message ID: ${info.messageId})`)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error(`[SMTP] Error sending welcome email to ${to}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown mailer error',
    }
  }
}

/**
 * Send notification when an existing user's role is updated or password is reset by admin
 */
export async function sendRoleOrPasswordUpdateEmail({
  to,
  fullName,
  email,
  role,
  newPassword,
  loginUrl,
}: SendRoleOrPasswordUpdateParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = getTransporter()
    const targetLoginUrl = loginUrl || `${SITE_URL}/admin/login`

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Account Update Notification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background-color: #0f172a; padding: 26px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 800;">SabaiChha Newsroom Update</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 18px;">Hello, ${fullName}</h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569; line-height: 1.6;">
                Your staff account on <strong>SabaiChha Digital News Portal</strong> has been updated by an administrator.
              </p>

              ${
                role
                  ? `
              <div style="background-color: #f1f5f9; padding: 14px 18px; border-radius: 10px; margin-bottom: 18px;">
                <span style="font-size: 12px; color: #64748b; display: block; margin-bottom: 4px;">Assigned Role:</span>
                <span style="font-size: 15px; font-weight: 800; color: #dc2626;">${role}</span>
              </div>
              `
                  : ''
              }

              ${
                newPassword
                  ? `
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 16px 18px; border-radius: 10px; margin-bottom: 20px;">
                <span style="font-size: 12px; color: #991b1b; display: block; margin-bottom: 4px; font-weight: 700;">New Temporary Password:</span>
                <span style="font-size: 16px; font-weight: 800; color: #dc2626; font-family: monospace;">${newPassword}</span>
                <p style="margin: 8px 0 0 0; font-size: 11px; color: #b91c1c;">
                  You will be required to change your password immediately upon logging in.
                </p>
              </div>
              `
                  : ''
              }

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 10px; margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <a href="${targetLoginUrl}" target="_blank" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 8px;">
                      Go to Editorial Login &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject: `SabaiChha Newsroom - Account Details Updated`,
      html: htmlContent,
      text: `Hello ${fullName},\n\nYour account details on SabaiChha Newsroom have been updated.\n${role ? `Role: ${role}\n` : ''}${newPassword ? `New Temporary Password: ${newPassword}\n` : ''}\nLogin: ${targetLoginUrl}`,
    })

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error(`[SMTP] Error sending update email to ${to}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown mailer error',
    }
  }
}
