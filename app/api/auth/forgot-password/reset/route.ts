import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body.email?.trim().toLowerCase();
    const code = body.code?.trim();
    const password = body.password;

    if (!email || !code || !password) {
      return NextResponse.json({ error: 'Missing reset details' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const resetTokens = await prisma.$queryRaw<Array<{
      id: number;
      tokenHash: string;
    }>>`
      SELECT id, tokenHash
      FROM PasswordResetToken
      WHERE email = ${email}
        AND expiresAt > ${new Date()}
      ORDER BY createdAt DESC
      LIMIT 1
    `;

    const resetToken = resetTokens[0];

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Reset code expired or invalid' },
        { status: 400 }
      );
    }

    const isValidCode = await bcrypt.compare(code, resetToken.tokenHash);

    if (!isValidCode) {
      return NextResponse.json({ error: 'Invalid reset code' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unable to reset password' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      }),
      prisma.$executeRaw`
        DELETE FROM PasswordResetToken
        WHERE email = ${email}
      `,
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('RESET PASSWORD ERROR:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
