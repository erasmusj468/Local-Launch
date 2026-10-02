import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { businessName, category, description, services, targetAudience } = await req.json()

    const prompt = `
    You are an expert web designer and copywriter. Generate a modern website structure in clean JSON for a local business with these details:
    Business Name: ${businessName}
    Category: ${category}
    Description: ${description}
    Services: ${services}
    Target Audience: ${targetAudience}

    Respond ONLY with valid JSON matching this schema:
    {
      "heroTitle": "string",
      "heroSub": "string",
      "aboutSection": "string",
      "services": ["string"],
      "callToAction": "string",
      "primaryColor": "hex string",
      "secondaryColor": "hex string"
    }
    `

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    })

    const websiteContent = JSON.parse(response.choices[0].message.content || "{}")

    return NextResponse.json({ success: true, websiteContent })
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate website content." }, { status: 500 })
  }
}
