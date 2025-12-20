import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { email, otp } = await req.json();

  const record = await prisma.emailOTP.findFirst({
    where: {
      email,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) {
    return NextResponse.json({ error: 'OTP expired or invalid' }, { status: 400 });
  }

  const isValid = await bcrypt.compare(otp, record.otpHash);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
  }

  // Optional: delete OTP after success
  await prisma.emailOTP.delete({ where: { id: record.id } });

  return NextResponse.json({ success: true });
}
