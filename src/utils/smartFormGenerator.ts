import type { FormDef, FormAppearanceSettings, PageComponentDef } from "../components/page-def/builder/pageDef";

/**
 * Smart rule-based AI form generator fallback.
 * Parses plain English prompt requirements to construct a valid, rich FormDef with custom styling.
 */
export function generateSmartFallbackForm(prompt: string): FormDef {
  const pLower = prompt.toLowerCase();

  // Determine Appearance & Styling based on keywords
  let appearance: FormAppearanceSettings = {
    primaryColor: "#6366f1",
    backgroundColor: "#f8fafc",
    surfaceColor: "#ffffff",
    textColor: "#0f172a",
    borderRadius: "md",
    submitStyle: "solid",
    inputStyle: "outline",
  };

  if (pLower.includes("trendy") || pLower.includes("aesthetic") || pLower.includes("chic") || pLower.includes("vibe")) {
    appearance = {
      primaryColor: "#ec4899",
      backgroundColor: "#fdf2f8",
      surfaceColor: "#ffffff",
      textColor: "#0f172a",
      borderRadius: "lg",
      submitStyle: "solid",
      inputStyle: "outline",
    };
  } else if (pLower.includes("dark mode") || pLower.includes("dark theme") || pLower.includes("dark")) {
    appearance = {
      primaryColor: "#818cf8",
      backgroundColor: "#0f172a",
      surfaceColor: "#1e293b",
      textColor: "#f8fafc",
      borderRadius: "md",
      submitStyle: "solid",
      inputStyle: "outline",
    };
  } else if (pLower.includes("pink") || pLower.includes("rose") || pLower.includes("barbie")) {
    appearance = {
      primaryColor: "#f43f5e",
      backgroundColor: "#fff1f2",
      surfaceColor: "#ffffff",
      textColor: "#881337",
      borderRadius: "lg",
      submitStyle: "solid",
      inputStyle: "outline",
    };
  } else if (pLower.includes("emerald") || pLower.includes("green") || pLower.includes("nature")) {
    appearance = {
      primaryColor: "#10b981",
      backgroundColor: "#ecfdf5",
      surfaceColor: "#ffffff",
      textColor: "#064e3b",
      borderRadius: "md",
      submitStyle: "solid",
      inputStyle: "outline",
    };
  } else if (pLower.includes("warm") || pLower.includes("sunset") || pLower.includes("amber")) {
    appearance = {
      primaryColor: "#f59e0b",
      backgroundColor: "#fffbeb",
      surfaceColor: "#ffffff",
      textColor: "#78350f",
      borderRadius: "md",
      submitStyle: "solid",
      inputStyle: "outline",
    };
  } else if (pLower.includes("purple") || pLower.includes("violet")) {
    appearance = {
      primaryColor: "#8b5cf6",
      backgroundColor: "#f5f3ff",
      surfaceColor: "#ffffff",
      textColor: "#4c1d95",
      borderRadius: "md",
      submitStyle: "solid",
      inputStyle: "outline",
    };
  }

  // Determine Title
  let title = "Generated Form";
  if (pLower.includes("wedding") || pLower.includes("rsvp")) title = "Wedding RSVP & Celebration Form";
  else if (pLower.includes("feedback")) title = "Customer Feedback Form";
  else if (pLower.includes("job") || pLower.includes("application") || pLower.includes("career")) title = "Job Application Form";
  else if (pLower.includes("event") || pLower.includes("registration")) title = "Event Registration Form";
  else if (pLower.includes("contact")) title = "Contact Us Form";
  else if (pLower.includes("lead") || pLower.includes("sales") || pLower.includes("inquiry")) title = "Sales Lead Intake Form";
  else if (pLower.includes("course") || pLower.includes("evaluation") || pLower.includes("survey")) title = "Course Evaluation Survey";
  else if (pLower.includes("bug") || pLower.includes("issue") || pLower.includes("report")) title = "Bug & Issue Report Form";
  else {
    const words = prompt.trim().split(/\s+/).slice(0, 5).join(" ");
    title = words ? words.charAt(0).toUpperCase() + words.slice(1) : "Custom AI Form";
  }

  const components: PageComponentDef[] = [];

  // Always check for Name
  if (pLower.includes("name") || !pLower.includes("no name")) {
    components.push({
      id: "full_name",
      type: "text",
      label: "Full Name",
      required: true,
      placeholder: "e.g. Alex Morgan",
    });
  }

  // Check for Email
  if (pLower.includes("email") || components.length === 1) {
    components.push({
      id: "email_address",
      type: "email",
      label: "Email Address",
      required: true,
      placeholder: "alex@example.com",
    });
  }

  // Check for Phone
  if (pLower.includes("phone") || pLower.includes("contact number") || pLower.includes("mobile")) {
    components.push({
      id: "phone_number",
      type: "phone",
      label: "Phone Number",
      required: false,
      placeholder: "+1 (555) 000-0000",
    });
  }

  // Check for Attendance / Radio
  if (pLower.includes("attending") || pLower.includes("rsvp") || pLower.includes("attendance")) {
    components.push({
      id: "attending_status",
      type: "radio",
      label: "Will you be attending?",
      required: true,
      options: ["Joyfully Accept", "Regretfully Decline"],
    });
  }

  // Guests count
  if (pLower.includes("guest") || pLower.includes("plus-one") || pLower.includes("guests")) {
    components.push({
      id: "total_guests",
      type: "number",
      label: "Total Number of Guests",
      min: 1,
      max: 10,
      placeholder: "1",
    });
    components.push({
      id: "plus_one_names",
      type: "textarea",
      label: "Names of Additional Guests / Plus-One",
      placeholder: "Enter full names of your guests...",
    });
  }

  // Dietary Restrictions
  if (pLower.includes("diet") || pLower.includes("allergy") || pLower.includes("allergies") || pLower.includes("food")) {
    components.push({
      id: "dietary_restrictions",
      type: "checkbox",
      label: "Dietary Restrictions or Allergies",
      options: ["Vegetarian", "Vegan", "Gluten-Free", "Nut Allergy", "Halal/Kosher", "None"],
    });
  }

  // Song Request / Music
  if (pLower.includes("song") || pLower.includes("music") || pLower.includes("dance")) {
    components.push({
      id: "song_request",
      type: "text",
      label: "Song Request for the DJ",
      placeholder: "Artist - Song Title",
    });
  }

  // Rating / Score / Stars
  if (pLower.includes("rating") || pLower.includes("score") || pLower.includes("satisfaction") || pLower.includes("1-5") || pLower.includes("stars")) {
    components.push({
      id: "overall_rating",
      type: "rating",
      label: "Overall Rating (1 to 5)",
      required: true,
      min: 1,
      max: 5,
    });
  }

  // Comments / Message / Textarea
  if (pLower.includes("message") || pLower.includes("comment") || pLower.includes("feedback") || pLower.includes("detail") || components.length < 4) {
    components.push({
      id: "message_notes",
      type: "textarea",
      label: pLower.includes("wedding") || pLower.includes("couple") ? "Message for the Couple" : "Comments & Feedback",
      placeholder: "Share your well wishes or notes here...",
    });
  }

  return {
    version: 1,
    id: `smart_form_${Date.now()}`,
    title,
    description: `Auto-generated form based on prompt: "${prompt}"`,
    formSettings: {
      appearance,
    },
    pages: [
      {
        id: "page-1",
        title,
        description: "Please complete the details below.",
        components,
      },
    ],
  };
}
