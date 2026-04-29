import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { transporter } from '@/lib/mailer';

function generateResetCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({
        success: true,
        message: 'If an account exists for this email, a reset code has been sent.',
      });
    }

    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    const code = generateResetCode();
    const tokenHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        email,
        tokenHash,
        expiresAt,
      },
    });

    await transporter.sendMail({
      to: email,
      subject: 'Telecoop Password Reset Code',
      html: `
        <h2>Reset your Telecoop password</h2>
        <p>Use this code to reset your admin password:</p>
        <h1 style="letter-spacing: 0.2em;">${code}</h1>
        <p>This code expires in 10 minutes.</p>
        <p>If you did not request a password reset, you can ignore this email.</p>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'If an account exists for this email, a reset code has been sent.',
    });
  } catch (error) {
    console.error('FORGOT PASSWORD REQUEST ERROR:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
