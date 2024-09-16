import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import z from 'zod'

const Quote = z.object({
  content: z.string(),
  quotee: z.string().nullable(),
})

const client = new OpenAI()

const PARSE_QUOTE_SYSTEM_PROMPT = `Parse the provided text to extract the quote and the quotee.`

type ParseQuoteParams = {
  text?: string
  imageURL?: string
}

export const parseQuote = async ({ text, imageURL }: ParseQuoteParams) => {
  let prompt
  let messages: any[] = []
  if (text) {
    prompt = [PARSE_QUOTE_SYSTEM_PROMPT, text].join('\n')
    messages = [{ role: 'user', content: text }]
  } else if (imageURL) {
    messages = [
      { role: 'user', content: PARSE_QUOTE_SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: imageURL, detail: 'low' },
          },
        ],
      },
    ]
  } else {
    throw new Error('Either text or imageURL must be provided')
  }

  const response = await client.beta.chat.completions.parse({
    messages,
    model: 'gpt-4o-mini',
    response_format: zodResponseFormat(Quote, 'quote'),
  })

  const quote = response.choices[0].message
  if (quote.refusal || !quote.parsed) {
    throw new Error('Quote parsing failed')
  }

  console.log('Quote parsed:', quote.parsed)
  return quote.parsed
}
