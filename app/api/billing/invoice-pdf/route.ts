import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const { invoiceHtml, fileName } = await req.json();

  try {
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();

    const tailwindPath = path.join(process.cwd(), "app/styles/output.css");
    const tailwindCss = fs.readFileSync(tailwindPath, "utf-8");

    const cleanedHtml = invoiceHtml.replace(
      /<div class="flex gap-3">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
      ""
    );

    // Wrap invoice HTML with full HTML structure and inject Tailwind
    const html = `
      <html>
        <head>
          <style>${tailwindCss}
          </style>
        </head>
        <body>
          ${cleanedHtml}
        </body>
      </html>
    `;

    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ 
      format: "A4", 
      printBackground: true, 
    });

    await browser.close();

    // Convert Buffer to Uint8Array for NextResponse
    const pdfUint8Array = new Uint8Array(pdfBuffer);

    return new NextResponse(pdfUint8Array, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName || "invoice"}.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
