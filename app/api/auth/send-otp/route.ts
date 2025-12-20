import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { transporter } from '@/lib/mailer';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1️⃣ Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing credentials' },
        { status: 400 }
      );
    }

    // 2️⃣ Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // ❌ Do NOT reveal which one is wrong
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 3️⃣ Verify password FIRST
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 4️⃣ OPTIONAL: Restrict to admins
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // 5️⃣ Cleanup old OTPs
    await prisma.emailOTP.deleteMany({
      where: { email },
    });

    // 6️⃣ Generate & hash OTP
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);

    await prisma.emailOTP.create({
      data: {
        email,
        otpHash,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
    });

    // 7️⃣ Send OTP email
    await transporter.sendMail({
      to: email,
      subject: 'Your Telecoop OTP Code',
      html: `
        <h2>Your Telecoop OTP</h2>
        <h1>${otp}</h1>
        <p>Expires in 5 minutes</p>
        <p>If you did not request this, please ignore.</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('SEND OTP ERROR:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
