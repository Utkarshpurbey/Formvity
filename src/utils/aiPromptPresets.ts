export interface PromptPreset {
  id: string;
  title: string;
  category: "Feedback" | "Business" | "HR" | "Events" | "Education";
  description: string;
  prompt: string;
  badge?: string;
}

export const AI_PROMPT_PRESETS: PromptPreset[] = [
  {
    id: "customer-feedback",
    title: "Customer Feedback Form",
    category: "Feedback",
    description: "Collect overall satisfaction ratings, product experience, and comments.",
    badge: "Popular",
    prompt:
      "I need a customer feedback form with full name, email address, overall rating (1 to 5 stars), primary product used (select dropdown: Web App, Mobile App, API), features liked most (checkboxes), and detailed comments (textarea).",
  },
  {
    id: "job-application",
    title: "Job Application Flow",
    category: "HR",
    description: "Capture candidate details, role applied for, experience, portfolio, and resume.",
    badge: "Detailed",
    prompt:
      "Create a job application form asking for Full Name, Email, Phone Number, Position Applied For (select dropdown: Frontend Engineer, Backend Developer, Product Designer, Marketing Manager), Years of Experience (number), Portfolio URL, LinkedIn Profile, and Cover Letter (textarea).",
  },
  {
    id: "event-rsvp",
    title: "Event RSVP & Preferences",
    category: "Events",
    description: "Gather guest attendance, dietary preferences, and session choices.",
    badge: "Quick",
    prompt:
      "Design an event RSVP form with Full Name, Email, Attendance Status (radio: Attending in person, Attending online, Unable to attend), Number of Guests (number), Dietary Requirements (select dropdown: None, Vegetarian, Vegan, Gluten-Free), and Special Requests (textarea).",
  },
  {
    id: "lead-intake",
    title: "B2B Sales Lead Intake",
    category: "Business",
    description: "Qualify high-value sales leads with company size, budget, and project urgency.",
    badge: "High Value",
    prompt:
      "Build a sales lead capture form with Full Name, Business Email, Company Name, Job Title, Team Size (select dropdown: 1-10, 11-50, 51-200, 200+), Estimated Monthly Budget (select dropdown: <$1k, $1k-$5k, $5k-$20k, $20k+), and Describe your project requirements (textarea).",
  },
  {
    id: "course-evaluation",
    title: "Course Evaluation Survey",
    category: "Education",
    description: "Gather student feedback on course materials, instructor clarity, and suggestions.",
    prompt:
      "Generate a course evaluation form with Student Name (optional), Course Title, Instructor Name, Overall Course Quality (rating 1-5), Clarity of Instruction (rating 1-5), Would you recommend this course? (radio: Yes, No, Maybe), and Suggestions for improvement (textarea).",
  },
  {
    id: "bug-report",
    title: "Product Bug & Issue Tracker",
    category: "Business",
    description: "Structured bug report intake with severity level, steps to reproduce, and screenshot.",
    prompt:
      "Create a software bug report form with User Name, Email, Issue Title, Severity Level (select: Critical, High, Medium, Low), Operating System & Browser, Steps to Reproduce (textarea), and Expected vs Actual Result (textarea).",
  },
];
