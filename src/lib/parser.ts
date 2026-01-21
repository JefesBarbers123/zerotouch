
// Basic deterministic parser for V1.5
// In a real production app, this would call an LLM (OpenAI/Gemini) for true flexibility.
// Here we use smart regex to simulate "understanding" common formats.

export interface ParsedBooking {
    name?: string
    time?: string
    date?: Date
    serviceName?: string
    confidence: number // 0-1
}

export function parseBookingText(text: string, availableServices: { name: string }[]): ParsedBooking {
    let confidence = 0.5
    const result: ParsedBooking = { confidence: 0 }

    const lower = text.toLowerCase()

    // 1. Detect Time (e.g. 5pm, 5:00, 14:00)
    const timeRegex = /(\d{1,2})(:(\d{2}))?\s*(am|pm)?/i
    const timeMatch = text.match(timeRegex)
    if (timeMatch) {
        // Normalize time (simple version)
        result.time = timeMatch[0]
        confidence += 0.2
    }

    // 2. Detect Relative Date (tmrw, tomorrow, today)
    const today = new Date()
    if (lower.includes('tmrw') || lower.includes('tomorrow')) {
        const tmrw = new Date(today)
        tmrw.setDate(tmrw.getDate() + 1)
        result.date = tmrw
        confidence += 0.1
    } else if (lower.includes('today')) {
        result.date = today
        confidence += 0.1
    } else {
        // Default to today if time is future, else tomorrow? Simplify to today for now.
        result.date = today
    }

    // 3. Detect Service (Keyword matching against DB services)
    // We assume availableServices is passed in
    let matchedService = availableServices.find(s => lower.includes(s.name.toLowerCase()))

    // Fallback: Common barber terms if not exact match
    if (!matchedService) {
        if (lower.includes('fade')) result.serviceName = 'Skin Fade' // Guess
        else if (lower.includes('cut')) result.serviceName = 'Haircut' // Guess
        else if (lower.includes('beard')) result.serviceName = 'Beard Trim' // Guess
    } else {
        result.serviceName = matchedService.name
        confidence += 0.2
    }

    // 4. Detect Name (Capitalized words that aren't keywords?)
    // This is hard with regex. We'll assume the FIRST capitalized word is the name for now, 
    // excluding "Hi", "Hello", "Book".
    const words = text.split(' ')
    const exclude = ['Hi', 'Hey', 'Hello', 'Book', 'Can', 'I', 'Please', 'Pls']
    for (const word of words) {
        if (word && word[0] === word[0].toUpperCase() && !exclude.includes(word) && word.length > 2) {
            // Check if it's a number/time
            if (!/\d/.test(word)) {
                result.name = word.replace(/[^a-zA-Z]/g, '')
                confidence += 0.2
                break // Take first apparent name
            }
        }
    }

    result.confidence = Math.min(confidence, 1)
    return result
}
