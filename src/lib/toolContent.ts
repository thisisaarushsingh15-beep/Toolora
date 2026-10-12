/**
 * Long-form content for each tool page: honest formulas, a worked example and
 * FAQs. Kept next to the registry so phase 2/3 only has to add the live
 * calculator — the page frame and copy are already real.
 */
export type ToolContent = {
  intro: string;
  formula: string;
  howItWorks: string[];
  example: { title: string; steps: string[]; result: string };
  faqs: { q: string; a: string }[];
};

export const TOOL_CONTENT: Record<string, ToolContent> = {
  "percentage-calculator": {
    intro:
      "Percentages come up constantly — a discount, a test score, a pay rise, a tip. This calculator covers the three questions people actually ask: a percent of a number, one number as a percent of another, and the percent change between two values.",
    formula: "Part = Whole × (Percent ÷ 100)",
    howItWorks: [
      "Divide the percentage by 100 to turn it into a decimal.",
      "Multiply that decimal by the whole amount to get the part.",
      "For percent change, divide the difference by the original value and multiply by 100.",
    ],
    example: {
      title: "What is 15% of 240?",
      steps: [
        "Convert the percentage: 15 ÷ 100 = 0.15",
        "Multiply: 0.15 × 240 = 36",
        "Check in reverse: 36 ÷ 240 × 100 = 15%",
      ],
      result: "15% of 240 is 36.",
    },
    faqs: [
      {
        q: "How do I work out a discount?",
        a: "Take the percentage off in one step: multiply the price by (100 − discount) ÷ 100. A 20% discount on 1,500 leaves 1,500 × 0.8 = 1,200.",
      },
      {
        q: "What is the difference between percent change and percentage points?",
        a: "Percent change compares a value with its own original value. Percentage points describe the gap between two percentages: going from 20% to 25% is a rise of 5 percentage points, which is a 25% increase.",
      },
      {
        q: "Can a result be more than 100%?",
        a: "Yes. A value can grow to 150% of its original size, and a 200% increase means the original tripled.",
      },
      {
        q: "Why does an answer sometimes look rounded?",
        a: "The full value is kept through the calculation and only rounded for display, so repeating the maths on the rounded figure can give a slightly different last digit.",
      },
    ],
  },
  "grade-calculator": {
    intro:
      "A course grade is usually a weighted average: every test, assignment or exam counts for a share of the final mark. This calculator averages your scores using the weights you set, so you can see where a course currently stands.",
    formula: "Grade = Σ(score × weight) ÷ Σ(weight)",
    howItWorks: [
      "Enter each score as a percentage.",
      "Give each item its weight — the share of the final mark it counts for.",
      "Add up score × weight, divide by the total weight, and that is the grade.",
    ],
    example: {
      title: "A course with three parts",
      steps: [
        "Assignment 1: 78% at 20% weight → 78 × 20 = 1,560",
        "Assignment 2: 85% at 30% weight → 85 × 30 = 2,550",
        "Final exam: 64% at 50% weight → 64 × 50 = 3,200",
      ],
      result: "(1,560 + 2,550 + 3,200) ÷ 100 = 73.1% for the course.",
    },
    faqs: [
      {
        q: "What if all my scores carry the same weight?",
        a: "Give every item the weight 1 and the result is a plain average of the scores.",
      },
      {
        q: "Can I work out the score I need on the final?",
        a: "Yes: required score = (target grade − marks already secured) ÷ weight of the final. Enter the weights you know and solve for the remaining one.",
      },
      {
        q: "Why does it not show a letter grade?",
        a: "Letter boundaries are set by each school or university, so they are not universal. The tool reports percentages only.",
      },
      {
        q: "Should I put 0 for a test I have not taken?",
        a: "No. Leave that row out instead — a zero drags the average down as though you had scored nothing.",
      },
    ],
  },
  "age-calculator": {
    intro:
      "An age is a calendar calculation rather than a division, because months have different lengths and leap years add a day. This tool counts the complete years, months and days between a date of birth and any other date.",
    formula: "Age = complete years + complete months + remaining days",
    howItWorks: [
      "Count complete years from the date of birth to the date you are measuring against.",
      "Count complete months after those whole years.",
      "Count the days left over, borrowing from the correct month length.",
    ],
    example: {
      title: "Born 12 March 2000, measured on 5 June 2025",
      steps: [
        "Complete years: 25 (reached on 12 March 2025)",
        "Complete months after that: 2 (reached on 12 May 2025)",
        "Days remaining: 24 (13 May to 5 June)",
      ],
      result: "25 years, 2 months and 24 days.",
    },
    faqs: [
      {
        q: "How is a 29 February birthday handled?",
        a: "In a non-leap year the following 1 March completes the year, and a leap day is counted as a real day in the day total.",
      },
      {
        q: "Why is the month figure different from days ÷ 30.44?",
        a: "An average month is about 30.44 days, which is an approximation. Counting whole calendar months gives the exact answer.",
      },
      {
        q: "Does the day of birth count as one day old?",
        a: "No. The day of birth is day zero, and the first birthday comes exactly one year later.",
      },
      {
        q: "Can I measure the age between two dates in the past?",
        a: "Yes — any two dates work, and the tool counts the gap between them.",
      },
    ],
  },
  "date-difference-calculator": {
    intro:
      "Counting days between dates by hand trips over month lengths and leap years. This calculator returns the gap in days, weeks, months and years, with an optional weekday-only count for planning work.",
    formula: "Days = end date − start date · Working days = weekdays excluding Saturday and Sunday",
    howItWorks: [
      "Count the calendar days between the two dates.",
      "Divide by 7 for whole weeks and the leftover days.",
      "Switch on working days to exclude Saturdays and Sundays.",
    ],
    example: {
      title: "1 January 2025 to 1 March 2025",
      steps: [
        "January has 31 days and February 2025 has 28 (2025 is not a leap year)",
        "31 + 28 = 59 days",
        "59 ÷ 7 = 8 weeks and 3 days",
      ],
      result: "59 days, or 8 weeks and 3 days.",
    },
    faqs: [
      {
        q: "Is the start date itself counted?",
        a: "The gap between the dates is counted, so 1 January to 2 January is 1 day.",
      },
      {
        q: "Are public holidays excluded from working days?",
        a: "No. Public holidays differ by country and year, so only Saturdays and Sundays are excluded.",
      },
      {
        q: "Does the order of the two dates matter?",
        a: "No — reverse them and the total is the same length, and the tool tells you the direction.",
      },
      {
        q: "Does the time of day affect the result?",
        a: "No. Only the calendar dates are used, so 09:00 to 17:00 counts as one day.",
      },
    ],
  },
  "word-counter": {
    intro:
      "Paste or type your text and the counts update as you go: words, characters with and without spaces, sentences, paragraphs and an estimated reading time for the finished piece.",
    formula: "Words = groups of non-whitespace characters · Characters (no spaces) = characters − whitespace",
    howItWorks: [
      "The text is split on whitespace to count words.",
      "Characters are counted twice: with spaces and without, because limits are usually set one way or the other.",
      "Sentences end at a full stop, question mark or exclamation mark; paragraphs are separated by blank lines.",
    ],
    example: {
      title: "Estimating reading time for 240 words",
      steps: ["240 words ÷ 200 words per minute = 1.2 minutes", "0.2 minutes × 60 = 12 seconds"],
      result: "About 1 minute 12 seconds of reading.",
    },
    faqs: [
      {
        q: "Which reading speed is assumed?",
        a: "200 words per minute, a common average for adults reading plain English. Dense technical text takes longer.",
      },
      {
        q: "Do numbers count as words?",
        a: "Yes — anything separated by a space counts, including numerals and abbreviations.",
      },
      {
        q: "How are emoji counted?",
        a: "Every character is counted as a Unicode code point, so an accent, a Chinese character or a single emoji counts as one. Emoji built from several code points — skin tones, flags, family groups — count as more than one. The word count is unaffected.",
      },
      {
        q: "Is my text uploaded anywhere?",
        a: "No. Counting runs in your browser and nothing is sent to a server.",
      },
    ],
  },
  "text-case-converter": {
    intro:
      "Different places want text in different shapes: a heading in Title Case, an identifier in snake_case, a sentence in Sentence case. This tool rewrites the whole block without changing the words themselves.",
    formula:
      "UPPER = toUpperCase() · lower = toLowerCase() · Title = first letter of each word · Sentence = first letter of each sentence",
    howItWorks: [
      "Each option rewrites the text word by word and leaves punctuation in place.",
      "Title case capitalises the first letter of every word and lowercases the rest.",
      "camelCase and snake_case also remove the spaces between words.",
    ],
    example: {
      title: "Input: “the quick brown fox jumps over the lazy dog”",
      steps: [
        "Title Case → The Quick Brown Fox Jumps Over The Lazy Dog",
        "camelCase → theQuickBrownFoxJumpsOverTheLazyDog",
        "snake_case → the_quick_brown_fox_jumps_over_the_lazy_dog",
      ],
      result: "Pick the style you need; the page itself never alters what you pasted.",
    },
    faqs: [
      {
        q: "Will it keep acronyms like NASA capitalised?",
        a: "Not when converting to lowercase — 'NASA' becomes 'nasa', and converting back gives 'Nasa'. That is normal for a plain case converter, so check acronyms afterwards.",
      },
      {
        q: "Which words does Title Case capitalise?",
        a: "Every word, including short ones such as 'of' and 'the'. Publishing style guides differ on small words, so give the result a quick read.",
      },
      {
        q: "Does it work with accents and non-English letters?",
        a: "Yes. Case mapping follows the Unicode rules built into your browser, so accented and non-Latin letters convert correctly where a case distinction exists.",
      },
      {
        q: "Is the text sent anywhere?",
        a: "No — the conversion happens entirely in your browser.",
      },
    ],
  },
  "remove-duplicate-lines": {
    intro:
      "Lists pasted from different sources collect repeated entries and stray spacing. This tool removes the repeats and can tidy the result at the same time, so what is left is the list you meant to have.",
    formula: "Output = each line in order, keeping only the first occurrence of every unique line",
    howItWorks: [
      "Each line is compared with the lines already kept.",
      "A repeat is dropped, while the original order of the survivors stays the same.",
      "Optional extras: trim whitespace, ignore letter case, drop blank lines and sort the result.",
    ],
    example: {
      title: "Input: apple, banana, apple, Cherry, banana",
      steps: [
        "apple kept (first occurrence)",
        "banana kept",
        "apple dropped as a repeat; Cherry kept",
        "banana dropped as a repeat",
      ],
      result: "apple, banana, Cherry — 3 unique lines out of 5.",
    },
    faqs: [
      {
        q: "Does it change the order of my lines?",
        a: "Only if you ask it to sort. Otherwise the first occurrence of each line stays exactly where it was.",
      },
      {
        q: "How does case-insensitive matching work?",
        a: "With it switched on, 'Apple' and 'apple' count as the same line and the first one is the one kept.",
      },
      {
        q: "Why do two identical-looking lines both survive?",
        a: "Invisible trailing spaces are the usual cause. Switch on the trim option and they collapse into one line.",
      },
      {
        q: "Is my list uploaded anywhere?",
        a: "No. The cleaning happens in your browser and the text is never sent to a server.",
      },
    ],
  },
  "unit-converter": {
    intro:
      "Metric and imperial units sit side by side in everyday work. This converter switches a value between units of the same kind, including temperature, where the scales do not share a zero and the conversion is a formula rather than a single factor.",
    formula: "Target value = value × factor · Temperature: °F = °C × 9/5 + 32",
    howItWorks: [
      "Length, weight, volume and speed convert with a fixed multiplication factor.",
      "Temperature uses a formula because the Celsius and Fahrenheit scales start at different points.",
      "The full value is carried through the conversion and rounded only for display.",
    ],
    example: {
      title: "Convert 72 kg to pounds",
      steps: [
        "1 kilogram = 2.2046226218 pounds",
        "72 × 2.2046226218 = 158.73282877",
        "Rounded for display: 158.73 lb",
      ],
      result: "72 kg = 158.73 lb (about 158 lb 12 oz).",
    },
    faqs: [
      {
        q: "Is a US gallon the same as a UK gallon?",
        a: "No. A US gallon is about 3.785 litres and a UK (imperial) gallon about 4.546 litres, so the two are listed separately.",
      },
      {
        q: "Is 1 kg exactly 2.2 lb?",
        a: "2.2 is a rounded figure. The exact factor is 2.20462, which starts to matter on larger values.",
      },
      {
        q: "Why does 100 °C show as 212 °F exactly?",
        a: "Because the temperature formula is exact: 100 × 9/5 + 32 = 212. Only the displayed rounding of other conversions can look approximate.",
      },
      {
        q: "Which kinds of units are covered?",
        a: "Length, weight, temperature, volume and speed — the groups that cover most day-to-day conversions.",
      },
    ],
  },
  "budget-planner": {
    intro:
      "A budget is two lists: money in and money out. This planner totals both for a month and shows what is left over as an amount and as a share of your income, so a tight month is visible before it happens.",
    formula: "Left over = total income − total expenses · Share of income = left over ÷ total income × 100",
    howItWorks: [
      "Add each income line and each expense line.",
      "Subtract expenses from income to get what is left over, or the shortfall.",
      "The share of income shows how much of the month is still uncommitted.",
    ],
    example: {
      title: "A monthly plan",
      steps: [
        "Income: 45,000",
        "Expenses: rent 15,000 + food 8,000 + travel 3,000 = 26,000",
        "45,000 − 26,000 = 19,000",
      ],
      result: "19,000 left over — 42.2% of income.",
    },
    faqs: [
      {
        q: "Which currency does it use?",
        a: "INR by default, and it can be changed on the page. The arithmetic is identical whatever symbol you pick.",
      },
      {
        q: "Does it save my budget?",
        a: "No. The figures stay in your browser and nothing is sent anywhere, so copy anything you want to keep before closing the page.",
      },
      {
        q: "Where do annual costs fit?",
        a: "Divide a yearly cost by 12 and add it as a monthly line. Insurance, subscriptions and annual fees are the ones most often left out.",
      },
      {
        q: "What if my expenses are higher than my income?",
        a: "The planner shows the shortfall as a negative figure and as a share of income, so an over-budget month is stated plainly rather than hidden.",
      },
    ],
  },
  "study-timer": {
    intro:
      "A study timer works best when the session has a fixed end. Set a focus length, work until it rings, take a short break, then repeat — with each completed session counted so the day adds up.",
    formula: "Progress = elapsed time ÷ focus length · Total focus = completed sessions × focus length",
    howItWorks: [
      "The countdown works from the clock time the session started, so it stays accurate even while the tab sits in the background.",
      "Pause and resume without losing the time already spent.",
      "Breaks are separate from study time and are never counted as focus.",
    ],
    example: {
      title: "Four sessions of 25 minutes with 5-minute breaks",
      steps: ["25 minutes focused, then a 5-minute break", "Repeat four times", "4 × 25 = 100 minutes of focus"],
      result: "100 minutes of focused study, spread over about 1 hour 55 minutes.",
    },
    faqs: [
      {
        q: "Does the timer keep running if I switch tabs?",
        a: "Yes. It works from the start time rather than a raw counter, so time is not lost — but keep the tab open, since the page controls the timer.",
      },
      {
        q: "Why 25 minutes with a 5-minute break?",
        a: "That is the classic Pomodoro split. Any lengths work; 50 minutes with a 10-minute break suits longer reading or problem sets.",
      },
      {
        q: "Are breaks counted as study time?",
        a: "No. The session count records focused blocks only, so the total reflects real work.",
      },
      {
        q: "Will it wake my device or play a sound?",
        a: "The timer shows the state of the session in the page. Sound and notifications depend on your device settings, so keep the page visible if you need a visual cue.",
      },
    ],
  },
};

export function getToolContent(slug: string): ToolContent | undefined {
  return TOOL_CONTENT[slug];
}
